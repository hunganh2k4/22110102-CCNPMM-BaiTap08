// src/middleware/roles.js
const allowRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                EC: 3,
                EM: "Bạn không có quyền thực hiện hành động này!"
            });
        }
        next();
    };
};

module.exports = { allowRoles };
