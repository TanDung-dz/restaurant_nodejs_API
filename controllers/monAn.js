const MonAn = require('../models/monAn');
const NhaHang = require('../models/nhaHang');

// @desc    Lấy tất cả món ăn
// @route   GET /api/monan
// @access  Public
exports.getMonAns = async (req, res) => {
  try {
    let query;
    
    // Copy req.query
    const reqQuery = { ...req.query };
    
    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];
    
    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);
    
    // Create query string
    let queryStr = JSON.stringify(reqQuery);
    
    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    // Finding resource
    query = MonAn.find(JSON.parse(queryStr))
      .populate('nhaHangId', 'tenNhaHang')
      .populate('loaiMonAn', 'tenLoai');
    
    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }
    
    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-ngayTao');
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await MonAn.countDocuments();
    
    query = query.skip(startIndex).limit(limit);
    
    // Executing query
    const monAns = await query;
    
    // Pagination result
    const pagination = {};
    
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }
    
    res.status(200).json({
      success: true,
      count: monAns.length,
      pagination,
      data: monAns
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Lỗi server'
    });
  }
};

// @desc    Lấy một món ăn
// @route   GET /api/monan/:id
// @access  Public
exports.getMonAn = async (req, res) => {
  try {
    const monAn = await MonAn.findById(req.params.id)
      .populate('nhaHangId', 'tenNhaHang diaChi')
      .populate('loaiMonAn', 'tenLoai');
    
    if (!monAn) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy món ăn'
      });
    }
    
    res.status(200).json({
      success: true,
      data: monAn
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Lỗi server'
    });
  }
};

// @desc    Tạo món ăn mới
// @route   POST /api/monan
// @access  Private/Admin
exports.createMonAn = async (req, res) => {
  try {
    // Kiểm tra nhà hàng tồn tại
    const nhaHang = await NhaHang.findById(req.body.nhaHangId);
    if (!nhaHang) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy nhà hàng'
      });
    }
    
    const monAn = await MonAn.create(req.body);
    
    res.status(201).json({
      success: true,
      data: monAn
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

// @desc    Cập nhật món ăn
// @route   PUT /api/monan/:id
// @access  Private/Admin
exports.updateMonAn = async (req, res) => {
  try {
    // Thêm ngày cập nhật
    req.body.ngayCapNhap = Date.now();
    
    const monAn = await MonAn.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!monAn) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy món ăn'
      });
    }
    
    res.status(200).json({
      success: true,
      data: monAn
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

// @desc    Xóa món ăn
// @route   DELETE /api/monan/:id
// @access  Private/Admin
exports.deleteMonAn = async (req, res) => {
  try {
    const monAn = await MonAn.findById(req.params.id);
    
    if (!monAn) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy món ăn'
      });
    }
    
    await monAn.deleteOne();
    
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

// @desc    Lấy món ăn theo nhà hàng
// @route   GET /api/nhahang/:nhaHangId/monan
// @access  Public
exports.getMonAnsByNhaHang = async (req, res) => {
  try {
    const monAns = await MonAn.find({ nhaHangId: req.params.nhaHangId })
      .populate('loaiMonAn', 'tenLoai');
    
    res.status(200).json({
      success: true,
      count: monAns.length,
      data: monAns
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Lỗi server'
    });
  }
};