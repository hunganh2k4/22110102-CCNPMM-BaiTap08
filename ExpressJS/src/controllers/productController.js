const productService = require('../services/productService');
const User = require('../models/user');
const Order = require('../models/order');
const Comment = require('../models/comment');
const Product = require('../models/product');
const mongoose = require('mongoose');

const createProduct = async (req, res) => {
    try {
        const data = req.body;
        const result = await productService.createProductService(data);
        return res.status(201).json(result);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ EC: -1, EM: 'Lỗi hệ thống' });
    }
};

const getProducts = async (req, res) => {
    try {
        const query = req.query;
        const result = await productService.getProductsService(query);
        return res.status(200).json(result);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ EC: -1, EM: 'Lỗi hệ thống' });
    }
};

const getProductById = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await productService.getProductByIdService(id);
        return res.status(200).json(result);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ EC: -1, EM: 'Lỗi hệ thống' });
    }
};

const updateProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const result = await productService.updateProductService(id, data);
        if (result.EC === 0) return res.status(200).json(result);
        if (result.EC === 1) return res.status(404).json(result);
        return res.status(500).json(result);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ EC: -1, EM: 'Lỗi hệ thống' });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await productService.deleteProductService(id);
        if (result.EC === 0) return res.status(200).json(result);
        if (result.EC === 1) return res.status(404).json(result);
        return res.status(500).json(result);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ EC: -1, EM: 'Lỗi hệ thống' });
    }
};

// Toggle favorite for current user
const toggleFavorite = async (req, res) => {
    try {
        const productId = req.params.id;
        const userId = req.user?.id;
        
        if (!userId) {
            return res.status(401).json({ EC: 1, EM: "Unauthorized" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ EC: 1, EM: "User not found" });
        }

        const idx = (user.favorites || []).findIndex(f => String(f) === String(productId));
        if (idx >= 0) {
            user.favorites.splice(idx, 1);
        } else {
            user.favorites.push(productId);
        }
        await user.save();
        return res.status(200).json({ EC: 0, EM: "Success", data: user.favorites });
    } catch (err) {
        console.error("toggleFavorite error:", err);
        return res.status(500).json({ EC: -1, EM: 'Lỗi hệ thống' });
    }
};

// Get favorites of current user
const getUserFavorites = async (req, res) => {
    try {
        const userId = req.user?.id || req.query?.userId;
        
        if (!userId) {
            return res.status(401).json({ EC: 1, EM: "Unauthorized - User ID not found" });
        }

        const user = await User.findById(userId).populate('favorites');
        
        if (!user) {
            return res.status(404).json({ EC: 1, EM: "User not found" });
        }

        return res.status(200).json({ EC: 0, data: user.favorites || [] });
    } catch (err) {
        console.error("getUserFavorites error:", err);
        return res.status(500).json({ EC: -1, EM: 'Lỗi hệ thống' });
    }
};

// Post comment for product (current user)
const postComment = async (req, res) => {
    try {
        const productId = req.params.id;
        const userId = req.user && req.user.id;
        const { content } = req.body;
        if (!userId) return res.status(401).json({ EC: 1, EM: "Unauthorized" });

        // basic product existence check (optional)
        const prod = await Product.findById(productId);
        if (!prod) return res.status(404).json({ EC: 1, EM: "Product not found" });

        const comment = await Comment.create({ user: userId, product: productId, content: content || '' });
        return res.status(201).json({ EC: 0, data: comment });
    } catch (err) {
        console.error("postComment error:", err);
        return res.status(500).json({ EC: -1, EM: 'Lỗi hệ thống' });
    }
};

// Get comments for a product (latest first, populated user)
const getComments = async (req, res) => {
    try {
        const productId = req.params.id;
        const comments = await Comment.find({ product: productId }).populate('user', 'name email').sort({ createdAt: -1 }).lean();
        return res.status(200).json({ EC: 0, data: comments });
    } catch (err) {
        console.error("getComments error:", err);
        return res.status(500).json({ EC: -1, EM: 'Lỗi hệ thống' });
    }
};

// Get counts for product: unique buyers and unique commenters
const getCounts = async (req, res) => {
    try {
        const id = req.params.id;
        const buyers = await Order.find({ 'items.productId': id }).distinct('userId');
        const buyersCount = Array.isArray(buyers) ? buyers.length : 0;
        const commenters = await Comment.find({ product: id }).distinct('user');
        const commentsCount = Array.isArray(commenters) ? commenters.length : 0;
        return res.status(200).json({ EC: 0, buyersCount, commentsCount });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ EC: -1, EM: 'Lỗi hệ thống' });
    }
};

const getProductsByCategory = async (req, res) => {
    try {
        const { category, limit } = req.query;
        const result = await productService.getProductsByCategoryService(category, limit || 5);
        if (result.EC === 0) return res.status(200).json(result);
        return res.status(400).json(result);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ EC: -1, EM: 'Lỗi hệ thống' });
    }
};

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    toggleFavorite,
    getUserFavorites,
    postComment,
    getComments,
    getCounts,
    getProductsByCategory
};