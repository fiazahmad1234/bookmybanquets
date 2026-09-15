import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(form.email, form.password);

      toast.success(`Welcome back, ${user.name}! 🎉`);

      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'manager') navigate('/manager/dashboard');
      else navigate('/customer/dashboard');

    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }

    setLoading(false);
  };

  const fillDemo = (role) => {
    if (role === 'admin') {
      setForm({
        email: 'admin@bookmybanquets.com',
        password: 'Admin@123'
      });
    } else if (role === 'manager') {
      setForm({
        email: 'ahmed@manager.com',
        password: 'Manager@123'
      });
    } else {
      setForm({
        email: 'ali@customer.com',
        password: 'Customer@123'
      });
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-split">

        <div className="auth-left">
          <div className="auth-left-content">

            <Link to="/" className="auth-logo">
              🏛️ BookMyBanquets
            </Link>

            <h2 className="auth-left-title">
              Welcome Back
            </h2>

            <p className="auth-left-desc">
              Sign in to manage your bookings, discover new venues,
              and plan your perfect event.
            </p>

            <div className="auth-features">
              {[
                '500+ Verified Banquet Halls',
                'AI-Powered Recommendations',
                'Instant Availability Check',
                'Real-time Chat Support'
              ].map(f => (
                <div key={f} className="auth-feature">
                  <span>✓</span>
                  {f}
                </div>
              ))}
            </div>

            <div className="auth-bg-image">
              <img
                src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80"
                alt="venue"
              />
            </div>

          </div>
        </div>

        <div className="auth-right">
          <div className="auth-form-wrap">

            <h1 className="auth-title">
              Sign In
            </h1>

            <p className="auth-subtitle">
              Don't have an account?{' '}
              <Link to="/register">
                Create one free →
              </Link>
            </p>

            {/* Demo buttons */}
            <div className="demo-btns">
              <span className="demo-label">
                Quick Demo:
              </span>

              <button
                type="button"
                className="demo-btn"
                onClick={() => fillDemo('customer')}
              >
                Customer
              </button>

              <button
                type="button"
                className="demo-btn"
                onClick={() => fillDemo('manager')}
              >
                Manager
              </button>

              <button
                type="button"
                className="demo-btn"
                onClick={() => fillDemo('admin')}
              >
                Admin
              </button>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">

              <div className="form-group">
                <label className="form-label">
                  Email Address
                </label>

                <input
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  required
                  value={form.email}
                  onChange={e =>
                    setForm({
                      ...form,
                      email: e.target.value
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Password
                </label>

                <div className="pass-wrap">

                  <input
                    type={showPass ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Your password"
                    required
                    value={form.password}
                    onChange={e =>
                      setForm({
                        ...form,
                        password: e.target.value
                      })
                    }
                  />

                  <button
                    type="button"
                    className="pass-toggle"
                    onClick={() => setShowPass(!showPass)}
                  >
                    {showPass ? '🙈' : '👁️'}
                  </button>

                </div>
              </div>

              <div className="auth-forgot">
                <Link to="/forgot-password">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                disabled={loading}
              >
                {loading
                  ? '⏳ Signing In...'
                  : '→ Sign In'}
              </button>

            </form>

          </div>
        </div>

      </div>
    </div>
  );
};


export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    role: 'customer'
  });

  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [step, setStep] = useState(1);


  // ==============================
  // FORM VALIDATION
  // ==============================

  const validateForm = () => {

    // NAME VALIDATION
    const nameRegex = /^[A-Za-z\s]+$/;

    if (!form.name.trim()) {
      toast.error('Please enter your full name');
      return false;
    }

    if (!nameRegex.test(form.name.trim())) {
      toast.error('Name must contain letters only. Numbers are not allowed.');
      return false;
    }

    if (form.name.trim().length < 2) {
      toast.error('Name must be at least 2 characters');
      return false;
    }


    // EMAIL VALIDATION
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(form.email.trim())) {
      toast.error('Please enter a valid email address');
      return false;
    }


    // PHONE VALIDATION
    if (form.phone.trim()) {

      const phoneValue = form.phone.trim();

      // Allow + at beginning, then numbers, spaces and hyphens
      const phoneRegex =
        /^\+?[0-9][0-9\s-]{9,11}$/;

      if (!phoneRegex.test(phoneValue)) {
        toast.error(
          'Phone number must contain only numbers and be 9-11 digits.'
        );
        return false;
      }

      // Get digits only
      const phoneDigits =
        phoneValue.replace(/\D/g, '');

      if (phoneDigits.length < 11 || phoneDigits.length > 11) {
        toast.error(
          'Phone number must be 11 digits.'
        );
        return false;
      }
    }


    // PASSWORD VALIDATION
    if (form.password.length < 6) {
      toast.error(
        'Password must be at least 6 characters.'
      );
      return false;
    }

    // Capital letter required
    if (!/[A-Z]/.test(form.password)) {
      toast.error(
        'Password must contain at least one capital letter.'
      );
      return false;
    }

    // Number required
    if (!/[0-9]/.test(form.password)) {
      toast.error(
        'Password must contain at least one number.'
      );
      return false;
    }

    return true;
  };


  // ==============================
  // SUBMIT
  // ==============================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {

      const user = await register(form);

      toast.success(
        `Welcome to BookMyBanquets, ${user.name}! 🎉`
      );

      if (user.role === 'manager') {
        navigate('/manager/dashboard');
      } else {
        navigate('/customer/dashboard');
      }

    } catch (err) {

      toast.error(
        err.response?.data?.message ||
        'Registration failed'
      );

    }

    setLoading(false);
  };


  return (
    <div className="auth-page">

      <div className="auth-split">

        <div className="auth-left">
          <div className="auth-left-content">

            <Link to="/" className="auth-logo">
              🏛️ BookMyBanquets
            </Link>

            <h2 className="auth-left-title">
              Join Pakistan's #1 Event Platform
            </h2>

            <p className="auth-left-desc">
              Create your free account and start discovering
              premium venues today.
            </p>

            <div className="auth-features">

              {[
                'Free Account Forever',
                'Book with Confidence',
                'Verified & Trusted Venues',
                'AI-Powered Matching'
              ].map(f => (

                <div
                  key={f}
                  className="auth-feature"
                >
                  <span>✓</span>
                  {f}
                </div>

              ))}

            </div>


            <div className="register-role-preview">

              <div
                className={`role-preview ${
                  form.role === 'customer'
                    ? 'active'
                    : ''
                }`}
              >
                <span>👤</span>

                <div>
                  <strong>Customer</strong>
                  <p>Book halls for events</p>
                </div>

              </div>


              <div
                className={`role-preview ${
                  form.role === 'manager'
                    ? 'active'
                    : ''
                }`}
              >
                <span>🏛️</span>

                <div>
                  <strong>Hall Manager</strong>
                  <p>List & manage your hall</p>
                </div>

              </div>

            </div>

          </div>
        </div>


        <div className="auth-right">

          <div className="auth-form-wrap">

            <h1 className="auth-title">
              Create Account
            </h1>

            <p className="auth-subtitle">
              Already registered?{' '}
              <Link to="/login">
                Sign in →
              </Link>
            </p>


            <form
              onSubmit={handleSubmit}
              className="auth-form"
            >

              {/* ROLE SELECTOR */}

              <div className="role-selector">

                {[
                  {
                    val: 'customer',
                    icon: '👤',
                    label: 'I want to book halls'
                  },
                  {
                    val: 'manager',
                    icon: '🏛️',
                    label: 'I want to list my hall'
                  }
                ].map(r => (

                  <label
                    key={r.val}
                    className={`role-option ${
                      form.role === r.val
                        ? 'active'
                        : ''
                    }`}
                  >

                    <input
                      type="radio"
                      name="role"
                      value={r.val}
                      checked={
                        form.role === r.val
                      }
                      onChange={() =>
                        setForm({
                          ...form,
                          role: r.val
                        })
                      }
                    />

                    <span>
                      {r.icon}
                    </span>

                    <span>
                      {r.label}
                    </span>

                  </label>

                ))}

              </div>


              {/* NAME + PHONE */}

              <div className="form-row-2">

                <div className="form-group">

                  <label className="form-label">
                    Full Name *
                  </label>

                  <input
                    type="text"
                    className="form-input"
                    placeholder="Muhammad Ali"
                    required
                    value={form.name}

                    onChange={e => {

                      const value =
                        e.target.value;

                      // Only letters and spaces
                      if (
                        /^[A-Za-z\s]*$/.test(value)
                      ) {
                        setForm({
                          ...form,
                          name: value
                        });
                      }

                    }}

                  />

                </div>


                <div className="form-group">

                  <label className="form-label">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+92-3000000000"
                    value={form.phone}

                    onChange={e => {

                      let value =
                        e.target.value;

                      // Allow + only at beginning
                      // Allow numbers, spaces and -
                      value = value.replace(
                        /[^0-9+\-\s]/g,
                        ''
                      );

                      if (
                        value.indexOf('+') > 0
                      ) {
                        value =
                          value.replace(/\+/g, '');
                      }

                      setForm({
                        ...form,
                        phone: value
                      });

                    }}

                  />

                </div>

              </div>


              {/* EMAIL */}

              <div className="form-group">

                <label className="form-label">
                  Email Address *
                </label>

                <input
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  required
                  value={form.email}

                  onChange={e =>
                    setForm({
                      ...form,
                      email: e.target.value
                    })
                  }

                />

              </div>


              {/* CITY */}

              <div className="form-group">

                <label className="form-label">
                  City
                </label>

                <select
                  className="form-input"
                  value={form.city}

                  onChange={e =>
                    setForm({
                      ...form,
                      city: e.target.value
                    })
                  }
                >

                  <option value="">
                    Select your city
                  </option>

                  {[
                    'Lahore',
                    'Karachi',
                    'Islamabad',
                    'Rawalpindi',
                    'Faisalabad',
                    'Multan',
                    'Peshawar',
                    'Quetta'
                  ].map(c => (

                    <option
                      key={c}
                      value={c}
                    >
                      {c}
                    </option>

                  ))}

                </select>

              </div>


              {/* PASSWORD */}

              <div className="form-group">

                <label className="form-label">
                  Password *
                </label>

                <div className="pass-wrap">

                  <input
                    type={
                      showPass
                        ? 'text'
                        : 'password'
                    }
                    className="form-input"
                    placeholder="Min 6 characters"
                    required
                    value={form.password}

                    onChange={e =>
                      setForm({
                        ...form,
                        password:
                          e.target.value
                      })
                    }

                  />

                  <button
                    type="button"
                    className="pass-toggle"
                    onClick={() =>
                      setShowPass(!showPass)
                    }
                  >
                    {showPass
                      ? '🙈'
                      : '👁️'}
                  </button>

                </div>


                {/* PASSWORD STRENGTH */}

                <div className="pass-strength">

                  {[1, 2, 3, 4].map(i => (

                    <div
                      key={i}
                      className={`strength-bar ${
                        form.password.length >=
                        i * 3
                          ? 'filled'
                          : ''
                      }`}
                    />

                  ))}

                  <span>

                    {form.password.length < 6
                      ? 'Weak'
                      : !/[A-Z]/.test(
                          form.password
                        )
                      ? 'Add Capital'
                      : !/[0-9]/.test(
                          form.password
                        )
                      ? 'Add Number'
                      : form.password.length < 10
                      ? 'Fair'
                      : 'Strong'}

                  </span>

                </div>


                {/* PASSWORD REQUIREMENTS */}

                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--text-muted)',
                    marginTop: 8
                  }}
                >
                  Password must contain:
                  <div>
                    {form.password.length >= 6
                      ? '✅'
                      : '❌'}{' '}
                    At least 6 characters
                  </div>

                  <div>
                    {/[A-Z]/.test(form.password)
                      ? '✅'
                      : '❌'}{' '}
                    At least 1 capital letter
                  </div>

                  <div>
                    {/[0-9]/.test(form.password)
                      ? '✅'
                      : '❌'}{' '}
                    At least 1 number
                  </div>
                </div>

              </div>


              {/* SUBMIT BUTTON */}

              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                disabled={loading}
              >

                {loading
                  ? '⏳ Creating Account...'
                  : `🎉 Create ${
                      form.role === 'manager'
                        ? 'Manager'
                        : 'Customer'
                    } Account`}

              </button>


              {/* TERMS */}

              <p className="auth-terms">

                By creating an account, you agree to our{' '}

                <Link to="/terms">
                  Terms of Service
                </Link>{' '}

                and{' '}

                <Link to="/privacy">
                  Privacy Policy
                </Link>

              </p>

            </form>

          </div>

        </div>

      </div>

    </div>
  );
};
