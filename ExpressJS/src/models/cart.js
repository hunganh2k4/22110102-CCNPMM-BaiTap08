const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "product", required: true },
    quantity: { type: Number, default: 1, min: 1 },
    selected: { type: Boolean, default: true }
}, { _id: false });

const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", unique: true, required: true },
    items: { type: [cartItemSchema], default: [] }
}, { timestamps: true });

const Cart = mongoose.model("cart", cartSchema);

module.exports = Cart;
