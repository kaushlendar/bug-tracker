
import { useState, useEffect } from 'react';
import './App.css';
import KanbanBoard from './KanbanBoard';
import IssueDetails from './IssueDetails';
import ProfileSettings from './ProfileSettings';
import AdminDashboard from './AdminDashboard';
import ProjectDashboard from './ProjectDashboard';

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('token')
  );

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [issues, setIssues] = useState([]);

  
const [searchTerm, setSearchTerm] = useState('');
const [filterStatus, setFilterStatus] = useState('All');
const [filterPriority, setFilterPriority] = useState('All');
const [currentPage, setCurrentPage] = useState(1);
const [viewMode, setViewMode] = useState('all');
const [commentText, setCommentText] = useState({});
const [showKanban, setShowKanban] = useState(false);
const [selectedIssue, setSelectedIssue] = useState(null);
const [showProfile, setShowProfile] = useState(false);
const [showAdmin, setShowAdmin] = useState(false);
const [showProjects, setShowProjects] = useState(false);

const [editingIssue, setEditingIssue] = useState(null);
const [editTitle, setEditTitle] = useState('');
const [editDescription, setEditDescription] = useState('');
const [editPriority, setEditPriority] = useState('Medium');

  const [issueMessage, setIssueMessage] = useState('');

  const [showIssueForm, setShowIssueForm] = useState(false);
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [issuePriority, setIssuePriority] = useState('Medium');

  // Reset pagination when search or filters change
useEffect(() => {
  setCurrentPage(1);
}, [searchTerm, filterStatus, filterPriority]);

const currentUser = JSON.parse(
  localStorage.getItem('user') || 'null'
);
  
const filteredIssues = issues.filter((issue) => {
  const matchesSearch =
    issue.title.toLowerCase().includes(searchTerm.toLowerCase());

  const matchesStatus =
    filterStatus === 'All' || issue.status === filterStatus;

  const matchesPriority =
    filterPriority === 'All' || issue.priority === filterPriority;

const createdById =
  issue.createdBy?._id || issue.createdBy;

const createdByEmail =
  issue.createdBy?.email || '';

const matchesOwner =
  viewMode === 'all' ||
  (
    currentUser &&
    (
      String(createdById) === String(currentUser._id) ||
      createdByEmail.toLowerCase() ===
        (currentUser.email || '').toLowerCase()
    )
  );
  return (
    matchesSearch &&
    matchesStatus &&
    matchesPriority &&
    matchesOwner
  );
});

// Pagination Logic
const issuesPerPage = 5;

const indexOfLastIssue = currentPage * issuesPerPage;
const indexOfFirstIssue = indexOfLastIssue - issuesPerPage;

const currentIssues = filteredIssues.slice(
  indexOfFirstIssue,
  indexOfLastIssue
);

const totalPages = Math.ceil(
  filteredIssues.length / issuesPerPage
);


  const user = JSON.parse(localStorage.getItem('user') || 'null');

  // Fetch all issues
  useEffect(() => {
    const fetchIssues = async () => {
      const token = localStorage.getItem('token');

      if (!token) return;

      try {
const response = await fetch(
  'https://bug-tracker-5y8m.onrender.com/api/issues',
  {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Issues load nahi hue');
        }

        setIssues(data.issues || []);
        setIssueMessage('');
      } catch (error) {
        setIssueMessage(error.message);
      }
    };

    if (isAuthenticated) {
      fetchIssues();
    }
  }, [isAuthenticated]);

  // Login and Register
  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage('');
    setLoading(true);

    try {
      const endpoint = isLogin ? 'login' : 'register';

const response = await fetch(
  `https://bug-tracker-5y8m.onrender.com/api/auth/${endpoint}`,
  {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(
            isLogin
              ? { email, password }
              : { name, email, password }
          )
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Something went wrong');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setIsAuthenticated(true);
      setMessage('');

    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setIsAuthenticated(false);
    setIsLogin(true);

    setEmail('');
    setPassword('');
    setIssues([]);
    setIssueMessage('');
  };

  // Create New Issue
  const handleCreateIssue = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');

    try {
const response = await fetch(
  'https://bug-tracker-5y8m.onrender.com/api/issues',
  {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            title: issueTitle,
            description: issueDescription,
            priority: issuePriority
          })
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Issue create nahi hua');
      }

      setIssues((previousIssues) => [
        data.issue,
        ...previousIssues
      ]);

      setIssueTitle('');
      setIssueDescription('');
      setIssuePriority('Medium');
      setShowIssueForm(false);

      setIssueMessage('Issue created successfully!');

    } catch (error) {
      setIssueMessage(error.message);
    }
  };

  
// Update Issue
const handleUpdateIssue = async (issueId, newStatus) => {
  const token = localStorage.getItem('token');

  try {
const response = await fetch(
  `https://bug-tracker-5y8m.onrender.com/api/issues/${issueId}`,
  {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus
        })
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Issue update nahi hua');
    }

    setIssues((previousIssues) =>
      previousIssues.map((issue) =>
        issue._id === issueId ? data.issue : issue
      )
    );

    setIssueMessage('Issue updated successfully!');
  } catch (error) {
    setIssueMessage(error.message);
  }
};


