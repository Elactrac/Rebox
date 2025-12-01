import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pickupAPI } from '../services/api';
import QRCodeDisplay from '../components/common/QRCodeDisplay';
import { ArrowLeft, Calendar, Clock, MapPin, Package, Truck, Gift, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const PickupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pickup, setPickup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPickup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchPickup = async () => {
    try {
      const response = await pickupAPI.getById(id);
      setPickup(response.data.data);
    } catch (error) {
      toast.error('Pickup not found');
      navigate('/pickups');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this pickup?')) return;
    
    try {
      await pickupAPI.cancel(id);
      toast.success('Pickup cancelled');
      fetchPickup();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel pickup');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!pickup) return null;

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: 'warning',
      CONFIRMED: 'info',
      IN_TRANSIT: 'info',
      COMPLETED: 'success',
      CANCELLED: 'danger'
    };
    return badges[status] || 'secondary';
  };

  const statusSteps = ['PENDING', 'CONFIRMED', 'IN_TRANSIT', 'COMPLETED'];
  const currentStepIndex = statusSteps.indexOf(pickup.status);

  return (
    <div className="pickup-detail">
      <button onClick={() => navigate(-1)} className="back-btn">
        <ArrowLeft size={18} /> Back to Pickups
      </button>

      <div className="detail-header card">
        <div className="header-main">
          <div>
            <span className="tracking-label">Tracking Code</span>
            <h1>{pickup.trackingCode}</h1>
          </div>
          <span className={`badge badge-${getStatusBadge(pickup.status)} badge-lg`}>
            {pickup.status}
          </span>
        </div>

        {pickup.status !== 'CANCELLED' && pickup.status !== 'COMPLETED' && (
          <div className="status-tracker">
            {statusSteps.map((step, index) => (
              <React.Fragment key={step}>
                <div className={`tracker-step ${index <= currentStepIndex ? 'active' : ''}`}>
                  <div className="tracker-icon">
                    {index === 0 && <Clock size={16} />}
                    {index === 1 && <Package size={16} />}
                    {index === 2 && <Truck size={16} />}
                    {index === 3 && <Gift size={16} />}
                  </div>
                  <span>{step}</span>
                </div>
                {index < statusSteps.length - 1 && (
                  <div className={`tracker-line ${index < currentStepIndex ? 'active' : ''}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      <div className="detail-grid">
        <div className="detail-main">
          <div className="card">
            <h3>Pickup Details</h3>
            <div className="details-list">
              <div className="detail-item">
                <Calendar size={18} />
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
              <div className="detail-item">
                <Clock size={18} />
                <div>
                  <span className="detail-label">Time Slot</span>
                  <span className="detail-value">{pickup.scheduledSlot}</span>
                </div>
              </div>
              <div className="detail-item">
                <MapPin size={18} />
                <div>
                  <span className="detail-label">Pickup Address</span>
                  <span className="detail-value">
                    {pickup.address}<br />
                    {pickup.city}, {pickup.state} {pickup.zipCode}
                  </span>
                </div>
              </div>
              {pickup.instructions && (
                <div className="detail-item">
                  <div>
                    <span className="detail-label">Special Instructions</span>
                    <span className="detail-value">{pickup.instructions}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h3>Packages ({pickup.items?.length || 0})</h3>
            <div className="packages-list">
              {pickup.items?.map((item) => (
                <div key={item.id} className="package-row">
                  <div className="package-info">
                    <span className="package-type">{item.package.type}</span>
                    <span className="package-brand">{item.package.brand || 'No brand'}</span>
                  </div>
                  <div className="package-meta">
                    <span>Qty: {item.quantity}</span>
                    <span className="package-value">${item.package.estimatedValue.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {pickup.recycler && (
            <div className="card">
              <h3>Recycler</h3>
              <div className="recycler-info">
                <div className="recycler-avatar">
                  {pickup.recycler.name.charAt(0)}
                </div>
                <div>
                  <span className="recycler-name">{pickup.recycler.companyName || pickup.recycler.name}</span>
                  {pickup.recycler.phone && (
                    <span className="recycler-phone">{pickup.recycler.phone}</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="detail-sidebar">
          {/* QR Code for Tracking */}
          <div className="card qr-card">
            <h3>Tracking QR Code</h3>
            <p className="qr-description">Share this QR code for easy tracking</p>
            <QRCodeDisplay 
              trackingCode={pickup.trackingCode}
              size={180}
              showActions={true}
              showLabel={false}
            />
          </div>

          <div className="card summary-card">
            <h3>Summary</h3>
            <div className="summary-list">
              <div className="summary-row">
                <span>Total Items</span>
                <span>{pickup.totalItems}</span>
              </div>
              <div className="summary-row">
                <span>Total Weight</span>
                <span>{pickup.totalWeight?.toFixed(1) || '—'} kg</span>
              </div>
              <div className="summary-row">
                <span>Estimated Value</span>
                <span>${pickup.totalValue.toFixed(2)}</span>
              </div>
              <div className="divider"></div>
              <div className="summary-row highlight">
                <span>Reward Points</span>
                <span>+{pickup.rewardPoints} pts</span>
              </div>
            </div>
          </div>

          {['PENDING', 'CONFIRMED'].includes(pickup.status) && (
            <button className="btn btn-danger w-full" onClick={handleCancel}>
              <XCircle size={18} /> Cancel Pickup
            </button>
          )}

          {pickup.status === 'COMPLETED' && pickup.transaction && (
            <div className="card completed-card">
              <Gift size={32} className="completed-icon" />
              <h3>Points Earned!</h3>
              <span className="points-earned">+{pickup.transaction.points}</span>
              <p>Thank you for recycling!</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .loading-container {
          display: flex;
          justify-content: center;
          padding: 4rem;
        }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          color: var(--gray-600);
          font-size: 0.875rem;
          cursor: pointer;
          margin-bottom: 1.5rem;
        }

        .detail-header {
          margin-bottom: 1.5rem;
        }

        .header-main {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .tracking-label {
          font-size: 0.75rem;
          color: var(--gray-500);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .detail-header h1 {
          font-size: 1.75rem;
          font-weight: 700;
        }

        .badge-lg {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        }

        .status-tracker {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--gray-200);
        }

        .tracker-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          color: var(--gray-400);
        }

        .tracker-step.active {
          color: var(--primary);
        }

        .tracker-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 2px solid currentColor;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tracker-step.active .tracker-icon {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
        }

        .tracker-step span {
          font-size: 0.75rem;
          font-weight: 500;
        }

        .tracker-line {
          width: 60px;
          height: 2px;
          background: var(--gray-200);
          margin: 0 0.5rem;
          margin-bottom: 1.5rem;
        }

        .tracker-line.active {
          background: var(--primary);
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 1.5rem;
        }

        .detail-main .card {
          margin-bottom: 1rem;
        }

        .detail-main h3 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .details-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .detail-item {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .detail-item svg {
          color: var(--gray-400);
          flex-shrink: 0;
        }

        .detail-label {
          display: block;
          font-size: 0.75rem;
          color: var(--gray-500);
        }

        .detail-value {
          font-weight: 500;
        }

        .packages-list {
          display: flex;
          flex-direction: column;
        }

        .package-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid var(--gray-100);
        }

        .package-row:last-child {
          border-bottom: none;
        }

        .package-type {
          font-weight: 500;
        }

        .package-brand {
          display: block;
          font-size: 0.75rem;
          color: var(--gray-500);
        }

        .package-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          font-size: 0.875rem;
          color: var(--gray-500);
        }

        .package-value {
          font-weight: 600;
          color: var(--primary);
        }

        .recycler-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .recycler-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 1.25rem;
        }

        .recycler-name {
          font-weight: 600;
        }

        .recycler-phone {
          display: block;
          font-size: 0.875rem;
          color: var(--gray-500);
        }

        .detail-sidebar h3 {
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .qr-card {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(16, 185, 129, 0.02));
          margin-bottom: 1rem;
        }

        .qr-description {
          font-size: 0.8125rem;
          color: var(--gray-600);
          margin-bottom: 1rem;
          text-align: center;
        }

        .summary-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
        }

        .summary-row.highlight {
          font-weight: 700;
          color: var(--primary);
          font-size: 1rem;
        }

        .summary-card .divider {
          height: 1px;
          background: var(--gray-200);
          margin: 0.5rem 0;
        }

        .w-full {
          width: 100%;
          margin-top: 1rem;
        }

        .completed-card {
          text-align: center;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05));
          margin-top: 1rem;
        }

        .completed-icon {
          color: var(--primary);
          margin-bottom: 0.5rem;
        }

        .completed-card h3 {
          margin-bottom: 0.5rem;
        }

        .points-earned {
          font-size: 2rem;
          font-weight: 800;
          color: var(--primary);
        }

        .completed-card p {
          font-size: 0.875rem;
          color: var(--gray-500);
          margin-top: 0.5rem;
        }

        @media (max-width: 1024px) {
          .detail-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default PickupDetail;
