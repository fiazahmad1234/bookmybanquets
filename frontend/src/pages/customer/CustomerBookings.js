import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../../context/AuthContext';
import Sidebar from '../../components/common/Sidebar';
import toast from 'react-hot-toast';
import '../customer/Dashboard.css';
import './Bookings.css';

const CustomerBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', cleanliness_rating: 5, service_rating: 5, value_rating: 5 });

  useEffect(() => { fetchBookings(); }, [filter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const res = await API.get(`/bookings${params}`);
      setBookings(res.data.bookings || []);
    } catch (e) {}
    setLoading(false);
  };

  const handleCancel = async () => {
    try {
      await API.put(`/bookings/${cancelModal}/cancel`, { cancellation_reason: cancelReason });
      toast.success('Booking cancelled successfully');
      setCancelModal(null);
      fetchBookings();
    } catch (e) { toast.error(e.response?.data?.message || 'Cancel failed'); }
  };

  const handleReview = async () => {
    try {
      await API.post('/reviews', { booking_id: reviewModal.id, ...reviewForm });
      toast.success('Review submitted!');
      setReviewModal(null);
      fetchBookings();
    } catch (e) { toast.error(e.response?.data?.message || 'Review failed'); }
  };

  const statusBadge = (s) => {
    const map = { pending: 'badge-pending', confirmed: 'badge-confirmed', cancelled: 'badge-cancelled', completed: 'badge-completed', rejected: 'badge-rejected' };
    return <span className={`badge ${map[s] || ''}`}>{s}</span>;
  };

  const tabs = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="dashboard-inner">
          <div className="dash-header">
            <div>
              <h1 className="dash-title">My Bookings</h1>
              <p className="dash-subtitle">Track and manage all your hall bookings.</p>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="bookings-tabs">
            {tabs.map(tab => (
              <button key={tab} className={`bookings-tab ${filter === tab ? 'active' : ''}`} onClick={() => setFilter(tab)}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="page-loader" style={{ minHeight: 300 }}><div className="spinner" /></div>
          ) : bookings.length === 0 ? (
            <div className="empty-state" style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 64 }}>
              <div style={{ fontSize: 64 }}>📋</div>
              <h3>No {filter === 'all' ? '' : filter} bookings found</h3>
              <p>Start by finding and booking a hall for your event.</p>
              <button className="btn btn-primary" onClick={() => navigate('/halls')}>Browse Halls</button>
            </div>
          ) : (
            <div className="bookings-cards">
              {bookings.map(b => (
                <div key={b.id} className="booking-card-full">
                  <div className="bcf-image">
                    {b.hall_image ? <img src={b.hall_image} alt={b.hall_name} /> : <div className="bcf-placeholder">🏛️</div>}
                    {statusBadge(b.booking_status)}
                  </div>
                  <div className="bcf-body">
                    <div className="bcf-header">
                      <div>
                        <h3 className="bcf-hall">{b.hall_name}</h3>
                        <div className="bcf-location">📍 {b.hall_address}, {b.hall_city}</div>
                      </div>
                      <div className="bcf-amount">
                        <div className="bcf-total">PKR {Number(b.total_amount).toLocaleString()}</div>
                        <div className="bcf-payment">{b.payment_status}</div>
                      </div>
                    </div>

                    <div className="bcf-details">
                      <div className="bcf-detail"><span>🎉</span><div><strong>Event</strong><p>{b.event_type}</p></div></div>
                      <div className="bcf-detail"><span>📅</span><div><strong>Date</strong><p>{new Date(b.event_date).toDateString()}</p></div></div>
                      <div className="bcf-detail"><span>🕐</span><div><strong>Time</strong><p>{b.start_time} – {b.end_time}</p></div></div>
                      <div className="bcf-detail"><span>👥</span><div><strong>Guests</strong><p>{b.guest_count}</p></div></div>
                    </div>

                    {b.special_requests && (
                      <div className="bcf-note">📝 {b.special_requests}</div>
                    )}

                    {b.ai_recommendation && (
                      <div className="bcf-ai">🤖 {b.ai_recommendation}</div>
                    )}

                    {b.manager_notes && (
                      <div className="bcf-manager-note">💬 Manager: {b.manager_notes}</div>
                    )}

                    <div className="bcf-actions">
                      <div className="bcf-id">Booking #{b.id?.slice(0,8).toUpperCase()}</div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {['pending', 'confirmed'].includes(b.booking_status) && (
                          <button className="btn btn-danger btn-sm" onClick={() => setCancelModal(b.id)}>Cancel</button>
                        )}
                        {b.booking_status === 'completed' && (
                          <button className="btn btn-primary btn-sm" onClick={() => { setReviewModal(b); }}>⭐ Write Review</button>
                        )}
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/halls/${b.hall_id}`)}>View Hall</button>
                        {['confirmed', 'pending'].includes(b.booking_status) && (
                          <button className="btn btn-outline btn-sm" onClick={() => navigate(`/customer/messages?hall=${b.hall_id}`)}>💬 Message Manager</button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CANCEL MODAL */}
        {cancelModal && (
          <div className="modal-overlay" onClick={() => setCancelModal(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h3 className="modal-title">Cancel Booking</h3>
              <p className="modal-desc">Are you sure you want to cancel this booking? This action cannot be undone.</p>
              <textarea
                className="form-input"
                placeholder="Reason for cancellation (optional)"
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                rows={3}
              />
              <div className="modal-actions">
                <button className="btn btn-ghost" onClick={() => setCancelModal(null)}>Keep Booking</button>
                <button className="btn btn-danger" onClick={handleCancel}>Yes, Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* REVIEW MODAL */}
        {reviewModal && (
          <div className="modal-overlay" onClick={() => setReviewModal(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h3 className="modal-title">⭐ Write a Review</h3>
              <p className="modal-desc">Share your experience at <strong>{reviewModal.hall_name}</strong></p>

              <div className="review-form">
                {[
                  { key: 'rating', label: 'Overall Rating' },
                  { key: 'cleanliness_rating', label: 'Cleanliness' },
                  { key: 'service_rating', label: 'Service' },
                  { key: 'value_rating', label: 'Value for Money' },
                ].map(r => (
                  <div key={r.key} className="form-group">
                    <label className="form-label">{r.label}</label>
                    <div className="star-select">
                      {[1,2,3,4,5].map(star => (
                        <button key={star} type="button" className={`star-btn ${reviewForm[r.key] >= star ? 'active' : ''}`}
                          onClick={() => setReviewForm(f => ({ ...f, [r.key]: star }))}>★</button>
                      ))}
                      <span>{reviewForm[r.key]}/5</span>
                    </div>
                  </div>
                ))}
                <div className="form-group">
                  <label className="form-label">Your Review</label>
                  <textarea className="form-input" rows={4} placeholder="Share details about your experience..."
                    value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))} />
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn btn-ghost" onClick={() => setReviewModal(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleReview}>Submit Review</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerBookings;
