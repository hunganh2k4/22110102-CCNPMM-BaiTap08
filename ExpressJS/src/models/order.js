const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
  name: { type: String },
  price: { type: Number, default: 0 },
  quantity: { type: Number, default: 1 }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  items: { type: [orderItemSchema], default: [] },
  total: { type: Number, default: 0 },
  status: { type: String, default: "PENDING" } // PENDING / PAID / CANCELLED
}, { timestamps: true });

const Order = mongoose.model("order", orderSchema);

module.exports = Order;
