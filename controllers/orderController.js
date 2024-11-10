const Order = require('../models/oder');
const OrderItem = require('../models/oderItem');
const Cart = require('../models/cart');
const Product = require('../models/product');


// Lấy danh sách phương thức thanh toán
exports.getPaymentMethods = (req, res) => {
    const paymentMethods = ['credit_card', 'paypal', 'cash_on_delivery'];
    res.status(200).json({ paymentMethods });
};

// Xác nhận đơn hàng
exports.confirmOrder = async (req, res) => {
    try {
        const userId = req.user._id;
        const { selectedProducts, payment_method } = req.body;

        // Kiểm tra giỏ hàng người dùng
        const cart = await Cart.findOne({ userId }).populate('products.productId');
        if (!cart) {
            return res.status(404).json({ message: "Giỏ hàng không tồn tại." });
        }

        // Lọc các sản phẩm đã chọn
        const productsToOrder = cart.products.filter(item => 
            selectedProducts.includes(item.productId._id.toString())
        );

        if (productsToOrder.length === 0) {
            return res.status(400).json({ message: "Không có sản phẩm nào được chọn để thanh toán." });
        }

        // Tính tổng tiền cho các sản phẩm đã chọn
        const total_price = productsToOrder.reduce((total, item) => {
            return total + (item.productId.price * item.quantity);
        }, 0);

        // Tạo đơn hàng mới
        const newOrder = await Order.create({
            user_id: userId,
            total_price,
            status: 'confirmed',
            payment_method,
            payment_status: 'completed'
        });

        // Tạo các mục của đơn hàng
        const orderItems = productsToOrder.map(item => ({
            order_id: newOrder._id,
            product_id: item.productId._id,
            quantity: item.quantity,
            price: item.productId.price
        }));

        await OrderItem.insertMany(orderItems);

        // Xóa các sản phẩm đã đặt ra khỏi giỏ hàng
        cart.products = cart.products.filter(item => 
            !selectedProducts.includes(item.productId._id.toString())
        );
        await cart.save();

        // Trả về thông tin đơn hàng
        res.status(201).json({
            message: "Đặt hàng thành công!",
            order: {
                id: newOrder._id,
                total_price: newOrder.total_price,
                payment_method: newOrder.payment_method,
                status: newOrder.status,
                items: orderItems
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi server." });
    }
};


// Lấy thông tin chi tiết của đơn hàng
exports.getOrderDetails = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const userId = req.user._id; // ID người dùng đã đăng nhập

        // Tìm đơn hàng theo ID và người dùng
        const order = await Order.findOne({ _id: orderId, user_id: userId });
        if (!order) {
            return res.status(404).json({ message: "Đơn hàng không tồn tại." });
        }

        // Tìm các sản phẩm trong đơn hàng
        const orderItems = await OrderItem.find({ order_id: orderId }).populate('product_id', 'name price');

        // Chuẩn bị dữ liệu để trả về
        const orderDetails = {
            order_id: order._id,
            total_price: order.total_price,
            payment_method: order.payment_method,
            status: order.status,
            items: orderItems.map(item => ({
                product_id: item.product_id._id,
                product_name: item.product_id.name,
                quantity: item.quantity,
                price: item.price,
                total_price: item.price * item.quantity
            })),
            createdAt: order.createdAt,
            updatedAt: order.updatedAt
        };

        res.status(200).json({ orderDetails });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi server." });
    }
};


// Hàm hiển thị tất cả đơn hàng của người dùng
exports.getAllOrders = async (req, res) => {
    try {
        const userId = req.user._id; // Lấy ID người dùng từ request
        console.log('User ID:', userId); // Log user ID để kiểm tra

        // Tìm tất cả đơn hàng của người dùng
        const orders = await Order.find({ user_id: userId });

        if (!orders.length) {
            return res.status(404).json({ message: "Không có đơn hàng nào." });
        }

        // Lấy thông tin chi tiết cho từng đơn hàng
        const ordersWithItems = await Promise.all(orders.map(async (order) => {
            // Tìm các sản phẩm trong đơn hàng
            const orderItems = await OrderItem.find({ order_id: order._id }).populate('product_id', 'name price');

            return {
                order_id: order._id,
                total_price: order.total_price,
                payment_method: order.payment_method,
                status: order.status,
                items: orderItems.map(item => ({
                    product_id: item.product_id._id,
                    product_name: item.product_id.name,
                    quantity: item.quantity,
                    price: item.price,
                    total_price: item.price * item.quantity
                })),
                createdAt: order.createdAt,
                updatedAt: order.updatedAt
            };
        }));

        res.status(200).json({ orders: ordersWithItems });
    } catch (error) {
        console.error('Error fetching orders:', error); // Log lỗi để kiểm tra
        res.status(500).json({ message: "Lỗi server." });
    }
};


// orderController.js

exports.updateOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.id;
        const { status } = req.body;

        // Kiểm tra trạng thái có hợp lệ hay không
        const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Trạng thái không hợp lệ." });
        }

        // Cập nhật trạng thái đơn hàng
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status: status },
            { new: true } // Trả về bản ghi đã cập nhật
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: "Đơn hàng không tồn tại." });
        }

        res.status(200).json({ message: "Trạng thái đơn hàng đã được cập nhật.", updatedOrder });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi server." });
    }
};


