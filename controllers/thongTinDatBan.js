const ThongTinDatBan = require('../models/thongTinDatBan');
const NhaHang = require('../models/nhaHang');
const User = require('../models/user');
const MonAn = require('../models/monAn');
const notificationUtil = require('../middleware/notification');
// @desc    Đặt bàn mới
// @route   POST /api/datban
// @access  Private
exports.datBan = async (req, res) => {
  try {
    // Thêm userId từ người dùng đã đăng nhập
    req.body.userId = req.user.id;
    
    // Kiểm tra nhà hàng tồn tại
    const nhaHang = await NhaHang.findById(req.body.nhaHangId);
    if (!nhaHang) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy nhà hàng'
      });
    }
    
    // Tạo đơn đặt bàn
    const thongtindatban = await ThongTinDatBan.create(req.body);
    
    // Thêm thông báo
    await notificationUtil.datBanNotification(req.user.id, {
      _id: thongtindatban._id,
      nhaHangId: thongtindatban.nhaHangId,
      thoiGianDatBan: thongtindatban.thoiGianDatBan
    });



    // Tính toán thành tiền cho từng món ăn (nếu có)
    if (req.body.monAn && req.body.monAn.length > 0) {
      for (let i = 0; i < req.body.monAn.length; i++) {
        const monAn = await MonAn.findById(req.body.monAn[i].monAnId);
        if (!monAn) {
          return res.status(404).json({
            success: false,
            error: `Không tìm thấy món ăn với ID: ${req.body.monAn[i].monAnId}`
          });
        }
        
        req.body.monAn[i].donGia = monAn.gia;
        req.body.monAn[i].thanhTien = monAn.gia * req.body.monAn[i].soLuong;
      }
    }
    
    // Tạo đơn đặt bàn
    const datBan = await ThongTinDatBan.create(req.body);
    
    res.status(201).json({
      success: true,
      data: datBan
    });
  } catch (err) {
    console.error(err);
    
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Lỗi server'
    });
  }
};

// @desc    Lấy tất cả đơn đặt bàn
// @route   GET /api/datban
// @access  Private/Admin
exports.getDatBans = async (req, res) => {
  try {
    let query;
    
    // Nếu là admin, lấy tất cả đơn
    if (req.user.quyen === 1) {
      query = ThongTinDatBan.find()
        .populate('userId', 'hoVaTen email sdt')
        .populate('nhaHangId', 'tenNhaHang diaChi')
        .populate({
          path: 'monAn.monAnId',
          select: 'tenMonAn gia'
        });
    } else {
      // Nếu là người dùng thường, chỉ lấy đơn của họ
      query = ThongTinDatBan.find({ userId: req.user.id })
        .populate('nhaHangId', 'tenNhaHang diaChi')
        .populate({
          path: 'monAn.monAnId',
          select: 'tenMonAn gia'
        });
    }
    
    // Thực hiện query
    const datBans = await query;
    
    res.status(200).json({
      success: true,
      count: datBans.length,
      data: datBans
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Lỗi server'
    });
  }
};

// @desc    Lấy chi tiết đơn đặt bàn
// @route   GET /api/datban/:id
// @access  Private
exports.getDatBan = async (req, res) => {
  try {
    const datBan = await ThongTinDatBan.findById(req.params.id)
      .populate('userId', 'hoVaTen email sdt')
      .populate('nhaHangId', 'tenNhaHang diaChi')
      .populate({
        path: 'monAn.monAnId',
        select: 'tenMonAn gia'
      });
    
    if (!datBan) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy đơn đặt bàn'
      });
    }
    
    // Kiểm tra quyền: chỉ admin hoặc chủ đơn mới được xem
    if (datBan.userId._id.toString() !== req.user.id && req.user.quyen !== 1) {
      return res.status(403).json({
        success: false,
        error: 'Không có quyền xem đơn đặt bàn này'
      });
    }
    
    res.status(200).json({
      success: true,
      data: datBan
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Lỗi server'
    });
  }
};

