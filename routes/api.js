const express = require("express");
const router = express.Router();

const { register, login, getUser, updateUser } = require('../controllers/userController'); 
const Upload = require("../config/upload");
const { getListCategory, addCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { getListProduct, addProduct, updateProduct, deleteProduct, getProductById, getProductsByCategoryId } = require('../controllers/productController');
const { addToCart, viewCart, calculateSelectedTotal, removeProductFromCart  } = require('../controllers/cartController');
const { authenticateUser } = require('../controllers/auth');
const { getPaymentMethods, confirmOrder, getOrderDetails, getAllOrders, updateOrderStatus, getAllUsersOrders  } = require('../controllers/orderController');
const {getTotalRevenue,getRevenueByProduct, getTotalProductsSold   } = require('../controllers/thongkeController');
const { addComment } = require('../controllers/commentController');

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
router.get('/products/category/:categoryId', getProductsByCategoryId);
router.post('/products', Upload.single("imageUrl"), addProduct); 
router.put('/products/:id', Upload.single("imageUrl"), updateProduct); 
router.delete('/products/:id', deleteProduct); 

// Giỏ hàng
router.post('/cart', authenticateUser, addToCart); 
router.get('/cart', authenticateUser, viewCart); 
router.delete('/cart/products/:productId', authenticateUser, removeProductFromCart); 
// tổng tiền sp đã chọn để tthanh toán 
router.post('/cart/selected-total', authenticateUser, calculateSelectedTotal);
// Lấy phương thức thanh toán
router.get('/order/payment-methods', authenticateUser, getPaymentMethods);


// Xác nhận đặt hàng
router.post('/order/confirm', authenticateUser, confirmOrder);
// Lấy thông đơn hàng
router.get('/order/:orderId', authenticateUser, getOrderDetails);
router.get('/order', authenticateUser, getAllOrders); 
router.get('/orders/all', getAllUsersOrders);


router.put('/orders/updateStatus/:id', updateOrderStatus);


//tổng doanh thu 
router.get('/revenue/total', getTotalRevenue);
// doanh thu theo sản phẩm
router.get('/revenue/products', getRevenueByProduct);
// toongr sp bán ra
router.get('/products/sold/total', getTotalProductsSold); 

//đánh giá 
router.post('/products/:productId/comment', authenticateUser, addComment);

module.exports = router;
