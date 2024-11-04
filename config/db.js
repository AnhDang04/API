const mongoose = require("mongoose");

// Thay thế <password> bằng mật khẩu thực tế, và mã hóa URL nếu cần
const local = "mongodb://localhost:27017/SHOPTEA"
const connect = async () => {
  try {
    await mongoose.connect(local); // Không cần useNewUrlParser và useUnifiedTopology
    console.log("Connection success");
  } catch (error) {
    console.error("Connection error:", error);
  }
};

module.exports = { connect };
