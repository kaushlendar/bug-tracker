const Project = require('../models/Project');

// Create Project
const createProject = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Project title is required'
      });
    }

    const project = await Project.create({
      title,
      description,
      owner: req.user._id,
      teamMembers: [req.user._id]
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get My Projects
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      teamMembers: req.user._id
    })
      .populate('owner', 'name email')
      .populate('teamMembers', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update Project
const updateProject = async (req, res) => {
  try {
    const { title, description } = req.body;

    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or access denied'
      });
    }

    if (title !== undefined) project.title = title;
    if (description !== undefined) {
      project.description = description;
    }

    await project.save();

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete Project
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or access denied'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add Team Member
const addTeamMember = async (req, res) => {
  try {
    const { email } = req.body;

    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or access denied'
      });
    }

    const User = require('../models/User');
    const user = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (project.teamMembers.some(
      (member) => member.toString() === user._id.toString()
    )) {
      return res.status(400).json({
        success: false,
        message: 'User is already a team member'
      });
    }

    project.teamMembers.push(user._id);
    await project.save();

    await project.populate('teamMembers', 'name email');

    res.status(200).json({
      success: true,
      message: 'Team member added successfully',
      project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// Remove Team Member
const removeTeamMember = async (req, res) => {
  try {
    const { userId } = req.body;

    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or access denied'
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    if (userId === project.owner.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Project owner cannot be removed'
      });
    }

    const isMember = project.teamMembers.some(
      (member) => member.toString() === userId
    );

    if (!isMember) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    project.teamMembers = project.teamMembers.filter(
      (member) => member.toString() !== userId
    );

    await project.save();
    await project.populate('teamMembers', 'name email');

    res.status(200).json({
      success: true,
      message: 'Team member removed successfully',
      project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
  addTeamMember,
  removeTeamMember
};