const mongoose = require('mongoose');

const chiTietDatMonSchema = new mongoose.Schema({
  monAnId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MonAn',
    required: true
  },
  soLuong: {
    type: Number,
    required: true,
    min: 1
  },
  ghiChu: String,
  donGia: Number,
  thanhTien: Number
});

const thongTinDatBanSchema = new mongoose.Schema({
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
  thoiGianDatBan: {
    type: Date,
    required: true
  },
  soLuongKhach: {
    type: Number,
    required: true
  },
  yeuCau: String,
  ban: [{
    banId: {
      type: mongoose.Schema.Types.ObjectId
    }
  }],
  monAn: [chiTietDatMonSchema],
  thanhToan: {
    soLuong: Number,
    phuongThucThanhToan: {
      type: Number,
      default: 0 // 0: Tiền mặt, 1: Thẻ, 2: Ví điện tử
    },
    trangThaiThanhToan: {
      type: Number,
      default: 0 // 0: Chưa thanh toán, 1: Đã thanh toán
    },
    ngayThanhToan: Date,
    maGiaoDich: String
  },
  trangThai: {
    type: Number,
    default: 0 // 0: Đang chờ, 1: Đã xác nhận, 2: Đã hoàn thành, 3: Đã hủy
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

module.exports = mongoose.model('ThongTinDatBan', thongTinDatBanSchema);