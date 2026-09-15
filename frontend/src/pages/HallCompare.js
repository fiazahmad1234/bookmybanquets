import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { API } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import './HallCompare.css';

const HallCompare = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const ids = searchParams.get('ids') || '';

  useEffect(() => {
    if (ids) fetchHalls();
  }, [ids]);

  const fetchHalls = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/halls/compare?ids=${ids}`);
      setHalls(res.data.halls || []);
    } catch (e) {}
    setLoading(false);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} style={{ color: i < Math.floor(rating || 0) ? '#C9A84C' : '#E0CDB8', fontSize: 16 }}>★</span>
    ));
  };

  const check = (val) => val ? <span className="comp-yes">✓</span> : <span className="comp-no">✗</span>;

  const rows = [
    { label: 'City', key: (h) => h.city },
    { label: 'Hall Type', key: (h) => <span className="comp-badge">{h.hall_type}</span> },
    { label: 'Min Guests', key: (h) => h.capacity_min },
    { label: 'Max Guests', key: (h) => h.capacity_max },
    { label: 'Price / Day', key: (h) => `PKR ${Number(h.price_per_day).toLocaleString()}` },
    { label: 'Price / Hour', key: (h) => h.price_per_hour ? `PKR ${Number(h.price_per_hour).toLocaleString()}` : '—' },
    { label: 'Parking', key: (h) => `${h.parking_capacity} cars` },
    { label: 'Rating', key: (h) => <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{renderStars(h.avg_rating)}<strong>{parseFloat(h.avg_rating || 0).toFixed(1)}</strong></span> },
    { label: 'Total Reviews', key: (h) => h.total_reviews || 0 },
    { label: 'Total Bookings', key: (h) => h.total_bookings || 0 },
    { label: '❄️ Air Conditioning', key: (h) => check(h.is_ac) },
    { label: '👨‍🍳 Kitchen', key: (h) => check(h.has_kitchen) },
    { label: '🎤 Stage', key: (h) => check(h.has_stage) },
    { label: '📽️ Projector', key: (h) => check(h.has_projector) },
    { label: '🔊 Sound System', key: (h) => check(h.has_sound_system) },
    { label: '📶 WiFi', key: (h) => check(h.has_wifi) },
    { label: '🌸 Decoration', key: (h) => check(h.has_decoration) },
    { label: '🍽️ Catering', key: (h) => check(h.catering_available) },
    { label: '🌿 Outdoor Space', key: (h) => check(h.outdoor_space) },
  ];

  return (
    <div>
      <Navbar />
      <div className="compare-page">
        <div className="compare-header">
          <div className="container">
            <h1 className="compare-title">⚖️ Hall Comparison</h1>
            <p className="compare-subtitle">Compare halls side by side to make the best choice.</p>
            <Link to="/halls" className="btn btn-outline btn-sm">← Back to Halls</Link>
          </div>
        </div>

        <div className="container">
          {loading ? (
            <div className="page-loader" style={{ minHeight: 400 }}><div className="spinner" /></div>
          ) : halls.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 24px' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>⚖️</div>
              <h3 style={{ marginBottom: 8 }}>No halls to compare</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Go to the Halls page and select halls to compare.</p>
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/halls')}>Browse Halls</button>
            </div>
          ) : (
            <div className="compare-wrapper">
              <table className="compare-table">
                <thead>
                  <tr>
                    <th className="comp-label-col">Feature</th>
                    {halls.map(h => (
                      <th key={h.id} className="comp-hall-col">
                        <div className="comp-hall-header">
                          <img
                            src={h.primary_image || h.cover_image || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400'}
                            alt={h.name}
                            className="comp-hall-img"
                          />
                          <div className="comp-hall-name">{h.name}</div>
                          <div className="comp-hall-city">📍 {h.city}</div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'row-even' : 'row-odd'}>
                      <td className="comp-label">{row.label}</td>
                      {halls.map(h => (
                        <td key={h.id} className="comp-value">{row.key(h)}</td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <td className="comp-label">Action</td>
                    {halls.map(h => (
                      <td key={h.id} className="comp-value">
                        <Link to={`/halls/${h.id}`} className="btn btn-primary btn-sm btn-full">
                          Book Now →
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HallCompare;
