// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Giả sử bạn có model User

exports.authenticateUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1]; // Lấy token từ header
        const decoded = jwt.verify(token, 'your_jwt_secret'); // Thay 'your_jwt_secret' bằng secret của bạn
        const user = await User.findById(decoded.id); // Tìm người dùng

        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        req.user = user; // Gán người dùng vào request
        next(); // Tiếp tục với request
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized" });
    }
};
