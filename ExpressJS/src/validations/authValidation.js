const { Joi } = require("express-validation");

// Validation for user registration
const registerValidation = {
  body: Joi.object({
    name: Joi.string()
      .min(3)
      .max(100)
      .required()
      .messages({
        "string.base": "Tên phải là chuỗi",
        "string.empty": "Tên không được để trống",
        "string.min": "Tên phải có ít nhất 3 ký tự",
        "string.max": "Tên không được vượt quá 100 ký tự",
        "any.required": "Tên là bắt buộc"
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        "string.email": "Email không hợp lệ",
        "string.empty": "Email không được để trống",
        "any.required": "Email là bắt buộc"
      }),
    password: Joi.string()
      .min(6)
      .max(128)
      .required()
      .messages({
        "string.base": "Mật khẩu phải là chuỗi",
        "string.empty": "Mật khẩu không được để trống",
        "string.min": "Mật khẩu phải có ít nhất 6 ký tự",
        "string.max": "Mật khẩu không được vượt quá 128 ký tự",
        "any.required": "Mật khẩu là bắt buộc"
      })
  })
};

// Validation for login
const loginValidation = {
  body: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        "string.email": "Email không hợp lệ",
        "string.empty": "Email không được để trống",
        "any.required": "Email là bắt buộc"
      }),
    password: Joi.string()
      .required()
      .messages({
        "string.base": "Mật khẩu phải là chuỗi",
        "string.empty": "Mật khẩu không được để trống",
        "any.required": "Mật khẩu là bắt buộc"
      })
  })
};

// Validation for forgot password
const forgotPasswordValidation = {
  body: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        "string.email": "Email không hợp lệ",
        "string.empty": "Email không được để trống",
        "any.required": "Email là bắt buộc"
      }),
    newPassword: Joi.string()
      .min(6)
      .max(128)
      .required()
      .messages({
        "string.base": "Mật khẩu mới phải là chuỗi",
        "string.empty": "Mật khẩu mới không được để trống",
        "string.min": "Mật khẩu mới phải có ít nhất 6 ký tự",
        "string.max": "Mật khẩu mới không được vượt quá 128 ký tự",
        "any.required": "Mật khẩu mới là bắt buộc"
      })
  })
};

module.exports = {
  registerValidation,
  loginValidation,
  forgotPasswordValidation
};

// Usage (example, not applied here):
// const { validate } = require('express-validation');
// const { registerValidation } = require('../validations/authValidation');
// router.post('/register', validate(registerValidation), createUser);
