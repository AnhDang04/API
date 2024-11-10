const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    id: { // Thêm trường id
        type: String,
        required: true,
        unique: true // Có thể thêm unique nếu cần
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    imageUrl: {
        type: String,
        default: ''
    },
    status: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
