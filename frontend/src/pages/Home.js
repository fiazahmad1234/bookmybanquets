import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../context/AuthContext';
import HallCard from '../components/common/HallCard';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState({ city: '', event_type: '', guest_count: '', date: '' });
  const [featuredHalls, setFeaturedHalls] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiRecs, setAiRecs] = useState([]);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => setActiveTestimonial(p => (p + 1) % testimonials.length), 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [hallsRes, citiesRes] = await Promise.all([
        API.get('/halls?limit=6&sort=avg_rating&order=DESC'),
        API.get('/halls/cities')
      ]);
      setFeaturedHalls(hallsRes.data.halls || []);
      setCities(citiesRes.data.cities || []);
    } catch (e) {
      // Use placeholder data if API not connected
      setFeaturedHalls(placeholderHalls);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.city) params.set('city', search.city);
    if (search.event_type) params.set('hall_type', search.event_type);
    if (search.guest_count) params.set('min_capacity', search.guest_count);
    navigate(`/halls?${params.toString()}`);
  };

  const testimonials = [
    { name: 'Ayesha & Zain', event: 'Wedding Reception', rating: 5, text: 'BookMyBanquets made our dream wedding possible. Found the perfect hall in Lahore within minutes. The entire booking process was seamless!', city: 'Lahore', image: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=80' },
    { name: 'Tariq Mahmood', event: 'Corporate Conference', rating: 5, text: 'As an event manager, I rely on BookMyBanquets for all our corporate events. The comparison feature and instant availability check save us hours.', city: 'Islamabad', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80' },
    { name: 'Sana Family', event: 'Birthday Celebration', rating: 4, text: 'Found an amazing garden venue for my daughter\'s birthday. The AI recommendations were spot on — exactly what we were looking for!', city: 'Karachi', image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80' },
  ];

  const stats = [
    { value: '500+', label: 'Verified Halls', icon: '🏛️' },
    { value: '50K+', label: 'Happy Customers', icon: '😊' },
    { value: '25+', label: 'Cities Covered', icon: '📍' },
    { value: '4.8★', label: 'Average Rating', icon: '⭐' },
  ];

  const features = [
    { icon: '🔍', title: 'Smart Search & Filters', desc: 'Find halls by city, type, capacity, price, and 15+ amenities. Our smart filters get you to the perfect venue instantly.' },
    { icon: '⚖️', title: 'Side-by-Side Compare', desc: 'Compare up to 4 halls simultaneously. View all features, pricing, and ratings in one clear table.' },
    { icon: '🤖', title: 'AI-Powered Recommendations', desc: 'Our intelligent system analyzes your event requirements and suggests the best-matched venues with personalized scores.' },
    { icon: '📅', title: 'Real-Time Availability', desc: 'See live calendar availability. No more back-and-forth calls — check and book your date instantly.' },
    { icon: '💬', title: 'Direct Chat with Managers', desc: 'Message hall managers directly through our built-in chat. Ask questions and confirm details before booking.' },
    { icon: '⭐', title: 'Verified Reviews', desc: 'Read authentic reviews from real customers who booked and attended events. Make informed decisions.' },
  ];

  const eventTypes = [
    { type: 'wedding', icon: '💍', label: 'Weddings', image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400', count: '180+' },
    { type: 'corporate', icon: '💼', label: 'Corporate', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400', count: '95+' },
    { type: 'party', icon: '🎉', label: 'Parties', image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400', count: '120+' },
    { type: 'conference', icon: '🎤', label: 'Conferences', image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400', count: '60+' },
  ];

  return (
    <div className="home">
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg">
          <img src="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1600&q=80" alt="Hero" className="hero-bg-img" />
          <div className="hero-overlay" />
        </div>
        <div className="hero-content">
          <div className="hero-badge animate-fadeIn">✨ Pakistan's #1 Banquet Booking Platform</div>
          <h1 className="hero-title animate-fadeIn">
            Find Your Perfect<br />
            <span className="hero-title-accent">Event Venue</span>
          </h1>
          <p className="hero-subtitle animate-fadeIn">
            Discover and book premium banquet halls for weddings, corporate events, and celebrations.<br />
            500+ verified venues across Pakistan.
          </p>

          {/* Search Bar */}
          <form className="hero-search animate-fadeIn" onSubmit={handleSearch}>
            <div className="search-field">
              <label>📍 City</label>
              <select value={search.city} onChange={e => setSearch({ ...search, city: e.target.value })}>
                <option value="">Any City</option>
                <option value="Lahore">Lahore</option>
                <option value="Karachi">Karachi</option>
                <option value="Islamabad">Islamabad</option>
                <option value="Rawalpindi">Rawalpindi</option>
                <option value="Faisalabad">Faisalabad</option>
                <option value="Multan">Multan</option>
                <option value="Peshawar">Peshawar</option>
              </select>
            </div>
            <div className="search-divider" />
            <div className="search-field">
              <label>🎉 Event Type</label>
              <select value={search.event_type} onChange={e => setSearch({ ...search, event_type: e.target.value })}>
                <option value="">Any Event</option>
                <option value="wedding">Wedding</option>
                <option value="corporate">Corporate</option>
                <option value="party">Party</option>
                <option value="conference">Conference</option>
              </select>
            </div>
            <div className="search-divider" />
            <div className="search-field">
              <label>👥 Guests</label>
              <input
                type="number"
                placeholder="No. of guests"
                value={search.guest_count}
                onChange={e => setSearch({ ...search, guest_count: e.target.value })}
              />
            </div>
            <div className="search-divider" />
            <div className="search-field">
              <label>📅 Event Date</label>
              <input
                type="date"
                value={search.date}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setSearch({ ...search, date: e.target.value })}
              />
            </div>
            <button type="submit" className="search-btn">
              🔍 Search Halls
            </button>
          </form>

          <div className="hero-tags">
            {['Weddings', 'Corporate Events', 'Birthday Parties', 'Conferences', 'Engagement Ceremonies'].map(tag => (
              <span key={tag} className="hero-tag">{tag}</span>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats-bar">
        <div className="container">
          <div className="stats-grid">
            {stats.map((s, i) => (
              <div key={i} className="stat-item">
                <span className="stat-icon">{s.icon}</span>
                <div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BROWSE BY EVENT TYPE */}
      <section className="section event-types-section">
        <div className="container">
          <div className="section-header">
            <div className="section-label">EXPLORE BY OCCASION</div>
            <h2 className="section-title">Every Event, Perfectly Planned</h2>
            <p className="section-desc">From intimate gatherings to grand celebrations, find venues built for every occasion.</p>
          </div>
          <div className="event-types-grid">
            {eventTypes.map(et => (
              <div key={et.type} className="event-type-card" onClick={() => navigate(`/halls?hall_type=${et.type}`)}>
                <div className="event-type-image">
                  <img src={et.image} alt={et.label} />
                  <div className="event-type-overlay" />
                </div>
                <div className="event-type-body">
                  <span className="event-type-icon">{et.icon}</span>
                  <h3 className="event-type-name">{et.label}</h3>
                  <span className="event-type-count">{et.count} venues</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED HALLS */}
      <section className="section featured-section">
        <div className="container">
          <div className="section-header">
            <div className="section-label">TOP RATED VENUES</div>
            <h2 className="section-title">Featured Banquet Halls</h2>
            <p className="section-desc">Hand-picked halls with outstanding reviews and premium facilities.</p>
          </div>
          {loading ? (
            <div className="page-loader"><div className="spinner" /></div>
          ) : (
            <div className="halls-grid">
              {featuredHalls.map(hall => <HallCard key={hall.id} hall={hall} />)}
            </div>
          )}
          <div className="text-center mt-4">
            <button className="btn btn-dark btn-lg" onClick={() => navigate('/halls')}>
              Explore All Halls →
            </button>
          </div>
        </div>
      </section>

      {/* AI RECOMMENDATION BANNER */}
      <section className="ai-banner-section">
        <div className="container">
          <div className="ai-banner">
            <div className="ai-banner-content">
              <div className="ai-icon">🤖</div>
              <div>
                <h2 className="ai-banner-title">AI-Powered Hall Recommendations</h2>
                <p className="ai-banner-desc">Tell us about your event and our intelligent system will find the perfect match from hundreds of venues — scored and ranked just for you.</p>
                <button className="btn btn-primary btn-lg" onClick={() => navigate('/halls?ai=true')}>
                  Get AI Recommendations ✨
                </button>
              </div>
            </div>
            <div className="ai-banner-visual">
              <div className="ai-score-card">
                <div className="ai-score-title">AI Match Score</div>
                <div className="ai-score-bars">
                  {[{ label: 'Royal Grandeur Hall', score: 97 }, { label: 'Pearl Banquet', score: 92 }, { label: 'Seaside Events', score: 88 }].map(item => (
                    <div key={item.label} className="ai-score-row">
                      <span>{item.label}</span>
                      <div className="ai-score-bar"><div style={{ width: `${item.score}%` }} /><span>{item.score}%</span></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section features-section">
        <div className="container">
          <div className="section-header">
            <div className="section-label">WHY CHOOSE US</div>
            <h2 className="section-title">Everything You Need to Book Smart</h2>
          </div>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section how-section">
        <div className="container">
          <div className="section-header">
            <div className="section-label">HOW IT WORKS</div>
            <h2 className="section-title">Book Your Venue in 3 Simple Steps</h2>
          </div>
          <div className="steps-grid">
            {[
              { step: '01', icon: '🔍', title: 'Search & Discover', desc: 'Browse hundreds of verified venues using smart filters. Use AI recommendations for instant perfect matches.' },
              { step: '02', icon: '📋', title: 'Compare & Choose', desc: 'Compare up to 4 halls side-by-side. Read reviews, check availability, and chat with managers.' },
              { step: '03', icon: '🎉', title: 'Book & Celebrate', desc: 'Submit your booking request, get confirmation, and enjoy your perfect event!' },
            ].map((s, i) => (
              <div key={i} className="step-card">
                <div className="step-number">{s.step}</div>
                <div className="step-icon">{s.icon}</div>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">{s.desc}</p>
                {i < 2 && <div className="step-arrow">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section testimonials-section">
        <div className="container">
          <div className="section-header">
            <div className="section-label">CUSTOMER STORIES</div>
            <h2 className="section-title">Loved by Thousands</h2>
          </div>
          <div className="testimonials-slider">
            {testimonials.map((t, i) => (
              <div key={i} className={`testimonial-card ${i === activeTestimonial ? 'active' : ''}`}>
                <div className="testimonial-stars">{'★'.repeat(t.rating)}</div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <img src={t.image} alt={t.name} className="testimonial-avatar" />
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-event">{t.event} · {t.city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="testimonial-dots">
            {testimonials.map((_, i) => (
              <button key={i} className={`dot ${i === activeTestimonial ? 'active' : ''}`} onClick={() => setActiveTestimonial(i)} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Plan Your Perfect Event?</h2>
            <p className="cta-desc">Join 50,000+ satisfied customers who found their dream venue on BookMyBanquets.</p>
            <div className="cta-buttons">
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
                Start Booking Free →
              </button>
              <button className="btn btn-outline btn-lg" onClick={() => navigate('/halls')}>
                Browse Venues
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const placeholderHalls = [
  { id: '1', name: 'Royal Grandeur Hall', city: 'Lahore', address: 'Gulberg III, Main Boulevard', avg_rating: 4.8, total_reviews: 45, price_per_day: 150000, capacity_min: 100, capacity_max: 500, hall_type: 'wedding', is_ac: true, has_kitchen: true, has_stage: true, catering_available: true, outdoor_space: true, parking_capacity: 100, cover_image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800' },
  { id: '2', name: 'The Pearl Banquet', city: 'Lahore', address: 'DHA Phase 5', avg_rating: 4.6, total_reviews: 32, price_per_day: 200000, capacity_min: 200, capacity_max: 800, hall_type: 'all', is_ac: true, has_kitchen: true, has_stage: true, catering_available: true, outdoor_space: false, parking_capacity: 150, cover_image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800' },
  { id: '3', name: 'Seaside Events Center', city: 'Karachi', address: 'Clifton Block 5', avg_rating: 4.7, total_reviews: 58, price_per_day: 180000, capacity_min: 50, capacity_max: 1000, hall_type: 'all', is_ac: true, has_kitchen: true, has_stage: true, catering_available: true, outdoor_space: true, parking_capacity: 200, cover_image: 'https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=800' },
];

export default Home;
