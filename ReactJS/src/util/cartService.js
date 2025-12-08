import axios from '../util/axios.customize';

// Fetch cart from server
export const fetchCartService = async () => {
    try {
        const query = `query { cart { id userId items { productId quantity selected } } }`;
        const resp = await axios.post('/v1/graphql', { query });
        const body = resp ?? {};
        let cart = null;
        if (body.data && body.data.cart) cart = body.data.cart;
        else if (body.cart) cart = body.cart;
        else if (body.data && body.data.data && body.data.data.cart) cart = body.data.data.cart;
        if (!cart || !Array.isArray(cart.items)) {
            return [];
        }

        // enrich items with product details
        const enriched = await Promise.all(cart.items.map(async (it) => {
            const pid = it.productId;
            try {
                const pRes = await axios.get(`/v1/api/products/${pid}`);
                const real = (pRes?.data && pRes?.data.data) ? pRes.data.data : (pRes?.data?.name ? pRes.data : (pRes?.name ? pRes : null));
                const productObj = real || (pRes && pRes.data) || null;
                return {
                    _id: pid,
                    quantity: it.quantity,
                    selected: !!it.selected,
                    name: productObj?.name || "",
                    price: productObj?.price ?? 0,
                    image: productObj?.image || ""
                };
            } catch (e) {
                return { _id: pid, quantity: it.quantity, selected: !!it.selected, name: "", price: 0, image: "" };
            }
        }));

        return enriched;
    } catch (error) {
        console.error("fetchCart error:", error);
        return [];
    }
};

// Add product to cart
export const addToCartService = async (productId) => {
    const mutation = `
      mutation AddToCart($productId: ID!, $quantity: Int!) {
        addToCart(productId: $productId, quantity: $quantity) {
          id userId items { productId quantity selected }
        }
      }
    `;
    const variables = { productId, quantity: 1 };
    const resp = await axios.post('/v1/graphql', { query: mutation, variables });
    const body = resp ?? {};
    const cartResp = body?.data?.addToCart ?? body?.addToCart ?? (body?.data?.cart ?? null);
    return cartResp;
};

// Update cart item quantity
export const updateCartItemService = async (productId, quantity) => {
    const mut = `mutation Update($productId: ID!, $quantity: Int!) { updateCartItem(productId:$productId, quantity:$quantity) { id } }`;
    await axios.post('/v1/graphql', { query: mut, variables: { productId, quantity } });
};

// Remove from cart
export const removeFromCartService = async (productId) => {
    const mut = `mutation Remove($productId: ID!) { removeFromCart(productId:$productId) { id } }`;
    await axios.post('/v1/graphql', { query: mut, variables: { productId } });
};

// Toggle select items in cart
export const toggleSelectItemsService = async (productIds, selected) => {
    const mut = `mutation Toggle($productIds: [ID!]!, $selected: Boolean!) { toggleSelectItems(productIds:$productIds, selected:$selected) { id } }`;
    await axios.post('/v1/graphql', { query: mut, variables: { productIds, selected } });
};

// Checkout
export const checkoutService = async (items) => {
    const gql = `
      mutation Checkout($items: [CheckoutItemInput!]) {
        checkout(items: $items) { EC EM order { id total } }
      }
    `;
    const variables = { items };
    const resp = await axios.post('/v1/graphql', { query: gql, variables });
    const body = resp ?? {};
    const result = body?.data?.checkout ?? body?.checkout ?? body;
    return result;
};

// Format price helper
export const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
};
