const express = require("express");
const router = express.Router();

const { register, login, getUser, updateUser } = require('../controllers/userController'); 
const Upload = require("../config/upload");
const { getListCategory, addCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { getListProduct, addProduct, updateProduct, deleteProduct, getProductById } = require('../controllers/productController');
const { addToCart, viewCart } = require('../controllers/cartController');
const { authenticateUser } = require('../controllers/auth');

// user
router.post('/register', register);
router.post('/login', login);
router.get('/user/:id', getUser);
router.put('/user/:id', updateUser);

// category(danh mục sản phẩm)
router.get('/categories', getListCategory);
router.post('/categories', Upload.single("imageUrl"), addCategory); 
router.put('/categories/:id', Upload.single("imageUrl"), updateCategory);
router.delete('/categories/:id', deleteCategory); 

// product (sản phẩm)
router.get('/products', getListProduct); 
router.get('/products/:id', getProductById); 
router.post('/products', Upload.single("imageUrl"), addProduct); 
router.put('/products/:id', Upload.single("imageUrl"), updateProduct); 
router.delete('/products/:id', deleteProduct); 

// Giỏ hàng
router.post('/cart', authenticateUser, addToCart); 
router.get('/cart', authenticateUser, viewCart);  


module.exports = router;
