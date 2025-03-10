const mongoose = require('mongoose');

const loaiMonAnSchema = new mongoose.Schema({
  tenLoai: {
    type: String,
    required: [true, 'Vui lòng nhập tên loại món ăn'],
    trim: true,
    maxlength: [255, 'Tên loại món ăn không quá 255 ký tự']
  },
  moTa: {
    type: String,
    maxlength: [255, 'Mô tả không quá 255 ký tự']
  },
  hide: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('LoaiMonAn', loaiMonAnSchema);