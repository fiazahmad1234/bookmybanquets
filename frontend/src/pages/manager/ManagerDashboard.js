import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { API } from '../../context/AuthContext';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/common/Sidebar';
import '../customer/Dashboard.css';
import './ManagerDashboard.css';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [statsRes, bookingsRes, hallsRes] = await Promise.all([
        API.get('/bookings/stats'),
        API.get('/bookings?limit=8'),
        API.get('/halls/my-halls')
      ]);
      setStats(statsRes.data.stats);
      setBookings(bookingsRes.data.bookings || []);
      setHalls(hallsRes.data.halls || []);
    } catch (e) {}
    setLoading(false);
  };

  const handleStatusUpdate = async (bookingId, status) => {
    try {
      await API.put(`/bookings/${bookingId}/status`, { status });
      fetchData();
    } catch (e) {}
  };

  // Mock monthly data for charts
  const monthlyData = [
    { month: 'Jul', bookings: 12, revenue: 240000 },
    { month: 'Aug', bookings: 18, revenue: 380000 },
    { month: 'Sep', bookings: 15, revenue: 290000 },
    { month: 'Oct', bookings: 22, revenue: 460000 },
    { month: 'Nov', bookings: 28, revenue: 580000 },
    { month: 'Dec', bookings: 35, revenue: 720000 },
  ];

  const pieData = [
    { name: 'Confirmed', value: Number(stats?.confirmed_count || 4), color: '#2E7D4F' },
    { name: 'Pending', value: Number(stats?.pending_count || 3), color: '#C47C0E' },
    { name: 'Completed', value: Number(stats?.completed_count || 8), color: '#1565C0' },
    { name: 'Cancelled', value: Number(stats?.cancelled_count || 1), color: '#C41E1E' },
  ];

  const statCards = [
    { label: 'Total Bookings', value: stats?.total_bookings || 0, icon: '📋', color: 'blue' },
    { label: 'Pending', value: stats?.pending_count || 0, icon: '⏳', color: 'yellow' },
    { label: 'Confirmed', value: stats?.confirmed_count || 0, icon: '✅', color: 'green' },
    { label: 'Total Revenue', value: `PKR ${Number(stats?.total_revenue || 0).toLocaleString()}`, icon: '💰', color: 'orange', wide: true },
  ];

  const statusBadge = (s) => {
    const map = { pending: 'badge-pending', confirmed: 'badge-confirmed', cancelled: 'badge-cancelled', completed: 'badge-completed', rejected: 'badge-rejected' };
    return <span className={`badge ${map[s] || ''}`}>{s}</span>;
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="dashboard-inner">
          <div className="dash-header">
            <div>
              <h1 className="dash-title">Manager Dashboard</h1>
              <p className="dash-subtitle">Manage your halls, bookings and revenue.</p>
            </div>
            <Link to="/manager/halls/new" className="btn btn-primary">+ Add New Hall</Link>
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
            {/* Revenue Chart */}
            <div className="dash-card">
              <div className="dash-card-header"><h3>Monthly Revenue (PKR)</h3></div>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0E5D4" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={v => [`PKR ${v.toLocaleString()}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#C4823A" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bookings Trend */}
            <div className="dash-card">
              <div className="dash-card-header"><h3>Booking Trend</h3></div>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0E5D4" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="bookings" stroke="#2C1810" strokeWidth={3} dot={{ fill: '#C4823A', r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="dash-grid-2">
            {/* Booking Status Pie */}
            <div className="dash-card">
              <div className="dash-card-header"><h3>Booking Status Distribution</h3></div>
              <div className="chart-wrapper" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pie-legend">
                  {pieData.map((d, i) => (
                    <div key={i} className="pie-legend-item">
                      <div className="pie-dot" style={{ background: d.color }} />
                      <span>{d.name}</span>
                      <strong>{d.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* My Halls */}
            <div className="dash-card">
              <div className="dash-card-header">
                <h3>My Halls</h3>
                <Link to="/manager/halls" className="view-all">Manage All →</Link>
              </div>
              <div style={{ padding: '8px 0' }}>
                {halls.slice(0, 4).map(hall => (
                  <div key={hall.id} className="hall-list-item">
                    <div className="hli-img">
                      {hall.primary_image ? <img src={hall.primary_image} alt={hall.name} /> : '🏛️'}
                    </div>
                    <div className="hli-info">
                      <div className="hli-name">{hall.name}</div>
                      <div className="hli-meta">{hall.city} · {hall.capacity_max} guests</div>
                    </div>
                    <div className="hli-stats">
                      <span className={`badge ${hall.is_approved ? 'badge-confirmed' : 'badge-pending'}`}>
                        {hall.is_approved ? 'Live' : 'Pending'}
                      </span>
                      <div className="hli-bookings">{hall.confirmed_bookings || 0} bookings</div>
                    </div>
                  </div>
                ))}
                {halls.length === 0 && (
                  <div className="empty-state">
                    <span>🏛️</span>
                    <p>No halls yet</p>
                    <Link to="/manager/halls/new" className="btn btn-primary btn-sm">Add Hall</Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RECENT BOOKINGS TABLE */}
          <div className="dash-card">
            <div className="dash-card-header">
              <h3>Recent Booking Requests</h3>
              <Link to="/manager/bookings" className="view-all">View All →</Link>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Hall</th>
                    <th>Event</th>
                    <th>Date</th>
                    <th>Guests</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32 }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
                  ) : bookings.length === 0 ? (
                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No bookings yet</td></tr>
                  ) : bookings.map(b => (
                    <tr key={b.id}>
                      <td><div style={{ fontWeight: 600 }}>{b.customer_name}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.customer_phone}</div></td>
                      <td>{b.hall_name}</td>
                      <td>{b.event_type}</td>
                      <td>{new Date(b.event_date).toLocaleDateString()}</td>
                      <td>{b.guest_count}</td>
                      <td style={{ fontWeight: 600 }}>PKR {Number(b.total_amount).toLocaleString()}</td>
                      <td>{statusBadge(b.booking_status)}</td>
                      <td>
                        {b.booking_status === 'pending' && (
                          <div className="table-actions">
                            <button className="btn btn-primary btn-sm" onClick={() => handleStatusUpdate(b.id, 'confirmed')}>✓ Confirm</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleStatusUpdate(b.id, 'rejected')}>✗</button>
                          </div>
                        )}
                        {b.booking_status === 'confirmed' && (
                          <button className="btn btn-ghost btn-sm" onClick={() => handleStatusUpdate(b.id, 'completed')}>Mark Done</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
