const express = require('express');
const router = express.Router();

const {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllIssues,
  deleteIssue
} = require('../controllers/adminController');

const {
  protect,
  adminOnly
} = require('../middleware/authMiddleware');

// Dashboard Statistics
router.get('/stats', protect, adminOnly, getDashboardStats);

// User Management
router.get('/users', protect, adminOnly, getAllUsers);
router.put('/users/:id/role', protect, adminOnly, updateUserRole);
router.delete('/users/:id', protect, adminOnly, deleteUser);

// Issue Management
router.get('/issues', protect, adminOnly, getAllIssues);
router.delete('/issues/:id', protect, adminOnly, deleteIssue);

module.exports = router;