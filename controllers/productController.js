const Product = require('../models/product');
const mongoose = require('mongoose');

// Hiển thị danh sách tất cả sản phẩm
exports.getListProduct = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
};

// Hiển thị thông tin chi tiết của sản phẩm theo ID
exports.getProductById = async (req, res) => {
    const { id } = req.params;

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID không hợp lệ!" });
        }

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại" });
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
};

// Hiển thị danh sách sản phẩm theo ID của category
exports.getProductsByCategoryId = async (req, res) => {
    const { categoryId } = req.params;

    try {
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({ message: "ID danh mục không hợp lệ!" });
        }

        const products = await Product.find({ categoryId }).sort({ createdAt: -1 });

        if (products.length === 0) {
            return res.status(404).json({ message: "Không có sản phẩm nào trong danh mục này" });
        }

        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
};


// Thêm sản phẩm mới
exports.addProduct = async (req, res) => {
    try {
        const { categoryId, name, price, description } = req.body;
        const { file } = req; // Nhận file hình ảnh từ request
        let imageUrl = null;

        if (file) {
            imageUrl = `${req.protocol}://192.168.1.249:3000/uploads/${file.filename}`; // Đường dẫn hình ảnh
        }

        const newProduct = new Product({
            categoryId,
            name,
            imageUrl,
            price,
            description,
        });

        const result = await newProduct.save();
        res.status(201).json(result);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "Server Error" });
    }
};

// Cập nhật sản phẩm
exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const { categoryId, name, price, description, status } = req.body;

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID không hợp lệ!" });
        }

        const currentProduct = await Product.findById(id);
        if (!currentProduct) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại" });
        }

        let imageUrl = currentProduct.imageUrl; // Giữ lại imageUrl cũ nếu không có hình mới

        if (req.file) {
            imageUrl = `${req.protocol}://localhost:3000/uploads/${req.file.filename}`; // Cập nhật hình ảnh mới
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { categoryId, name, imageUrl, price, description, status },
            { new: true }
        );

        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "Server Error" });
    }
};

// Xóa sản phẩm
exports.deleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID không hợp lệ!" });
        }

        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại" });
        }

        res.status(200).json({ message: "Sản phẩm đã được xóa thành công" });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "Server Error" });
    }
};
