const express = require('express');
const {
  getMonAns,
  getMonAn,
  createMonAn,
  updateMonAn,
  deleteMonAn
} = require('../controllers/monAn');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(getMonAns)
  .post(protect, authorize(1), createMonAn);

router
  .route('/:id')
  .get(getMonAn)
  .put(protect, authorize(1), updateMonAn)
  .delete(protect, authorize(1), deleteMonAn);

module.exports = router;