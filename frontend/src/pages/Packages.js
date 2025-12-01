import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { packageAPI } from '../services/api';
import { Package, Plus, Trash2 } from 'lucide-react';
import SearchFilter from '../components/common/SearchFilter';
import toast from 'react-hot-toast';

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [aggregates, setAggregates] = useState({
    totalValue: 0,
    totalWeight: 0,
    totalCO2Saved: 0,
    avgValue: 0
  });

  const fetchPackages = useCallback(async (page = 1, filterParams = filters) => {
    try {
      setLoading(true);
      const params = { 
        page, 
        limit: 12, 
        myPackages: 'true',
        ...filterParams 
      };
      
      const response = await packageAPI.getAll(params);
      setPackages(response.data.data.packages);
      setPagination(response.data.data.pagination);
      setAggregates(response.data.data.aggregates || {});
    } catch (error) {
      toast.error('Failed to load packages');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchPackages(1, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this package?')) return;
    
    try {
      await packageAPI.delete(id);
      toast.success('Package deleted');
      fetchPackages(pagination.page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete package');
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      BOX: '📦',
      BOTTLE: '🍾',
      CONTAINER: '🥡',
      BAG: '🛍️',
      OTHER: '📋'
    };
    return icons[type] || '📦';
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

  const getConditionLabel = (condition) => {
    const labels = {
      EXCELLENT: 'Excellent',
      GOOD: 'Good',
      FAIR: 'Fair',
      POOR: 'Poor'
    };
    return labels[condition] || condition;
  };

  return (
    <div className="packages-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Packages</h1>
          <p className="page-description">Manage your packaging listings</p>
        </div>
        <Link to="/packages/new" className="btn btn-primary">
          <Plus size={18} /> Add Package
        </Link>
      </div>

      {/* Search and Filter Component */}
      <SearchFilter 
        onFilterChange={handleFilterChange}
        showSearch={true}
      />

      {/* Aggregates Summary */}
      {pagination.total > 0 && (
        <div className="aggregates-bar">
          <div className="aggregate-item">
            <span className="aggregate-label">Total Value</span>
            <span className="aggregate-value">${aggregates.totalValue?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="aggregate-item">
            <span className="aggregate-label">Total Weight</span>
            <span className="aggregate-value">{aggregates.totalWeight?.toFixed(1) || '0'} kg</span>
          </div>
          <div className="aggregate-item">
            <span className="aggregate-label">CO2 Saved</span>
            <span className="aggregate-value highlight">{aggregates.totalCO2Saved?.toFixed(1) || '0'} kg</span>
          </div>
          <div className="aggregate-item">
            <span className="aggregate-label">Results</span>
            <span className="aggregate-value">{pagination.total} packages</span>
          </div>
        </div>
      )}

      {/* Packages Grid */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      ) : packages.length > 0 ? (
        <>
          <div className="packages-grid">
            {packages.map((pkg) => (
              <div key={pkg.id} className="package-card card">
                <div className="package-header">
                  <span className="package-type-icon">{getTypeIcon(pkg.type)}</span>
                  <span className={`badge badge-${getStatusBadge(pkg.status)}`}>
                    {pkg.status}
                  </span>
                </div>
                <div className="package-info">
                  <h3>{pkg.type}</h3>
                  <p className="package-brand">{pkg.brand || 'No brand'}</p>
                  <div className="package-meta">
                    <span>Qty: {pkg.quantity}</span>
                    <span>Condition: {getConditionLabel(pkg.condition)}</span>
                  </div>
                  <div className="package-value">
                    Est. Value: <strong>${pkg.estimatedValue.toFixed(2)}</strong>
                  </div>
                </div>
                <div className="package-actions">
                  <Link to={`/packages/${pkg.id}`} className="btn btn-outline btn-sm">
                    View
                  </Link>
                  {pkg.status === 'LISTED' && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(pkg.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-outline btn-sm"
                disabled={pagination.page === 1}
                onClick={() => fetchPackages(pagination.page - 1)}
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                className="btn btn-outline btn-sm"
                disabled={pagination.page === pagination.pages}
                onClick={() => fetchPackages(pagination.page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state card">
          <Package size={48} className="empty-state-icon" />
          <h3 className="empty-state-title">No packages yet</h3>
          <p className="empty-state-description">
            Start by listing your first package for recycling
          </p>
          <Link to="/packages/new" className="btn btn-primary">
            <Plus size={18} /> Add Your First Package
          </Link>
        </div>
      )}

      <style>{`
        .aggregates-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          background: white;
          padding: 1rem 1.5rem;
          border-radius: 0.75rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .aggregate-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .aggregate-label {
          font-size: 0.75rem;
          color: var(--gray-500);
          text-transform: uppercase;
          font-weight: 500;
        }

        .aggregate-value {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--gray-900);
        }

        .aggregate-value.highlight {
          color: var(--primary);
        }

        .loading-container {
          display: flex;
          justify-content: center;
          padding: 4rem;
        }

        .packages-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.25rem;
        }

        .package-card {
          padding: 1.25rem;
        }

        .package-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .package-type-icon {
          font-size: 2rem;
        }

        .package-info h3 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: 0.25rem;
        }

        .package-brand {
          font-size: 0.875rem;
          color: var(--gray-500);
          margin-bottom: 0.75rem;
        }

        .package-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.75rem;
          color: var(--gray-500);
          margin-bottom: 0.75rem;
        }

        .package-value {
          font-size: 0.875rem;
          color: var(--gray-600);
          margin-bottom: 1rem;
        }

        .package-value strong {
          color: var(--primary);
        }

        .package-actions {
          display: flex;
          gap: 0.5rem;
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

        @media (max-width: 768px) {
          .aggregates-bar {
            flex-direction: column;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Packages;
