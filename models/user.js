const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  tenDangNhap: {
    type: String,
    required: [true, 'Vui lòng nhập tên đăng nhập'],
    unique: true
  },
  matKhau: {
    type: String,
    required: [true, 'Vui lòng nhập mật khẩu'],
    minlength: 6,
    select: false
  },
  hoVaTen: String,
  email: {
    type: String,
    required: [true, 'Vui lòng nhập email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Vui lòng nhập email hợp lệ'
    ]
  },
  sdt: String,
  quyen: {
    type: Number,
    default: 0
  },
  ngayDK: {
    type: Date,
    default: Date.now
  },
  anh: String,
  hide: {
    type: Boolean,
    default: false
  },
  ngayTao: {
    type: Date,
    default: Date.now
  },
  ngayCapNhap: {
    type: Date,
    default: Date.now
  }
});

// Mã hóa mật khẩu trước khi lưu
userSchema.pre('save', async function(next) {
  if (!this.isModified('matKhau')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.matKhau = await bcrypt.hash(this.matKhau, salt);
});

// Tạo JWT token
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, quyen: this.quyen },
    process.env.JWT_SECRET || 'restaurant_secret_key',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Kiểm tra mật khẩu
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.matKhau);
};

module.exports = mongoose.model('User', userSchema);