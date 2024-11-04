const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            }
        }
    ]
}, { timestamps: true });

// Hàm tính tổng tiền
cartSchema.methods.getTotalAmount = async function() {
    const products = await Promise.all(this.products.map(async (item) => {
        const product = await mongoose.model('Product').findById(item.productId);
        return product ? product.price * item.quantity : 0;
    }));
    return products.reduce((total, price) => total + price, 0);
};

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
