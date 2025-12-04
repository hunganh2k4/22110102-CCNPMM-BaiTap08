const Cart = require("../models/cart");
const mongoose = require("mongoose");

const getCart = async (userId) => {
    try {
        const cart = await Cart.findOne({ userId }).lean();
        return cart || { userId, items: [] };
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const addToCart = async (userId, productId, quantity = 1) => {
    try {
        productId = new mongoose.Types.ObjectId(productId);
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = await Cart.create({ userId, items: [{ productId, quantity }] });
            return cart;
        }
        const idx = cart.items.findIndex(i => i.productId.equals(productId));
        if (idx > -1) {
            cart.items[idx].quantity += quantity;
            if (cart.items[idx].quantity < 1) cart.items[idx].quantity = 1;
        } else {
            cart.items.push({ productId, quantity });
        }
        await cart.save();
        return cart;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const updateCartItem = async (userId, productId, quantity) => {
    try {
        productId = new mongoose.Types.ObjectId(productId);
        const cart = await Cart.findOne({ userId });
        if (!cart) return null;
        const idx = cart.items.findIndex(i => i.productId.equals(productId));
        if (idx === -1) return cart;
        if (quantity <= 0) {
            cart.items.splice(idx, 1);
        } else {
            cart.items[idx].quantity = quantity;
        }
        await cart.save();
        return cart;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const removeFromCart = async (userId, productId) => {
    try {
        productId = new mongoose.Types.ObjectId(productId);
        const cart = await Cart.findOne({ userId });
        if (!cart) return null;
        cart.items = cart.items.filter(i => !i.productId.equals(productId));
        await cart.save();
        return cart;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const toggleSelectItems = async (userId, productIds = [], selected = true) => {
    try {
        const cart = await Cart.findOne({ userId });
        if (!cart) return null;
        const ids = productIds.map(id => new mongoose.Types.ObjectId(id));
        cart.items = cart.items.map(i => {
            if (ids.some(pid => pid.equals(i.productId))) {
                return { ...i.toObject(), selected };
            }
            return i;
        });
        await cart.save();
        return cart;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const clearCart = async (userId) => {
    try {
        const cart = await Cart.findOneAndUpdate({ userId }, { items: [] }, { new: true, upsert: true });
        return cart;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    toggleSelectItems,
    clearCart
};
