import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI, authAPI, oauthAPI } from '../services/api';
import { User, MapPin, Building, Lock, Save, Mail, AlertCircle, Link as LinkIcon, Unlink } from 'lucide-react';
import GoogleSignInButton from '../components/common/GoogleSignInButton';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    companyName: '',
    businessType: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        zipCode: user.zipCode || '',
        companyName: user.companyName || '',
        businessType: user.businessType || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await userAPI.updateProfile(formData);
      updateUser(response.data.data);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await authAPI.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendingEmail(true);
    try {
      const response = await authAPI.resendVerification();
      toast.success(response.data.message || 'Verification email sent! Please check your inbox.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setResendingEmail(false);
    }
  };

  const handleGoogleLink = async () => {
    toast.info('Redirecting to Google to link your account...');
    try {
      const redirectUri = `${window.location.origin}/profile?action=link-google`;
      const response = await oauthAPI.getGoogleUrl(redirectUri);
      
      if (response.data.success) {
        sessionStorage.setItem('oauth_action', 'link');
        sessionStorage.setItem('oauth_state', response.data.data.state);
        window.location.href = response.data.data.url;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to initiate Google linking');
    }
  };

  const handleUnlinkOAuth = async () => {
    if (!user.password) {
      toast.error('Please set a password before unlinking your Google account');
      return;
    }

    if (!window.confirm('Are you sure you want to unlink your Google account? You will still be able to log in with your email and password.')) {
      return;
    }

    setUnlinking(true);
    try {
      const response = await oauthAPI.unlinkOAuth();
      updateUser(response.data.data);
      toast.success('Google account unlinked successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to unlink Google account');
    } finally {
      setUnlinking(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1 className="page-title">Profile Settings</h1>
        <p className="page-description">Manage your account information</p>
      </div>

      <div className="profile-content">
        {/* Email Verification Banner */}
        {user && !user.isVerified && (
          <div className="alert alert-warning">
            <div className="alert-content">
              <AlertCircle size={20} />
              <div>
                <strong>Email Not Verified</strong>
                <p>Please verify your email address to access all features.</p>
              </div>
            </div>
            <button 
              onClick={handleResendVerification} 
              className="btn btn-sm btn-secondary"
              disabled={resendingEmail}
            >
              {resendingEmail ? 'Sending...' : 'Resend Email'}
            </button>
          </div>
        )}

        {/* Profile Header */}
        <div className="card profile-header">
          <div className="avatar-lg">
            {user?.name?.charAt(0)}
          </div>
          <div className="profile-info">
            <h2>{user?.name}</h2>
            <p>{user?.email}</p>
            <span className={`badge badge-${user?.role === 'BUSINESS' ? 'info' : 'primary'}`}>
              {user?.role}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`tab ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
          <button
            className={`tab ${activeTab === 'accounts' ? 'active' : ''}`}
            onClick={() => setActiveTab('accounts')}
          >
            Connected Accounts
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="card">
            <form onSubmit={handleProfileSubmit}>
              <div className="form-section">
                <h3><User size={18} /> Personal Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-input"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-input"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {(user?.role === 'BUSINESS' || user?.role === 'RECYCLER') && (
                <div className="form-section">
                  <h3><Building size={18} /> Business Information</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Company Name</label>
                      <input
                        type="text"
                        name="companyName"
                        className="form-input"
                        value={formData.companyName}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Business Type</label>
                      <input
                        type="text"
                        name="businessType"
                        className="form-input"
                        value={formData.businessType}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="form-section">
                <h3><MapPin size={18} /> Address</h3>
                <div className="form-group">
                  <label className="form-label">Street Address</label>
                  <input
                    type="text"
                    name="address"
                    className="form-input"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-grid three">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      name="city"
                      className="form-input"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input
                      type="text"
                      name="state"
                      className="form-input"
                      value={formData.state}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">ZIP Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      className="form-input"
                      value={formData.zipCode}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                  {!loading && <Save size={18} />}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="card">
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-section">
                <h3><Lock size={18} /> Change Password</h3>
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    className="form-input"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required={!!user?.password}
                  />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      className="form-input"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      className="form-input"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                </div>
                {!user?.password && (
                  <p className="helper-text">
                    You currently don't have a password set. Setting a password will allow you to log in with email/password in addition to Google.
                  </p>
                )}
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Updating...' : user?.password ? 'Update Password' : 'Set Password'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Connected Accounts Tab */}
        {activeTab === 'accounts' && (
          <div className="card">
            <div className="form-section">
              <h3><LinkIcon size={18} /> Connected Accounts</h3>
              <p className="section-description">
                Link your accounts to enable multiple sign-in options and enhance your experience.
              </p>

              <div className="connected-accounts">
                {/* Google Account */}
                <div className="account-item">
                  <div className="account-icon google">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </div>
                  <div className="account-info">
                    <div className="account-name">Google</div>
                    {user?.provider === 'google' && user?.providerId ? (
                      <>
                        <div className="account-status connected">
                          Connected {user?.providerData?.email ? `(${user.providerData.email})` : ''}
                        </div>
                      </>
                    ) : (
                      <div className="account-status disconnected">Not connected</div>
                    )}
                  </div>
                  <div className="account-action">
                    {user?.provider === 'google' && user?.providerId ? (
                      <button
                        onClick={handleUnlinkOAuth}
                        className="btn btn-secondary btn-sm"
                        disabled={unlinking || !user?.password}
                        title={!user?.password ? 'Set a password first to unlink Google' : 'Unlink Google account'}
                      >
                        {unlinking ? 'Unlinking...' : (
                          <>
                            <Unlink size={16} />
                            Unlink
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={handleGoogleLink}
                        className="btn btn-secondary btn-sm"
                      >
                        <LinkIcon size={16} />
                        Link Account
                      </button>
                    )}
                  </div>
                </div>

                {!user?.password && user?.provider && (
                  <div className="account-warning">
                    <AlertCircle size={18} />
                    <div>
                      <strong>Important:</strong> Set a password in the Security tab before unlinking your OAuth account to ensure you can still log in.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .profile-content {
          max-width: 800px;
        }

        .alert {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1.5rem;
          gap: 1rem;
        }

        .alert-warning {
          background: #fef3c7;
          border: 1px solid #fbbf24;
          color: #92400e;
        }

        .alert-content {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          flex: 1;
        }

        .alert-content strong {
          display: block;
          margin-bottom: 0.25rem;
        }

        .alert-content p {
          margin: 0;
          font-size: 0.875rem;
          opacity: 0.9;
        }

        .btn-sm {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .avatar-lg {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: var(--primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: 700;
        }

        .profile-info h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .profile-info p {
          color: var(--gray-500);
          margin-bottom: 0.5rem;
        }

        .form-section {
          margin-bottom: 2rem;
        }

        .form-section h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
          font-weight: 600;
          color: var(--gray-700);
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--gray-200);
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .form-grid.three {
          grid-template-columns: repeat(3, 1fr);
        }

        .form-actions {
          padding-top: 1.5rem;
          border-top: 1px solid var(--gray-200);
          display: flex;
          justify-content: flex-end;
        }

        .section-description {
          color: var(--gray-600);
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
        }

        .helper-text {
          font-size: 0.875rem;
          color: var(--gray-600);
          margin-top: 0.5rem;
          padding: 0.75rem;
          background: var(--gray-50);
          border-radius: 0.375rem;
          border-left: 3px solid var(--primary);
        }

        .connected-accounts {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .account-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border: 1px solid var(--gray-200);
          border-radius: 0.5rem;
          transition: all 0.2s;
        }

        .account-item:hover {
          border-color: var(--gray-300);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .account-icon {
          width: 3rem;
          height: 3rem;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .account-icon.google {
          background: #f1f3f4;
        }

        .account-info {
          flex: 1;
          min-width: 0;
        }

        .account-name {
          font-weight: 600;
          font-size: 0.9375rem;
          color: var(--gray-900);
          margin-bottom: 0.25rem;
        }

        .account-status {
          font-size: 0.8125rem;
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .account-status.connected {
          color: var(--primary);
          font-weight: 500;
        }

        .account-status.disconnected {
          color: var(--gray-500);
        }

        .account-action {
          flex-shrink: 0;
        }

        .account-warning {
          display: flex;
          gap: 0.75rem;
          padding: 1rem;
          background: #fef3c7;
          border: 1px solid #fbbf24;
          border-radius: 0.5rem;
          color: #92400e;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .account-warning strong {
          display: block;
          margin-bottom: 0.25rem;
        }

        @media (max-width: 640px) {
          .profile-header {
            flex-direction: column;
            text-align: center;
          }

          .form-grid,
          .form-grid.three {
            grid-template-columns: 1fr;
          }

          .account-item {
            flex-wrap: wrap;
          }

          .account-action {
            width: 100%;
            margin-top: 0.5rem;
          }

          .account-action button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Profile;