// Open Edit Issue Form
const handleEditClick = (issue) => {
  setEditingIssue(issue._id);
  setEditTitle(issue.title);
  setEditDescription(issue.description);
  setEditPriority(issue.priority);
};

// Save Edited Issue
const handleSaveEdit = async (e) => {
  e.preventDefault();

  const token = localStorage.getItem('token');

  try {
const response = await fetch(
  `https://bug-tracker-5y8m.onrender.com/api/issues/${editingIssue}`,
  {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          priority: editPriority
        })
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Issue update nahi hua');
    }

    setIssues((previousIssues) =>
      previousIssues.map((issue) =>
        issue._id === editingIssue ? data.issue : issue
      )
    );

    setEditingIssue(null);
    setIssueMessage('Issue updated successfully!');

  } catch (error) {
    setIssueMessage(error.message);
  }
};


// Delete Issue
const handleDeleteIssue = async (issueId) => {
  const confirmDelete = window.confirm(
    'Are you sure you want to delete this issue?'
  );

  if (!confirmDelete) return;

  const token = localStorage.getItem('token');

  try {
const response = await fetch(
  `https://bug-tracker-5y8m.onrender.com/api/issues/${issueId}`,
  {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Issue delete nahi hua');
    }

    setIssues((previousIssues) =>
      previousIssues.filter((issue) => issue._id !== issueId)
    );

    setIssueMessage('Issue deleted successfully!');
  } catch (error) {
    setIssueMessage(error.message);
  }
};

const handleAddComment = async (issueId) => {
  const text = commentText[issueId];

  if (!text || !text.trim()) {
    alert('Please write a comment');
    return;
  }

  try {
    const token = localStorage.getItem('token');

 const response = await fetch(
  `https://bug-tracker-5y8m.onrender.com/api/issues/${issueId}/comments`,
  {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      }
    );

    const data = await response.json();

    if (data.success) {
      setIssues(prev =>
        prev.map(issue =>
          issue._id === issueId
            ? { ...issue, comments: data.comments }
            : issue
        )
      );

      setCommentText(prev => ({
        ...prev,
        [issueId]: ''
      }));
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error('Add Comment Error:', error);
  }
};

if (showProjects) {
  return (
    <ProjectDashboard
      onBack={() => setShowProjects(false)}
    />
  );
}

if (showAdmin) {
  return (
    <AdminDashboard
      onBack={() => setShowAdmin(false)}
    />
  );
}

if (selectedIssue) {
  return (
    <IssueDetails
      issue={selectedIssue}
      onBack={() => setSelectedIssue(null)}
    />
  );
}

if (showProfile) {
  return (
    <ProfileSettings
      user={currentUser}
      onBack={() => setShowProfile(false)}
    />
  );
}

  // Dashboard
  if (isAuthenticated) {
    
    return (
      <div className="app">

        <aside className="sidebar">
          <h2>🐞 Bug Tracker</h2>

<nav>
  <a
    href="#"
    className={viewMode === 'all' ? 'active' : ''}
    onClick={() => setViewMode('all')}
  >
    Dashboard
  </a>

  <a
    href="#"
    onClick={() => setViewMode('all')}
  >
    All Issues
  </a>

  <a
    href="#"
    className={viewMode === 'my' ? 'active' : ''}
    onClick={() => setViewMode('my')}
  >
    My Issues
  </a>

  <a
  href="#"
  onClick={(e) => {
    e.preventDefault();
    setShowProfile(true);
  }}
>
  Settings
</a>

<a
  href="#"
  onClick={(e) => {
    e.preventDefault();
    setShowProjects(true);
  }}
>
  Projects
</a>

{currentUser?.role === 'admin' && (
  <a
    href="#"
    onClick={(e) => {
      e.preventDefault();
      setShowAdmin(true);
    }}
  >
    Admin Dashboard
  </a>
)}
</nav>

          <div className="user">
            <h4>{user?.name || 'Developer'}</h4>
            <p>Developer</p>

            <button
              className="logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </aside>

        <main className="main-content">

          <header className="topbar">
            <div>
              <h1>Dashboard</h1>
              <button
  className="add-btn"
  onClick={() => {
    const headers = ['Title', 'Description', 'Status', 'Priority'];
    const rows = issues.map(issue => [
      issue.title,
      issue.description,
      issue.status,
      issue.priority
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(value =>
        `"${String(value || '').replace(/"/g, '""')}"`
      ).join(','))
      .join('\n');

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;'
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'bug-tracker-issues.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  }}
>
  Export Issues CSV
</button>
              <p>
                Welcome back, {user?.name || 'Developer'}!
              </p>
            </div>

            <button
              className="add-btn"
              onClick={() => {
                setShowIssueForm(true);
                setIssueMessage('');
              }}
            >
              + Create Issue
            </button>
            <button
  className="add-btn"
  onClick={() => setShowKanban(!showKanban)}
>
  {showKanban ? 'List View' : 'Kanban Board'}
</button>
          </header>

          {/* Statistics */}
          <section className="stats">

            <div className="stat-card">
              <h3>Total Issues</h3>
              <h1>{issues.length}</h1>
            </div>

            <div className="stat-card">
              <h3>Open Issues</h3>
              <h1>
                {issues.filter(
                  issue => issue.status === 'Open'
                ).length}
              </h1>
            </div>

            <div className="stat-card">
              <h3>In Progress</h3>
              <h1>
                {issues.filter(
                  issue => issue.status === 'In Progress'
                ).length}
              </h1>
            </div>

          <div className="stat-card">
  <h3>Resolved</h3>
  <h1>
    {issues.filter(
      issue => issue.status === 'Resolved'
    ).length}
  </h1>
</div>

<div className="stat-card">
  <h3>Closed Issues</h3>
  <h1>
    {issues.filter(
      issue => issue.status === 'Closed'
    ).length}
  </h1>
</div>

</section>

{/* Kanban Board */}
{showKanban && (
  <KanbanBoard
    issues={filteredIssues}
    onStatusChange={handleUpdateIssue}
  />
)}

{/* Recent Activity */}
<section className="issues">
  <h2>Recent Activity</h2>

  {issues.length === 0 ? (
    <p>No recent activity found.</p>
  ) : (
    [...issues]
      .sort(
        (a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
      )
      .slice(0, 5)
      .map((issue) => (
        <div className="activity-item" key={issue._id}>
          <h4>{issue.title}</h4>

          <p>
            Created: {new Date(issue.createdAt).toLocaleString('en-IN')}
          </p>

          <p>
            Current Status: {issue.status}
          </p>
        </div>
      ))
  )}
</section>

{/* Create Issue Form */}
          {showIssueForm && (
            <section className="issues">
              <h2>Create New Issue</h2>

              <form onSubmit={handleCreateIssue}>

                <input
                  type="text"
                  placeholder="Issue Title"
                  value={issueTitle}
                  onChange={(e) =>
                    setIssueTitle(e.target.value)
                  }
                  required
                />

                <textarea
                  placeholder="Issue Description"
                  value={issueDescription}
                  onChange={(e) =>
                    setIssueDescription(e.target.value)
                  }
                  required
                />

                <select
                  value={issuePriority}
                  onChange={(e) =>
                    setIssuePriority(e.target.value)
                  }
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>

                <button type="submit">
                  Save Issue
                </button>

                <button
                  type="button"
                  onClick={() => setShowIssueForm(false)}
                >
                  Cancel
                </button>

              </form>
            </section>
          )}


{/* Recent Issues */}
<section className="issues">
  <h2>
  {viewMode === 'my' ? 'My Issues' : 'All Issues'}
</h2>

  
{/* Search and Filter */}
<div className="issue-filters">

  <input
    type="text"
    placeholder="Search issues..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
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
    value={filterPriority}
    onChange={(e) => setFilterPriority(e.target.value)}
  >
    <option value="All">All Priority</option>
    <option value="Low">Low</option>
    <option value="Medium">Medium</option>
    <option value="High">High</option>
    <option value="Critical">Critical</option>
  </select>

</div>


  {issueMessage && <p>{issueMessage}</p>}

{filteredIssues.length === 0 ? (
  <p>No matching issues found.</p>
) : (
  <>
    {currentIssues.map((issue) => (
      <div className="issue-item" key={issue._id}>
        <h3>{issue.title}</h3>

        <button
  className="add-btn"
  onClick={() => setSelectedIssue(issue)}
>
  View Details
</button>
        <p className="issue-date">
  Created: {new Date(issue.createdAt).toLocaleDateString('en-IN')}
</p>

<p className="issue-created-by">
  Created By: {issue.createdBy?.name || 'Unknown User'}
</p>

        <p>{issue.description}</p>

        <p className="issue-meta">
  Status:
  <span className={`status-badge status-${issue.status.toLowerCase().replace(' ', '-')}`}>
    {issue.status}
  </span>

  {' '}| Priority:
  <span className={`priority-badge priority-${issue.priority.toLowerCase()}`}>
    {issue.priority}
  </span>
</p>

        
<button
  type="button"
  onClick={() => handleEditClick(issue)}
>
  Edit Issue
</button>


{editingIssue === issue._id && (
  <form onSubmit={handleSaveEdit}>
    <h3>Edit Issue</h3>

    <input
      type="text"
      placeholder="Issue Title"
      value={editTitle}
      onChange={(e) => setEditTitle(e.target.value)}
      required
    />

    <textarea
      placeholder="Issue Description"
      value={editDescription}
      onChange={(e) => setEditDescription(e.target.value)}
      required
    />

    <select
      value={editPriority}
      onChange={(e) => setEditPriority(e.target.value)}
    >
      <option value="Low">Low</option>
      <option value="Medium">Medium</option>
      <option value="High">High</option>
      <option value="Critical">Critical</option>
    </select>

    <button type="submit">Save Changes</button>

    <button
      type="button"
      onClick={() => setEditingIssue(null)}
    >
      Cancel
    </button>
  </form>
)}


        <label>Update Status:</label>

        <select
          value={issue.status}
          onChange={(e) =>
            handleUpdateIssue(issue._id, e.target.value)
          }
        >
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>

        <button
          type="button"
          onClick={() => handleDeleteIssue(issue._id)}
        >
          Delete Issue
        </button>


<div className="comments-section">
  <h4>Comments</h4>

{(issue.comments || []).length === 0 ? (
  <p className="no-comments">No comments yet.</p>
) : (
  (issue.comments || []).map((comment) => (
    <div className="comment-item" key={comment._id}>
      <p>{comment.text}</p>

      <small>
        By: {comment.commentedBy?.name || 'User'} |
        {' '}
        {new Date(comment.createdAt).toLocaleString('en-IN')}
      </small>
    </div>
  ))
)}

  <input
    type="text"
    placeholder="Write a comment..."
    value={commentText[issue._id] || ''}
    onChange={(e) =>
      setCommentText(prev => ({
        ...prev,
        [issue._id]: e.target.value
      }))
    }
  />

  <button
    type="button"
    onClick={() => handleAddComment(issue._id)}
  >
    Add Comment
  </button>
</div>


      </div>
    ))}

    {/* Pagination Buttons */}
    <div className="pagination">
      <button
        type="button"
        onClick={() =>
          setCurrentPage((prev) => Math.max(prev - 1, 1))
        }
        disabled={currentPage === 1}
      >
        Previous
      </button>

      <span>
        Page {totalPages === 0 ? 0 : currentPage} of {totalPages}
      </span>

      <button
        type="button"
        onClick={() =>
          setCurrentPage((prev) => Math.min(prev + 1, totalPages))
        }
        disabled={currentPage >= totalPages || totalPages === 0}
      >
        Next
      </button>
    </div>
  </>
)}
</section>



        </main>
      </div>
    );
  }
  

  // Login and Register Page
  return (
    <div className="auth-container">

      <form
        className="auth-card"
        onSubmit={handleSubmit}
      >

        <h1>🐞 Bug  Tracker</h1>

        <h2>
          {isLogin ? 'Welcome Back!' : 'Create Account'}
        </h2>

        <p>
          {isLogin
            ? 'Login to manage your issues'
            : 'Register to get started'}
        </p>

        {!isLogin && (
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />

        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? 'Please wait...'
            : isLogin
              ? 'Login'
              : 'Register'}
        </button>

        {message && (
          <p className="auth-message">{message}</p>
        )}

        <p className="auth-switch">
          {isLogin
            ? "Don't have an account?"
            : 'Already have an account?'}

          <span
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage('');
            }}
          >
            {isLogin ? ' Register' : ' Login'}
          </span>
        </p>

      </form>
    </div>
  );
}

export default App;
