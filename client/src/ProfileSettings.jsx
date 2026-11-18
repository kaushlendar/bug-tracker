
import { useState } from 'react';
import './ProfileSettings.css';

function ProfileSettings({ user, onBack }) {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Update Profile
  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');

const response = await fetch(
  'https://bug-tracker-5y8m.onrender.com/api/auth/profile',
  {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ name, email })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Profile update failed');
      }

      localStorage.setItem('user', JSON.stringify(data.user));
      setMessage('Profile updated successfully!');

    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    setPasswordLoading(true);

    try {
      const token = localStorage.getItem('token');

const response = await fetch(
  'https://bug-tracker-5y8m.onrender.com/api/auth/change-password',
  {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmPassword
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Password change failed');
      }

      setPasswordMessage('Password changed successfully!');

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

    } catch (error) {
      setPasswordMessage(error.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="issue-details">
      <button className="add-btn" onClick={onBack}>
        Back to Dashboard
      </button>

      <h2>My Profile & Settings</h2>

      {/* Edit Profile */}
      <form onSubmit={handleUpdate}>
        <div className="activity-item">
          <h3>Edit Profile</h3>

          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button className="add-btn" type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Profile'}
          </button>

          {message && <p>{message}</p>}
        </div>
      </form>

      {/* Change Password */}
      <form onSubmit={handleChangePassword}>
        <div className="activity-item">
          <h3>Change Password</h3>

          <label>Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />

          <label>New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={6}
            required
          />

          <label>Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={6}
            required
          />

          <button
            className="add-btn"
            type="submit"
            disabled={passwordLoading}
          >
            {passwordLoading ? 'Changing...' : 'Change Password'}
          </button>

          {passwordMessage && <p>{passwordMessage}</p>}
        </div>
      </form>

      {/* Account Settings */}
      <div className="activity-item">
        <h3>Account Settings</h3>
        <p>Role: {user?.role || 'User'}</p>
        <p>Account Status: Active</p>
        <p>Application: Bug Tracker</p>
      </div>
    </div>
  );
}

export default ProfileSettings;
