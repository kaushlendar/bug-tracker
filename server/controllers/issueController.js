
const Issue = require('../models/Issue');
const Project = require('../models/Project');

// Create a new issue
const createIssue = async (req, res) => {
  try {
    const { title, description, priority, project } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }

    if (project) {
  const projectExists = await Project.findOne({
    _id: project,
    teamMembers: req.user._id
  });

  if (!projectExists) {
    return res.status(403).json({
      success: false,
      message: 'You are not a member of this project'
    });
  }
}

const issue = await Issue.create({
  title,
  description,
  priority: priority || 'Medium',
  createdBy: req.user._id,
  project: project || null
});

    res.status(201).json({
      success: true,
      message: 'Issue created successfully',
      issue
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all issues
const getIssues = async (req, res) => {
  try {
const { project } = req.query;

let filter = {};

if (project) {
  const projectExists = await Project.findOne({
    _id: project,
    teamMembers: req.user._id
  });

  if (!projectExists) {
    return res.status(403).json({
      success: false,
      message: 'You are not a member of this project'
    });
  }

  filter.project = project;
}

const issues = await Issue.find(filter)
  .populate('createdBy', 'name email')
  .populate('comments.commentedBy', 'name email')
  .sort({ createdAt: -1 });
  
    res.status(200).json({
      success: true,
      count: issues.length,
      issues
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


const updateIssue = async (req, res) => {
  try {
    const { status, priority, title, description } = req.body;

    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

if (issue.project) {
  const projectExists = await Project.findOne({
    _id: issue.project,
    teamMembers: req.user._id
  });

  if (!projectExists) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this issue'
    });
  }
} else if (issue.createdBy.toString() !== req.user._id.toString()) {
  return res.status(403).json({
    success: false,
    message: 'Not authorized to update this issue'
  });
}

    if (title !== undefined) issue.title = title;
    if (description !== undefined) issue.description = description;
    if (status !== undefined) issue.status = status;
    if (priority !== undefined) issue.priority = priority;

    await issue.save();

    res.status(200).json({
      success: true,
      message: 'Issue updated successfully',
      issue
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


const deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    if (issue.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this issue'
      });
    }

    await issue.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Issue deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// Add a comment to an issue
const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment is required'
      });
    }

    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    issue.comments.push({
      text: text.trim(),
      commentedBy: req.user._id
    });

    await issue.save();
    await issue.populate('comments.commentedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comments: issue.comments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete a comment
const deleteComment = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    const comment = issue.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    if (
      comment.commentedBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own comment'
      });
    }

    comment.deleteOne();
    await issue.save();

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createIssue,
  getIssues,
  updateIssue,
  deleteIssue,
  addComment,
  deleteComment
};