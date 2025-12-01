import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pickupAPI } from '../services/api';
import { Truck, Plus, Calendar, MapPin, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const Pickups = () => {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  useEffect(() => {
    fetchPickups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchPickups = async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (filter) params.status = filter;
      
      const response = await pickupAPI.getAll(params);
      setPickups(response.data.data.pickups);
      setPagination(response.data.data.pagination);
    } catch (error) {
      toast.error('Failed to load pickups');
    } finally {
      setLoading(false);
    }
  };

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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="pickups-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pickups</h1>
          <p className="page-description">Manage your scheduled pickups</p>
        </div>
        <Link to="/pickups/schedule" className="btn btn-primary">
          <Plus size={18} /> Schedule Pickup
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="tabs">
        {['', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((status) => (
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
      ) : pickups.length > 0 ? (
        <>
          <div className="pickups-list">
            {pickups.map((pickup) => (
              <Link key={pickup.id} to={`/pickups/${pickup.id}`} className="pickup-card card">
                <div className="pickup-header">
                  <div className="pickup-tracking">
                    <span className="tracking-code">{pickup.trackingCode}</span>
                    <span className={`badge badge-${getStatusBadge(pickup.status)}`}>
                      {pickup.status}
                    </span>
                  </div>
                  <div className="pickup-points">
                    +{pickup.rewardPoints} pts
                  </div>
                </div>

                <div className="pickup-details">
                  <div className="pickup-detail">
                    <Calendar size={16} />
                    <span>{formatDate(pickup.scheduledDate)} • {pickup.scheduledSlot}</span>
                  </div>
                  <div className="pickup-detail">
                    <MapPin size={16} />
                    <span>{pickup.city}, {pickup.state}</span>
                  </div>
                  <div className="pickup-detail">
                    <Package size={16} />
                    <span>{pickup.totalItems} items • ${pickup.totalValue.toFixed(2)} value</span>
                  </div>
                </div>

                {pickup.recycler && (
                  <div className="pickup-recycler">
                    <span className="recycler-label">Recycler:</span>
                    <span>{pickup.recycler.companyName || pickup.recycler.name}</span>
                  </div>
                )}
              </Link>
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-outline btn-sm"
                disabled={pagination.page === 1}
                onClick={() => fetchPickups(pagination.page - 1)}
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                className="btn btn-outline btn-sm"
                disabled={pagination.page === pagination.pages}
                onClick={() => fetchPickups(pagination.page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state card">
          <Truck size={48} className="empty-state-icon" />
          <h3 className="empty-state-title">No pickups yet</h3>
          <p className="empty-state-description">
            Schedule your first pickup to get your packages recycled
          </p>
          <Link to="/pickups/schedule" className="btn btn-primary">
            <Plus size={18} /> Schedule Pickup
          </Link>
        </div>
      )}

      <style>{`
        .loading-container {
          display: flex;
          justify-content: center;
          padding: 4rem;
        }

        .pickups-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .pickup-card {
          display: block;
          text-decoration: none;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .pickup-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .pickup-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .pickup-tracking {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .tracking-code {
          font-weight: 700;
          font-size: 1rem;
          color: var(--gray-900);
        }

        .pickup-points {
          font-weight: 600;
          color: var(--primary);
        }

        .pickup-details {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .pickup-detail {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: var(--gray-600);
        }

        .pickup-detail svg {
          color: var(--gray-400);
        }

        .pickup-recycler {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--gray-100);
          font-size: 0.875rem;
        }

        .recycler-label {
          color: var(--gray-500);
          margin-right: 0.5rem;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          margin-top: 2rem;
        }

        .pagination-info {
          font-size: 0.875rem;
          color: var(--gray-500);
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

export default Pickups;
