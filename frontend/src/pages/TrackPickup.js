import React, { useState } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { pickupAPI } from '../services/api';
import { Search, Package, Truck, Clock, MapPin, CheckCircle, Leaf, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const TrackPickup = () => {
  const [searchParams] = useSearchParams();
  const { trackingCode: routeTrackingCode } = useParams();
  const navigate = useNavigate();
  const [trackingCode, setTrackingCode] = useState(
    routeTrackingCode || searchParams.get('code') || ''
  );
  const [pickup, setPickup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  React.useEffect(() => {
    const code = routeTrackingCode || searchParams.get('code');
    if (code) {
      setTrackingCode(code);
      handleSearch(code);
    }
    // eslint-disable-next-line
  }, [routeTrackingCode]);

  const handleSearch = async (code = trackingCode) => {
    if (!code || code.length < 6) {
      toast.error('Please enter a valid tracking code');
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const response = await pickupAPI.track(code);
      setPickup(response.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Pickup not found');
      setPickup(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock size={48} />;
      case 'CONFIRMED':
        return <Package size={48} />;
      case 'IN_TRANSIT':
        return <Truck size={48} />;
      case 'COMPLETED':
        return <CheckCircle size={48} />;
      case 'CANCELLED':
        return <XCircle size={48} />;
      default:
        return <Package size={48} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'CONFIRMED':
      case 'IN_TRANSIT':
        return 'info';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const statusSteps = [
    { key: 'PENDING', label: 'Pending', icon: Clock },
    { key: 'CONFIRMED', label: 'Confirmed', icon: Package },
    { key: 'IN_TRANSIT', label: 'In Transit', icon: Truck },
    { key: 'COMPLETED', label: 'Completed', icon: CheckCircle }
  ];

  const getCurrentStepIndex = (status) => {
    return statusSteps.findIndex(step => step.key === status);
  };

  return (
    <div className="track-pickup-page">
      {/* Header */}
      <header className="track-header">
        <div className="track-header-content">
          <div className="logo" onClick={() => navigate('/')}>
            <Leaf size={32} />
            <span>ReBox</span>
          </div>
          <button onClick={() => navigate('/login')} className="btn btn-secondary">
            Sign In
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="track-hero">
        <h1>Track Your Pickup</h1>
        <p>Enter your tracking code to see real-time status updates</p>

        <form onSubmit={handleSubmit} className="track-search">
          <div className="search-input-group">
            <Search size={20} />
            <input
              type="text"
              placeholder="Enter tracking code (e.g., RBX-XXXXXX)"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
              className="track-input"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Tracking...' : 'Track'}
          </button>
        </form>
      </div>

      {/* Results */}
      {loading && (
        <div className="track-loading">
          <div className="spinner"></div>
          <span>Searching for your pickup...</span>
        </div>
      )}

      {!loading && searched && !pickup && (
        <div className="track-not-found">
          <XCircle size={64} />
          <h2>Pickup Not Found</h2>
          <p>We couldn't find a pickup with tracking code: <strong>{trackingCode}</strong></p>
          <p>Please check your tracking code and try again.</p>
        </div>
      )}

      {!loading && pickup && (
        <div className="track-results">
          <div className="status-card">
            <div className="status-icon-container" data-status={getStatusColor(pickup.status)}>
              {getStatusIcon(pickup.status)}
            </div>
            <h2>Status: {pickup.status}</h2>
            <div className="tracking-code-display">{pickup.trackingCode}</div>
          </div>

          {/* Progress Tracker */}
          {pickup.status !== 'CANCELLED' && (
            <div className="progress-tracker">
              {statusSteps.map((step, index) => {
                const currentIndex = getCurrentStepIndex(pickup.status);
                const isActive = index <= currentIndex;
                const Icon = step.icon;

                return (
                  <React.Fragment key={step.key}>
                    <div className={`progress-step ${isActive ? 'active' : ''}`}>
                      <div className="progress-icon">
                        <Icon size={20} />
                      </div>
                      <span>{step.label}</span>
                    </div>
                    {index < statusSteps.length - 1 && (
                      <div className={`progress-line ${index < currentIndex ? 'active' : ''}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}

          {/* Pickup Details */}
          <div className="details-grid">
            <div className="detail-card">
              <h3>Pickup Information</h3>
              <div className="detail-list">
                <div className="detail-row">
                  <Clock size={18} />
                  <div>
                    <span className="detail-label">Scheduled Date</span>
                    <span className="detail-value">
                      {new Date(pickup.scheduledDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                <div className="detail-row">
                  <Clock size={18} />
                  <div>
                    <span className="detail-label">Time Slot</span>
                    <span className="detail-value">{pickup.scheduledSlot}</span>
                  </div>
                </div>
                <div className="detail-row">
                  <MapPin size={18} />
                  <div>
                    <span className="detail-label">Pickup Location</span>
                    <span className="detail-value">
                      {pickup.city}, {pickup.state}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="detail-card">
              <h3>Package Summary</h3>
              <div className="summary-stats">
                <div className="stat">
                  <Package size={24} />
                  <div>
                    <span className="stat-value">{pickup.totalItems}</span>
                    <span className="stat-label">Items</span>
                  </div>
                </div>
                {pickup.totalWeight && (
                  <div className="stat">
                    <div className="stat-icon">⚖️</div>
                    <div>
                      <span className="stat-value">{pickup.totalWeight.toFixed(1)} kg</span>
                      <span className="stat-label">Weight</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {pickup.status === 'COMPLETED' && (
            <div className="completion-card">
              <CheckCircle size={48} />
              <h3>Pickup Completed!</h3>
              <p>Thank you for choosing ReBox. Your contribution helps create a sustainable future.</p>
            </div>
          )}

          {pickup.status === 'CANCELLED' && (
            <div className="cancellation-card">
              <XCircle size={48} />
              <h3>Pickup Cancelled</h3>
              <p>This pickup has been cancelled. Contact support if you have any questions.</p>
            </div>
          )}

          <div className="cta-card">
            <h3>Want to schedule your own pickup?</h3>
            <p>Join ReBox and start recycling your packaging waste for rewards</p>
            <div className="cta-actions">
              <button onClick={() => navigate('/register')} className="btn btn-primary">
                Get Started
              </button>
              <button onClick={() => navigate('/login')} className="btn btn-secondary">
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .track-pickup-page {
          min-height: 100vh;
          background: var(--gray-50);
        }

        .track-header {
          background: white;
          border-bottom: 1px solid var(--gray-200);
          padding: 1rem 0;
        }

        .track-header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--gray-900);
          cursor: pointer;
        }

        .logo svg {
          color: var(--primary);
        }

        .track-hero {
          background: linear-gradient(135deg, var(--primary), #059669);
          color: white;
          padding: 4rem 2rem;
          text-align: center;
        }

        .track-hero h1 {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
        }

        .track-hero p {
          font-size: 1.125rem;
          opacity: 0.9;
          margin-bottom: 2rem;
        }

        .track-search {
          max-width: 600px;
          margin: 0 auto;
          display: flex;
          gap: 0.75rem;
        }

        .search-input-group {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
          background: white;
          border-radius: 0.5rem;
          padding: 0 1rem;
          color: var(--gray-500);
        }

        .track-input {
          flex: 1;
          border: none;
          padding: 0.875rem 0.5rem;
          font-size: 1rem;
          outline: none;
          color: var(--gray-900);
        }

        .track-input::placeholder {
          color: var(--gray-400);
        }

        .track-loading {
          max-width: 600px;
          margin: 3rem auto;
          text-align: center;
          padding: 3rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          color: var(--gray-600);
        }

        .track-not-found {
          max-width: 600px;
          margin: 3rem auto;
          background: white;
          border-radius: 1rem;
          padding: 3rem 2rem;
          text-align: center;
          color: var(--gray-600);
        }

        .track-not-found svg {
          color: var(--danger);
          margin-bottom: 1rem;
        }

        .track-not-found h2 {
          color: var(--gray-900);
          margin-bottom: 1rem;
        }

        .track-not-found strong {
          font-family: monospace;
          color: var(--gray-900);
        }

        .track-results {
          max-width: 1000px;
          margin: 0 auto;
          padding: 3rem 2rem;
        }

        .status-card {
          background: white;
          border-radius: 1rem;
          padding: 2.5rem;
          text-align: center;
          margin-bottom: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .status-icon-container {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          margin: 0 auto 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .status-icon-container[data-status="warning"] {
          background: #fef3c7;
          color: #f59e0b;
        }

        .status-icon-container[data-status="info"] {
          background: #dbeafe;
          color: #3b82f6;
        }

        .status-icon-container[data-status="success"] {
          background: #d1fae5;
          color: var(--primary);
        }

        .status-icon-container[data-status="danger"] {
          background: #fee2e2;
          color: var(--danger);
        }

        .status-card h2 {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .tracking-code-display {
          font-family: monospace;
          font-size: 1.25rem;
          color: var(--gray-600);
          letter-spacing: 0.1em;
        }

        .progress-tracker {
          background: white;
          border-radius: 1rem;
          padding: 2rem;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .progress-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          color: var(--gray-400);
        }

        .progress-step.active {
          color: var(--primary);
        }

        .progress-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 2px solid currentColor;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .progress-step.active .progress-icon {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
        }

        .progress-step span {
          font-size: 0.875rem;
          font-weight: 500;
        }

        .progress-line {
          width: 80px;
          height: 2px;
          background: var(--gray-200);
          margin: 0 1rem;
          margin-bottom: 1.75rem;
        }

        .progress-line.active {
          background: var(--primary);
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .detail-card {
          background: white;
          border-radius: 1rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .detail-card h3 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .detail-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .detail-row {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
        }

        .detail-row svg {
          color: var(--gray-400);
          flex-shrink: 0;
          margin-top: 0.125rem;
        }

        .detail-label {
          display: block;
          font-size: 0.75rem;
          color: var(--gray-500);
          margin-bottom: 0.25rem;
        }

        .detail-value {
          font-weight: 500;
          color: var(--gray-900);
        }

        .summary-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .stat svg,
        .stat-icon {
          color: var(--primary);
          font-size: 1.5rem;
        }

        .stat-value {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--gray-900);
        }

        .stat-label {
          display: block;
          font-size: 0.75rem;
          color: var(--gray-500);
        }

        .completion-card,
        .cancellation-card {
          background: white;
          border-radius: 1rem;
          padding: 2rem;
          text-align: center;
          margin-bottom: 2rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .completion-card {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05));
        }

        .completion-card svg {
          color: var(--primary);
          margin-bottom: 1rem;
        }

        .cancellation-card {
          background: rgba(239, 68, 68, 0.05);
        }

        .cancellation-card svg {
          color: var(--danger);
          margin-bottom: 1rem;
        }

        .completion-card h3,
        .cancellation-card h3 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .cta-card {
          background: linear-gradient(135deg, var(--primary), #059669);
          color: white;
          border-radius: 1rem;
          padding: 2.5rem;
          text-align: center;
        }

        .cta-card h3 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .cta-card p {
          opacity: 0.9;
          margin-bottom: 1.5rem;
        }

        .cta-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .cta-actions .btn {
          min-width: 120px;
        }

        .cta-actions .btn-primary {
          background: white;
          color: var(--primary);
        }

        .cta-actions .btn-primary:hover {
          background: var(--gray-50);
        }

        .cta-actions .btn-secondary {
          background: transparent;
          color: white;
          border-color: white;
        }

        .cta-actions .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        @media (max-width: 768px) {
          .track-hero h1 {
            font-size: 1.875rem;
          }

          .track-search {
            flex-direction: column;
          }

          .details-grid {
            grid-template-columns: 1fr;
          }

          .progress-tracker {
            padding: 1.5rem 1rem;
            overflow-x: auto;
          }

          .progress-line {
            width: 40px;
            margin: 0 0.5rem;
          }

          .progress-step span {
            font-size: 0.75rem;
          }

          .cta-actions {
            flex-direction: column;
          }

          .cta-actions .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default TrackPickup;
