import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { API } from '../../context/AuthContext';
import Sidebar from '../../components/common/Sidebar';
import '../customer/Dashboard.css';

const ManagerAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [statsRes, hallsRes] = await Promise.all([
        API.get('/bookings/stats'),
        API.get('/halls/my-halls')
      ]);
      setStats(statsRes.data.stats);
      setHalls(hallsRes.data.halls || []);
    } catch (e) {}
    setLoading(false);
  };

  // Mock chart data (replace with real API data when ready)
  const monthlyRevenue = [
    { month: 'Jul', revenue: 120000, bookings: 8 },
    { month: 'Aug', revenue: 195000, bookings: 13 },
    { month: 'Sep', revenue: 148000, bookings: 10 },
    { month: 'Oct', revenue: 230000, bookings: 16 },
    { month: 'Nov', revenue: 310000, bookings: 21 },
    { month: 'Dec', revenue: 460000, bookings: 32 },
  ];

  const eventTypeData = [
    { name: 'Wedding', value: 45, color: '#C4823A' },
    { name: 'Corporate', value: 25, color: '#2C1810' },
    { name: 'Birthday', value: 18, color: '#C9A84C' },
    { name: 'Conference', value: 8, color: '#8B1A1A' },
    { name: 'Other', value: 4, color: '#9C7B6C' },
  ];

  const weeklyData = [
    { day: 'Mon', bookings: 3 }, { day: 'Tue', bookings: 5 },
    { day: 'Wed', bookings: 2 }, { day: 'Thu', bookings: 7 },
    { day: 'Fri', bookings: 12 }, { day: 'Sat', bookings: 18 },
    { day: 'Sun', bookings: 15 },
  ];

  const ratingDistribution = [
    { rating: '5 ★', count: 45 }, { rating: '4 ★', count: 28 },
    { rating: '3 ★', count: 12 }, { rating: '2 ★', count: 5 },
    { rating: '1 ★', count: 2 },
  ];

  const hallPerformance = halls.map(h => ({
    name: h.name.substring(0, 15) + (h.name.length > 15 ? '...' : ''),
    rating: parseFloat(h.avg_rating || 0),
    bookings: parseInt(h.confirmed_bookings || 0),
    reviews: parseInt(h.total_reviews || 0),
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', boxShadow: 'var(--shadow)' }}>
          <p style={{ fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)' }}>{label}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color, fontSize: 13 }}>
              {p.name}: {p.name === 'revenue' ? `PKR ${Number(p.value).toLocaleString()}` : p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="dashboard-inner">
          <div className="dash-header">
            <div>
              <h1 className="dash-title">Analytics & Insights</h1>
              <p className="dash-subtitle">Detailed performance data for your halls and bookings.</p>
            </div>
          </div>

          {/* Summary KPIs */}
          <div className="stat-cards">
            {[
              { label: 'Total Revenue', value: `PKR ${Number(stats?.total_revenue || 0).toLocaleString()}`, icon: '💰', color: 'orange' },
              { label: 'Total Bookings', value: stats?.total_bookings || 0, icon: '📋', color: 'blue' },
              { label: 'Completion Rate', value: stats?.total_bookings > 0 ? `${Math.round((stats?.completed_count / stats?.total_bookings) * 100)}%` : '0%', icon: '✅', color: 'green' },
              { label: 'Cancellation Rate', value: stats?.total_bookings > 0 ? `${Math.round((stats?.cancelled_count / stats?.total_bookings) * 100)}%` : '0%', icon: '❌', color: 'red' },
            ].map((s, i) => (
              <div key={i} className={`stat-card stat-card-${s.color}`}>
                <div className="stat-card-icon">{s.icon}</div>
                <div className="stat-card-info">
                  <div className="stat-card-value">{loading ? '—' : s.value}</div>
                  <div className="stat-card-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Revenue & Bookings trend */}
          <div className="dash-card" style={{ marginBottom: 24 }}>
            <div className="dash-card-header"><h3>📈 Revenue & Bookings Trend (Last 6 Months)</h3></div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyRevenue} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C4823A" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#C4823A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0E5D4" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#C4823A" fill="url(#colorRevenue)" strokeWidth={2.5} name="Revenue (PKR)" />
                  <Line yAxisId="right" type="monotone" dataKey="bookings" stroke="#2C1810" strokeWidth={2.5} dot={{ fill: '#2C1810', r: 5 }} name="Bookings" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="dash-grid-2">
            {/* Event Type Breakdown */}
            <div className="dash-card">
              <div className="dash-card-header"><h3>🎉 Event Type Breakdown</h3></div>
              <div className="chart-wrapper" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <ResponsiveContainer width={200} height={220}>
                  <PieChart>
                    <Pie data={eventTypeData} cx="50%" cy="50%" outerRadius={90} paddingAngle={3} dataKey="value">
                      {eventTypeData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={v => [`${v}%`, 'Share']} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1 }}>
                  {eventTypeData.map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 13, color: 'var(--text-secondary)' }}>{d.name}</span>
                      <strong style={{ fontSize: 13 }}>{d.value}%</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Weekly Bookings Pattern */}
            <div className="dash-card">
              <div className="dash-card-header"><h3>📅 Weekly Booking Pattern</h3></div>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0E5D4" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="#C4823A" radius={[6, 6, 0, 0]} name="Bookings" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="dash-grid-2">
            {/* Rating Distribution */}
            <div className="dash-card">
              <div className="dash-card-header"><h3>⭐ Rating Distribution</h3></div>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={ratingDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0E5D4" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="rating" type="category" tick={{ fontSize: 12 }} width={40} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#C9A84C" radius={[0, 6, 6, 0]} name="Reviews" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Hall Performance */}
            <div className="dash-card">
              <div className="dash-card-header"><h3>🏛️ Hall Performance</h3></div>
              {hallPerformance.length === 0 ? (
                <div className="empty-state" style={{ padding: 32 }}><p>No halls data yet</p></div>
              ) : (
                <div style={{ padding: '8px 0' }}>
                  {hallPerformance.map((h, i) => (
                    <div key={i} style={{ padding: '12px 24px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--secondary)', width: 28 }}>{i + 1}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{h.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{h.bookings} bookings · {h.reviews} reviews</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#C9A84C', fontWeight: 700, fontSize: 14 }}>
                        ★ {h.rating}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerAnalytics;
