const mongoose = require('mongoose');

const monAnSchema = new mongoose.Schema({
  nhaHangId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NhaHang',
    required: true
  },
  loaiMonAn: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LoaiMonAn',
    required: true
  },
  tenMonAn: {
    type: String,
    required: [true, 'Vui lòng nhập tên món ăn'],
    trim: true,
    maxlength: [255, 'Tên món ăn không quá 255 ký tự']
  },
  moTa: {
    type: String,
    maxlength: [255, 'Mô tả không quá 255 ký tự']
  },
  gia: {
    type: Number,
    required: [true, 'Vui lòng nhập giá món ăn']
  },
  trangThai: {
    type: Number,
    default: 1 // 1: Có sẵn, 0: Hết
  },
  anh: [String],
  ngayTao: {
    type: Date,
    default: Date.now
  },
  ngayCapNhap: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MonAn', monAnSchema);