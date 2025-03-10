const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.protect = async (req, res, next) => {
  let token;

  // Kiểm tra xem authorization header có tồn tại không
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Lấy token từ Bearer
    token = req.headers.authorization.split(' ')[1];
  }

  // Kiểm tra token có tồn tại không
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Không có quyền truy cập'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'restaurant_secret_key'
    );

    // Lấy thông tin user từ token
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Không có quyền truy cập'
    });
  }
};

// Middleware kiểm tra quyền
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.quyen)) {
      return res.status(403).json({
        success: false,
        error: 'Bạn không có quyền thực hiện hành động này'
      });
    }
    next();
  };
};