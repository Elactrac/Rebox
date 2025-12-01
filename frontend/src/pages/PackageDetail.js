import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { packageAPI } from '../services/api';
import QRCodeDisplay from '../components/common/QRCodeDisplay';
import { ArrowLeft, Trash2, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

const PackageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPackage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchPackage = async () => {
    try {
      const response = await packageAPI.getById(id);
      setPkg(response.data.data);
    } catch (error) {
      toast.error('Package not found');
      navigate('/packages');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this package?')) return;
    
    try {
      await packageAPI.delete(id);
      toast.success('Package deleted');
      navigate('/packages');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete package');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!pkg) return null;

  const getTypeIcon = (type) => {
    const icons = { BOX: '📦', BOTTLE: '🍾', CONTAINER: '🥡', BAG: '🛍️', OTHER: '📋' };
    return icons[type] || '📦';
  };

  return (
    <div className="package-detail">
      <button onClick={() => navigate(-1)} className="back-btn">
        <ArrowLeft size={18} /> Back
      </button>

      <div className="detail-grid">
        <div className="detail-main card">
          <div className="detail-header">
            <span className="type-icon">{getTypeIcon(pkg.type)}</span>
            <div>
              <h1>{pkg.type}</h1>
              <span className={`badge badge-${getStatusBadge(pkg.status)}`}>
                {pkg.status}
              </span>
            </div>
          </div>

          <div className="detail-section">
            <h3>Details</h3>
            <div className="detail-grid-info">
              <div className="detail-item">
                <span className="detail-label">Brand</span>
                <span className="detail-value">{pkg.brand || 'Not specified'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Condition</span>
                <span className="detail-value">{pkg.condition}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Quantity</span>
                <span className="detail-value">{pkg.quantity}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Weight</span>
                <span className="detail-value">{pkg.weight ? `${pkg.weight} kg` : 'Not specified'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Dimensions</span>
                <span className="detail-value">{pkg.dimensions || 'Not specified'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Listed On</span>
                <span className="detail-value">
                  {new Date(pkg.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {pkg.description && (
            <div className="detail-section">
              <h3>Description</h3>
              <p>{pkg.description}</p>
            </div>
          )}

          {pkg.status === 'LISTED' && (
            <div className="detail-actions">
              <button className="btn btn-danger" onClick={handleDelete}>
                <Trash2 size={18} /> Delete Package
              </button>
              <Link to="/pickups/schedule" className="btn btn-primary">
                Schedule Pickup
              </Link>
            </div>
          )}
        </div>

        <div className="detail-sidebar">
          {/* QR Code for Package */}
          <div className="card qr-card">
            <h3>Package QR Code</h3>
            <p className="qr-description">Quick access & sharing</p>
            <QRCodeDisplay 
              packageId={pkg.id}
              size={180}
              showActions={true}
              showLabel={false}
            />
          </div>

          <div className="card">
            <h3>Estimated Value</h3>
            <div className="value-display">
              <DollarSign size={24} />
              <span>{pkg.estimatedValue.toFixed(2)}</span>
            </div>
            <p className="value-note">Based on type, condition, and quantity</p>
          </div>

          <div className="card">
            <h3>Environmental Impact</h3>
            <div className="impact-list">
              <div className="impact-item">
                <span className="impact-label">CO2 Saved</span>
                <span className="impact-value">{pkg.co2Saved?.toFixed(2) || 0} kg</span>
              </div>
              <div className="impact-item">
                <span className="impact-label">Water Saved</span>
                <span className="impact-value">{pkg.waterSaved?.toFixed(0) || 0} L</span>
              </div>
            </div>
          </div>

          {pkg.buybackOffers?.length > 0 && (
            <div className="card">
              <h3>Buyback Offers</h3>
              <div className="offers-list">
                {pkg.buybackOffers.map((offer) => (
                  <div key={offer.id} className="offer-item">
                    <div>
                      <span className="offer-brand">{offer.brand.companyName || offer.brand.name}</span>
                      <span className="offer-price">${offer.offeredPrice.toFixed(2)}</span>
                    </div>
                    <span className={`badge badge-${offer.status === 'PENDING' ? 'warning' : 'secondary'}`}>
                      {offer.status}
                    </span>
                  </div>
                ))}
              </div>
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

        .back-btn:hover {
          color: var(--gray-900);
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: 1.5rem;
        }

        .detail-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .type-icon {
          font-size: 3rem;
        }

        .detail-header h1 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .detail-section {
          margin-bottom: 2rem;
        }

        .detail-section h3 {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--gray-500);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 1rem;
        }

        .detail-grid-info {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
        }

        .detail-label {
          font-size: 0.75rem;
          color: var(--gray-500);
          margin-bottom: 0.25rem;
        }

        .detail-value {
          font-weight: 500;
          color: var(--gray-900);
        }

        .detail-actions {
          display: flex;
          gap: 1rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--gray-200);
        }

        .detail-sidebar .card {
          margin-bottom: 1rem;
        }

        .detail-sidebar h3 {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--gray-700);
          margin-bottom: 1rem;
        }

        .qr-card {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(16, 185, 129, 0.02));
        }

        .qr-description {
          font-size: 0.8125rem;
          color: var(--gray-600);
          margin-bottom: 1rem;
          text-align: center;
        }

        .value-display {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 2rem;
          font-weight: 800;
          color: var(--primary);
        }

        .value-note {
          font-size: 0.75rem;
          color: var(--gray-500);
          margin-top: 0.5rem;
        }

        .impact-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .impact-item {
          display: flex;
          justify-content: space-between;
        }

        .impact-label {
          color: var(--gray-500);
          font-size: 0.875rem;
        }

        .impact-value {
          font-weight: 600;
          color: var(--primary);
        }

        .offers-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .offer-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .offer-brand {
          font-size: 0.875rem;
          font-weight: 500;
        }

        .offer-price {
          display: block;
          font-size: 0.75rem;
          color: var(--gray-500);
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

const getStatusBadge = (status) => {
  const badges = {
    LISTED: 'primary',
    SCHEDULED: 'warning',
    PICKED_UP: 'info',
    PROCESSING: 'info',
    RECYCLED: 'success',
    REUSED: 'success'
  };
  return badges[status] || 'secondary';
};

export default PackageDetail;
