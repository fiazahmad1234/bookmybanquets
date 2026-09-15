import React from 'react';
import { Link } from 'react-router-dom';
import './About.css';

const STATS = [
  { value: '500+', label: 'Premium Venues' },
  { value: '50+', label: 'Trusted Vendors' },
  { value: '10,000+', label: 'Events Hosted' },
  { value: '8', label: 'Cities Covered' },
];

const VALUES = [
  { icon: '🏛️', title: 'Curated Venues', desc: 'Every hall on BookMyBanquets is verified for quality, capacity, and amenities before it goes live.' },
  { icon: '🤝', title: 'Trusted Vendors', desc: 'From catering to photography, we only list vendors with a track record of reliable service.' },
  { icon: '🤖', title: 'Smart Recommendations', desc: 'Our AI matches you with venues and vendors based on your event type, budget, and guest count.' },
  { icon: '💬', title: 'Direct Communication', desc: 'Message hall managers and vendors directly — no middlemen, no hidden fees.' },
];

const About = () => (
  <div className="about-page">
    {/* Hero */}
    <div className="about-hero">
      <div className="container">
        <div className="about-badge">🏛️ About Us</div>
        <h1 className="about-title">Making Event Planning Effortless</h1>
        <p className="about-subtitle">
          BookMyBanquets is Pakistan's premium platform for discovering and booking banquet halls
          and event vendors — all in one place.
        </p>
      </div>
    </div>

    <div className="container">
      {/* Stats */}
      <div className="about-stats">
        {STATS.map((s, i) => (
          <div key={i} className="about-stat">
            <div className="about-stat-value">{s.value}</div>
            <div className="about-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Story */}
      <div className="about-story">
        <h2>Our Story</h2>
        <p>
          Planning a wedding, corporate event, or celebration in Pakistan often means endless phone
          calls, in-person visits, and uncertainty about pricing. We built BookMyBanquets to change
          that — bringing banquet halls, caterers, decorators, photographers, and more onto a single,
          transparent platform.
        </p>
        <p>
          Whether you're comparing venues side by side, getting AI-powered recommendations, or
          messaging a hall manager directly, our goal is the same: give you the confidence to plan
          your event without the back-and-forth.
        </p>
      </div>

      {/* Values */}
      <div className="about-values">
        <h2 className="about-section-title">Why Choose Us</h2>
        <div className="about-values-grid">
          {VALUES.map((v, i) => (
            <div key={i} className="about-value-card">
              <div className="about-value-icon">{v.icon}</div>
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="about-cta">
        <h2>Ready to plan your next event?</h2>
        <p>Browse premium banquet halls and trusted vendors across Pakistan.</p>
        <div className="about-cta-actions">
          <Link to="/halls" className="btn btn-primary btn-lg">Browse Halls</Link>
          <Link to="/vendors" className="btn btn-outline btn-lg">Explore Vendors</Link>
        </div>
      </div>
    </div>
  </div>
);

export default About;