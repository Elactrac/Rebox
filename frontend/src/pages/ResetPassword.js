import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Lock, ArrowLeft, Eye, EyeOff, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await authAPI.resetPassword(token, password);
      setSuccess(true);
      toast.success('Password reset successful!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <h1>Invalid Reset Link</h1>
            <p className="auth-description">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link to="/forgot-password" className="btn btn-primary btn-block">
              Request New Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="success-icon">
              <CheckCircle size={48} />
            </div>
            <h1>Password Reset!</h1>
            <p className="auth-description">
              Your password has been successfully reset. You can now log in with your new password.
            </p>
            <button onClick={() => navigate('/login')} className="btn btn-primary btn-block">
              Go to Login
            </button>
          </div>
        </div>
        <style>{`
          .success-icon {
            display: flex;
            justify-content: center;
            margin-bottom: 1.5rem;
            color: var(--primary);
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
          
          <h1>Reset Password</h1>
          <p className="auth-description">
            Enter your new password below.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div className="input-icon">
                <Lock size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <div className="input-icon">
                <Lock size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
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
          padding-right: 2.75rem;
        }

        .password-toggle {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--gray-400);
          cursor: pointer;
        }

        .password-toggle:hover {
          color: var(--gray-600);
        }

        .btn-block {
          width: 100%;
          margin-top: 1rem;
        }
      `}</style>
    </div>
  );
};

export default ResetPassword;
