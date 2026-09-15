import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { API } from '../context/AuthContext';
import HallCard from '../components/common/HallCard';
import './Halls.css';

const Halls = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [compareList, setCompareList] = useState([]);
  const [aiRecs, setAiRecs] = useState([]);
  const [showAI, setShowAI] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    hall_type: searchParams.get('hall_type') || '',
    search: searchParams.get('search') || '',
    min_price: '', max_price: '',
    min_capacity: '', max_capacity: '',
    is_ac: false, has_kitchen: false, has_stage: false,
    catering_available: false, outdoor_space: false,
    has_sound_system: false, has_wifi: false, has_projector: false,
    sort: 'avg_rating', order: 'DESC',
  });

  const [aiForm, setAiForm] = useState({ event_type: '', guest_count: '', city: '', budget: '' });

  // Fetch whenever filters OR currentPage changes
  useEffect(() => { fetchHalls(); }, [filters, currentPage]);

  const fetchHalls = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      // Add all non-empty filters
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== '' && v !== false && v !== null && v !== undefined) {
          params.set(k, v);
        }
      });
      // Always add page and limit
      params.set('page', currentPage);
      params.set('limit', 10);

      const res = await API.get(`/halls?${params.toString()}`);
      setHalls(res.data.halls || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (e) {
      setHalls([]);
    }
    setLoading(false);
  };

  const handleFilterChange = (key, value) => {
    setCurrentPage(1); // reset to page 1 on any filter change
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setCurrentPage(1);
    setFilters({
      city: '', hall_type: '', search: '', min_price: '', max_price: '',
      min_capacity: '', max_capacity: '', is_ac: false, has_kitchen: false,
      has_stage: false, catering_available: false, outdoor_space: false,
      has_sound_system: false, has_wifi: false, has_projector: false,
      sort: 'avg_rating', order: 'DESC',
    });
  };

  const handleAIRecommend = async () => {
    setAiLoading(true);
    setShowAI(true);
    try {
      const res = await API.get('/halls/recommendations', { params: aiForm });
      setAiRecs(res.data.recommendations || []);
    } catch (e) { setAiRecs([]); }
    setAiLoading(false);
  };

  const toggleCompare = (hallId) => {
    setCompareList(prev => {
      if (prev.includes(hallId)) return prev.filter(id => id !== hallId);
      if (prev.length >= 4) { alert('You can compare up to 4 halls.'); return prev; }
      return [...prev, hallId];
    });
  };

  const handleCompareGo = () => {
    navigate(`/halls/compare?ids=${compareList.join(',')}`);
  };

  const cities = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta'];

  return (
    <div className="halls-page">
      {/* Header */}
      <div className="halls-header">
        <div className="container">
          <h1 className="halls-title">Browse Banquet Halls</h1>
          <p className="halls-subtitle">
            {total > 0 ? `${total} venues found` : 'Find your perfect venue'} — Pakistan's largest collection of premium event spaces
          </p>
          <div className="halls-search-bar">
            <input
              type="text"
              placeholder="🔍  Search halls by name, area or city..."
              className="halls-search-input"
              value={filters.search}
              onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
              onKeyDown={e => { if (e.key === 'Enter') { setCurrentPage(1); fetchHalls(); } }}
            />
            <button className="btn btn-primary" onClick={() => { setCurrentPage(1); fetchHalls(); }}>Search</button>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="halls-layout">
          {/* SIDEBAR FILTERS */}
          <aside className="halls-sidebar">
            {/* AI Form */}
            <div className="filter-section">
              <div className="filter-title">🤖 AI Recommendations</div>
              <div className="ai-filter-form">
                <select className="form-input" value={aiForm.event_type} onChange={e => setAiForm({ ...aiForm, event_type: e.target.value })}>
                  <option value="">Event Type</option>
                  <option value="wedding">Wedding</option>
                  <option value="corporate">Corporate</option>
                  <option value="party">Party</option>
                  <option value="conference">Conference</option>
                </select>
                <input type="number" placeholder="No. of guests" className="form-input" value={aiForm.guest_count} onChange={e => setAiForm({ ...aiForm, guest_count: e.target.value })} />
                <select className="form-input" value={aiForm.city} onChange={e => setAiForm({ ...aiForm, city: e.target.value })}>
                  <option value="">Select City</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input type="number" placeholder="Budget (PKR)" className="form-input" value={aiForm.budget} onChange={e => setAiForm({ ...aiForm, budget: e.target.value })} />
                <button className="btn btn-primary btn-full" onClick={handleAIRecommend} disabled={aiLoading}>
                  {aiLoading ? '⏳ Analyzing...' : '✨ Get AI Picks'}
                </button>
              </div>
            </div>

            {/* City */}
            <div className="filter-section">
              <div className="filter-title">📍 City</div>
              <select className="form-input" value={filters.city} onChange={e => handleFilterChange('city', e.target.value)}>
                <option value="">All Cities</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Event Type */}
            <div className="filter-section">
              <div className="filter-title">🎉 Event Type</div>
              <select className="form-input" value={filters.hall_type} onChange={e => handleFilterChange('hall_type', e.target.value)}>
                <option value="">All Types</option>
                <option value="wedding">Wedding</option>
                <option value="corporate">Corporate</option>
                <option value="party">Party</option>
                <option value="conference">Conference</option>
                <option value="all">Multi-Purpose</option>
              </select>
            </div>

            {/* Price */}
            <div className="filter-section">
              <div className="filter-title">💰 Price Range (PKR/day)</div>
              <div className="range-row">
                <input type="number" placeholder="Min" className="form-input" value={filters.min_price} onChange={e => handleFilterChange('min_price', e.target.value)} />
                <span>—</span>
                <input type="number" placeholder="Max" className="form-input" value={filters.max_price} onChange={e => handleFilterChange('max_price', e.target.value)} />
              </div>
            </div>

            {/* Capacity */}
            <div className="filter-section">
              <div className="filter-title">👥 Guest Capacity</div>
              <div className="range-row">
                <input type="number" placeholder="Min" className="form-input" value={filters.min_capacity} onChange={e => handleFilterChange('min_capacity', e.target.value)} />
                <span>—</span>
                <input type="number" placeholder="Max" className="form-input" value={filters.max_capacity} onChange={e => handleFilterChange('max_capacity', e.target.value)} />
              </div>
            </div>

            {/* Amenities */}
            <div className="filter-section">
              <div className="filter-title">✨ Amenities</div>
              <div className="amenity-checks">
                {[
                  { key: 'is_ac', label: '❄️ Air Conditioning' },
                  { key: 'has_kitchen', label: '👨‍🍳 Kitchen' },
                  { key: 'has_stage', label: '🎤 Stage' },
                  { key: 'catering_available', label: '🍽️ Catering' },
                  { key: 'outdoor_space', label: '🌿 Outdoor Space' },
                  { key: 'has_sound_system', label: '🔊 Sound System' },
                  { key: 'has_wifi', label: '📶 WiFi' },
                  { key: 'has_projector', label: '📽️ Projector' },
                ].map(a => (
                  <label key={a.key} className="check-label">
                    <input type="checkbox" checked={filters[a.key] || false} onChange={e => handleFilterChange(a.key, e.target.checked)} />
                    <span>{a.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button className="btn btn-ghost btn-full" onClick={clearFilters}>🔄 Clear All Filters</button>
          </aside>

          {/* MAIN */}
          <main className="halls-main">
            {/* Toolbar */}
            <div className="halls-toolbar">
              <div className="halls-count">
                {loading ? 'Loading...' : `${total} hall${total !== 1 ? 's' : ''} found`}
              </div>
              <div className="halls-sort">
                <label>Sort by:</label>
                <select className="form-input" value={`${filters.sort}_${filters.order}`} onChange={e => {
                  const parts = e.target.value.split('_');
                  const order = parts.pop();
                  const sort = parts.join('_');
                  setFilters(prev => ({ ...prev, sort, order }));
                  setCurrentPage(1);
                }}>
                  <option value="avg_rating_DESC">Top Rated</option>
                  <option value="price_per_day_ASC">Price: Low to High</option>
                  <option value="price_per_day_DESC">Price: High to Low</option>
                  <option value="capacity_max_DESC">Largest Capacity</option>
                  <option value="created_at_DESC">Newest First</option>
                  <option value="total_bookings_DESC">Most Popular</option>
                </select>
              </div>
            </div>

            {/* AI Results */}
            {showAI && (
              <div className="ai-results">
                <div className="ai-results-header">
                  <span>🤖 AI Recommendations</span>
                  <button onClick={() => setShowAI(false)}>✕</button>
                </div>
                {aiLoading ? (
                  <div className="page-loader"><div className="spinner" /></div>
                ) : aiRecs.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 20 }}>No recommendations found. Try adjusting your criteria.</p>
                ) : (
                  <div className="ai-recs-grid">
                    {aiRecs.map((hall, i) => (
                      <div key={hall.id} className="ai-rec-card">
                        <div className="ai-rank">#{i + 1}</div>
                        <img src={hall.primary_image || hall.cover_image} alt={hall.name} className="ai-rec-img" onError={e => { e.target.style.display = 'none'; }} />
                        <div className="ai-rec-body">
                          <div className="ai-rec-name">{hall.name}</div>
                          <div className="ai-rec-city">📍 {hall.city}</div>
                          <div className="ai-rec-reason">💡 {hall.ai_reason}</div>
                          <div className="ai-rec-price">PKR {Number(hall.price_per_day).toLocaleString()}/day</div>
                          <button className="btn btn-primary btn-sm" onClick={() => navigate(`/halls/${hall.id}`)}>View Hall</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Compare Bar */}
            {compareList.length > 0 && (
              <div className="compare-bar">
                <span>⚖️ {compareList.length} hall{compareList.length > 1 ? 's' : ''} selected</span>
                <div className="compare-bar-actions">
                  {compareList.length >= 2 && (
                    <button className="btn btn-primary btn-sm" onClick={handleCompareGo}>Compare Now</button>
                  )}
                  <button className="btn btn-ghost btn-sm" onClick={() => setCompareList([])}>Clear</button>
                </div>
              </div>
            )}

            {/* Halls Grid */}
            {loading ? (
              <div className="page-loader"><div className="spinner" /></div>
            ) : halls.length === 0 ? (
              <div className="no-results">
                <div className="no-results-icon">🏛️</div>
                <h3>No halls found</h3>
                <p>Try adjusting your filters or search terms.</p>
                <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
              </div>
            ) : (
              <div className="halls-grid-main">
                {halls.map(hall => (
                  <HallCard key={hall.id} hall={hall} onCompare={toggleCompare} compareList={compareList} />
                ))}
              </div>
            )}

            {/* PAGINATION — FIXED */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  disabled={currentPage <= 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  ← Prev
                </button>

                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  // Show first, last, current, and neighbours
                  if (pageNum === 1 || pageNum === totalPages || Math.abs(pageNum - currentPage) <= 1) {
                    return (
                      <button
                        key={i}
                        className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  if (Math.abs(pageNum - currentPage) === 2) {
                    return <span key={i} style={{ padding: '0 4px', color: 'var(--text-muted)' }}>...</span>;
                  }
                  return null;
                })}

                <button
                  className="page-btn"
                  disabled={currentPage >= totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Halls;