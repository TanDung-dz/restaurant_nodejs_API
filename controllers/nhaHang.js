const NhaHang = require('../models/nhaHang');

// @desc    Lấy tất cả nhà hàng
// @route   GET /api/nhahang
// @access  Public
exports.getNhaHangs = async (req, res) => {
  try {
    // Thực hiện query
    const nhaHangs = await NhaHang.find();

    res.status(200).json({
      success: true,
      count: nhaHangs.length,
      data: nhaHangs
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Lỗi server'
    });
  }
};

// @desc    Lấy một nhà hàng
// @route   GET /api/nhahang/:id
// @access  Public
exports.getNhaHang = async (req, res) => {
  try {
    const nhaHang = await NhaHang.findById(req.params.id);

    if (!nhaHang) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy nhà hàng'
      });
    }

    res.status(200).json({
      success: true,
      data: nhaHang
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Lỗi server'
    });
  }
};

// @desc    Tạo nhà hàng mới
// @route   POST /api/nhahang
// @access  Private/Admin
exports.createNhaHang = async (req, res) => {
  try {
    const nhaHang = await NhaHang.create(req.body);

    res.status(201).json({
      success: true,
      data: nhaHang
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

// @desc    Cập nhật nhà hàng
// @route   PUT /api/nhahang/:id
// @access  Private/Admin
exports.updateNhaHang = async (req, res) => {
  try {
    // Cập nhật ngày cập nhật
    req.body.ngayCapNhap = Date.now();
    
    const nhaHang = await NhaHang.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!nhaHang) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy nhà hàng'
      });
    }

    res.status(200).json({
      success: true,
      data: nhaHang
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

// @desc    Xóa nhà hàng
// @route   DELETE /api/nhahang/:id
// @access  Private/Admin
exports.deleteNhaHang = async (req, res) => {
  try {
    const nhaHang = await NhaHang.findById(req.params.id);

    if (!nhaHang) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy nhà hàng'
      });
    }

    await nhaHang.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Lỗi server'
    });
  }
};

// @desc    Thêm khu vực cho nhà hàng
// @route   POST /api/nhahang/:id/khuvuc
// @access  Private/Admin
exports.addKhuVuc = async (req, res) => {
  try {
    const nhaHang = await NhaHang.findById(req.params.id);

    if (!nhaHang) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy nhà hàng'
      });
    }

    // Thêm khu vực mới
    nhaHang.khuVuc.push(req.body);
    nhaHang.ngayCapNhap = Date.now();

    await nhaHang.save();

    res.status(200).json({
      success: true,
      data: nhaHang
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

// @desc    Thêm bàn vào khu vực
// @route   POST /api/nhahang/:id/khuvuc/:khuvucId/ban
// @access  Private/Admin
exports.addBan = async (req, res) => {
  try {
    const nhaHang = await NhaHang.findById(req.params.id);

    if (!nhaHang) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy nhà hàng'
      });
    }

    // Tìm khu vực
    const khuVuc = nhaHang.khuVuc.id(req.params.khuvucId);
    if (!khuVuc) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy khu vực'
      });
    }

    // Thêm bàn mới
    khuVuc.ban.push(req.body);
    nhaHang.ngayCapNhap = Date.now();

    await nhaHang.save();

    res.status(200).json({
      success: true,
      data: nhaHang
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