const mongoose = require('mongoose');

const thongBaoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ten: {
    type: String,
    required: [true, 'Vui lòng nhập tiêu đề thông báo'],
    trim: true,
    maxlength: [255, 'Tiêu đề không quá 255 ký tự']
  },
  moTa: {
    type: String,
    maxlength: [255, 'Mô tả không quá 255 ký tự']
  },
  noiDung: {
    type: String,
    maxlength: [1000, 'Nội dung không quá 1000 ký tự']
  },
  theLoai: {
    type: String,
    enum: ['Thông báo chung', 'Đặt bàn', 'Thanh toán', 'Khuyến mãi', 'Khác'],
    default: 'Thông báo chung'
  },
  daDoc: {
    type: Boolean,
    default: false
  },
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

module.exports = mongoose.model('ThongBao', thongBaoSchema);