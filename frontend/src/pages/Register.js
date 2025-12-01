import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Mail, Lock, User, Phone, Building, ArrowRight } from 'lucide-react';
import GoogleSignInButton from '../components/common/GoogleSignInButton';
import ReCaptcha from '../components/common/ReCaptcha';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'INDIVIDUAL',
    companyName: ''
  });
  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    // Check reCAPTCHA if site key is configured
    if (process.env.REACT_APP_RECAPTCHA_SITE_KEY && 
        process.env.REACT_APP_RECAPTCHA_SITE_KEY !== 'your-recaptcha-site-key' && 
        !recaptchaToken) {
      toast.error('Please complete the reCAPTCHA');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...data } = formData;
      await register({ ...data, recaptchaToken });
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      // Reset reCAPTCHA on error
      setRecaptchaToken(null);
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
  };

  const handleRecaptchaExpired = () => {
    setRecaptchaToken(null);
    toast.error('reCAPTCHA expired. Please verify again.');
  };

  const handleRecaptchaError = () => {
    setRecaptchaToken(null);
    toast.error('reCAPTCHA error. Please try again.');
  };

  const handleOAuthError = (error) => {
    toast.error(error || 'OAuth sign-up failed');
  };

  return (
    <div className="auth-page">
      <div className="auth-container register-container">
        <div className="auth-header">
          <Link to="/" className="logo">
            <Leaf className="logo-icon" />
            <span>ReBox</span>
          </Link>
          <h1>Create your account</h1>
          <p>Start your recycling journey today</p>
        </div>

        {/* OAuth Buttons */}
        <div className="oauth-section">
          <GoogleSignInButton 
            text="Sign up with Google"
            onError={handleOAuthError}
            disabled={loading}
            role={formData.role}
          />
        </div>

        <div className="divider">
          <span>or register with email</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">I am a</label>
            <div className="role-selector">
              {['INDIVIDUAL', 'BUSINESS', 'RECYCLER'].map((role) => (
                <button
                  key={role}
                  type="button"
                  className={`role-btn ${formData.role === role ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, role })}
                >
                  {role === 'INDIVIDUAL' && 'Individual'}
                  {role === 'BUSINESS' && 'Business'}
                  {role === 'RECYCLER' && 'Recycler'}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {(formData.role === 'BUSINESS' || formData.role === 'RECYCLER') && (
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <div className="input-with-icon">
                <Building size={18} className="input-icon" />
                <input
                  type="text"
                  name="companyName"
                  className="form-input"
                  placeholder="Enter company name"
                  value={formData.companyName}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Phone (optional)</label>
            <div className="input-with-icon">
              <Phone size={18} className="input-icon" />
              <input
                type="tel"
                name="phone"
                className="form-input"
                placeholder="Enter your phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="Create password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-input"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <ReCaptcha
            onChange={handleRecaptchaChange}
            onExpired={handleRecaptchaExpired}
            onError={handleRecaptchaError}
          />

          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--gray-50), var(--gray-100));
          padding: 2rem;
        }

        .auth-container {
          width: 100%;
          max-width: 420px;
          background: white;
          border-radius: 1rem;
          padding: 2.5rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }

        .register-container {
          max-width: 500px;
        }

        .auth-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .auth-header .logo {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: 1.5rem;
        }

        .auth-header .logo-icon {
          color: var(--primary);
        }

        .auth-header h1 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: 0.5rem;
        }

        .auth-header p {
          color: var(--gray-500);
        }

        .oauth-section {
          margin-bottom: 1.5rem;
        }

        .divider {
          display: flex;
          align-items: center;
          margin-bottom: 1.5rem;
          color: var(--gray-400);
          font-size: 0.875rem;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--gray-200);
        }

        .divider span {
          padding: 0 1rem;
        }

        .role-selector {
          display: flex;
          gap: 0.5rem;
        }

        .role-btn {
          flex: 1;
          padding: 0.625rem 1rem;
          border: 1px solid var(--gray-300);
          background: white;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--gray-600);
          cursor: pointer;
          transition: all 0.2s;
        }

        .role-btn:hover {
          border-color: var(--primary);
          color: var(--primary);
        }

        .role-btn.active {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .auth-form {
          margin-bottom: 1.5rem;
        }

        .input-with-icon {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 0.875rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--gray-400);
        }

        .input-with-icon .form-input {
          padding-left: 2.75rem;
        }

        .w-full {
          width: 100%;
        }

        .auth-footer {
          text-align: center;
          color: var(--gray-500);
          font-size: 0.875rem;
        }

        .auth-footer a {
          color: var(--primary);
          font-weight: 500;
        }

        @media (max-width: 480px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Register;
