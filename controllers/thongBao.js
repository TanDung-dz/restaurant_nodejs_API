const ThongBao = require('../models/thongBao');

// @desc    Tạo thông báo mới
// @route   POST /api/thongbao
// @access  Private/Admin
exports.createThongBao = async (req, res) => {
  try {
    const thongBao = await ThongBao.create(req.body);
    
    res.status(201).json({
      success: true,
      data: thongBao
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

// @desc    Lấy tất cả thông báo của một user
// @route   GET /api/thongbao
// @access  Private
exports.getThongBaos = async (req, res) => {
  try {
    // Các user chỉ thấy thông báo của họ, admin thấy tất cả
    let query;
    
    if (req.user.quyen === 1 && req.query.all === 'true') {
      // Admin có thể xem tất cả thông báo nếu có param all=true
      query = ThongBao.find();
    } else {
      // Mặc định chỉ xem thông báo của mình
      query = ThongBao.find({ 
        userId: req.user.id,
        hide: false
      });
    }
    
    // Tùy chọn sắp xếp (mặc định mới nhất trước)
    query = query.sort('-ngayTao');
    
    // Thực hiện query
    const thongBaos = await query;
    
    res.status(200).json({
      success: true,
      count: thongBaos.length,
      data: thongBaos
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Lỗi server'
    });
  }
};

// @desc    Lấy thông báo theo ID
// @route   GET /api/thongbao/:id
// @access  Private
exports.getThongBao = async (req, res) => {
  try {
    const thongBao = await ThongBao.findById(req.params.id);
    
    if (!thongBao) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy thông báo'
      });
    }
    
    // Kiểm tra quyền: chỉ user nhận thông báo hoặc admin mới được xem
    if (thongBao.userId.toString() !== req.user.id && req.user.quyen !== 1) {
      return res.status(403).json({
        success: false,
        error: 'Không có quyền xem thông báo này'
      });
    }
    
    // Đánh dấu đã đọc
    if (!thongBao.daDoc && thongBao.userId.toString() === req.user.id) {
      thongBao.daDoc = true;
      await thongBao.save();
    }
    
    res.status(200).json({
      success: true,
      data: thongBao
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Lỗi server'
    });
  }
};

// @desc    Cập nhật thông báo
// @route   PUT /api/thongbao/:id
// @access  Private/Admin
exports.updateThongBao = async (req, res) => {
  try {
    // Chỉ admin mới được cập nhật nội dung thông báo
    if (req.user.quyen !== 1) {
      return res.status(403).json({
        success: false,
        error: 'Không có quyền cập nhật thông báo'
      });
    }
    
    // Thêm ngày cập nhật
    req.body.ngayCapNhap = Date.now();
    
    const thongBao = await ThongBao.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!thongBao) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy thông báo'
      });
    }
    
    res.status(200).json({
      success: true,
      data: thongBao
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

// @desc    Đánh dấu đã đọc thông báo
// @route   PUT /api/thongbao/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const thongBao = await ThongBao.findById(req.params.id);
    
    if (!thongBao) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy thông báo'
      });
    }
    
    // Kiểm tra quyền: chỉ user nhận thông báo mới được đánh dấu đã đọc
    if (thongBao.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Không có quyền cập nhật thông báo này'
      });
    }
    
    // Đánh dấu đã đọc
    thongBao.daDoc = true;
    thongBao.ngayCapNhap = Date.now();
    
    await thongBao.save();
    
    res.status(200).json({
      success: true,
      data: thongBao
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Lỗi server'
    });
  }
};

// @desc    Ẩn/Xóa thông báo (soft delete)
// @route   DELETE /api/thongbao/:id
// @access  Private
exports.deleteThongBao = async (req, res) => {
  try {
    const thongBao = await ThongBao.findById(req.params.id);
    
    if (!thongBao) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy thông báo'
      });
    }
    
    // Kiểm tra quyền: chỉ admin hoặc user nhận thông báo mới được xóa
    if (thongBao.userId.toString() !== req.user.id && req.user.quyen !== 1) {
      return res.status(403).json({
        success: false,
        error: 'Không có quyền xóa thông báo này'
      });
    }
    
    // Nếu là admin, cho phép xóa hoàn toàn
    if (req.user.quyen === 1 && req.query.permanent === 'true') {
      await thongBao.deleteOne();
    } else {
      // Ẩn thông báo (soft delete)
      thongBao.hide = true;
      thongBao.ngayCapNhap = Date.now();
      await thongBao.save();
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Lỗi server'
    });
  }
};

// @desc    Đánh dấu tất cả thông báo đã đọc
// @route   PUT /api/thongbao/readall
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    // Cập nhật tất cả thông báo chưa đọc của user
    await ThongBao.updateMany(
      { userId: req.user.id, daDoc: false },
      { daDoc: true, ngayCapNhap: Date.now() }
    );
    
    res.status(200).json({
      success: true,
      message: 'Đã đánh dấu tất cả thông báo là đã đọc'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Lỗi server'
    });
  }
};