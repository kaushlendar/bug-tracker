
const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    required: true
  },

  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open'
  },

  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  project: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Project',
  default: null
},

  // Comments
  comments: [
    {
      text: {
        type: String,
        required: true,
        trim: true
      },

      commentedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },

      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ]

}, { timestamps: true });

module.exports = mongoose.model('Issue', issueSchema);
