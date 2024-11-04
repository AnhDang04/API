const User = require('../models/user'); // Đường dẫn tới mô hình User
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Đăng ký người dùng
exports.register = async (req, res) => {
    const { phone, password, name, email } = req.body;

    try {
        // Kiểm tra xem người dùng đã tồn tại chưa
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo người dùng mới
        const newUser = new User({
            phone,
            password: hashedPassword,
            name,
            email,
        });

        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Đăng nhập người dùng
exports.login = async (req, res) => {
    const { phone, password } = req.body;

    try {
        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(400).json({ message: 'Invalid phone or password' });
        }

        // So sánh mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid phone or password' });
        }

        // Tạo JWT token
        const token = jwt.sign({ id: user._id, role: user.role }, 'hihihaha', { expiresIn: '1h' });

        res.status(200).json({ token, user: { id: user._id, phone: user.phone, name: user.name, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Hiển thị thông tin người dùng
exports.getUser = async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ id: user._id, phone: user.phone, name: user.name, email: user.email, role: user.role });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Cập nhật thông tin người dùng
exports.updateUser = async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
