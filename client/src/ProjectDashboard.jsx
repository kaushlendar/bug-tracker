
import { useEffect, useState } from 'react';
import './ProjectDashboard.css';

const API_URL = 'https://bug-tracker-5y8m.onrender.com/api/projects';

function ProjectDashboard({ onBack }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [editingProject, setEditingProject] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const [message, setMessage] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
const [selectedProject, setSelectedProject] = useState(null);
const [projectIssues, setProjectIssues] = useState([]);
const [issueTitle, setIssueTitle] = useState('');
const [issueDescription, setIssueDescription] = useState('');
const [issuePriority, setIssuePriority] = useState('Medium');

const [editingIssue, setEditingIssue] = useState(null);
const [editIssueTitle, setEditIssueTitle] = useState('');
const [editIssueDescription, setEditIssueDescription] = useState('');
const [editIssuePriority, setEditIssuePriority] = useState('Medium');
const [searchIssue, setSearchIssue] = useState('');
const [filterStatus, setFilterStatus] = useState('All');
const [sortOrder, setSortOrder] = useState('latest');

const [commentText, setCommentText] = useState('');
const [issueComments, setIssueComments] = useState({});

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`
  });

  // Get Projects
  const fetchProjects = async () => {
    try {
      const response = await fetch(API_URL, {
        headers: getHeaders()
      });

      const data = await response.json();

      if (response.ok) {
        setProjects(data.projects);
      } else {
        setMessage(data.message || 'Failed to load projects');
      }
    } catch (error) {
      setMessage('Server connection failed');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Issues of Selected Project
const fetchProjectIssues = async (projectId) => {
  try {
const response = await fetch(
  `https://bug-tracker-5y8m.onrender.com/api/issues?project=${projectId}`,
  {
        headers: getHeaders()
      }
    );

    const data = await response.json();

if (response.ok) {
  setProjectIssues(data.issues);
  setSelectedProject(projectId);
  setSearchIssue('');
  setFilterStatus('All');
}
    else {
      setMessage(data.message || 'Failed to load project issues');
    }
  } catch (error) {
    setMessage('Server connection failed');
  }
};

// Create Issue in Project
const handleCreateIssue = async (e) => {
  e.preventDefault();

  if (!selectedProject) {
    setMessage('Please select a project first');
    return;
  }

  try {
    const response = await fetch(
  'https://bug-tracker-5y8m.onrender.com/api/issues',
  {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        title: issueTitle,
        description: issueDescription,
        priority: issuePriority,
        project: selectedProject
      })
    });

    const data = await response.json();

    if (response.ok) {
      setMessage('Issue created successfully');
      setIssueTitle('');
      setIssueDescription('');
      setIssuePriority('Medium');

      fetchProjectIssues(selectedProject);
    } else {
      setMessage(data.message || 'Issue creation failed');
    }
  } catch (error) {
    setMessage('Server connection failed');
  }
};

// Update Issue Status
const handleUpdateIssueStatus = async (issueId, status) => {
  try {
const response = await fetch(
  `https://bug-tracker-5y8m.onrender.com/api/issues/${issueId}`,
  {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status })
      }
    );

    const data = await response.json();

    if (response.ok) {
      setMessage('Issue status updated successfully');
      fetchProjectIssues(selectedProject);
    } else {
      setMessage(data.message || 'Status update failed');
    }
  } catch (error) {
    setMessage('Server connection failed');
  }
};

// Delete Issue
const handleDeleteIssue = async (issueId) => {
  const confirmDelete = window.confirm(
    'Are you sure you want to delete this issue?'
  );

  if (!confirmDelete) return;

  try {
const response = await fetch(
  `https://bug-tracker-5y8m.onrender.com/api/issues/${issueId}`,
  {
        method: 'DELETE',
        headers: getHeaders()
      }
    );

    const data = await response.json();

    if (response.ok) {
      setMessage('Issue deleted successfully');
      fetchProjectIssues(selectedProject);
    } else {
      setMessage(data.message || 'Issue deletion failed');
    }
  } catch (error) {
    setMessage('Server connection failed');
  }
};

