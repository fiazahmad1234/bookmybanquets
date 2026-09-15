// Profile.js
import React, { useState } from 'react';
import { API } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import toast from 'react-hot-toast';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', city: user?.city || '', address: user?.address || '' });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (avatar) fd.append('avatar', avatar);
      const res = await API.put('/auth/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (e) { toast.error('Update failed'); }
    setLoading(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    setPassLoading(true);
    try {
      await API.put('/auth/change-password', { currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
      toast.success('Password changed successfully!');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e) { toast.error(e.response?.data?.message || 'Password change failed'); }
    setPassLoading(false);
  };

  const isDashboard = !!user;

  const Wrapper = ({ children }) => isDashboard ? (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content"><div className="dashboard-inner">{children}</div></div>
    </div>
  ) : <div>{children}</div>;

  return (
    <Wrapper>
      <div className="dash-header">
        <div>
          <h1 className="dash-title">My Profile</h1>
          <p className="dash-subtitle">Manage your account information and security.</p>
        </div>
      </div>

      <div className="profile-layout">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar-big">
              {user?.avatar ? <img src={user.avatar} alt={user.name} /> : user?.name?.[0]?.toUpperCase()}
            </div>
            <label className="avatar-upload-btn">
              📷
              <input type="file" accept="image/*" onChange={e => setAvatar(e.target.files[0])} />
            </label>
          </div>
          {avatar && <p className="avatar-hint">✓ New photo selected</p>}
          <div className="profile-card-name">{user?.name}</div>
          <div className="profile-card-email">{user?.email}</div>
          <div className={`profile-card-role badge badge-${user?.role === 'admin' ? 'gold' : 'confirmed'}`}>{user?.role}</div>

          <div className="profile-meta">
            <div className="meta-item"><span>📍</span>{user?.city || 'Not set'}</div>
            <div className="meta-item"><span>📞</span>{user?.phone || 'Not set'}</div>
            <div className="meta-item"><span>📅</span>Joined {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recently'}</div>
          </div>
        </div>

        {/* Form Tabs */}
        <div className="profile-forms">
          <div className="profile-tabs">
            <button className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Personal Info</button>
            <button className={`profile-tab ${activeTab === 'password' ? 'active' : ''}`} onClick={() => setActiveTab('password')}>Change Password</button>
          </div>

          {activeTab === 'profile' && (
            <form onSubmit={handleProfileUpdate} className="profile-form-content">
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input className="form-input" placeholder="+92-300-0000000" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <select className="form-input" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}>
                  <option value="">Select city</option>
                  {['Lahore','Karachi','Islamabad','Rawalpindi','Faisalabad','Multan','Peshawar','Quetta'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea className="form-input" rows={3} placeholder="Your full address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" value={user?.email} disabled style={{ opacity: 0.6 }} />
                <small style={{ fontSize: 12, color: 'var(--text-muted)' }}>Email cannot be changed</small>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? '⏳ Saving...' : '💾 Save Changes'}
              </button>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordChange} className="profile-form-content">
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input type="password" className="form-input" required value={passForm.currentPassword} onChange={e => setPassForm({ ...passForm, currentPassword: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input type="password" className="form-input" required minLength={6} value={passForm.newPassword} onChange={e => setPassForm({ ...passForm, newPassword: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input type="password" className="form-input" required value={passForm.confirmPassword} onChange={e => setPassForm({ ...passForm, confirmPassword: e.target.value })} />
                {passForm.confirmPassword && passForm.newPassword !== passForm.confirmPassword && (
                  <small style={{ color: 'var(--error)' }}>Passwords do not match</small>
                )}
              </div>
              <button type="submit" className="btn btn-primary" disabled={passLoading}>
                {passLoading ? '⏳ Updating...' : '🔐 Change Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </Wrapper>
  );
};

export default Profile;
