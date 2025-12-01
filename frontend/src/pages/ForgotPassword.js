import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authAPI.forgotPassword(email);
      setSent(true);
      toast.success('Check your email for reset instructions');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="success-icon">
              <CheckCircle size={48} />
            </div>
            <h1>Check Your Email</h1>
            <p className="auth-description">
              If an account exists for <strong>{email}</strong>, you'll receive a password reset link shortly.
            </p>
            <p className="auth-note">
              The link will expire in 1 hour. Check your spam folder if you don't see the email.
            </p>
            <Link to="/login" className="btn btn-primary btn-block">
              Return to Login
            </Link>
          </div>
        </div>
        <style>{`
          .success-icon {
            display: flex;
            justify-content: center;
            margin-bottom: 1.5rem;
            color: var(--primary);
          }
          .auth-note {
            font-size: 0.875rem;
            color: var(--gray-500);
            margin-bottom: 1.5rem;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <Link to="/login" className="back-link">
            <ArrowLeft size={18} /> Back to Login
          </Link>
          
          <h1>Forgot Password?</h1>
          <p className="auth-description">
            Enter your email address and we'll send you instructions to reset your password.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-icon">
                <Mail size={18} />
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--gray-50);
          padding: 2rem;
        }

        .auth-container {
          width: 100%;
          max-width: 400px;
        }

        .auth-card {
          background: white;
          border-radius: 1rem;
          padding: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--gray-600);
          text-decoration: none;
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
        }

        .back-link:hover {
          color: var(--primary);
        }

        .auth-card h1 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: var(--gray-900);
        }

        .auth-description {
          color: var(--gray-600);
          margin-bottom: 1.5rem;
          line-height: 1.5;
        }

        .input-icon {
          position: relative;
        }

        .input-icon svg {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--gray-400);
        }

        .input-icon input {
          padding-left: 2.75rem;
        }

        .btn-block {
          width: 100%;
          margin-top: 1rem;
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;
