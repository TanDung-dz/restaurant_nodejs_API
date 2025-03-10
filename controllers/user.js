const User = require('../models/user');

// @desc    Lấy tất cả người dùng
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-matKhau');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Lỗi server'
    });
  }
};

// @desc    Lấy thông tin một người dùng
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-matKhau');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy người dùng'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Lỗi server'
    });
  }
};

// @desc    Tạo người dùng mới
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
  try {
    const { tenDangNhap, matKhau, hoVaTen, email, sdt, quyen } = req.body;

    // Kiểm tra tên đăng nhập đã tồn tại chưa
    const userExists = await User.findOne({ tenDangNhap });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'Tên đăng nhập đã tồn tại'
      });
    }

    // Kiểm tra email đã tồn tại chưa
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        error: 'Email đã được sử dụng'
      });
    }

    // Tạo người dùng mới
    const user = await User.create({
      tenDangNhap,
      matKhau,
      hoVaTen,
      email,
      sdt,
      quyen: quyen || 0
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        tenDangNhap: user.tenDangNhap,
        hoVaTen: user.hoVaTen,
        email: user.email,
        sdt: user.sdt,
        quyen: user.quyen,
        ngayDK: user.ngayDK,
        ngayTao: user.ngayTao
      }
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

// @desc    Cập nhật thông tin người dùng
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    // Không cho phép cập nhật mật khẩu qua route này
    if (req.body.matKhau) {
      delete req.body.matKhau;
    }
    
    // Thêm thời gian cập nhật
    req.body.ngayCapNhap = Date.now();
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).select('-matKhau');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy người dùng'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
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

// @desc    Xóa người dùng
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy người dùng'
      });
    }
    
    await user.deleteOne();
    
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

// @desc    Đổi mật khẩu người dùng
// @route   PUT /api/users/:id/password
// @access  Private/Admin
exports.changePassword = async (req, res) => {
  try {
    const { matKhauMoi } = req.body;
    
    if (!matKhauMoi || matKhauMoi.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Mật khẩu mới phải có ít nhất 6 ký tự'
      });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy người dùng'
      });
    }
    
    user.matKhau = matKhauMoi;
    user.ngayCapNhap = Date.now();
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Đã đổi mật khẩu thành công'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Lỗi server'
    });
  }
};