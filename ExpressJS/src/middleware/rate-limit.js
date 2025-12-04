const rateLimit = require("express-rate-limit");

// Giới hạn: 100 request mỗi 15 phút cho product API
const productRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        EC: 429,
        EM: "Bạn đang thao tác quá nhanh, vui lòng thử lại sau."
    }
});

module.exports = { productRateLimit };