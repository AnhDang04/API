const Cart = require('../models/cart');
const Product = require('../models/product'); 

// Hàm thêm sản phẩm vào giỏ hàng
exports.addToCart = async (req, res) => {
    try {
        const userId = req.user._id; // Lấy ID người dùng từ request
        const { productId, quantity } = req.body; // Lấy productId và quantity từ request body

        // Kiểm tra xem sản phẩm có tồn tại không
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại" });
        }

        // Tìm giỏ hàng của người dùng
        let cart = await Cart.findOne({ userId: userId });

        // Nếu giỏ hàng chưa tồn tại, tạo mới
        if (!cart) {
            cart = new Cart({ userId, products: [] });
        }

        // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
        const productIndex = cart.products.findIndex(item => item.productId.toString() === productId);

        if (productIndex > -1) {
            // Nếu sản phẩm đã có, cập nhật số lượng
            cart.products[productIndex].quantity += quantity;
        } else {
            // Nếu sản phẩm chưa có, thêm mới vào giỏ hàng
            cart.products.push({ productId, quantity });
        }

        // Lưu giỏ hàng
        await cart.save();
        res.status(200).json({ message: "Sản phẩm đã được thêm vào giỏ hàng", cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

// Hàm tính tổng tiền
const getTotalAmount = (products) => {
    return products.reduce((total, item) => {
        return total + (item.productId.price * item.quantity); // Tính tổng tiền
    }, 0);
};

// Hiển thị giỏ hàng
exports.viewCart = async (req, res) => {
    try {
        const userId = req.user.id; // Giả sử bạn đã xác thực và có ID người dùng
        const cart = await Cart.findOne({ userId: userId }).populate('products.productId'); // Lấy giỏ hàng của người dùng

        if (!cart) {
            return res.status(404).json({ message: "Giỏ hàng không tồn tại" });
        }

        const totalAmount = getTotalAmount(cart.products); // Tính tổng tiền
        res.status(200).json({ cart, totalAmount }); // Trả về giỏ hàng và tổng tiền
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi server" });
    }
};
