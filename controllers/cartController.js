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


// Hàm xóa sản phẩm khỏi giỏ hàng
exports.removeProductFromCart = async (req, res) => {
    try {
        const userId = req.user._id; // ID người dùng đã đăng nhập
        const productId = req.params.productId; // ID sản phẩm cần xóa từ URL

        // Tìm giỏ hàng của người dùng
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ message: "Giỏ hàng không tồn tại." });
        }

        // Tìm vị trí của sản phẩm trong giỏ hàng
        const productIndex = cart.products.findIndex(item => item.productId.toString() === productId);

        if (productIndex === -1) {
            return res.status(404).json({ message: "Sản phẩm không có trong giỏ hàng." });
        }

        // Xóa sản phẩm khỏi giỏ hàng
        cart.products.splice(productIndex, 1);
        
        // Lưu giỏ hàng
        await cart.save();

        res.status(200).json({ message: "Sản phẩm đã được xóa khỏi giỏ hàng.", cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi server." });
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


// Hàm tính tổng tiền cho các sản phẩm đã chọn
exports.calculateSelectedTotal = async (req, res) => {
    try {
        const userId = req.user._id; // ID người dùng đã được xác thực
        const { selectedProductIds } = req.body; // Danh sách sản phẩm được chọn

        // Lấy giỏ hàng của người dùng và populate để lấy thông tin sản phẩm
        const cart = await Cart.findOne({ userId: userId }).populate('products.productId');

        if (!cart) {
            return res.status(404).json({ message: "Giỏ hàng không tồn tại" });
        }

        // Tính tổng tiền cho các sản phẩm được chọn
        const selectedTotalAmount = cart.products.reduce((total, item) => {
            if (selectedProductIds.includes(item.productId._id.toString())) {
                return total + (item.productId.price * item.quantity);
            }
            return total;
        }, 0);

        res.status(200).json({ selectedTotalAmount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi server" });
    }
};