// Add Comment to Issue
const handleAddComment = async (issueId) => {
  if (!commentText.trim()) {
    setMessage('Please enter a comment');
    return;
  }

  try {
const response = await fetch(
  `https://bug-tracker-5y8m.onrender.com/api/issues/${issueId}/comments`,
  {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ text: commentText })
      }
    );

    const data = await response.json();

    if (response.ok) {
      setMessage('Comment added successfully');

      setIssueComments((prev) => ({
        ...prev,
        [issueId]: data.comments
      }));

      setCommentText('');
    } else {
      setMessage(data.message || 'Comment failed');
    }
  } catch (error) {
    setMessage('Server connection failed');
  }
};

const handleDeleteComment = async (issueId, commentId) => {
  if (!window.confirm('Are you sure you want to delete this comment?')) {
    return;
  }

  try {
const response = await fetch(
  `https://bug-tracker-5y8m.onrender.com/api/issues/${issueId}/comments/${commentId}`,
  {
        method: 'DELETE',
        headers: getHeaders()
      }
    );

    const data = await response.json();

    if (data.success) {
      alert('Comment deleted successfully');
      fetchProjectIssues(selectedProject);
    } else {
      alert(data.message || 'Failed to delete comment');
    }
  } catch (error) {
    console.error('Delete Comment Error:', error);
  }
};

const handleEditIssue = (issue) => {
  setEditingIssue(issue._id);
  setEditIssueTitle(issue.title);
  setEditIssueDescription(issue.description);
  setEditIssuePriority(issue.priority);
};

const handleUpdateIssue = async (issueId) => {
  try {
const response = await fetch(
  `https://bug-tracker-5y8m.onrender.com/api/issues/${issueId}`,
  {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          title: editIssueTitle,
          description: editIssueDescription,
          priority: editIssuePriority
        })
      }
    );

    const data = await response.json();

    if (data.success) {
      alert('Issue updated successfully');
      setEditingIssue(null);
      fetchProjectIssues(selectedProject);
    } else {
      alert(data.message || 'Failed to update issue');
    }
  } catch (error) {
    console.error('Update Issue Error:', error);
  }
};

  useEffect(() => {
    fetchProjects();
  }, []);

  // Create Project
  const handleCreateProject = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ title, description })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Project created successfully');
        setTitle('');
        setDescription('');
        fetchProjects();
      } else {
        setMessage(data.message || 'Project creation failed');
      }
    } catch (error) {
      setMessage('Server connection failed');
    }
  };

  // Update Project
  const handleUpdateProject = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${API_URL}/${editingProject}`,
        {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify({
            title: editTitle,
            description
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage('Project updated successfully');
        setEditingProject(null);
        setEditTitle('');
        setDescription('');
        fetchProjects();
      } else {
        setMessage(data.message || 'Project update failed');
      }
    } catch (error) {
      setMessage('Server connection failed');
    }
  };

  // Delete Project
  const handleDeleteProject = async (projectId) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this project?'
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_URL}/${projectId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Project deleted successfully');
        fetchProjects();
      } else {
        setMessage(data.message || 'Project deletion failed');
      }
    } catch (error) {
      setMessage('Server connection failed');
    }
  };

  const handleAddMember = async (projectId) => {
  if (!memberEmail.trim()) {
    setMessage('Please enter member email');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${projectId}/members`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email: memberEmail })
    });

    const data = await response.json();

    if (response.ok) {
      setMessage('Team member added successfully');
      setMemberEmail('');
      fetchProjects();
    } else {
      setMessage(data.message || 'Failed to add team member');
    }
  } catch (error) {
    setMessage('Server connection failed');
  }
};

