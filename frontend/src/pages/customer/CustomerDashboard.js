import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API } from '../../context/AuthContext';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/common/Sidebar';
import './Dashboard.css';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        API.get('/bookings/stats'),
        API.get('/bookings?limit=5')
      ]);
      setStats(statsRes.data.stats);
      setBookings(bookingsRes.data.bookings || []);
    } catch (e) {}
    setLoading(false);
  };

  const statCards = [
    { label: 'Total Bookings', value: stats?.total_bookings || 0, icon: '📋', color: 'blue' },
    { label: 'Confirmed', value: stats?.confirmed_count || 0, icon: '✅', color: 'green' },
    { label: 'Pending', value: stats?.pending_count || 0, icon: '⏳', color: 'yellow' },
    { label: 'Completed', value: stats?.completed_count || 0, icon: '🎉', color: 'purple' },
  ];

  const quickLinks = [
    { to: '/halls', icon: '🔍', label: 'Find Halls', desc: 'Browse 500+ venues' },
    { to: '/halls?ai=true', icon: '🤖', label: 'AI Recommendations', desc: 'Get personalized picks' },
    { to: '/halls/compare', icon: '⚖️', label: 'Compare Halls', desc: 'Compare up to 4 halls' },
    { to: '/vendors', icon: '🛍️', label: 'Vendor Marketplace', desc: 'Catering, decor & more' },
  ];

  const statusBadge = (status) => {
    const map = { pending: 'badge-pending', confirmed: 'badge-confirmed', cancelled: 'badge-cancelled', completed: 'badge-completed', rejected: 'badge-rejected' };
    return <span className={`badge ${map[status] || 'badge-pending'}`}>{status}</span>;
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="dashboard-inner">
          {/* HEADER */}
          <div className="dash-header">
            <div>
              <h1 className="dash-title">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
              <p className="dash-subtitle">Here's an overview of your bookings and activity.</p>
            </div>
            <Link to="/halls" className="btn btn-primary">
              + Book a Hall
            </Link>
          </div>

          {/* STAT CARDS */}
          <div className="stat-cards">
            {statCards.map((s, i) => (
              <div key={i} className={`stat-card stat-card-${s.color}`}>
                <div className="stat-card-icon">{s.icon}</div>
                <div className="stat-card-info">
                  <div className="stat-card-value">{loading ? '—' : s.value}</div>
                  <div className="stat-card-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="dash-grid-2">
            {/* RECENT BOOKINGS */}
            <div className="dash-card">
              <div className="dash-card-header">
                <h3>Recent Bookings</h3>
                <Link to="/customer/bookings" className="view-all">View All →</Link>
              </div>
              {loading ? (
                <div className="page-loader" style={{ minHeight: 200 }}><div className="spinner" /></div>
              ) : bookings.length === 0 ? (
                <div className="empty-state">
                  <div style={{ fontSize: 48 }}>📋</div>
                  <p>No bookings yet</p>
                  <Link to="/halls" className="btn btn-primary btn-sm">Find a Hall</Link>
                </div>
              ) : (
                <div className="bookings-list">
                  {bookings.map(b => (
                    <div key={b.id} className="booking-item" onClick={() => navigate('/customer/bookings')}>
                      <div className="booking-item-img">
                        {b.hall_image ? <img src={b.hall_image} alt={b.hall_name} /> : '🏛️'}
                      </div>
                      <div className="booking-item-info">
                        <div className="booking-item-hall">{b.hall_name}</div>
                        <div className="booking-item-date">📅 {new Date(b.event_date).toDateString()}</div>
                        <div className="booking-item-type">{b.event_type}</div>
                      </div>
                      <div className="booking-item-right">
                        {statusBadge(b.booking_status)}
                        <div className="booking-item-price">PKR {Number(b.total_amount).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* QUICK LINKS */}
            <div>
              <div className="dash-card mb-3">
                <div className="dash-card-header"><h3>Quick Actions</h3></div>
                <div className="quick-links-grid">
                  {quickLinks.map((l, i) => (
                    <Link key={i} to={l.to} className="quick-link">
                      <span className="ql-icon">{l.icon}</span>
                      <div>
                        <div className="ql-label">{l.label}</div>
                        <div className="ql-desc">{l.desc}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Profile completion */}
              <div className="dash-card">
                <div className="dash-card-header"><h3>Profile Completion</h3></div>
                <div className="profile-completion">
                  <div className="pc-bar">
                    <div className="pc-fill" style={{ width: `${[user?.name, user?.email, user?.phone, user?.city].filter(Boolean).length * 25}%` }} />
                  </div>
                  <p className="pc-text">{[user?.name, user?.email, user?.phone, user?.city].filter(Boolean).length * 25}% complete</p>
                  <div className="pc-items">
                    {[
                      { label: 'Name', done: !!user?.name },
                      { label: 'Email', done: !!user?.email },
                      { label: 'Phone', done: !!user?.phone },
                      { label: 'City', done: !!user?.city },
                    ].map(item => (
                      <div key={item.label} className={`pc-item ${item.done ? 'done' : ''}`}>
                        <span>{item.done ? '✓' : '○'}</span> {item.label}
                      </div>
                    ))}
                  </div>
                  <Link to="/profile" className="btn btn-outline btn-sm btn-full">Complete Profile</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;