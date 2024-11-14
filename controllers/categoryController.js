const Category = require('../models/category');
const mongoose = require('mongoose');

// Hiển thị danh sách danh mục
exports.getListCategory = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json(categories);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

// Thêm danh mục mới
exports.addCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const { file } = req;
    let imageUrl = null;

    if (file) {
      imageUrl = `${req.protocol}://192.168.1.249:3000/uploads/${file.filename}`; // Đường dẫn hình ảnh
    }

    const newCategory = new Category({
      name,
      description,
      imageUrl,
    });

    const result = await newCategory.save();
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Server Error" });
  }
};

// Cập nhật danh mục
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID không hợp lệ!" });
    }

    const currentCategory = await Category.findById(id);
    if (!currentCategory) {
      return res.status(404).json({ message: "Category không tồn tại" });
    }

    let imageUrl = currentCategory.imageUrl; // Giữ lại imageUrl cũ nếu không có hình mới

    if (req.file) {
      imageUrl = `${req.protocol}://localhost:3000/uploads/${req.file.filename}`; // Cập nhật hình ảnh mới
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name, description, imageUrl, status },
      { new: true }
    );

    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Server Error" });
  }
};


// Xóa danh mục
exports.deleteCategory = async (req, res) => {
    try {
      const { id } = req.params;
  
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "ID không hợp lệ!" });
      }
  
      const deletedCategory = await Category.findByIdAndDelete(id);
      if (!deletedCategory) {
        return res.status(404).json({ message: "Category không tồn tại" });
      }
  
      res.status(200).json({ message: "Xóa thành công" });
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: "Server Error" });
    }
  };
  