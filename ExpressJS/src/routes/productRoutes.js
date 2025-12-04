const express = require("express");
const router = express.Router();

const {
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
} = require("../controllers/productController");

const auth = require("../middleware/auth");
const { allowRoles } = require("../middleware/roles");

const { validate } = require("express-validation");
const { createProductValidation, updateProductValidation } = require("../validations/productValidation");


// =============================
// APPLY AUTH FOR ALL PRODUCT ROUTES
// =============================
router.use(auth);

// =============================
// STATIC ROUTES (must come BEFORE dynamic :id routes)
// =============================
router.get("/favorites", allowRoles("User", "Admin", "Staff"), getUserFavorites);
router.get("/category/:category", allowRoles("User", "Admin", "Staff"), getProductsByCategory);

// =============================
// USER PERMISSION
// =============================
router.get("/", allowRoles("User", "Admin", "Staff"), getProducts);

// =============================
// ADMIN + STAFF PERMISSION
// =============================
router.post(
    "/",
    allowRoles("Admin", "Staff"),
    validate(createProductValidation),
    createProduct
);

// =============================
// DYNAMIC ROUTES (/:id routes come AFTER static routes)
// =============================
router.get("/:id", allowRoles("User", "Admin", "Staff"), getProductById);

router.put(
    "/:id",
    allowRoles("Admin", "Staff"),
    validate(updateProductValidation),
    updateProduct
);

router.delete(
    "/:id",
    allowRoles("Admin", "Staff"),
    deleteProduct
);

// =============================
// PRODUCT DETAIL ROUTES
// =============================
router.post("/:id/favorite", allowRoles("User", "Admin", "Staff"), toggleFavorite);
router.post("/:id/comment", allowRoles("User", "Admin", "Staff"), postComment);
router.get("/:id/comments", allowRoles("User", "Admin", "Staff"), getComments);
router.get("/:id/counts", allowRoles("User", "Admin", "Staff"), getCounts);


module.exports = router;
