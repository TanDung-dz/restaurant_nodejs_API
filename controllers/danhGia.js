const DanhGia = require('../models/danhGia');
const NhaHang = require('../models/nhaHang');

// @desc    Tạo đánh giá mới
// @route   POST /api/danhgia
// @access  Private
exports.createDanhGia = async (req, res) => {
  try {
    // Lấy thông tin từ request body
    const { nhaHangId, xepHang, binhLuan } = req.body;

    // Kiểm tra xem người dùng đã đánh giá nhà hàng này chưa
    const existingDanhGia = await DanhGia.findOne({
      userId: req.user.id,
      nhaHangId
    });

    if (existingDanhGia) {
      return res.status(400).json({
        success: false,
        error: 'Bạn đã đánh giá nhà hàng này rồi. Vui lòng cập nhật đánh giá cũ'
      });
    }

    // Thêm userId từ người dùng đã đăng nhập
    req.body.userId = req.user.id;
    
    // Tạo đánh giá mới
    const danhGia = await DanhGia.create(req.body);

    // Cập nhật xếp hạng trung bình của nhà hàng
    await updateNhaHangXepHang(nhaHangId);
    
    res.status(201).json({
      success: true,
      data: danhGia
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
    
    // Lỗi trùng lặp (người dùng đã đánh giá nhà hàng)
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Bạn đã đánh giá nhà hàng này rồi'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Lỗi server'
    });
  }
};

// @desc    Lấy tất cả đánh giá
// @route   GET /api/danhgia
// @access  Public
exports.getDanhGias = async (req, res) => {
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
    query = DanhGia.find(JSON.parse(queryStr))
      .populate('userId', 'hoVaTen')
      .populate('nhaHangId', 'tenNhaHang');
    
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
    const total = await DanhGia.countDocuments();
    
    query = query.skip(startIndex).limit(limit);
    
    // Executing query
    const danhGias = await query;
    
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
      count: danhGias.length,
      pagination,
      data: danhGias
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Lỗi server'
    });
  }
};

// @desc    Lấy đánh giá theo ID
// @route   GET /api/danhgia/:id
// @access  Public
exports.getDanhGia = async (req, res) => {
  try {
    const danhGia = await DanhGia.findById(req.params.id)
      .populate('userId', 'hoVaTen')
      .populate('nhaHangId', 'tenNhaHang');
    
    if (!danhGia) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy đánh giá'
      });
    }
    
    res.status(200).json({
      success: true,
      data: danhGia
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Lỗi server'
    });
  }
};

// @desc    Cập nhật đánh giá
// @route   PUT /api/danhgia/:id
// @access  Private
exports.updateDanhGia = async (req, res) => {
  try {
    let danhGia = await DanhGia.findById(req.params.id);
    
    if (!danhGia) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy đánh giá'
      });
    }
    
    // Kiểm tra quyền: chỉ người tạo đánh giá mới được cập nhật
    if (danhGia.userId.toString() !== req.user.id && req.user.quyen !== 1) {
      return res.status(403).json({
        success: false,
        error: 'Không có quyền cập nhật đánh giá này'
      });
    }
    
    // Admin chỉ được cập nhật phần trả lời
    if (req.user.quyen === 1 && danhGia.userId.toString() !== req.user.id) {
      if (Object.keys(req.body).some(key => key !== 'traLoi')) {
        return res.status(400).json({
          success: false,
          error: 'Admin chỉ được cập nhật phần trả lời'
        });
      }
    }
    
    // Người dùng thường không được cập nhật phần trả lời
    if (req.user.quyen !== 1 && req.body.traLoi !== undefined) {
      return res.status(400).json({
        success: false,
        error: 'Không được phép cập nhật phần trả lời'
      });
    }
    
    // Thêm ngày cập nhật
    req.body.ngayCapNhap = Date.now();
    
    // Cập nhật đánh giá
    danhGia = await DanhGia.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('userId', 'hoVaTen')
     .populate('nhaHangId', 'tenNhaHang');
    
    // Cập nhật xếp hạng trung bình của nhà hàng nếu đã thay đổi xếp hạng
    if (req.body.xepHang) {
      await updateNhaHangXepHang(danhGia.nhaHangId);
    }
    
    res.status(200).json({
      success: true,
      data: danhGia
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

// @desc    Xóa đánh giá
// @route   DELETE /api/danhgia/:id
// @access  Private
exports.deleteDanhGia = async (req, res) => {
  try {
    const danhGia = await DanhGia.findById(req.params.id);
    
    if (!danhGia) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy đánh giá'
      });
    }
    
    // Kiểm tra quyền: chỉ người tạo đánh giá hoặc admin mới được xóa
    if (danhGia.userId.toString() !== req.user.id && req.user.quyen !== 1) {
      return res.status(403).json({
        success: false,
        error: 'Không có quyền xóa đánh giá này'
      });
    }
    
    await danhGia.deleteOne();
    
    // Cập nhật xếp hạng trung bình của nhà hàng
    await updateNhaHangXepHang(danhGia.nhaHangId);
    
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

// @desc    Lấy đánh giá của một nhà hàng
// @route   GET /api/nhahang/:nhaHangId/danhgia
// @access  Public
exports.getDanhGiasByNhaHang = async (req, res) => {
  try {
    const danhGias = await DanhGia.find({ nhaHangId: req.params.nhaHangId })
      .populate('userId', 'hoVaTen')
      .sort('-ngayTao');
    
    res.status(200).json({
      success: true,
      count: danhGias.length,
      data: danhGias
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Lỗi server'
    });
  }
};

// Hàm hỗ trợ để cập nhật xếp hạng trung bình của nhà hàng
async function updateNhaHangXepHang(nhaHangId) {
  const danhGias = await DanhGia.find({ nhaHangId });
  
  if (danhGias.length === 0) {
    // Nếu không có đánh giá, đặt xếp hạng về 0
    await NhaHang.findByIdAndUpdate(nhaHangId, { xepHangTrungBinh: 0 });
    return;
  }
  
  // Tính xếp hạng trung bình
  const totalRating = danhGias.reduce((sum, item) => sum + item.xepHang, 0);
  const avgRating = Math.round((totalRating / danhGias.length) * 10) / 10; // Làm tròn 1 số thập phân
  
  // Cập nhật nhà hàng
  await NhaHang.findByIdAndUpdate(nhaHangId, { xepHangTrungBinh: avgRating });
}