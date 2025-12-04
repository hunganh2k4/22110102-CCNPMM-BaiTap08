const { Joi } = require("express-validation");

// =========================
//   VALIDATION TẠO SẢN PHẨM
// =========================
const createProductValidation = {
    body: Joi.object({
        name: Joi.string()
            .min(3)
            .max(100)
            .required()
            .messages({
                "string.base": "Tên sản phẩm phải là chuỗi",
                "string.empty": "Tên sản phẩm không được để trống",
                "string.min": "Tên sản phẩm phải có ít nhất 3 ký tự",
                "string.max": "Tên sản phẩm không được vượt quá 100 ký tự",
                "any.required": "Tên sản phẩm là bắt buộc"
            }),

        price: Joi.number()
            .min(0)
            .required()
            .messages({
                "number.base": "Giá sản phẩm phải là số",
                "number.min": "Giá sản phẩm phải lớn hơn hoặc bằng 0",
                "any.required": "Giá sản phẩm là bắt buộc"
            }),

        description: Joi.string()
            .max(500)
            .required()
            .messages({
                "string.base": "Mô tả phải là chuỗi",
                "string.empty": "Mô tả không được để trống",
                "string.max": "Mô tả không vượt quá 500 ký tự",
                "any.required": "Mô tả sản phẩm là bắt buộc"
            }),

        stock: Joi.number()
            .min(0)
            .required()
            .messages({
                "number.base": "Số lượng phải là số",
                "number.min": "Số lượng không được âm",
                "any.required": "Số lượng là bắt buộc"
            }),

        category: Joi.string()
            .required()
            .messages({
                "string.base": "Danh mục phải là chuỗi",
                "string.empty": "Danh mục không được để trống",
                "any.required": "Danh mục sản phẩm là bắt buộc"
            }),

        image: Joi.string()
            .required()
            .messages({
                "string.base": "Link ảnh phải là chuỗi",
                "string.empty": "Ảnh sản phẩm không được để trống",
                "any.required": "Ảnh sản phẩm là bắt buộc"
            })
    })
};

// =========================
//   VALIDATION UPDATE
// =========================
const updateProductValidation = {
    body: Joi.object({
        name: Joi.string()
            .min(3)
            .max(100)
            .messages({
                "string.base": "Tên sản phẩm phải là chuỗi",
                "string.min": "Tên sản phẩm phải có ít nhất 3 ký tự",
                "string.max": "Tên sản phẩm không vượt quá 100 ký tự"
            }),

        price: Joi.number()
            .min(0)
            .messages({
                "number.base": "Giá sản phẩm phải là số",
                "number.min": "Giá sản phẩm phải lớn hơn hoặc bằng 0"
            }),

        description: Joi.string()
            .max(500)
            .messages({
                "string.base": "Mô tả phải là chuỗi",
                "string.max": "Mô tả không vượt quá 500 ký tự"
            }),

        stock: Joi.number()
            .min(0)
            .messages({
                "number.base": "Số lượng phải là số",
                "number.min": "Số lượng không được âm"
            }),

        category: Joi.string()
            .messages({
                "string.base": "Danh mục phải là chuỗi"
            }),

        image: Joi.string()
            .messages({
                "string.base": "Link ảnh phải là chuỗi"
            })
    })
};

module.exports = {
    createProductValidation,
    updateProductValidation
};