const handleRemoveMember = async (projectId, userId) => {
  const confirmRemove = window.confirm(
    'Are you sure you want to remove this member?'
  );

  if (!confirmRemove) return;

  try {
    const response = await fetch(`${API_URL}/${projectId}/members`, {
      method: 'DELETE',
      headers: getHeaders(),
      body: JSON.stringify({ userId })
    });

    const data = await response.json();

    if (response.ok) {
      setMessage('Team member removed successfully');
      fetchProjects();
    } else {
      setMessage(data.message || 'Failed to remove member');
    }
  } catch (error) {
    setMessage('Server connection failed');
  }
};

  // Edit Project Form
  const handleEditClick = (project) => {
    setEditingProject(project._id);
    setEditTitle(project.title);
    setDescription(project.description || '');
    setMessage('');
  };

  // Cancel Edit
  const handleCancelEdit = () => {
    setEditingProject(null);
    setEditTitle('');
    setDescription('');
  };

  if (loading) {
    return <h2>Loading Projects...</h2>;
  }

  return (
    <div className="project-dashboard">

      <button onClick={onBack}>
        Back to Dashboard
      </button>

      <h1>Project Management</h1>

      {message && (
        <p>{message}</p>
      )}

      {/* Create / Edit Project Form */}
      <form
        onSubmit={
          editingProject
            ? handleUpdateProject
            : handleCreateProject
        }
      >
        <h2>
          {editingProject ? 'Edit Project' : 'Create New Project'}
        </h2>

        <input
          type="text"
          placeholder="Project Title"
          value={editingProject ? editTitle : title}
          onChange={(e) =>
            editingProject
              ? setEditTitle(e.target.value)
              : setTitle(e.target.value)
          }
          required
        />

        <textarea
          placeholder="Project Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button type="submit">
          {editingProject ? 'Update Project' : 'Create Project'}
        </button>

        {editingProject && (
          <button
            type="button"
            onClick={handleCancelEdit}
          >
            Cancel
          </button>
        )}
      </form>

      {/* Project List */}
      <h2>My Projects</h2>

      {selectedProject && (
  <div className="project-issues">
    <h2>Project Issues</h2>

    <form onSubmit={handleCreateIssue}>
  <h3>Create New Issue</h3>

  <input
    type="text"
    placeholder="Issue Title"
    value={issueTitle}
    onChange={(e) => setIssueTitle(e.target.value)}
    required
  />

  <textarea
    placeholder="Issue Description"
    value={issueDescription}
    onChange={(e) => setIssueDescription(e.target.value)}
    required
  />

  <select
    value={issuePriority}
    onChange={(e) => setIssuePriority(e.target.value)}
  >
    <option value="Low">Low</option>
    <option value="Medium">Medium</option>
    <option value="High">High</option>
    <option value="Critical">Critical</option>
  </select>

  <button type="submit">Create Issue</button>
</form>

    <button
      type="button"
onClick={() => {
  setSelectedProject(null);
  setProjectIssues([]);
  setSearchIssue('');
  setFilterStatus('All');
}}
    >
      Close Issues
    </button>


{projectIssues.length === 0 ? (
  <p>No issues found in this project.</p>
) : (
  <>
    {/* Search and Filter */}
    <div className="issue-filters">
      <input
        type="text"
        placeholder="Search issue by title..."
        value={searchIssue}
        onChange={(e) => setSearchIssue(e.target.value)}
      />

      <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
      >
        <option value="All">All Status</option>
        <option value="Open">Open</option>
        <option value="In Progress">In Progress</option>
        <option value="Resolved">Resolved</option>
        <option value="Closed">Closed</option>
      </select>
            <select
        value={sortOrder}
        onChange={(e) => setSortOrder(e.target.value)}
      >
        <option value="latest">Latest First</option>
        <option value="oldest">Oldest First</option>
        <option value="priority">Priority (High to Low)</option>
      </select>
    </div>

    {/* Filtered Issues */}
{[...projectIssues]
  .filter((issue) => {
    const matchesSearch = issue.title
      .toLowerCase()
      .includes(searchIssue.toLowerCase());

    const matchesStatus =
      filterStatus === 'All' || issue.status === filterStatus;

    return matchesSearch && matchesStatus;
  })
  .sort((a, b) => {
    if (sortOrder === 'latest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }

    if (sortOrder === 'oldest') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }

    const priorityOrder = {
      Critical: 4,
      High: 3,
      Medium: 2,
      Low: 1,
    };

    return priorityOrder[b.priority] - priorityOrder[a.priority];
  })
  .map((issue) => (
        <div key={issue._id} className="project-card">
          {editingIssue === issue._id ? (
            <div>
              <input
                type="text"
                value={editIssueTitle}
                onChange={(e) => setEditIssueTitle(e.target.value)}
                placeholder="Issue Title"
              />

              <textarea
                value={editIssueDescription}
                onChange={(e) => setEditIssueDescription(e.target.value)}
                placeholder="Issue Description"
              />

              <select
                value={editIssuePriority}
                onChange={(e) => setEditIssuePriority(e.target.value)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>

              <button
                type="button"
                onClick={() => handleUpdateIssue(issue._id)}
              >
                Save Changes
              </button>

              <button
                type="button"
                onClick={() => setEditingIssue(null)}
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <h3>{issue.title}</h3>
              <p>{issue.description}</p>

              <button
                type="button"
                onClick={() => handleEditIssue(issue)}
              >
                Edit Issue
              </button>
            </>
          )}

          <label>Status: </label>
          <select
            value={issue.status}
            onChange={(e) =>
              handleUpdateIssueStatus(issue._id, e.target.value)
            }
          >
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          <p>Priority: {issue.priority}</p>
          <p>Created By: {issue.createdBy?.name || 'Unknown'}</p>

          <button
            type="button"
            onClick={() => handleDeleteIssue(issue._id)}
          >
            Delete Issue
          </button>

          {/* Issue Comments */}
          <h4>Comments</h4>

          <textarea
            placeholder="Write your comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />

          <button
            type="button"
            onClick={() => handleAddComment(issue._id)}
          >
            Add Comment
          </button>

          {(issueComments[issue._id] || issue.comments || []).map(
            (comment, index) => (
              <div key={comment._id || index}>
                <p>
                  {comment.text} — {comment.commentedBy?.name || 'User'}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    handleDeleteComment(issue._id, comment._id)
                  }
                >
                  Delete Comment
                </button>
              </div>
            )
          )}
        </div>
      ))}

    {projectIssues.filter((issue) => {
      const matchesSearch = issue.title
        .toLowerCase()
        .includes(searchIssue.toLowerCase());
      const matchesStatus =
        filterStatus === 'All' || issue.status === filterStatus;
      return matchesSearch && matchesStatus;
    }).length === 0 && (
      <p>No matching issues found.</p>
    )}
  </>
)}

  </div>
)}

      {projects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        projects.map((project) => (
          <div
            key={project._id}
            className="project-card"
          >
            <h3>{project.title}</h3>

            <button
  type="button"
  onClick={() => fetchProjectIssues(project._id)}
>
  View Issues
</button>

            <p>{project.description}</p>

            <p>
              Owner: {project.owner?.name || 'Unknown'}
            </p>

            <p>
              Team Members: {project.teamMembers.length}
            </p>

            <div className="team-member-section">
  <h4>Team Members</h4>

 {project.teamMembers.map((member) => (
  <div key={member._id}>
    <p>
      {member.name} ({member.email})
    </p>

    {member._id !== project.owner?._id && (
      <button
        type="button"
        onClick={() =>
          handleRemoveMember(project._id, member._id)
        }
      >
        Remove
      </button>
    )}
  </div>
))}

  <input
    type="email"
    placeholder="Enter member email"
    value={memberEmail}
    onChange={(e) => setMemberEmail(e.target.value)}
  />

  <button
    type="button"
    onClick={() => handleAddMember(project._id)}
  >
    Add Member
  </button>
</div>

            <button
              onClick={() => handleEditClick(project)}
            >
              Edit Project
            </button>

            <button
              onClick={() => handleDeleteProject(project._id)}
            >
              Delete Project
            </button>
          </div>
        ))
      )}

    </div>
  );
}

export default ProjectDashboard;
