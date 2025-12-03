import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Mail, Lock, ArrowRight } from 'lucide-react';
import GoogleSignInButton from '../components/common/GoogleSignInButton';
import ReCaptcha from '../components/common/ReCaptcha';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check reCAPTCHA only if site key is properly configured
    const siteKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY;
    const isRecaptchaConfigured = siteKey && 
                                   siteKey !== 'your-recaptcha-site-key' && 
                                   siteKey !== '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // Google test key
    
    if (isRecaptchaConfigured && !recaptchaToken) {
      toast.error('Please complete the reCAPTCHA');
      return;
    }

    setLoading(true);

    try {
      await login(email, password, recaptchaToken);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      // Reset reCAPTCHA on error
      setRecaptchaToken(null);
      toast.error(error.response?.data?.message || 'Login failed');
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
    toast.error(error || 'OAuth sign-in failed');
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Link to="/" className="logo">
            <Leaf className="logo-icon" />
            <span>ReBox</span>
          </Link>
          <h1>Welcome back</h1>
          <p>Sign in to your account to continue</p>
        </div>

        {/* OAuth Buttons */}
        <div className="oauth-section">
          <GoogleSignInButton 
            text="Sign in with Google"
            onError={handleOAuthError}
            disabled={loading}
          />
        </div>

        <div className="divider">
          <span>or continue with email</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                className="form-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="label-row">
              <label className="form-label">Password</label>
              <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
            </div>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <ReCaptcha
            onChange={handleRecaptchaChange}
            onExpired={handleRecaptchaExpired}
            onError={handleRecaptchaError}
          />

          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Sign up</Link>
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

        .label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .forgot-link {
          font-size: 0.875rem;
          color: var(--primary);
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
      `}</style>
    </div>
  );
};

export default Login;
