const express = require('express');
const {
  getThongBaos,
  getThongBao,
  createThongBao,
  updateThongBao,
  deleteThongBao,
  markAsRead,
  markAllAsRead
} = require('../controllers/thongBao');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Tất cả các route đều yêu cầu đăng nhập
router.use(protect);

// Route đánh dấu tất cả đã đọc
router.route('/readall').put(markAllAsRead);

router
  .route('/')
  .get(getThongBaos)
  .post(authorize(1), createThongBao);

router
  .route('/:id')
  .get(getThongBao)
  .put(authorize(1), updateThongBao)
  .delete(deleteThongBao);

router.route('/:id/read').put(markAsRead);

module.exports = router;