const Order = require("../models/order");
const Cart = require("../models/cart");
const Product = require("../models/product");
const mongoose = require("mongoose");

/**
 * createOrder(userId, items?)
 * - items: optional array [{ productId, name, price, quantity }]
 * - if items not provided, use cart.selected items
 * Returns { EC, EM, data? }
 */
const createOrder = async (userId, items = null) => {
  try {
    if (!userId) return { EC: 1, EM: "Missing userId" };
    const uid = new mongoose.Types.ObjectId(String(userId));

    let orderItems = [];

    if (Array.isArray(items) && items.length > 0) {
      orderItems = items.map(it => ({
        productId: it.productId ? new mongoose.Types.ObjectId(it.productId) : null,
        name: it.name || "",
        price: Number(it.price || 0),
        quantity: Number(it.quantity || 1)
      }));
    } else {
      const cart = await Cart.findOne({ userId: uid }).lean();
      const selected = (cart?.items || []).filter(i => i.selected);
      if (!selected || selected.length === 0) {
        return { EC: 2, EM: "Không có sản phẩm được chọn trong giỏ hàng" };
      }
      for (const si of selected) {
        const prod = await Product.findById(si.productId).lean();
        orderItems.push({
          productId: si.productId ? new mongoose.Types.ObjectId(si.productId) : null,
          name: prod?.name || si.name || "",
          price: prod?.price != null ? prod.price : (si.price || 0),
          quantity: si.quantity || 1
        });
      }
    }

    if (orderItems.length === 0) {
      return { EC: 3, EM: "Không có sản phẩm để tạo đơn" };
    }

    // 1) Check stock availability for each item
    for (const oi of orderItems) {
      if (!oi.productId) {
        return { EC: 4, EM: "ProductId missing in order item" };
      }
      const prod = await Product.findById(oi.productId).lean();
      if (!prod) {
        return { EC: 5, EM: `Không tìm thấy sản phẩm (${oi.productId})` };
      }
      if ((prod.stock || 0) < (oi.quantity || 0)) {
        return { EC: 6, EM: `Sản phẩm "${prod.name || prod._id}" không đủ số lượng` };
      }
    }

    // 2) Decrement stock atomically for each item
    for (const oi of orderItems) {
      await Product.findByIdAndUpdate(oi.productId, { $inc: { stock: -Math.max(0, Number(oi.quantity || 0)) } });
    }

    // 3) Calculate total and create order
    const total = orderItems.reduce((s, it) => s + (Number(it.price || 0) * Number(it.quantity || 0)), 0);

    const order = await Order.create({
      userId: uid,
      items: orderItems,
      total,
      status: "PAID" // demo: mark as PAID
    });

    // 4) Remove paid items from cart (if exists)
    const cart = await Cart.findOne({ userId: uid });
    if (cart) {
      const paidProductIds = orderItems.map(oi => String(oi.productId));
      cart.items = cart.items.filter(i => !paidProductIds.includes(String(i.productId)));
      await cart.save();
    }

    return { EC: 0, EM: "Thanh toán thành công", data: order };
  } catch (error) {
    console.error("orderService.createOrder error:", error);
    return { EC: -1, EM: "Lỗi hệ thống khi tạo đơn hàng" };
  }
};

module.exports = { createOrder };
