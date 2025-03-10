const express = require('express');
const {
  getLoaiMonAns,
  getLoaiMonAn,
  createLoaiMonAn,
  updateLoaiMonAn,
  deleteLoaiMonAn
} = require('../controllers/loaiMonAn');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(getLoaiMonAns)
  .post(protect, authorize(1), createLoaiMonAn);

router
  .route('/:id')
  .get(getLoaiMonAn)
  .put(protect, authorize(1), updateLoaiMonAn)
  .delete(protect, authorize(1), deleteLoaiMonAn);

module.exports = router;