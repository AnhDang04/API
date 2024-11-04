// commentController.js

const Comment = require('../models/comment');
const Order = require('../models/oder');

exports.addComment = async (req, res) => {
    try {
        const userId = req.user._id; // ID người dùng đã đăng nhập
        const productId = req.params.productId; // ID sản phẩm từ URL
        const { content, rating } = req.body; // Lấy nội dung và đánh giá từ body

        // Kiểm tra rating hợp lệ
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Đánh giá phải từ 1 đến 5 sao." });
        }

        // Kiểm tra xem người dùng đã mua sản phẩm này chưa
        const order = await Order.findOne({
            user_id: userId,
            status: 'completed', // Chỉ kiểm tra trong các đơn hàng đã hoàn thành
        }).populate({
            path: 'orderItems', // Đảm bảo bạn đã thêm orderItems vào mô hình Order
            match: { product_id: productId } // Kiểm tra xem sản phẩm có trong đơn hàng không
        });

        // Nếu không có đơn hàng hoặc không có sản phẩm nào, trả về lỗi
        if (!order || !order.orderItems.length) {
            return res.status(403).json({ message: "Bạn chưa mua sản phẩm này." });
        }

        // Kiểm tra xem người dùng đã đánh giá sản phẩm chưa
        const existingComment = await Comment.findOne({ productId, userId });
        if (existingComment) {
            return res.status(400).json({ message: "Bạn đã đánh giá sản phẩm này rồi." });
        }

        // Tạo đánh giá mới
        const newComment = new Comment({
            productId,
            userId,
            content,
            rating
        });

        // Lưu đánh giá vào cơ sở dữ liệu
        await newComment.save();
        res.status(201).json({ message: "Đánh giá đã được thêm thành công.", comment: newComment });
    } catch (error) {
        console.error('Error adding comment:', error); // Log lỗi để kiểm tra
        res.status(500).json({ message: "Lỗi server." });
    }
};
