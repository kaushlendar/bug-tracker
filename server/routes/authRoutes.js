
const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  changePassword
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected Profile API
router.get('/profile', protect, getProfile);

// Protected Update Profile API
router.put('/profile', protect, updateProfile);

// Protected Change Password API
router.put('/change-password', protect, changePassword);

module.exports = router;
