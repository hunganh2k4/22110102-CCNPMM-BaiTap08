const express = require('express');
const { createUser, handleLogin, getUser, getAccount, forgotPassword } = require('../controllers/userController');
const auth = require('../middleware/auth');
const delay = require('../middleware/delay');
const { validate } = require('express-validation');
const { registerValidation, loginValidation, forgotPasswordValidation } = require('../validations/authValidation');

const routerAPI = express.Router();

// Public routes with validation
routerAPI.post("/register", validate(registerValidation), createUser);
routerAPI.post("/login", validate(loginValidation), handleLogin);
routerAPI.post("/forgot-password", validate(forgotPasswordValidation), forgotPassword);

// Apply auth for protected routes
routerAPI.use(auth);

routerAPI.get("/", (req, res) => {
    return res.status(200).json("Hello world api")
});

routerAPI.get("/user", getUser);
routerAPI.get("/account", delay, getAccount);

module.exports = routerAPI; //export default