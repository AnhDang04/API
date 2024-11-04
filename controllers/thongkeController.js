const Order = require('../models/oder');
const OrderItem = require('../models/oderItem');

// Thống kê tổng doanh thu từ các đơn hàng đã hoàn thành
exports.getTotalRevenue = async (req, res) => {
    try {
        const totalRevenue = await OrderItem.aggregate([
            {
                $lookup: {
                    from: 'orders', // Tên collection đơn hàng
                    localField: 'order_id',
                    foreignField: '_id',
                    as: 'orderDetails'
                }
            },
            {
                $unwind: '$orderDetails' // Tách từng đơn hàng
            },
            {
                $match: {
                    'orderDetails.status': 'completed' // Chỉ lấy những đơn hàng đã hoàn thành
                }
            },
            {
                $group: {
                    _id: null, // Nhóm tất cả lại với nhau
                    totalRevenue: { $sum: { $multiply: ['$quantity', '$price'] } } // Tính tổng doanh thu
                }
            }
        ]);

        res.status(200).json({ totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].totalRevenue : 0 });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi server." });
    }
};


// doanh thu từng sản phẩm
exports.getRevenueByProduct = async (req, res) => {
    try {
        const completedOrders = await OrderItem.aggregate([
            {
                $lookup: {
                    from: 'orders', // Tên collection đơn hàng
                    localField: 'order_id',
                    foreignField: '_id',
                    as: 'orderDetails'
                }
            },
            {
                $unwind: '$orderDetails' // Tách từng đơn hàng
            },
            {
                $match: {
                    'orderDetails.status': 'completed' // Chỉ lấy những đơn hàng đã hoàn thành
                }
            },
            {
                $group: {
                    _id: '$product_id', // Nhóm theo product_id
                    totalRevenue: { $sum: { $multiply: ['$quantity', '$price'] } } // Tính tổng doanh thu
                }
            },
            {
                $lookup: {
                    from: 'products', // Tên collection sản phẩm
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            {
                $unwind: '$productDetails' // Tách từng sản phẩm
            },
            {
                $project: {
                    product_id: '$_id',
                    product_name: '$productDetails.name',
                    totalRevenue: 1
                }
            }
        ]);

        res.status(200).json({ revenue: completedOrders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi server." });
    }
};


// Hàm thống kê tổng số sản phẩm đã được bán ra từ các đơn hàng hoàn thành
exports.getTotalProductsSold = async (req, res) => {
    try {
        // Tìm tất cả các đơn hàng có trạng thái 'completed'
        const completedOrders = await Order.find({ status: 'completed' });
        
        // Khởi tạo biến đếm
        let totalProductsSold = 0;

        // Duyệt qua từng đơn hàng và tính tổng số sản phẩm
        for (const order of completedOrders) {
            const orderItems = await OrderItem.find({ order_id: order._id });
            totalProductsSold += orderItems.reduce((sum, item) => sum + item.quantity, 0);
        }

        // Trả về kết quả
        res.status(200).json({ totalProductsSold });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi server." });
    }
};