// @desc    Cập nhật đơn đặt bàn
// @route   PUT /api/datban/:id
// @access  Private
exports.updateDatBan = async (req, res) => {
  try {
    let datBan = await ThongTinDatBan.findById(req.params.id);
    
    if (!datBan) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy đơn đặt bàn'
      });
    }
    
    // Kiểm tra quyền: chỉ admin hoặc chủ đơn mới được cập nhật
    if (datBan.userId.toString() !== req.user.id && req.user.quyen !== 1) {
      return res.status(403).json({
        success: false,
        error: 'Không có quyền cập nhật đơn đặt bàn này'
      });
    }
    
    // Người dùng thường chỉ được cập nhật một số trường giới hạn
    if (req.user.quyen !== 1) {
      // Chỉ cho phép người dùng cập nhật một số trường nhất định
      const allowedUpdates = ['yeuCau', 'soLuongKhach', 'thoiGianDatBan'];
      const requestedUpdates = Object.keys(req.body);
      
      const isValidOperation = requestedUpdates.every(update => 
        allowedUpdates.includes(update)
      );
      
      if (!isValidOperation) {
        return res.status(400).json({
          success: false,
          error: 'Không được phép cập nhật các trường này'
        });
      }
    }
    
    // Thêm ngày cập nhật
    req.body.ngayCapNhap = Date.now();
    
    // Cập nhật đơn
    datBan = await ThongTinDatBan.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    res.status(200).json({
      success: true,
      data: datBan
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Lỗi server'
    });
  }
};

// @desc    Hủy đơn đặt bàn
// @route   PUT /api/datban/:id/cancel
// @access  Private
exports.cancelDatBan = async (req, res) => {
  try {
    const datBan = await ThongTinDatBan.findById(req.params.id);
    
    if (!datBan) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy đơn đặt bàn'
      });
    }
    
    // Kiểm tra quyền: chỉ admin hoặc chủ đơn mới được hủy
    if (datBan.userId.toString() !== req.user.id && req.user.quyen !== 1) {
      return res.status(403).json({
        success: false,
        error: 'Không có quyền hủy đơn đặt bàn này'
      });
    }
    
    // Cập nhật trạng thái đơn thành "Đã hủy"
    datBan.trangThai = 3;
    datBan.ngayCapNhap = Date.now();
    
    await datBan.save();
    
    res.status(200).json({
      success: true,
      data: datBan
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Lỗi server'
    });
  }
};

// @desc    Cập nhật trạng thái đơn đặt bàn (dành cho admin)
// @route   PUT /api/datban/:id/status
// @access  Private/Admin
exports.updateDatBanStatus = async (req, res) => {
  try {
    const { trangThai } = req.body;
    
    if (trangThai === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp trạng thái mới'
      });
    }

     // Nếu trạng thái mới là "Đã xác nhận" (1), tạo thông báo
     if (req.body.trangThai === 1) {
        await notificationUtil.xacNhanDatBanNotification(datBan.userId, {
          _id: datBan._id,
          nhaHangId: datBan.nhaHangId,
          thoiGianDatBan: datBan.thoiGianDatBan
        });
      }
    
    const datBan = await ThongTinDatBan.findById(req.params.id);
    
    if (!datBan) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy đơn đặt bàn'
      });
    }
    
    // Cập nhật trạng thái
    datBan.trangThai = trangThai;
    datBan.ngayCapNhap = Date.now();
    
    await datBan.save();
    
    res.status(200).json({
      success: true,
      data: datBan
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Lỗi server'
    });
  }
};

// @desc    Cập nhật thanh toán cho đơn đặt bàn
// @route   PUT /api/datban/:id/thanhtoan
// @access  Private/Admin
exports.updateThanhToan = async (req, res) => {
  try {
    const { phuongThucThanhToan, trangThaiThanhToan, maGiaoDich } = req.body;
    
    const datBan = await ThongTinDatBan.findById(req.params.id);
    
    if (!datBan) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy đơn đặt bàn'
      });
    }
    
    // Tính tổng tiền (nếu chưa có)
    if (!datBan.thanhToan.soLuong) {
      let tongTien = 0;
      if (datBan.monAn && datBan.monAn.length > 0) {
        for (const item of datBan.monAn) {
          tongTien += item.thanhTien || 0;
        }
      }
      datBan.thanhToan.soLuong = tongTien;
    }
    
    // Cập nhật thông tin thanh toán
    if (phuongThucThanhToan !== undefined) {
      datBan.thanhToan.phuongThucThanhToan = phuongThucThanhToan;
    }
    
    if (trangThaiThanhToan !== undefined) {
      datBan.thanhToan.trangThaiThanhToan = trangThaiThanhToan;
      
      // Nếu đã thanh toán, cập nhật ngày thanh toán
      if (trangThaiThanhToan === 1) {
        datBan.thanhToan.ngayThanhToan = Date.now();
      }
    }
    
    if (maGiaoDich) {
      datBan.thanhToan.maGiaoDich = maGiaoDich;
    }
    
    datBan.ngayCapNhap = Date.now();
    
    await datBan.save();
    
    res.status(200).json({
      success: true,
      data: datBan
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Lỗi server'
    });
  }
};

