import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { API } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './HallDetail.css';

const HallDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [hall, setHall] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [bookingForm, setBookingForm] = useState({
    event_type: '', event_date: '', start_time: '', end_time: '',
    guest_count: '', special_requests: '', coupon_code: ''
  });
  const [booking, setBooking] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [availability, setAvailability] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [totalPrice, setTotalPrice] = useState(null);

  useEffect(() => { fetchHall(); fetchReviews(); }, [id]);

  useEffect(() => { calculatePrice(); }, [bookingForm.start_time, bookingForm.end_time]);

  const fetchHall = async () => {
    try {
      const res = await API.get(`/halls/${id}`);
      setHall(res.data.hall);
      setReviews(res.data.reviews || []);
    } catch (e) {
      toast.error('Hall not found');
      navigate('/halls');
    }
    setLoading(false);
  };

  const fetchReviews = async () => {
    try {
      const res = await API.get(`/reviews/hall/${id}`);
      setReviews(res.data.reviews || []);
      setReviewStats(res.data.stats);
    } catch (e) {}
  };

  const calculatePrice = () => {
    if (!hall || !bookingForm.start_time || !bookingForm.end_time) { setTotalPrice(null); return; }
    const [sh, sm] = bookingForm.start_time.split(':').map(Number);
    const [eh, em] = bookingForm.end_time.split(':').map(Number);
    const hours = (eh + em / 60) - (sh + sm / 60);
    if (hours > 0) {
      const price = hall.price_per_hour ? hall.price_per_hour * hours : hall.price_per_day;
      setTotalPrice({ hours, price, advance: price * 0.25 });
    }
  };

  const checkAvailability = async () => {
    if (!bookingForm.event_date || !bookingForm.start_time || !bookingForm.end_time) return;
    try {
      const res = await API.get(`/halls/${id}/availability`, {
        params: { date: bookingForm.event_date, start_time: bookingForm.start_time, end_time: bookingForm.end_time }
      });
      setAvailability(res.data.available);
    } catch (e) {}
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to book'); navigate('/login'); return; }
    if (user.role !== 'customer') { toast.error('Only customers can book halls'); return; }
    setBookingLoading(true);
    try {
      const res = await API.post('/bookings', { hall_id: id, ...bookingForm });
      setBooking(res.data.booking);
      toast.success('Booking request submitted!');
      setActiveTab('booking-success');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Booking failed');
    }
    setBookingLoading(false);
  };

  const renderStars = (rating) => [...Array(5)].map((_, i) => (
    <span key={i} className={`star ${i < Math.floor(rating) ? '' : 'empty'}`}>★</span>
  ));

  if (loading) return <div className="page-loader" style={{ minHeight: '60vh' }}><div className="spinner" /></div>;
  if (!hall) return null;

  const images = hall.images?.map(img => img.image_url || img) || [hall.cover_image];

  return (
    <div className="hall-detail">
      {/* Breadcrumb */}
      <div className="detail-breadcrumb">
        <div className="container">
          <Link to="/">Home</Link> / <Link to="/halls">Halls</Link> / <span>{hall.name}</span>
        </div>
      </div>

      <div className="container">
        <div className="detail-layout">
          {/* LEFT COLUMN */}
          <div className="detail-left">
            {/* Gallery */}
            <div className="gallery">
              <div className="gallery-main">
                <img src={images[activeImage] || hall.cover_image} alt={hall.name} className="gallery-main-img" />
                {images.length > 1 && (
                  <>
                    <button className="gallery-nav prev" onClick={() => setActiveImage(p => (p - 1 + images.length) % images.length)}>‹</button>
                    <button className="gallery-nav next" onClick={() => setActiveImage(p => (p + 1) % images.length)}>›</button>
                  </>
                )}
                <div className="gallery-count">{activeImage + 1} / {images.length}</div>
              </div>
              {images.length > 1 && (
                <div className="gallery-thumbs">
                  {images.map((img, i) => (
                    <img key={i} src={img} alt={`View ${i + 1}`} className={`gallery-thumb ${i === activeImage ? 'active' : ''}`} onClick={() => setActiveImage(i)} />
                  ))}
                </div>
              )}
            </div>

            {/* TABS */}
            <div className="detail-tabs">
              {['overview', 'amenities', 'reviews', 'location'].map(tab => (
                <button key={tab} className={`detail-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* TAB CONTENT */}
            {activeTab === 'overview' && (
              <div className="tab-content animate-fadeIn">
                <div className="hall-info-header">
                  <div>
                    <h1 className="hall-name">{hall.name}</h1>
                    <div className="hall-location">📍 {hall.address}, {hall.city}, {hall.state}</div>
                    <div className="hall-rating-row">
                      <div className="stars">{renderStars(hall.avg_rating)}</div>
                      <span className="rating-val">{parseFloat(hall.avg_rating || 0).toFixed(1)}</span>
                      <span className="rating-cnt">({hall.total_reviews} reviews)</span>
                      <span className="hall-type-badge">{hall.hall_type}</span>
                    </div>
                  </div>
                </div>

                <p className="hall-description">{hall.description}</p>

                <div className="hall-stats-grid">
                  <div className="hall-stat"><span className="hall-stat-icon">👥</span><div><div className="hall-stat-val">{hall.capacity_min}–{hall.capacity_max}</div><div className="hall-stat-lbl">Guests</div></div></div>
                  <div className="hall-stat"><span className="hall-stat-icon">💰</span><div><div className="hall-stat-val">PKR {Number(hall.price_per_day).toLocaleString()}</div><div className="hall-stat-lbl">Per Day</div></div></div>
                  <div className="hall-stat"><span className="hall-stat-icon">🚗</span><div><div className="hall-stat-val">{hall.parking_capacity}</div><div className="hall-stat-lbl">Parking</div></div></div>
                  <div className="hall-stat"><span className="hall-stat-icon">🎉</span><div><div className="hall-stat-val">{hall.total_bookings || 0}</div><div className="hall-stat-lbl">Bookings</div></div></div>
                </div>

                {hall.cancellation_policy && (
                  <div className="policy-box">
                    <h4>📋 Cancellation Policy</h4>
                    <p>{hall.cancellation_policy}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'amenities' && (
              <div className="tab-content animate-fadeIn">
                <h3 className="tab-section-title">Hall Amenities & Features</h3>
                <div className="amenities-grid">
                  {[
                    { key: 'is_ac', label: 'Air Conditioning', icon: '❄️' },
                    { key: 'has_kitchen', label: 'Kitchen Facility', icon: '👨‍🍳' },
                    { key: 'has_stage', label: 'Stage / Podium', icon: '🎤' },
                    { key: 'has_projector', label: 'Projector & Screen', icon: '📽️' },
                    { key: 'has_sound_system', label: 'Sound System', icon: '🔊' },
                    { key: 'has_wifi', label: 'WiFi Internet', icon: '📶' },
                    { key: 'has_decoration', label: 'Decoration Services', icon: '🌸' },
                    { key: 'catering_available', label: 'In-House Catering', icon: '🍽️' },
                    { key: 'outdoor_space', label: 'Outdoor Space', icon: '🌿' },
                  ].map(a => (
                    <div key={a.key} className={`amenity-item ${hall[a.key] ? 'available' : 'unavailable'}`}>
                      <span className="amenity-item-icon">{a.icon}</span>
                      <span className="amenity-item-label">{a.label}</span>
                      <span className="amenity-status">{hall[a.key] ? '✓' : '✗'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="tab-content animate-fadeIn">
                <h3 className="tab-section-title">Customer Reviews</h3>
                {reviewStats && (
                  <div className="review-stats">
                    <div className="review-overall">
                      <div className="review-big-rating">{parseFloat(reviewStats.avg_rating || 0).toFixed(1)}</div>
                      <div className="stars">{renderStars(reviewStats.avg_rating || 0)}</div>
                      <div className="review-total">{reviews.length} reviews</div>
                    </div>
                    <div className="review-breakdown">
                      {[5,4,3,2,1].map(star => {
                        const count = Number(reviewStats[`${['one','two','three','four','five'][star-1]}_star`] || 0);
                        const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                        return (
                          <div key={star} className="review-bar-row">
                            <span>{star}★</span>
                            <div className="review-bar"><div style={{ width: `${pct}%` }} /></div>
                            <span>{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div className="reviews-list">
                  {reviews.length === 0 ? (
                    <p className="text-muted text-center" style={{ padding: '40px 0' }}>No reviews yet. Be the first to review!</p>
                  ) : reviews.map(r => (
                    <div key={r.id} className="review-item">
                      <div className="review-header">
                        <div className="review-avatar">{r.customer_name?.[0]}</div>
                        <div>
                          <div className="review-name">{r.customer_name}</div>
                          <div className="review-date">{new Date(r.created_at).toLocaleDateString()}</div>
                        </div>
                        <div className="review-rating">{renderStars(r.rating)}</div>
                      </div>
                      <p className="review-text">{r.comment}</p>
                      {r.manager_reply && (
                        <div className="manager-reply">
                          <strong>Manager's Response:</strong> {r.manager_reply}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'location' && (
              <div className="tab-content animate-fadeIn">
                <h3 className="tab-section-title">Location & Directions</h3>
                <div className="location-info">
                  <div className="location-details">
                    <div className="location-item"><span>📍</span><div><strong>Address</strong><p>{hall.address}</p></div></div>
                    <div className="location-item"><span>🏙️</span><div><strong>City</strong><p>{hall.city}, {hall.state}</p></div></div>
                    <div className="location-item"><span>📞</span><div><strong>Contact</strong><p>{hall.manager_phone || 'Contact via message'}</p></div></div>
                    <div className="location-item"><span>✉️</span><div><strong>Email</strong><p>{hall.manager_email || 'Contact via message'}</p></div></div>
                  </div>
                  <div className="map-placeholder">
                    <div className="map-placeholder-inner">
                      📍<br />{hall.name}<br /><small>{hall.city}</small>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'booking-success' && booking && (
              <div className="tab-content animate-fadeIn">
                <div className="booking-success">
                  <div className="booking-success-icon">🎉</div>
                  <h2>Booking Submitted Successfully!</h2>
                  <p>Your booking request for <strong>{hall.name}</strong> has been submitted and is awaiting confirmation from the hall manager.</p>
                  <div className="booking-success-details">
                    <div className="bd-row"><span>Booking ID</span><strong>#{booking.id?.slice(0,8).toUpperCase()}</strong></div>
                    <div className="bd-row"><span>Event</span><strong>{booking.event_type}</strong></div>
                    <div className="bd-row"><span>Date</span><strong>{new Date(booking.event_date).toDateString()}</strong></div>
                    <div className="bd-row"><span>Total Amount</span><strong>PKR {Number(booking.total_amount).toLocaleString()}</strong></div>
                    <div className="bd-row"><span>Advance (25%)</span><strong>PKR {Number(booking.advance_payment).toLocaleString()}</strong></div>
                  </div>
                  {booking.ai_recommendation && (
                    <div className="ai-tips">
                      <h4>🤖 AI Event Tips</h4>
                      {booking.ai_recommendation.split(' | ').map((tip, i) => <p key={i}>{tip}</p>)}
                    </div>
                  )}
                  <div className="booking-success-actions">
                    <button className="btn btn-primary" onClick={() => navigate('/customer/bookings')}>View My Bookings</button>
                    <button className="btn btn-ghost" onClick={() => navigate('/halls')}>Browse More Halls</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN - BOOKING FORM */}
          <div className="detail-right">
            <div className="booking-card">
              <div className="booking-card-header">
                <div className="booking-price">
                  <span className="bp-from">Starting from</span>
                  <span className="bp-amount">PKR {Number(hall.price_per_day).toLocaleString()}</span>
                  <span className="bp-unit">/day</span>
                </div>
                {hall.price_per_hour && (
                  <div className="bp-hourly">PKR {Number(hall.price_per_hour).toLocaleString()} / hour</div>
                )}
              </div>

              <form className="booking-form" onSubmit={handleBooking}>
                <div className="form-group">
                  <label className="form-label">Event Type *</label>
                  <select className="form-input" required value={bookingForm.event_type} onChange={e => setBookingForm({ ...bookingForm, event_type: e.target.value })}>
                    <option value="">Select event type</option>
                    <option value="Wedding">💍 Wedding</option>
                    <option value="Corporate Event">💼 Corporate Event</option>
                    <option value="Birthday Party">🎂 Birthday Party</option>
                    <option value="Engagement">💎 Engagement</option>
                    <option value="Anniversary">🌹 Anniversary</option>
                    <option value="Conference">🎤 Conference</option>
                    <option value="Other">📋 Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Event Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingForm.event_date}
                    onChange={e => { setBookingForm({ ...bookingForm, event_date: e.target.value }); setAvailability(null); }}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Start Time *</label>
                    <input type="time" className="form-input" required value={bookingForm.start_time}
                      onChange={e => { setBookingForm({ ...bookingForm, start_time: e.target.value }); setAvailability(null); }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Time *</label>
                    <input type="time" className="form-input" required value={bookingForm.end_time}
                      onChange={e => { setBookingForm({ ...bookingForm, end_time: e.target.value }); setAvailability(null); }} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Number of Guests *</label>
                  <input type="number" className="form-input" required placeholder={`${hall.capacity_min}–${hall.capacity_max}`}
                    min={hall.capacity_min} max={hall.capacity_max}
                    value={bookingForm.guest_count}
                    onChange={e => setBookingForm({ ...bookingForm, guest_count: e.target.value })} />
                  <small className="form-hint">Capacity: {hall.capacity_min}–{hall.capacity_max} guests</small>
                </div>

                {bookingForm.event_date && bookingForm.start_time && bookingForm.end_time && (
                  <button type="button" className="btn btn-ghost btn-full btn-sm" onClick={checkAvailability}>
                    🗓️ Check Availability
                  </button>
                )}

                {availability !== null && (
                  <div className={`availability-result ${availability ? 'available' : 'unavailable'}`}>
                    {availability ? '✅ Hall is available for selected date & time!' : '❌ Hall is not available for selected time. Please choose another.'}
                  </div>
                )}

                {totalPrice && (
                  <div className="price-estimate">
                    <div className="pe-row"><span>Duration</span><span>{totalPrice.hours} hours</span></div>
                    <div className="pe-row"><span>Estimated Total</span><strong>PKR {Number(totalPrice.price).toLocaleString()}</strong></div>
                    <div className="pe-row accent"><span>Advance Payment (25%)</span><strong>PKR {Number(totalPrice.advance).toLocaleString()}</strong></div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Special Requests</label>
                  <textarea className="form-input" placeholder="Any special requirements, dietary preferences, decoration needs..."
                    value={bookingForm.special_requests}
                    onChange={e => setBookingForm({ ...bookingForm, special_requests: e.target.value })} />
                </div>

                <div className="form-group">
                  <label className="form-label">Coupon Code</label>
                  <input type="text" className="form-input" placeholder="Enter coupon code (e.g. FIRST10)" value={bookingForm.coupon_code}
                    onChange={e => setBookingForm({ ...bookingForm, coupon_code: e.target.value })} />
                  <small className="form-hint">Try: FIRST10, SAVE500, WELCOME15</small>
                </div>

                <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={bookingLoading}>
                  {bookingLoading ? '⏳ Submitting...' : user ? '📋 Book This Hall' : '🔐 Login to Book'}
                </button>

                {!user && (
                  <p className="booking-login-hint">
                    <Link to="/login">Sign in</Link> or <Link to="/register">create an account</Link> to book this hall
                  </p>
                )}
              </form>

              {/* Manager Info */}
              <div className="manager-card">
                <div className="manager-card-title">Hall Manager</div>
                <div className="manager-info">
                  <div className="manager-avatar">{hall.manager_name?.[0]}</div>
                  <div>
                    <div className="manager-name">{hall.manager_name}</div>
                    <div className="manager-label">Verified Manager</div>
                  </div>
                </div>
                {user && (
                  <button className="btn btn-outline btn-full btn-sm" onClick={() => navigate(`/customer/messages?to=${hall.manager_id}`)}>
                    💬 Message Manager
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HallDetail;
