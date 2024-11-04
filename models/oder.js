const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    total_price: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'confirmed'  // Đơn hàng được xác nhận ngay khi đặt hàng thành công
    },
    payment_method: {
        type: String,
        enum: ['credit_card', 'paypal', 'cash_on_delivery'],
        default: 'cash_on_delivery'
    },
    payment_status: {
        type: String,
        enum: ['completed', 'failed'],
        default: 'completed'  // Giả định thanh toán thành công khi chọn xong
    },
    
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
