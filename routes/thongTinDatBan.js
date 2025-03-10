const express = require('express');
const {
  datBan,
  getDatBans,
  getDatBan,
  updateDatBan,
  cancelDatBan,
  updateDatBanStatus,
  updateThanhToan,
  addMonAn,
  removeMonAn
} = require('../controllers/thongTinDatBan');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Tất cả các route đều yêu cầu đăng nhập
router.use(protect);

router
  .route('/')
  .get(getDatBans)
  .post(datBan);

router
  .route('/:id')
  .get(getDatBan)
  .put(updateDatBan);

router.route('/:id/cancel').put(cancelDatBan);

// Routes chỉ dành cho admin
router.route('/:id/status').put(authorize(1), updateDatBanStatus);
router.route('/:id/thanhtoan').put(authorize(1), updateThanhToan);

// Routes để quản lý món ăn trong đơn đặt bàn
router.route('/:id/monan').put(addMonAn);
router.route('/:id/monan/:monAnId').delete(removeMonAn);

module.exports = router;