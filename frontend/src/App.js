import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public pages
import Home           from './pages/Home';
import Halls          from './pages/Halls';
import HallDetail     from './pages/HallDetail';
import HallCompare    from './pages/HallCompare';
import Vendors        from './pages/Vendors';
import About          from './pages/About';
import Profile        from './pages/Profile';
import { Login, Register } from './pages/Auth';
import Notifications  from './pages/Notifications';
import Messages       from './pages/Messages';

// Customer
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerBookings  from './pages/customer/CustomerBookings';

// Manager
import ManagerDashboard  from './pages/manager/ManagerDashboard';
import ManagerHalls      from './pages/manager/ManagerHalls';
import ManagerBookings   from './pages/manager/ManagerBookings';
import ManagerReviews    from './pages/manager/ManagerReviews';
import ManagerAnalytics  from './pages/manager/ManagerAnalytics';
import ManagerCalendar   from './pages/manager/ManagerCalendar';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers     from './pages/admin/AdminUsers';
import AdminHalls     from './pages/admin/AdminHalls';
import AdminBookings  from './pages/admin/AdminBookings';
import AdminVendors   from './pages/admin/AdminVendors';

// Layout
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

import './styles/global.css';

// ── Protected Route ──────────────────────────────────────────
const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    if (user.role === 'admin')    return <Navigate to="/admin/dashboard"    replace />;
    if (user.role === 'manager')  return <Navigate to="/manager/dashboard"  replace />;
    return <Navigate to="/customer/dashboard" replace />;
  }
  return children;
};

// ── Public wrapper (navbar + footer) ─────────────────────────
const Public = ({ children, noFooter }) => (
  <div>
    <Navbar />
    {children}
    {!noFooter && <Footer />}
  </div>
);

// ── 404 ──────────────────────────────────────────────────────
const NotFound = () => (
  <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--cream)', textAlign:'center', padding:24 }}>
    <div>
      <div style={{ fontSize:80, marginBottom:16 }}>🏛️</div>
      <h1 style={{ fontFamily:'var(--font-display)', fontSize:56, color:'var(--text-primary)', marginBottom:12 }}>404</h1>
      <p style={{ color:'var(--text-muted)', fontSize:18, marginBottom:32 }}>Oops! This page does not exist.</p>
      <a href="/" className="btn btn-primary btn-lg">Go to Home</a>
    </div>
  </div>
);

// ── App Routes ───────────────────────────────────────────────
const AppRoutes = () => {
  const { user } = useAuth();

  const dashHome = () => {
    if (!user) return '/login';
    if (user.role === 'admin')   return '/admin/dashboard';
    if (user.role === 'manager') return '/manager/dashboard';
    return '/customer/dashboard';
  };

  return (
    <Routes>
      {/* Public */}
      <Route path="/"           element={<Public><Home /></Public>} />
      <Route path="/halls"      element={<Public noFooter><Halls /></Public>} />
      <Route path="/halls/compare" element={<Public><HallCompare /></Public>} />
      <Route path="/halls/:id"  element={<Public><HallDetail /></Public>} />
      <Route path="/vendors"    element={<Vendors />} />
      <Route path="/about"      element={<Public><About /></Public>} />

      {/* Auth */}
      <Route path="/login"    element={user ? <Navigate to={dashHome()} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={dashHome()} /> : <Register />} />

      {/* Shared (any logged-in user) */}
      <Route path="/profile"        element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/notifications"  element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/messages"       element={<ProtectedRoute><Messages /></ProtectedRoute>} />
      <Route path="/customer/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
      <Route path="/manager/messages"  element={<ProtectedRoute><Messages /></ProtectedRoute>} />

      {/* Customer */}
      <Route path="/customer/dashboard" element={<ProtectedRoute roles={['customer']}><CustomerDashboard /></ProtectedRoute>} />
      <Route path="/customer/bookings"  element={<ProtectedRoute roles={['customer']}><CustomerBookings /></ProtectedRoute>} />
      <Route path="/customer/compare"   element={<ProtectedRoute roles={['customer']}><HallCompare /></ProtectedRoute>} />

      {/* Manager */}
      <Route path="/manager/dashboard"  element={<ProtectedRoute roles={['manager']}><ManagerDashboard /></ProtectedRoute>} />
      <Route path="/manager/halls"      element={<ProtectedRoute roles={['manager']}><ManagerHalls /></ProtectedRoute>} />
      <Route path="/manager/halls/new"  element={<ProtectedRoute roles={['manager']}><ManagerHalls /></ProtectedRoute>} />
      <Route path="/manager/bookings"   element={<ProtectedRoute roles={['manager']}><ManagerBookings /></ProtectedRoute>} />
      <Route path="/manager/reviews"    element={<ProtectedRoute roles={['manager']}><ManagerReviews /></ProtectedRoute>} />
      <Route path="/manager/analytics"  element={<ProtectedRoute roles={['manager']}><ManagerAnalytics /></ProtectedRoute>} />
      <Route path="/manager/calendar"   element={<ProtectedRoute roles={['manager']}><ManagerCalendar /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin/dashboard"  element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users"      element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/halls"      element={<ProtectedRoute roles={['admin']}><AdminHalls /></ProtectedRoute>} />
      <Route path="/admin/bookings"   element={<ProtectedRoute roles={['admin']}><AdminBookings /></ProtectedRoute>} />
      <Route path="/admin/vendors"    element={<ProtectedRoute roles={['admin']}><AdminVendors /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              borderRadius: 12,
              background: '#1A0F08',
              color: 'white',
            },
            success: { iconTheme: { primary: '#C4823A', secondary: 'white' } },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;