const express = require('express');
const {
  getDanhGias,
  getDanhGia,
  createDanhGia,
  updateDanhGia,
  deleteDanhGia
} = require('../controllers/danhGia');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(getDanhGias)
  .post(protect, createDanhGia);

router
  .route('/:id')
  .get(getDanhGia)
  .put(protect, updateDanhGia)
  .delete(protect, deleteDanhGia);

module.exports = router;