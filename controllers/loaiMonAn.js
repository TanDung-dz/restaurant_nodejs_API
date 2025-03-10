const LoaiMonAn = require('../models/loaiMonAn');

// @desc    Lấy tất cả loại món ăn
// @route   GET /api/loaimonan
// @access  Public
exports.getLoaiMonAns = async (req, res) => {
  try {
    const loaiMonAns = await LoaiMonAn.find({ hide: false });

    res.status(200).json({
      success: true,
      count: loaiMonAns.length,
      data: loaiMonAns
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Lỗi server'
    });
  }
};

// @desc    Lấy một loại món ăn
// @route   GET /api/loaimonan/:id
// @access  Public
exports.getLoaiMonAn = async (req, res) => {
  try {
    const loaiMonAn = await LoaiMonAn.findById(req.params.id);

    if (!loaiMonAn) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy loại món ăn'
      });
    }

    res.status(200).json({
      success: true,
      data: loaiMonAn
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Lỗi server'
    });
  }
};

// @desc    Tạo loại món ăn mới
// @route   POST /api/loaimonan
// @access  Private/Admin
exports.createLoaiMonAn = async (req, res) => {
  try {
    const loaiMonAn = await LoaiMonAn.create(req.body);

    res.status(201).json({
      success: true,
      data: loaiMonAn
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

// @desc    Cập nhật loại món ăn
// @route   PUT /api/loaimonan/:id
// @access  Private/Admin
exports.updateLoaiMonAn = async (req, res) => {
  try {
    const loaiMonAn = await LoaiMonAn.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!loaiMonAn) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy loại món ăn'
      });
    }

    res.status(200).json({
      success: true,
      data: loaiMonAn
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

// @desc    Xóa loại món ăn
// @route   DELETE /api/loaimonan/:id
// @access  Private/Admin
exports.deleteLoaiMonAn = async (req, res) => {
  try {
    const loaiMonAn = await LoaiMonAn.findById(req.params.id);

    if (!loaiMonAn) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy loại món ăn'
      });
    }

    await loaiMonAn.deleteOne();

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