// @desc    Thêm món ăn vào đơn đặt bàn
// @route   PUT /api/datban/:id/monan
// @access  Private
exports.addMonAn = async (req, res) => {
  try {
    const { monAnId, soLuong, ghiChu } = req.body;
    
    if (!monAnId || !soLuong) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp ID món ăn và số lượng'
      });
    }
    
    const datBan = await ThongTinDatBan.findById(req.params.id);
    
    if (!datBan) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy đơn đặt bàn'
      });
    }
    
    // Kiểm tra quyền: chỉ admin hoặc chủ đơn mới được thêm món
    if (datBan.userId.toString() !== req.user.id && req.user.quyen !== 1) {
      return res.status(403).json({
        success: false,
        error: 'Không có quyền cập nhật đơn đặt bàn này'
      });
    }
    
    // Kiểm tra món ăn tồn tại
    const monAn = await MonAn.findById(monAnId);
    if (!monAn) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy món ăn'
      });
    }
    
    // Tính thành tiền
    const thanhTien = monAn.gia * soLuong;
    
    // Kiểm tra xem món ăn đã có trong đơn chưa
    const existingMonAnIndex = datBan.monAn.findIndex(
      item => item.monAnId.toString() === monAnId
    );
    
    if (existingMonAnIndex !== -1) {
      // Cập nhật số lượng nếu món ăn đã tồn tại
      datBan.monAn[existingMonAnIndex].soLuong += soLuong;
      datBan.monAn[existingMonAnIndex].thanhTien = 
        datBan.monAn[existingMonAnIndex].donGia * datBan.monAn[existingMonAnIndex].soLuong;
      
      if (ghiChu) {
        datBan.monAn[existingMonAnIndex].ghiChu = ghiChu;
      }
    } else {
      // Thêm món ăn mới vào đơn
      datBan.monAn.push({
        monAnId,
        soLuong,
        ghiChu,
        donGia: monAn.gia,
        thanhTien
      });
    }
    
    datBan.ngayCapNhap = Date.now();
    
    await datBan.save();
    
    res.status(200).json({
      success: true,
      data: datBan
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Lỗi server'
    });
  }
};

// @desc    Xóa món ăn khỏi đơn đặt bàn
// @route   DELETE /api/datban/:id/monan/:monAnId
// @access  Private
exports.removeMonAn = async (req, res) => {
  try {
    const datBan = await ThongTinDatBan.findById(req.params.id);
    
    if (!datBan) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy đơn đặt bàn'
      });
    }
    
    // Kiểm tra quyền: chỉ admin hoặc chủ đơn mới được xóa món
    if (datBan.userId.toString() !== req.user.id && req.user.quyen !== 1) {
      return res.status(403).json({
        success: false,
        error: 'Không có quyền cập nhật đơn đặt bàn này'
      });
    }
    
    // Tìm index của món ăn cần xóa
    const monAnIndex = datBan.monAn.findIndex(
      item => item.monAnId.toString() === req.params.monAnId
    );
    
    if (monAnIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy món ăn trong đơn đặt bàn'
      });
    }
    
    // Xóa món ăn khỏi danh sách
    datBan.monAn.splice(monAnIndex, 1);
    datBan.ngayCapNhap = Date.now();
    
    await datBan.save();
    
    res.status(200).json({
      success: true,
      data: datBan
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Lỗi server'
    });
  }
};