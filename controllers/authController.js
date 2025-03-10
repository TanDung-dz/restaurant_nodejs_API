const User = require('../models/user');

// @desc    Đăng ký người dùng
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
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

    // Tạo token
    sendTokenResponse(user, 201, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Lỗi server'
    });
  }
};

// @desc    Đăng nhập
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { tenDangNhap, matKhau } = req.body;

    // Validate
    if (!tenDangNhap || !matKhau) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng nhập tên đăng nhập và mật khẩu'
      });
    }

    // Tìm user
    const user = await User.findOne({ tenDangNhap }).select('+matKhau');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Thông tin đăng nhập không hợp lệ'
      });
    }

    // Kiểm tra mật khẩu
    const isMatch = await user.matchPassword(matKhau);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Thông tin đăng nhập không hợp lệ'
      });
    }

    // Tạo token
    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Lỗi server'
    });
  }
};

// @desc    Lấy thông tin người dùng hiện tại
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

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

// Hàm gửi token response
const sendTokenResponse = (user, statusCode, res) => {
  // Tạo token
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    data: {
      _id: user._id,
      tenDangNhap: user.tenDangNhap,
      hoVaTen: user.hoVaTen,
      email: user.email,
      quyen: user.quyen
    }
  });
};