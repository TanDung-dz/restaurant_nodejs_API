const mongoose = require('mongoose');

const danhGiaSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  nhaHangId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NhaHang',
    required: true
  },
  xepHang: {
    type: Number,
    required: [true, 'Vui lòng đánh giá xếp hạng'],
    min: 1,
    max: 5
  },
  binhLuan: {
    type: String,
    maxlength: [1000, 'Bình luận không quá 1000 ký tự']
  },
  traLoi: {
    type: String,
    maxlength: [1000, 'Trả lời không quá 1000 ký tự']
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

// Ngăn người dùng đánh giá nhiều lần cho một nhà hàng
danhGiaSchema.index({ userId: 1, nhaHangId: 1 }, { unique: true });

module.exports = mongoose.model('DanhGia', danhGiaSchema);