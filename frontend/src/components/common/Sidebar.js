import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const customerLinks = [
  { to: '/customer/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/halls',              icon: '🔍', label: 'Find Halls' },
  { to: '/customer/bookings',  icon: '📋', label: 'My Bookings' },
  { to: '/customer/compare',   icon: '⚖️',  label: 'Compare Halls' },
  { to: '/vendors',            icon: '🛍️', label: 'Vendors' },
  { to: '/messages',           icon: '💬', label: 'Messages' },
  { to: '/notifications',      icon: '🔔', label: 'Notifications' },
  { to: '/profile',            icon: '👤', label: 'My Profile' },
];

const managerLinks = [
  { to: '/manager/dashboard',  icon: '📊', label: 'Dashboard' },
  { to: '/manager/halls',      icon: '🏛️', label: 'My Halls' },
  { to: '/manager/bookings',   icon: '📋', label: 'Bookings' },
  { to: '/manager/calendar',   icon: '📅', label: 'Calendar' },
  { to: '/manager/reviews',    icon: '⭐', label: 'Reviews' },
  { to: '/messages',           icon: '💬', label: 'Messages' },
  { to: '/manager/analytics',  icon: '📈', label: 'Analytics' },
  { to: '/notifications',      icon: '🔔', label: 'Notifications' },
  { to: '/profile',            icon: '👤', label: 'Profile' },
];

const adminLinks = [
  { to: '/admin/dashboard',  icon: '📊', label: 'Dashboard' },
  { to: '/admin/users',      icon: '👥', label: 'Users' },
  { to: '/admin/halls',      icon: '🏛️', label: 'Hall Approvals' },
  { to: '/admin/bookings',   icon: '📋', label: 'All Bookings' },
  { to: '/admin/vendors',    icon: '🛍️', label: 'Vendor Approvals' },
  { to: '/notifications',    icon: '🔔', label: 'Notifications' },
  { to: '/profile',          icon: '👤', label: 'Profile' },
];

const Sidebar = () => {
  const { user, logout, unreadCount } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const links =
    user?.role === 'admin'   ? adminLinks   :
    user?.role === 'manager' ? managerLinks :
    customerLinks;

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Link to="/" className="sidebar-logo-link">
          <span style={{ fontSize: 24 }}>🏛️</span>
          <div>
            <div className="sidebar-logo-name">BookMyBanquets</div>
            <div className="sidebar-logo-role">{user?.role?.toUpperCase()} PANEL</div>
          </div>
        </Link>
      </div>

      <div className="sidebar-user">
        <div className="sidebar-avatar">
          {user?.avatar
            ? <img src={user.avatar} alt={user.name} />
            : user?.name?.[0]?.toUpperCase()
          }
        </div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{user?.name}</div>
          <div className="sidebar-user-email">{user?.email}</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`sidebar-link ${location.pathname === link.to ? 'active' : ''}`}
          >
            <span className="sidebar-link-icon">{link.icon}</span>
            <span className="sidebar-link-label">{link.label}</span>
            {link.label === 'Notifications' && unreadCount > 0 && (
              <span className="sidebar-badge">{unreadCount}</span>
            )}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <Link to="/" className="sidebar-link">
          <span className="sidebar-link-icon">🏠</span>
          <span className="sidebar-link-label">Go to Website</span>
        </Link>
        <button className="sidebar-link logout" onClick={handleLogout}>
          <span className="sidebar-link-icon">🚪</span>
          <span className="sidebar-link-label">Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
