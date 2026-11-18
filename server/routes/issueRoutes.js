
const express = require('express');
const router = express.Router();

const {
  createIssue,
  getIssues,
  updateIssue,
  deleteIssue,
  addComment,
  deleteComment
} = require('../controllers/issueController');

const { protect } = require('../middleware/authMiddleware');

// Create new issue
router.post('/', protect, createIssue);

// Get all issues
router.get('/', protect, getIssues);

// Update issue
router.put('/:id', protect, updateIssue);

// Delete issue
router.delete('/:id', protect, deleteIssue);

router.post('/:id/comments', protect, addComment);

// Delete a comment
router.delete('/:id/comments/:commentId', protect, deleteComment);

module.exports = router;
