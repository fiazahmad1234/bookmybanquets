import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { API } from '../../context/AuthContext';
import Sidebar from '../../components/common/Sidebar';
import '../customer/Dashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingHalls, setPendingHalls] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [statsRes, pendingRes, usersRes] = await Promise.all([
        API.get('/admin/dashboard'),
        API.get('/admin/halls/pending'),
        API.get('/admin/users?limit=8')
      ]);
      setStats(statsRes.data.stats);
      setPendingHalls(pendingRes.data.halls || []);
      setUsers(usersRes.data.users || []);
    } catch (e) {}
    setLoading(false);
  };

  const approveHall = async (hallId, approved) => {
    try {
      await API.put(`/halls/${hallId}/approve`, { is_approved: approved });
      fetchData();
    } catch (e) {}
  };

  const toggleUser = async (userId) => {
    try {
      await API.put(`/admin/users/${userId}/toggle`);
      fetchData();
    } catch (e) {}
  };

  const s = stats;
  const statCards = [
    { label: 'Total Users', value: s?.users?.total || 0, sub: `${s?.users?.customers || 0} customers`, icon: '👥', color: 'blue' },
    { label: 'Total Halls', value: s?.halls?.total || 0, sub: `${s?.halls?.pending || 0} pending`, icon: '🏛️', color: 'orange' },
    { label: 'Total Bookings', value: s?.bookings?.total || 0, sub: `${s?.bookings?.confirmed || 0} confirmed`, icon: '📋', color: 'green' },
    { label: 'Total Revenue', value: `PKR ${Number(s?.bookings?.total_revenue || 0).toLocaleString()}`, sub: 'All time', icon: '💰', color: 'purple' },
  ];

  const trendData = s?.monthly_trend?.map(m => ({
    month: new Date(m.month).toLocaleString('default', { month: 'short' }),
    bookings: Number(m.bookings),
    revenue: Number(m.revenue)
  })) || [
    { month: 'Jan', bookings: 45, revenue: 900000 },
    { month: 'Feb', bookings: 62, revenue: 1240000 },
    { month: 'Mar', bookings: 78, revenue: 1560000 },
    { month: 'Apr', bookings: 55, revenue: 1100000 },
    { month: 'May', bookings: 90, revenue: 1800000 },
    { month: 'Jun', bookings: 110, revenue: 2200000 },
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="dashboard-inner">
          <div className="dash-header">
            <div>
              <h1 className="dash-title">Admin Dashboard</h1>
              <p className="dash-subtitle">Platform-wide overview and management.</p>
            </div>
          </div>

          {/* STAT CARDS */}
          <div className="stat-cards">
            {statCards.map((s, i) => (
              <div key={i} className={`stat-card stat-card-${s.color}`}>
                <div className="stat-card-icon">{s.icon}</div>
                <div className="stat-card-info">
                  <div className="stat-card-value">{loading ? '—' : s.value}</div>
                  <div className="stat-card-label">{s.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="dash-grid-2" style={{ marginBottom: 24 }}>
            <div className="dash-card">
              <div className="dash-card-header"><h3>Monthly Bookings Trend</h3></div>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0E5D4" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="bookings" stroke="#C4823A" strokeWidth={3} dot={{ fill: '#2C1810', r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="dash-card">
              <div className="dash-card-header"><h3>Monthly Revenue (PKR)</h3></div>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0E5D4" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={v => [`PKR ${Number(v).toLocaleString()}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#2C1810" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="dash-grid-2">
            {/* PENDING HALL APPROVALS */}
            <div className="dash-card">
              <div className="dash-card-header">
                <h3>⏳ Pending Hall Approvals</h3>
                <Link to="/admin/halls" className="view-all">View All →</Link>
              </div>
              {pendingHalls.length === 0 ? (
                <div className="empty-state"><span>✅</span><p>All caught up! No pending approvals.</p></div>
              ) : (
                <div>
                  {pendingHalls.slice(0, 5).map(hall => (
                    <div key={hall.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 24px', borderBottom: '1px solid var(--border-light)' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{hall.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{hall.city} · by {hall.manager_name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Capacity: {hall.capacity_max} · PKR {Number(hall.price_per_day).toLocaleString()}/day</div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-primary btn-sm" onClick={() => approveHall(hall.id, true)}>✓ Approve</button>
                        <button className="btn btn-danger btn-sm" onClick={() => approveHall(hall.id, false)}>✗ Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RECENT USERS */}
            <div className="dash-card">
              <div className="dash-card-header">
                <h3>👥 Recent Users</h3>
                <Link to="/admin/users" className="view-all">View All →</Link>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr><th>Name</th><th>Role</th><th>City</th><th>Status</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{u.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</div>
                        </td>
                        <td><span className={`badge ${u.role === 'admin' ? 'badge-gold' : u.role === 'manager' ? 'badge-confirmed' : 'badge-pending'}`}>{u.role}</span></td>
                        <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{u.city || '—'}</td>
                        <td><span className={`badge ${u.is_active ? 'badge-confirmed' : 'badge-cancelled'}`}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
                        <td>
                          <button className="btn btn-ghost btn-sm" onClick={() => toggleUser(u.id)}>
                            {u.is_active ? 'Disable' : 'Enable'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* SUMMARY CARDS */}
          <div className="dash-grid-3" style={{ marginTop: 0 }}>
            {[
              { icon: '👥', label: 'New Users This Month', value: s?.users?.new_this_month || 0, color: 'var(--info)' },
              { icon: '🏛️', label: 'Approved Halls', value: s?.halls?.approved || 0, color: 'var(--success)' },
              { icon: '🛍️', label: 'Total Vendors', value: s?.vendors?.total || 0, color: 'var(--secondary)' },
            ].map((c, i) => (
              <div key={i} className="dash-card" style={{ padding: 24, textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>{c.icon}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, color: c.color }}>{c.value}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{c.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
