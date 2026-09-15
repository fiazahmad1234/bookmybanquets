import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, unreadCount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'manager') return '/manager/dashboard';
    return '/customer/dashboard';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">🏛️</div>
          <div className="logo-text">
            <span className="logo-main">BookMyBanquets</span>
            <span className="logo-sub">Premium Event Venues</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="navbar-links">
          <Link to="/halls" className={`nav-link ${location.pathname.startsWith('/halls') ? 'active' : ''}`}>
            Browse Halls
          </Link>
          <Link to="/vendors" className={`nav-link ${location.pathname.startsWith('/vendors') ? 'active' : ''}`}>
            Vendors
          </Link>
          <Link to="/about" className="nav-link">About</Link>
        </div>

        {/* Right Section */}
        <div className="navbar-right">
          {user ? (
            <>
              <Link to="/notifications" className="notif-btn">
                <span>🔔</span>
                {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
              </Link>
              <div className="profile-menu">
                <button className="profile-btn" onClick={() => setProfileOpen(!profileOpen)}>
                  <div className="avatar-sm">
                    {user.avatar ? <img src={user.avatar} alt={user.name} /> : user.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="profile-name">{user.name?.split(' ')[0]}</span>
                  <span className={`chevron ${profileOpen ? 'open' : ''}`}>▾</span>
                </button>
                {profileOpen && (
                  <div className="profile-dropdown" onClick={() => setProfileOpen(false)}>
                    <div className="dropdown-header">
                      <div className="dropdown-avatar">
                        {user.avatar ? <img src={user.avatar} alt={user.name} /> : user.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="dropdown-name">{user.name}</div>
                        <div className="dropdown-role">{user.role}</div>
                      </div>
                    </div>
                    <div className="dropdown-divider" />
                    <Link to={getDashboardLink()} className="dropdown-item">📊 Dashboard</Link>
                    <Link to="/profile" className="dropdown-item">👤 My Profile</Link>
                    {user.role === 'customer' && (
                      <Link to="/customer/bookings" className="dropdown-item">📋 My Bookings</Link>
                    )}
                    {user.role === 'manager' && (
                      <Link to="/manager/halls" className="dropdown-item">🏛️ My Halls</Link>
                    )}
                    <div className="dropdown-divider" />
                    <button className="dropdown-item logout" onClick={handleLogout}>🚪 Log Out</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button className="mobile-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu" onClick={() => setMenuOpen(false)}>
          <Link to="/halls" className="mobile-link">Browse Halls</Link>
          <Link to="/vendors" className="mobile-link">Vendors</Link>
          <Link to="/about" className="mobile-link">About</Link>
          {user ? (
            <>
              <Link to={getDashboardLink()} className="mobile-link">Dashboard</Link>
              <button className="mobile-link logout" onClick={handleLogout}>Log Out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="mobile-link">Sign In</Link>
              <Link to="/register" className="mobile-link primary">Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
