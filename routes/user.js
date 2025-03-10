const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  changePassword
} = require('../controllers/user');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Tất cả các route đều yêu cầu đăng nhập và có quyền admin (quyen = 1)
router.use(protect);
router.use(authorize(1));

router
  .route('/')
  .get(getUsers)
  .post(createUser);

router
  .route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

router
  .route('/:id/password')
  .put(changePassword);

module.exports = router;