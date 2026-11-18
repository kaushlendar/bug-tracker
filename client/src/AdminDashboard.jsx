
import { useEffect, useState } from 'react';
import './AdminDashboard.css';

const API = 'http://localhost:5000/api/admin';

function AdminDashboard({ onBack }) {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [userSearch, setUserSearch] = useState('');
const [issueSearch, setIssueSearch] = useState('');
const [userPage, setUserPage] = useState(1);
const [issuePage, setIssuePage] = useState(1);
const [userSort, setUserSort] = useState('name');
const [issueSort, setIssueSort] = useState('priority');

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

const filteredUsers = users
  .filter((user) =>
    `${user.name} ${user.email}`
      .toLowerCase()
      .includes(userSearch.toLowerCase())
  )
  .sort((a, b) => {
    return String(a[userSort] || '').localeCompare(
      String(b[userSort] || '')
    );
  });
const priorityOrder = {
  Critical: 1,
  High: 2,
  Medium: 3,
  Low: 4
};

const filteredIssues = issues
  .filter((issue) =>
    `${issue.title} ${issue.status} ${issue.priority}`
      .toLowerCase()
      .includes(issueSearch.toLowerCase())
  )
  .sort((a, b) => {
    if (issueSort === 'priority') {
      return (
        (priorityOrder[a.priority] || 5) -
        (priorityOrder[b.priority] || 5)
      );
    }

    return String(a[issueSort] || '').localeCompare(
      String(b[issueSort] || '')
    );
  });

const itemsPerPage = 5;

const totalUserPages = Math.ceil(filteredUsers.length / itemsPerPage);

const paginatedUsers = filteredUsers.slice(
  (userPage - 1) * itemsPerPage,
  userPage * itemsPerPage
);

const totalIssuePages = Math.ceil(
  filteredIssues.length / itemsPerPage
);

const paginatedIssues = filteredIssues.slice(
  (issuePage - 1) * itemsPerPage,
  issuePage * itemsPerPage
);

const statusCounts = {
  Open: issues.filter((issue) => issue.status === 'Open').length,
  'In Progress': issues.filter((issue) => issue.status === 'In Progress').length,
  Resolved: issues.filter((issue) => issue.status === 'Resolved').length,
  Closed: issues.filter((issue) => issue.status === 'Closed').length
};

const priorityCounts = {
  Critical: issues.filter((issue) => issue.priority === 'Critical').length,
  High: issues.filter((issue) => issue.priority === 'High').length,
  Medium: issues.filter((issue) => issue.priority === 'Medium').length,
  Low: issues.filter((issue) => issue.priority === 'Low').length
};

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      const [statsRes, usersRes, issuesRes] = await Promise.all([
        fetch(`${API}/stats`, { headers: getHeaders() }),
        fetch(`${API}/users`, { headers: getHeaders() }),
        fetch(`${API}/issues`, { headers: getHeaders() })
      ]);

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      const issuesData = await issuesRes.json();

      if (!statsRes.ok || !usersRes.ok || !issuesRes.ok) {
        throw new Error(
          statsData.message ||
          usersData.message ||
          issuesData.message ||
          'Unable to load admin data'
        );
      }

      setStats(statsData.stats);
      setUsers(usersData.users);
      setIssues(issuesData.issues);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRoleChange = async (userId, role) => {
    try {
      const response = await fetch(`${API}/users/${userId}/role`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ role })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      setMessage(data.message);
      fetchAdminData();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user and their issues?')) {
      return;
    }

    try {
      const response = await fetch(`${API}/users/${userId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      setMessage(data.message);
      fetchAdminData();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleDeleteIssue = async (issueId) => {
    if (!window.confirm('Are you sure you want to delete this issue?')) {
      return;
    }

    try {
      const response = await fetch(`${API}/issues/${issueId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      setMessage(data.message);
      fetchAdminData();
    } catch (error) {
      setMessage(error.message);
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading Admin Dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <button className="admin-back-btn" onClick={onBack}>
        Back to Dashboard
      </button>

      <h1>Admin Dashboard</h1>
      <div className="admin-analytics">
  <h2>Issues by Status</h2>

  {Object.entries(statusCounts).map(([status, count]) => (
    <div className="analytics-row" key={status}>
      <span>{status}</span>
      <strong>{count}</strong>
      <div className="analytics-bar">
        <div
          className="analytics-fill"
          style={{
            width: `${issues.length ? (count / issues.length) * 100 : 0}%`
          }}
        />
      </div>
    </div>
  ))}
</div>

<div className="admin-analytics">
  <h2>Issues by Priority</h2>

  {Object.entries(priorityCounts).map(([priority, count]) => (
    <div className="analytics-row" key={priority}>
      <span>{priority}</span>
      <strong>{count}</strong>

      <div className="analytics-bar">
        <div
          className="analytics-fill"
          style={{
            width: `${issues.length ? (count / issues.length) * 100 : 0}%`
          }}
        />
      </div>
    </div>
  ))}
</div>

      <p className="admin-subtitle">Manage users and issues</p>

      {message && <div className="admin-message">{message}</div>}

      <div className="admin-stats">
        <div className="admin-stat-card">
          <h3>Total Users</h3>
          <p>{stats.totalUsers ?? 0}</p>
        </div>

        <div className="admin-stat-card">
          <h3>Total Issues</h3>
          <p>{stats.totalIssues ?? 0}</p>
        </div>

        <div className="admin-stat-card">
          <h3>Open Issues</h3>
          <p>{stats.openIssues ?? 0}</p>
        </div>

        <div className="admin-stat-card">
          <h3>Resolved Issues</h3>
          <p>{stats.resolvedIssues ?? 0}</p>
        </div>
      </div>

      <section className="admin-section">
        <h2>User Management</h2>

        <select
  value={userSort}
  onChange={(e) => setUserSort(e.target.value)}
>
  <option value="name">Sort by Name</option>
  <option value="email">Sort by Email</option>
</select>

        <input
  type="text"
  placeholder="Search users by name or email..."
  value={userSearch}
  onChange={(e) => setUserSearch(e.target.value)}
/>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {paginatedUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
<select
  value={user.role}
  onChange={(e) =>
    handleRoleChange(user._id, e.target.value)
  }
>
  <option value="user">User</option>
  <option value="admin">Admin</option>
</select>
                  </td>
                  <td>
                    <button
                      className="admin-delete-btn"
                      onClick={() => handleDeleteUser(user._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="admin-pagination">
  <button
    onClick={() => setUserPage((prev) => Math.max(prev - 1, 1))}
    disabled={userPage === 1}
  >
    Previous
  </button>

  <span>
    Page {userPage} of {totalUserPages || 1}
  </span>

  <button
    onClick={() =>
      setUserPage((prev) => Math.min(prev + 1, totalUserPages))
    }
    disabled={userPage >= totalUserPages}
  >
    Next
  </button>
</div>

        </div>
      </section>

      <section className="admin-section">
        <h2>Issue Management</h2>

        <select
  value={issueSort}
  onChange={(e) => setIssueSort(e.target.value)}
>
  <option value="priority">Sort by Priority</option>
  <option value="title">Sort by Title</option>
  <option value="status">Sort by Status</option>
</select>

        <input
  type="text"
  placeholder="Search issues by title, status or priority..."
  value={issueSearch}
  onChange={(e) => setIssueSearch(e.target.value)}
/>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Created By</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {paginatedIssues.map((issue) => (
                <tr key={issue._id}>
                  <td>{issue.title}</td>
                  <td>{issue.status}</td>
                  <td>{issue.priority}</td>
                  <td>{issue.createdBy?.name || 'Unknown'}</td>
                  <td>
                    <button
                      className="admin-delete-btn"
                      onClick={() => handleDeleteIssue(issue._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="admin-pagination">
  <button
    onClick={() => setIssuePage((prev) => Math.max(prev - 1, 1))}
    disabled={issuePage === 1}
  >
    Previous
  </button>

  <span>
    Page {issuePage} of {totalIssuePages || 1}
  </span>

  <button
    onClick={() =>
      setIssuePage((prev) => Math.min(prev + 1, totalIssuePages))
    }
    disabled={issuePage >= totalIssuePages}
  >
    Next
  </button>
</div>
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;
