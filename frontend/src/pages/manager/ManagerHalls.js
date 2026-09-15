import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../../context/AuthContext';
import Sidebar from '../../components/common/Sidebar';
import toast from 'react-hot-toast';
import '../customer/Dashboard.css';

const ManagerHalls = () => {
  const navigate = useNavigate();
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', address: '', city: '', state: '',
    capacity_min: 50, capacity_max: 300, price_per_day: '', price_per_hour: '',
    hall_type: 'wedding', parking_capacity: 0,
    is_ac: true, has_kitchen: false, has_stage: false, has_projector: false,
    has_sound_system: false, has_wifi: false, has_decoration: false,
    catering_available: false, outdoor_space: false,
    cancellation_policy: '', terms_conditions: ''
  });
  const [coverImage, setCoverImage] = useState(null);

  useEffect(() => { fetchHalls(); }, []);

  const fetchHalls = async () => {
    try {
      const res = await API.get('/halls/my-halls');
      setHalls(res.data.halls || []);
    } catch (e) {}
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (coverImage) fd.append('cover_image', coverImage);

      if (editId) {
        await API.put(`/halls/${editId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Hall updated successfully!');
      } else {
        await API.post('/halls', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Hall added! Awaiting admin approval.');
      }
      setShowForm(false);
      setEditId(null);
      resetForm();
      fetchHalls();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save hall');
    }
    setSubmitting(false);
  };

  const handleEdit = (hall) => {
    setForm({ ...hall });
    setEditId(hall.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this hall?')) return;
    try {
      await API.delete(`/halls/${id}`);
      toast.success('Hall deleted');
      fetchHalls();
    } catch (e) { toast.error('Delete failed'); }
  };

  const resetForm = () => {
    setForm({ name: '', description: '', address: '', city: '', state: '', capacity_min: 50, capacity_max: 300, price_per_day: '', price_per_hour: '', hall_type: 'wedding', parking_capacity: 0, is_ac: true, has_kitchen: false, has_stage: false, has_projector: false, has_sound_system: false, has_wifi: false, has_decoration: false, catering_available: false, outdoor_space: false, cancellation_policy: '', terms_conditions: '' });
    setCoverImage(null);
  };

  const toggleCheck = (key) => setForm(f => ({ ...f, [key]: !f[key] }));

  const amenityFields = [
    { key: 'is_ac', label: '❄️ Air Conditioning' },
    { key: 'has_kitchen', label: '👨‍🍳 Kitchen' },
    { key: 'has_stage', label: '🎤 Stage' },
    { key: 'has_projector', label: '📽️ Projector' },
    { key: 'has_sound_system', label: '🔊 Sound System' },
    { key: 'has_wifi', label: '📶 WiFi' },
    { key: 'has_decoration', label: '🌸 Decoration' },
    { key: 'catering_available', label: '🍽️ Catering' },
    { key: 'outdoor_space', label: '🌿 Outdoor Space' },
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="dashboard-inner">
          <div className="dash-header">
            <div>
              <h1 className="dash-title">{showForm ? (editId ? 'Edit Hall' : 'Add New Hall') : 'My Halls'}</h1>
              <p className="dash-subtitle">{showForm ? 'Fill in the details for your banquet hall.' : 'Manage your listed halls.'}</p>
            </div>
            <button className={`btn ${showForm ? 'btn-ghost' : 'btn-primary'}`}
              onClick={() => { setShowForm(!showForm); setEditId(null); resetForm(); }}>
              {showForm ? '← Back to Halls' : '+ Add New Hall'}
            </button>
          </div>

          {showForm ? (
            <form onSubmit={handleSubmit} className="hall-form">
              {/* Basic Info */}
              <div className="form-section">
                <h3 className="form-section-title">📋 Basic Information</h3>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Hall Name *</label>
                    <input className="form-input" required placeholder="Royal Grandeur Hall" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Event Type *</label>
                    <select className="form-input" value={form.hall_type} onChange={e => setForm(f => ({ ...f, hall_type: e.target.value }))}>
                      <option value="wedding">Wedding</option>
                      <option value="corporate">Corporate</option>
                      <option value="party">Party</option>
                      <option value="conference">Conference</option>
                      <option value="all">All Types</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea className="form-input" rows={4} required placeholder="Describe your hall, its unique features, ambiance..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Cover Image</label>
                  <input type="file" className="form-input" accept="image/*" onChange={e => setCoverImage(e.target.files[0])} />
                  {form.cover_image && !coverImage && <img src={form.cover_image} alt="current" style={{ marginTop: 8, height: 80, borderRadius: 8, objectFit: 'cover' }} />}
                  {coverImage && <p style={{ fontSize: 12, color: 'var(--success)', marginTop: 4 }}>✓ New image selected: {coverImage.name}</p>}
                </div>
              </div>

              {/* Location */}
              <div className="form-section">
                <h3 className="form-section-title">📍 Location</h3>
                <div className="form-group">
                  <label className="form-label">Street Address *</label>
                  <input className="form-input" required placeholder="123 Main Boulevard, Block A" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <select className="form-input" required value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}>
                      <option value="">Select City</option>
                      {['Lahore','Karachi','Islamabad','Rawalpindi','Faisalabad','Multan','Peshawar','Quetta'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">State / Province</label>
                    <input className="form-input" placeholder="Punjab" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} />
                  </div>
                </div>
              </div>

              {/* Capacity & Pricing */}
              <div className="form-section">
                <h3 className="form-section-title">💰 Capacity & Pricing</h3>
                <div className="form-grid-4">
                  <div className="form-group">
                    <label className="form-label">Min Guests</label>
                    <input type="number" className="form-input" value={form.capacity_min} onChange={e => setForm(f => ({ ...f, capacity_min: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Max Guests *</label>
                    <input type="number" className="form-input" required value={form.capacity_max} onChange={e => setForm(f => ({ ...f, capacity_max: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price/Day (PKR) *</label>
                    <input type="number" className="form-input" required placeholder="150000" value={form.price_per_day} onChange={e => setForm(f => ({ ...f, price_per_day: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price/Hour (PKR)</label>
                    <input type="number" className="form-input" placeholder="20000" value={form.price_per_hour} onChange={e => setForm(f => ({ ...f, price_per_hour: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group" style={{ maxWidth: 200 }}>
                  <label className="form-label">Parking Capacity</label>
                  <input type="number" className="form-input" value={form.parking_capacity} onChange={e => setForm(f => ({ ...f, parking_capacity: e.target.value }))} />
                </div>
              </div>

              {/* Amenities */}
              <div className="form-section">
                <h3 className="form-section-title">✨ Amenities & Features</h3>
                <div className="amenities-checkboxes">
                  {amenityFields.map(a => (
                    <label key={a.key} className={`amenity-check ${form[a.key] ? 'active' : ''}`} onClick={() => toggleCheck(a.key)}>
                      <input type="checkbox" checked={form[a.key] || false} onChange={() => {}} />
                      <span>{a.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Policies */}
              <div className="form-section">
                <h3 className="form-section-title">📜 Policies</h3>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Cancellation Policy</label>
                    <textarea className="form-input" rows={3} placeholder="e.g. 50% refund if cancelled 7 days before event..." value={form.cancellation_policy} onChange={e => setForm(f => ({ ...f, cancellation_policy: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Terms & Conditions</label>
                    <textarea className="form-input" rows={3} placeholder="List any special rules or requirements..." value={form.terms_conditions} onChange={e => setForm(f => ({ ...f, terms_conditions: e.target.value }))} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
                  {submitting ? '⏳ Saving...' : (editId ? '💾 Update Hall' : '🚀 Submit for Approval')}
                </button>
                <button type="button" className="btn btn-ghost btn-lg" onClick={() => { setShowForm(false); resetForm(); setEditId(null); }}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div>
              {loading ? (
                <div className="page-loader"><div className="spinner" /></div>
              ) : halls.length === 0 ? (
                <div className="empty-state" style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 64 }}>
                  <div style={{ fontSize: 64 }}>🏛️</div>
                  <h3>No halls added yet</h3>
                  <p>Start listing your hall to receive bookings.</p>
                  <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add Your First Hall</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {halls.map(hall => (
                    <div key={hall.id} className="manager-hall-card">
                      <div className="mhc-image">
                        {hall.primary_image ? <img src={hall.primary_image} alt={hall.name} /> : <div className="mhc-placeholder">🏛️</div>}
                      </div>
                      <div className="mhc-body">
                        <div className="mhc-header">
                          <div>
                            <h3 className="mhc-name">{hall.name}</h3>
                            <div className="mhc-location">📍 {hall.city} · {hall.capacity_max} guests · PKR {Number(hall.price_per_day).toLocaleString()}/day</div>
                          </div>
                          <div className="mhc-badges">
                            <span className={`badge ${hall.is_approved ? 'badge-confirmed' : 'badge-pending'}`}>{hall.is_approved ? '✓ Live' : '⏳ Pending'}</span>
                            <span className={`badge ${hall.is_active ? 'badge-confirmed' : 'badge-cancelled'}`}>{hall.is_active ? 'Active' : 'Inactive'}</span>
                          </div>
                        </div>
                        <div className="mhc-stats">
                          <div className="mhc-stat"><span>⭐</span><strong>{parseFloat(hall.avg_rating || 0).toFixed(1)}</strong><span>Rating</span></div>
                          <div className="mhc-stat"><span>📋</span><strong>{hall.confirmed_bookings || 0}</strong><span>Confirmed</span></div>
                          <div className="mhc-stat"><span>⏳</span><strong>{hall.pending_bookings || 0}</strong><span>Pending</span></div>
                          <div className="mhc-stat"><span>💬</span><strong>{hall.total_reviews || 0}</strong><span>Reviews</span></div>
                        </div>
                        <div className="mhc-actions">
                          <button className="btn btn-outline btn-sm" onClick={() => handleEdit(hall)}>✏️ Edit</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/halls/${hall.id}`)}>👁️ View</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/manager/bookings?hall=${hall.id}`)}>📋 Bookings</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(hall.id)}>🗑️ Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerHalls;
