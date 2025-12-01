import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { CheckCircle, XCircle, Loader, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. No token provided.');
        return;
      }

      try {
        await authAPI.verifyEmail(token);
        setStatus('success');
        setMessage('Your email has been verified successfully!');
        toast.success('Email verified!');
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed. The link may be invalid or expired.');
      }
    };

    verifyEmail();
  }, [token]);

  const handleResendVerification = async () => {
    const authToken = localStorage.getItem('token');
    if (!authToken) {
      toast.error('Please login first to resend verification email');
      navigate('/login');
      return;
    }

    setResending(true);
    try {
      const response = await authAPI.resendVerification();
      toast.success(response.data.message || 'Verification email sent! Please check your inbox.');
      setMessage('A new verification email has been sent to your email address.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="verify-page">
      <div className="verify-container">
        <div className="verify-card">
          {status === 'verifying' && (
            <>
              <div className="status-icon verifying">
                <Loader size={48} className="spin" />
              </div>
              <h1>Verifying Your Email</h1>
              <p>Please wait while we verify your email address...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="status-icon success">
                <CheckCircle size={48} />
              </div>
              <h1>Email Verified!</h1>
              <p>{message}</p>
              <button onClick={() => navigate('/dashboard')} className="btn btn-primary btn-block">
                Go to Dashboard
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="status-icon error">
                <XCircle size={48} />
              </div>
              <h1>Verification Failed</h1>
              <p>{message}</p>
              <div className="action-buttons">
                <button 
                  onClick={handleResendVerification} 
                  className="btn btn-primary"
                  disabled={resending}
                >
                  {resending ? (
                    <>
                      <Loader size={16} className="spin" style={{ marginRight: '0.5rem' }} />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail size={16} style={{ marginRight: '0.5rem' }} />
                      Resend Verification
                    </>
                  )}
                </button>
                <Link to="/login" className="btn btn-secondary">
                  Go to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .verify-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--gray-50);
          padding: 2rem;
        }

        .verify-container {
          width: 100%;
          max-width: 400px;
        }

        .verify-card {
          background: white;
          border-radius: 1rem;
          padding: 2.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          text-align: center;
        }

        .status-icon {
          display: flex;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .status-icon.verifying {
          color: var(--primary);
        }

        .status-icon.success {
          color: var(--primary);
        }

        .status-icon.error {
          color: var(--danger);
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .verify-card h1 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
          color: var(--gray-900);
        }

        .verify-card p {
          color: var(--gray-600);
          margin-bottom: 1.5rem;
          line-height: 1.5;
        }

        .btn-block {
          width: 100%;
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
        }

        .action-buttons .btn {
          flex: 1;
        }
      `}</style>
    </div>
  );
};

export default VerifyEmail;
