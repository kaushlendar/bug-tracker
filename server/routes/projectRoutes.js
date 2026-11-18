const express = require('express');
const router = express.Router();

const {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
  addTeamMember,
  removeTeamMember
} = require('../controllers/projectController');

const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createProject);
router.get('/', protect, getProjects);
router.put('/:id', protect, updateProject);
router.delete('/:id', protect, deleteProject);
router.post('/:id/members', protect, addTeamMember);
router.delete('/:id/members', protect, removeTeamMember);

module.exports = router;