const mongoose = require('mongoose');

const banSchema = new mongoose.Schema({
  soBang: {
    type: Number,
    required: true
  },
  dungTich: {
    type: Number,
    required: true
  }
});

const khuVucSchema = new mongoose.Schema({
  ten: {
    type: String,
    required: true
  },
  diaChi: String,
  tang: String,
  ban: [banSchema]
});

const nhaHangSchema = new mongoose.Schema({
  tenNhaHang: {
    type: String,
    required: [true, 'Vui lòng nhập tên nhà hàng'],
    trim: true,
    maxlength: [255, 'Tên nhà hàng không quá 255 ký tự']
  },
  diaChi: {
    type: String,
    required: [true, 'Vui lòng nhập địa chỉ']
  },
  sdt: {
    type: String
  },
  email: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Vui lòng nhập email hợp lệ'
    ]
  },
  mieuTa: {
    type: String,
    maxlength: [1000, 'Miêu tả không quá 1000 ký tự']
  },
  openTime: {
    type: Date
  },
  closeTime: {
    type: Date
  },
  dungTich: {
    type: Number
  },
  xepHangTrungBinh: {
    type: Number,
    min: [1, 'Xếp hạng không thể dưới 1'],
    max: [5, 'Xếp hạng không thể trên 5'],
    default: 0
  },
  anh: [String],
  khuVuc: [khuVucSchema],
  ngayTao: {
    type: Date,
    default: Date.now
  },
  ngayCapNhap: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('NhaHang', nhaHangSchema);