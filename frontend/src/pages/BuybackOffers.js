import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { buybackAPI } from '../services/api';
import { ShoppingBag, Check, X, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

const BuybackOffers = () => {
  const { user } = useAuth();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const isBusiness = user?.role === 'BUSINESS';

  useEffect(() => {
    fetchOffers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchOffers = async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (filter) params.status = filter;
      
      const response = await buybackAPI.getOffers(params);
      setOffers(response.data.data.offers);
      setPagination(response.data.data.pagination);
    } catch (error) {
      toast.error('Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (offerId) => {
    try {
      await buybackAPI.acceptOffer(offerId);
      toast.success('Offer accepted!');
      fetchOffers(pagination.page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept offer');
    }
  };

  const handleReject = async (offerId) => {
    try {
      await buybackAPI.rejectOffer(offerId);
      toast.success('Offer rejected');
      fetchOffers(pagination.page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject offer');
    }
  };

  const handleCancel = async (offerId) => {
    if (!window.confirm('Cancel this offer?')) return;
    
    try {
      await buybackAPI.cancelOffer(offerId);
      toast.success('Offer cancelled');
      fetchOffers(pagination.page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel offer');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: 'warning',
      ACCEPTED: 'success',
      REJECTED: 'danger',
      COMPLETED: 'info'
    };
    return badges[status] || 'secondary';
  };

  const getTypeIcon = (type) => {
    const icons = { BOX: '📦', BOTTLE: '🍾', CONTAINER: '🥡', BAG: '🛍️', OTHER: '📋' };
    return icons[type] || '📦';
  };

  return (
    <div className="buyback-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Buyback Offers</h1>
          <p className="page-description">
            {isBusiness ? 'Manage your buyback offers' : 'View offers on your packages'}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="tabs">
        {['', 'PENDING', 'ACCEPTED', 'REJECTED'].map((status) => (
          <button
            key={status}
            className={`tab ${filter === status ? 'active' : ''}`}
            onClick={() => setFilter(status)}
          >
            {status || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      ) : offers.length > 0 ? (
        <>
          <div className="offers-list">
            {offers.map((offer) => (
              <div key={offer.id} className="offer-card card">
                <div className="offer-header">
                  <div className="offer-package">
                    <span className="package-icon">{getTypeIcon(offer.package.type)}</span>
                    <div>
                      <h3>{offer.package.type}</h3>
                      <p>{offer.package.brand || 'No brand'} - Qty: {offer.package.quantity}</p>
                    </div>
                  </div>
                  <span className={`badge badge-${getStatusBadge(offer.status)}`}>
                    {offer.status}
                  </span>
                </div>

                <div className="offer-details">
                  <div className="offer-price">
                    <DollarSign size={20} />
                    <span>{offer.offeredPrice.toFixed(2)}</span>
                  </div>
                  <div className="offer-info">
                    {isBusiness ? (
                      <span>To: {offer.package.user?.name}</span>
                    ) : (
                      <span>From: {offer.brand.companyName || offer.brand.name}</span>
                    )}
                    <span className="offer-date">
                      {new Date(offer.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {offer.status === 'PENDING' && (
                  <div className="offer-actions">
                    {isBusiness ? (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleCancel(offer.id)}
                      >
                        Cancel Offer
                      </button>
                    ) : (
                      <>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleReject(offer.id)}
                        >
                          <X size={16} /> Reject
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleAccept(offer.id)}
                        >
                          <Check size={16} /> Accept
                        </button>
                      </>
                    )}
                  </div>
                )}

                {offer.status === 'ACCEPTED' && !isBusiness && (
                  <div className="offer-accepted-note">
                    Congratulations! You earned ${offer.offeredPrice.toFixed(2)} + bonus points
                  </div>
                )}
              </div>
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-outline btn-sm"
                disabled={pagination.page === 1}
                onClick={() => fetchOffers(pagination.page - 1)}
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                className="btn btn-outline btn-sm"
                disabled={pagination.page === pagination.pages}
                onClick={() => fetchOffers(pagination.page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state card">
          <ShoppingBag size={48} className="empty-state-icon" />
          <h3 className="empty-state-title">No offers yet</h3>
          <p className="empty-state-description">
            {isBusiness 
              ? 'Browse the marketplace to make offers on available packages'
              : 'List your packages to receive buyback offers from businesses'
            }
          </p>
        </div>
      )}

      <style>{`
        .loading-container {
          display: flex;
          justify-content: center;
          padding: 4rem;
        }

        .offers-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .offer-card {
          padding: 1.25rem;
        }

        .offer-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .offer-package {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .package-icon {
          font-size: 2rem;
        }

        .offer-package h3 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.125rem;
        }

        .offer-package p {
          font-size: 0.875rem;
          color: var(--gray-500);
        }

        .offer-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: var(--gray-50);
          border-radius: 0.5rem;
          margin-bottom: 1rem;
        }

        .offer-price {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--primary);
        }

        .offer-info {
          text-align: right;
          font-size: 0.875rem;
          color: var(--gray-600);
        }

        .offer-date {
          display: block;
          font-size: 0.75rem;
          color: var(--gray-400);
          margin-top: 0.25rem;
        }

        .offer-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
        }

        .offer-accepted-note {
          padding: 1rem;
          background: rgba(16, 185, 129, 0.1);
          border-radius: 0.5rem;
          color: var(--primary-dark);
          font-weight: 500;
          text-align: center;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          margin-top: 2rem;
        }

        .empty-state {
          padding: 4rem 2rem;
          text-align: center;
        }

        .empty-state-icon {
          color: var(--gray-300);
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
};

export default BuybackOffers;
