const express = require('express');
const router = express.Router();
const {
  getNhaHangs,
  getNhaHang,
  createNhaHang,
  updateNhaHang,
  deleteNhaHang,
  addKhuVuc,
  addBan
} = require('../controllers/nhaHang');

const { protect, authorize } = require('../middleware/auth');
const { getMonAnsByNhaHang } = require('../controllers/monAn');
const { getDanhGiasByNhaHang } = require('../controllers/danhGia');
// Route cơ bản
router
  .route('/')
  .get(getNhaHangs)
  .post(protect, authorize(1), createNhaHang);

router
  .route('/:id')
  .get(getNhaHang)
  .put(protect, authorize(1), updateNhaHang)
  .delete(protect, authorize(1), deleteNhaHang);

// Routes cho khu vực và bàn
router
  .route('/:id/khuvuc')
  .post(protect, authorize(1), addKhuVuc);

router
  .route('/:id/khuvuc/:khuvucId/ban')
  .post(protect, authorize(1), addBan);

router
  .route('/:nhaHangId/monan').get(getMonAnsByNhaHang);

router
  .route('/:nhaHangId/danhgia').get(getDanhGiasByNhaHang);

module.exports = router;