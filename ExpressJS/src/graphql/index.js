const { buildSchema } = require('graphql');
const { graphqlHTTP } = require('express-graphql');

const { getCart, addToCart, updateCartItem, removeFromCart, toggleSelectItems, clearCart } = require('../services/cartService');
const { createOrder } = require('../services/orderService'); // added

// GraphQL schema (extended with checkout)
const schema = buildSchema(`
  input CheckoutItemInput {
    productId: ID!
    name: String
    price: Float
    quantity: Int
  }

  type OrderItem {
    productId: ID
    name: String
    price: Float
    quantity: Int
  }

  type Order {
    id: ID
    userId: ID
    items: [OrderItem!]
    total: Float
    status: String
    createdAt: String
    updatedAt: String
  }

  type CartItem {
    productId: ID!
    quantity: Int!
    selected: Boolean!
  }

  type Cart {
    id: ID
    userId: ID!
    items: [CartItem!]!
  }

  type CheckoutPayload {
    EC: Int
    EM: String
    order: Order
  }

  type Query {
    cart: Cart
    userOrders: [Order!]
  }

  type Mutation {
    addToCart(productId: ID!, quantity: Int!): Cart
    updateCartItem(productId: ID!, quantity: Int!): Cart
    removeFromCart(productId: ID!): Cart
    toggleSelectItems(productIds: [ID!]!, selected: Boolean!): Cart
    clearCart: Cart
    checkout(items: [CheckoutItemInput!]): CheckoutPayload
  }
`);

// Helper to map mongoose cart -> plain object
const mapCart = (cart, userId) => {
  if (!cart) return { id: null, userId, items: [] };
  const items = (cart.items || []).map(i => ({
    productId: i.productId ? String(i.productId) : null,
    quantity: i.quantity || 0,
    selected: typeof i.selected === 'boolean' ? i.selected : true
  }));
  return { id: cart._id ? String(cart._id) : null, userId: String(userId), items };
};

const mapOrder = (order) => {
  if (!order) return null;
  return {
    id: order._id ? String(order._id) : null,
    userId: order.userId ? String(order.userId) : null,
    items: (order.items || []).map(i => ({
      productId: i.productId ? String(i.productId) : null,
      name: i.name || "",
      price: i.price || 0,
      quantity: i.quantity || 0
    })),
    total: order.total || 0,
    status: order.status || "",
    createdAt: order.createdAt ? order.createdAt.toISOString() : null,
    updatedAt: order.updatedAt ? order.updatedAt.toISOString() : null
  };
};

const initGraphql = async (app, authMiddleware) => {
  // rootValue per-request so we can access req.user (set by authMiddleware)
  const rootFactory = (req, res) => ({
    // Query
    cart: async () => {
      if (!req.user || !req.user.id) throw new Error('Unauthorized');
      const cart = await getCart(req.user.id);
      return mapCart(cart, req.user.id);
    },
    userOrders: async () => {
      if (!req.user || !req.user.id) throw new Error('Unauthorized');
      const Order = require('../models/order');
      const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
      return (orders || []).map(o => mapOrder(o));
    },

    // Mutations (cart)
    addToCart: async ({ productId, quantity }) => {
      if (!req.user || !req.user.id) throw new Error('Unauthorized');
      const cart = await addToCart(req.user.id, productId, quantity);
      return mapCart(cart, req.user.id);
    },
    updateCartItem: async ({ productId, quantity }) => {
      if (!req.user || !req.user.id) throw new Error('Unauthorized');
      const cart = await updateCartItem(req.user.id, productId, quantity);
      return mapCart(cart, req.user.id);
    },
    removeFromCart: async ({ productId }) => {
      if (!req.user || !req.user.id) throw new Error('Unauthorized');
      const cart = await removeFromCart(req.user.id, productId);
      return mapCart(cart, req.user.id);
    },
    toggleSelectItems: async ({ productIds, selected }) => {
      if (!req.user || !req.user.id) throw new Error('Unauthorized');
      const cart = await toggleSelectItems(req.user.id, productIds, selected);
      return mapCart(cart, req.user.id);
    },
    clearCart: async () => {
      if (!req.user || !req.user.id) throw new Error('Unauthorized');
      const cart = await clearCart(req.user.id);
      return mapCart(cart, req.user.id);
    },

    // Checkout mutation (GraphQL) - use closure-captured req (not resolver args)
    checkout: async ({ items }) => {
      if (!req.user || !req.user.id) throw new Error('Unauthorized');
      // items may be null -> orderService will use selected cart items
      const result = await createOrder(req.user.id, items);
      if (result && result.EC === 0) {
        return { EC: 0, EM: result.EM || "OK", order: mapOrder(result.data) };
      }
      return { EC: result?.EC ?? -1, EM: result?.EM ?? "Error", order: null };
    }

  });

  // Mount route with authMiddleware before GraphQL
  app.use(
    '/v1/graphql',
    authMiddleware, // sets req.user or returns 401
    graphqlHTTP((req, res) => ({
      schema,
      rootValue: rootFactory(req, res),
      graphiql: true, // enable GraphiQL for development
      context: { req, res }
    }))
  );

  console.log('GraphQL endpoint ready at /v1/graphql (graphiql enabled)');
};

module.exports = initGraphql;
