import React, { useState, useEffect } from 'react';
import { API } from '../../context/AuthContext';
import Sidebar from '../../components/common/Sidebar';
import toast from 'react-hot-toast';
import '../customer/Dashboard.css';

const ManagerReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [halls, setHalls] = useState([]);
  const [selectedHall, setSelectedHall] = useState('');
  const [loading, setLoading] = useState(true);
  const [replyModal, setReplyModal] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => { fetchHalls(); }, []);
  useEffect(() => { if (selectedHall) fetchReviews(); }, [selectedHall]);

  const fetchHalls = async () => {
    try {
      const res = await API.get('/halls/my-halls');
      const hs = res.data.halls || [];
      setHalls(hs);
      if (hs.length > 0) setSelectedHall(hs[0].id);
    } catch (e) {}
  };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/reviews/hall/${selectedHall}`);
      setReviews(res.data.reviews || []);
    } catch (e) {}
    setLoading(false);
  };

  const submitReply = async () => {
    try {
      await API.put(`/reviews/${replyModal}/reply`, { reply: replyText });
      toast.success('Reply posted!');
      setReplyModal(null);
      setReplyText('');
      fetchReviews();
    } catch (e) { toast.error('Reply failed'); }
  };

  const renderStars = (n) => [...Array(5)].map((_, i) => (
    <span key={i} style={{ color: i < Math.floor(n || 0) ? '#C9A84C' : '#E0CDB8', fontSize: 15 }}>★</span>
  ));

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="dashboard-inner">
          <div className="dash-header">
            <div>
              <h1 className="dash-title">Customer Reviews</h1>
              <p className="dash-subtitle">Read and respond to customer reviews for your halls.</p>
            </div>
          </div>

          {/* Hall Selector */}
          {halls.length > 1 && (
            <div style={{ marginBottom: 20 }}>
              <select
                className="form-input"
                style={{ maxWidth: 320 }}
                value={selectedHall}
                onChange={e => setSelectedHall(e.target.value)}
              >
                {halls.map(h => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Summary Bar */}
          {reviews.length > 0 && (
            <div className="reviews-summary-bar">
              <div className="rsb-item">
                <div className="rsb-big">{avgRating}</div>
                <div>{renderStars(avgRating)}</div>
                <div className="rsb-label">Average Rating</div>
              </div>
              <div className="rsb-divider" />
              <div className="rsb-item">
                <div className="rsb-big">{reviews.length}</div>
                <div className="rsb-label">Total Reviews</div>
              </div>
              <div className="rsb-divider" />
              <div className="rsb-item">
                <div className="rsb-big">{reviews.filter(r => r.manager_reply).length}</div>
                <div className="rsb-label">Replied</div>
              </div>
              <div className="rsb-divider" />
              <div className="rsb-item">
                <div className="rsb-big">{reviews.filter(r => !r.manager_reply).length}</div>
                <div className="rsb-label">Awaiting Reply</div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="page-loader" style={{ minHeight: 300 }}><div className="spinner" /></div>
          ) : reviews.length === 0 ? (
            <div className="empty-state" style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 64 }}>
              <div style={{ fontSize: 48 }}>⭐</div>
              <h3>No reviews yet</h3>
              <p>Reviews will appear here once customers complete their bookings.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {reviews.map(r => (
                <div key={r.id} className="review-card-full">
                  <div className="rcf-header">
                    <div className="rcf-avatar">
                      {r.customer_avatar
                        ? <img src={r.customer_avatar} alt={r.customer_name} />
                        : r.customer_name?.[0]?.toUpperCase()
                      }
                    </div>
                    <div className="rcf-meta">
                      <div className="rcf-name">{r.customer_name}</div>
                      <div className="rcf-date">{new Date(r.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    </div>
                    <div className="rcf-stars">
                      {renderStars(r.rating)}
                      <span className="rcf-rating-num">{r.rating}/5</span>
                    </div>
                  </div>

                  {/* Sub-ratings */}
                  {(r.cleanliness_rating || r.service_rating || r.value_rating) && (
                    <div className="rcf-sub-ratings">
                      {r.cleanliness_rating && <div className="sub-rating"><span>🧹 Cleanliness</span>{renderStars(r.cleanliness_rating)}</div>}
                      {r.service_rating && <div className="sub-rating"><span>🤝 Service</span>{renderStars(r.service_rating)}</div>}
                      {r.value_rating && <div className="sub-rating"><span>💰 Value</span>{renderStars(r.value_rating)}</div>}
                    </div>
                  )}

                  <p className="rcf-comment">{r.comment || <em style={{ color: 'var(--text-muted)' }}>No comment provided.</em>}</p>

                  {r.manager_reply ? (
                    <div className="rcf-reply">
                      <div className="rcf-reply-header">
                        <span>🏛️ Your Response</span>
                        <span className="rcf-reply-date">{new Date(r.manager_replied_at).toLocaleDateString()}</span>
                      </div>
                      <p>{r.manager_reply}</p>
                    </div>
                  ) : (
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => { setReplyModal(r.id); setReplyText(''); }}
                    >
                      💬 Reply to Review
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reply Modal */}
        {replyModal && (
          <div className="modal-overlay" onClick={() => setReplyModal(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h3 className="modal-title">💬 Reply to Review</h3>
              <p className="modal-desc">Write a professional, helpful response to this customer review.</p>
              <div className="form-group">
                <label className="form-label">Your Response</label>
                <textarea
                  className="form-input"
                  rows={5}
                  placeholder="Thank you for your feedback! We're glad you enjoyed... "
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                />
              </div>
              <div className="modal-actions">
                <button className="btn btn-ghost" onClick={() => setReplyModal(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={submitReply} disabled={!replyText.trim()}>
                  Post Reply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerReviews;
