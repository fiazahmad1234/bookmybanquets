import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="footer-main">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <span className="footer-logo-icon">🏛️</span>
              <div>
                <div className="footer-logo-name">BookMyBanquets</div>
                <div className="footer-logo-tagline">Premium Event Venues</div>
              </div>
            </Link>
            <p className="footer-desc">
              Pakistan's most trusted platform for discovering and booking premium banquet halls for weddings, corporate events, and all celebrations.
            </p>
            <div className="footer-social">
              <a href="#" className="social-btn">📘</a>
              <a href="#" className="social-btn">📸</a>
              <a href="#" className="social-btn">🐦</a>
              <a href="#" className="social-btn">▶️</a>
            </div>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">Quick Links</h4>
            <Link to="/halls" className="footer-link">Browse Halls</Link>
            <Link to="/vendors" className="footer-link">Vendor Marketplace</Link>
            <Link to="/halls?hall_type=wedding" className="footer-link">Wedding Venues</Link>
            <Link to="/halls?hall_type=corporate" className="footer-link">Corporate Events</Link>
            <Link to="/halls?hall_type=party" className="footer-link">Party Halls</Link>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">For Business</h4>
            <Link to="/register?role=manager" className="footer-link">List Your Hall</Link>
            <Link to="/register?role=vendor" className="footer-link">Become a Vendor</Link>
            <Link to="/manager/dashboard" className="footer-link">Manager Dashboard</Link>
            <Link to="/about" className="footer-link">About Us</Link>
            <Link to="/contact" className="footer-link">Contact Support</Link>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">Top Cities</h4>
            <Link to="/halls?city=Lahore" className="footer-link">Lahore</Link>
            <Link to="/halls?city=Karachi" className="footer-link">Karachi</Link>
            <Link to="/halls?city=Islamabad" className="footer-link">Islamabad</Link>
            <Link to="/halls?city=Rawalpindi" className="footer-link">Rawalpindi</Link>
            <Link to="/halls?city=Faisalabad" className="footer-link">Faisalabad</Link>
          </div>
        </div>
      </div>
    </div>

    <div className="footer-bottom">
      <div className="container">
        <div className="footer-bottom-inner">
          <p>© 2025 BookMyBanquets. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/sitemap">Sitemap</Link>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
