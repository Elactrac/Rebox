import React, { useState, useEffect } from 'react';
import { buybackAPI } from '../services/api';
import { ShoppingBag, Filter, DollarSign, Send, ChevronDown, ChevronUp, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Marketplace = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    // Basic filters
    type: '',
    condition: '',
    brand: '',
    status: 'LISTED',
    
    // Advanced filters
    minValue: '',
    maxValue: '',
    minQuantity: '',
    maxQuantity: '',
    minWeight: '',
    maxWeight: '',
    minCO2: '',
    maxCO2: '',
    city: '',
    state: '',
    hasImages: '',
    hasDescription: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [offerModal, setOfferModal] = useState(null);
  const [offerPrice, setOfferPrice] = useState('');

  useEffect(() => {
    fetchPackages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchPackages = async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 12, ...filters };
      // Remove empty values
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });
      
      const response = await buybackAPI.getMarketplace(params);
      setPackages(response.data.data.packages);
      setPagination(response.data.data.pagination);
    } catch (error) {
      toast.error('Failed to load marketplace');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      type: '',
      condition: '',
      brand: '',
      status: 'LISTED',
      minValue: '',
      maxValue: '',
      minQuantity: '',
      maxQuantity: '',
      minWeight: '',
      maxWeight: '',
      minCO2: '',
      maxCO2: '',
      city: '',
      state: '',
      hasImages: '',
      hasDescription: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  const getActiveFilterCount = () => {
    const defaultFilters = { status: 'LISTED', sortBy: 'createdAt', sortOrder: 'desc' };
    return Object.keys(filters).filter(key => {
      return filters[key] !== '' && 
             filters[key] !== null && 
             filters[key] !== undefined &&
             filters[key] !== defaultFilters[key];
    }).length;
  };

  const handleMakeOffer = async () => {
    if (!offerPrice || parseFloat(offerPrice) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      await buybackAPI.createOffer({
        packageId: offerModal.id,
        offeredPrice: parseFloat(offerPrice)
      });
      toast.success('Offer sent successfully!');
      setOfferModal(null);
      setOfferPrice('');
      fetchPackages(pagination.page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send offer');
    }
  };

  const getTypeIcon = (type) => {
    const icons = { BOX: '📦', BOTTLE: '🍾', CONTAINER: '🥡', BAG: '🛍️', OTHER: '📋' };
    return icons[type] || '📦';
  };

  return (
    <div className="marketplace-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Packaging Marketplace</h1>
          <p className="page-description">Browse and make buyback offers on available packaging</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section card">
        <div className="filters-header">
          <div className="filters-title">
            <Filter size={20} />
            <span>Filters</span>
            {getActiveFilterCount() > 0 && (
              <span className="filter-badge">{getActiveFilterCount()}</span>
            )}
          </div>
          <div className="filters-actions">
            {getActiveFilterCount() > 0 && (
              <button className="btn-text" onClick={handleClearFilters}>
                <X size={16} /> Clear All
              </button>
            )}
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              {showAdvancedFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {showAdvancedFilters ? 'Hide' : 'Show'} Advanced
            </button>
          </div>
        </div>

        {/* Basic Filters */}
        <div className="filters-grid">
          <div className="filter-item">
            <label className="filter-label">Type</label>
            <select
              className="form-select"
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="BOX">Boxes</option>
              <option value="BOTTLE">Bottles</option>
              <option value="CONTAINER">Containers</option>
              <option value="BAG">Bags</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="filter-item">
            <label className="filter-label">Condition</label>
            <select
              className="form-select"
              value={filters.condition}
              onChange={(e) => handleFilterChange('condition', e.target.value)}
            >
              <option value="">All Conditions</option>
              <option value="EXCELLENT">Excellent</option>
              <option value="GOOD">Good</option>
              <option value="FAIR">Fair</option>
              <option value="POOR">Poor</option>
            </select>
          </div>

          <div className="filter-item">
            <label className="filter-label">Brand</label>
            <input
              type="text"
              className="form-input"
              placeholder="Search brand..."
              value={filters.brand}
              onChange={(e) => handleFilterChange('brand', e.target.value)}
            />
          </div>

          <div className="filter-item">
            <label className="filter-label">Sort By</label>
            <select
              className="form-select"
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            >
              <option value="createdAt">Newest First</option>
              <option value="estimatedValue">Value (High to Low)</option>
              <option value="quantity">Quantity</option>
              <option value="co2Saved">Environmental Impact</option>
            </select>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="advanced-filters">
            <div className="filter-section">
              <h4 className="section-title">Pricing & Value</h4>
              <div className="filters-grid">
                <div className="filter-item">
                  <label className="filter-label">Min Value ($)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0.00"
                    value={filters.minValue}
                    onChange={(e) => handleFilterChange('minValue', e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="filter-item">
                  <label className="filter-label">Max Value ($)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="999.99"
                    value={filters.maxValue}
                    onChange={(e) => handleFilterChange('maxValue', e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            <div className="filter-section">
              <h4 className="section-title">Quantity & Weight</h4>
              <div className="filters-grid">
                <div className="filter-item">
                  <label className="filter-label">Min Quantity</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="1"
                    value={filters.minQuantity}
                    onChange={(e) => handleFilterChange('minQuantity', e.target.value)}
                    min="1"
                  />
                </div>
                <div className="filter-item">
                  <label className="filter-label">Max Quantity</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="1000"
                    value={filters.maxQuantity}
                    onChange={(e) => handleFilterChange('maxQuantity', e.target.value)}
                    min="1"
                  />
                </div>
                <div className="filter-item">
                  <label className="filter-label">Min Weight (kg)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0.0"
                    value={filters.minWeight}
                    onChange={(e) => handleFilterChange('minWeight', e.target.value)}
                    min="0"
                    step="0.1"
                  />
                </div>
                <div className="filter-item">
                  <label className="filter-label">Max Weight (kg)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="100.0"
                    value={filters.maxWeight}
                    onChange={(e) => handleFilterChange('maxWeight', e.target.value)}
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
            </div>

            <div className="filter-section">
              <h4 className="section-title">Environmental Impact</h4>
              <div className="filters-grid">
                <div className="filter-item">
                  <label className="filter-label">Min CO2 Saved (kg)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0.0"
                    value={filters.minCO2}
                    onChange={(e) => handleFilterChange('minCO2', e.target.value)}
                    min="0"
                    step="0.1"
                  />
                </div>
                <div className="filter-item">
                  <label className="filter-label">Max CO2 Saved (kg)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="50.0"
                    value={filters.maxCO2}
                    onChange={(e) => handleFilterChange('maxCO2', e.target.value)}
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
            </div>

            <div className="filter-section">
              <h4 className="section-title">Location</h4>
              <div className="filters-grid">
                <div className="filter-item">
                  <label className="filter-label">City</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., San Francisco"
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                  />
                </div>
                <div className="filter-item">
                  <label className="filter-label">State</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., CA"
                    value={filters.state}
                    onChange={(e) => handleFilterChange('state', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="filter-section">
              <h4 className="section-title">Additional Filters</h4>
              <div className="filters-grid">
                <div className="filter-item">
                  <label className="filter-label">Has Images</label>
                  <select
                    className="form-select"
                    value={filters.hasImages}
                    onChange={(e) => handleFilterChange('hasImages', e.target.value)}
                  >
                    <option value="">Any</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div className="filter-item">
                  <label className="filter-label">Has Description</label>
                  <select
                    className="form-select"
                    value={filters.hasDescription}
                    onChange={(e) => handleFilterChange('hasDescription', e.target.value)}
                  >
                    <option value="">Any</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

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
                  <span className="offer-count">
                    {pkg._count?.buybackOffers || 0} offers
                  </span>
                </div>
                <div className="package-info">
                  <h3>{pkg.type}</h3>
                  <p className="package-brand">{pkg.brand || 'No brand'}</p>
                  <div className="package-meta">
                    <span>Qty: {pkg.quantity}</span>
                    <span>Condition: {pkg.condition}</span>
                  </div>
                  <div className="package-location">
                    {pkg.user?.city}, {pkg.user?.state}
                  </div>
                  <div className="package-value">
                    Est. Value: <strong>${pkg.estimatedValue.toFixed(2)}</strong>
                  </div>
                </div>
                <button
                  className="btn btn-primary w-full"
                  onClick={() => setOfferModal(pkg)}
                >
                  <DollarSign size={16} /> Make Offer
                </button>
              </div>
            ))}
          </div>

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
          <ShoppingBag size={48} className="empty-state-icon" />
          <h3 className="empty-state-title">No packages available</h3>
          <p className="empty-state-description">
            Check back later for new packaging listings
          </p>
        </div>
      )}

      {/* Offer Modal */}
      {offerModal && (
        <div className="modal-backdrop" onClick={() => setOfferModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Make Buyback Offer</h3>
            </div>
            <div className="modal-body">
              <div className="offer-package-info">
                <span className="offer-type-icon">{getTypeIcon(offerModal.type)}</span>
                <div>
                  <h4>{offerModal.type}</h4>
                  <p>{offerModal.brand || 'No brand'} - Qty: {offerModal.quantity}</p>
                </div>
              </div>
              <div className="offer-value-hint">
                Estimated value: ${offerModal.estimatedValue.toFixed(2)}
              </div>
              <div className="form-group">
                <label className="form-label">Your Offer Price ($)</label>
                <input
                  type="number"
                  className="form-input"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  min="0.01"
                  step="0.01"
                  placeholder="Enter your offer"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setOfferModal(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleMakeOffer}>
                <Send size={16} /> Send Offer
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .filters-section {
          margin-bottom: 1.5rem;
          padding: 1.5rem;
        }

        .filters-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .filters-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1rem;
          font-weight: 600;
          color: var(--gray-900);
        }

        .filter-badge {
          background: var(--primary);
          color: white;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.125rem 0.5rem;
          border-radius: 999px;
          min-width: 1.25rem;
          text-align: center;
        }

        .filters-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .btn-text {
          background: none;
          border: none;
          color: var(--gray-600);
          cursor: pointer;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.375rem 0.75rem;
          border-radius: 0.375rem;
          transition: all 0.2s;
        }

        .btn-text:hover {
          background: var(--gray-100);
          color: var(--gray-900);
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .filter-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--gray-700);
        }

        .advanced-filters {
          padding-top: 1.5rem;
          margin-top: 1.5rem;
          border-top: 2px solid var(--gray-200);
        }

        .filter-section {
          margin-bottom: 2rem;
        }

        .filter-section:last-child {
          margin-bottom: 0;
        }

        .section-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--gray-900);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .section-title::before {
          content: '';
          width: 3px;
          height: 1rem;
          background: var(--primary);
          border-radius: 999px;
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

        .offer-count {
          font-size: 0.75rem;
          color: var(--gray-500);
          background: var(--gray-100);
          padding: 0.25rem 0.5rem;
          border-radius: 1rem;
        }

        .package-info h3 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .package-brand {
          font-size: 0.875rem;
          color: var(--gray-500);
          margin-bottom: 0.5rem;
        }

        .package-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.75rem;
          color: var(--gray-500);
          margin-bottom: 0.5rem;
        }

        .package-location {
          font-size: 0.75rem;
          color: var(--gray-400);
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

        .w-full {
          width: 100%;
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

        .offer-package-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--gray-50);
          border-radius: 0.5rem;
          margin-bottom: 1rem;
        }

        .offer-type-icon {
          font-size: 2.5rem;
        }

        .offer-package-info h4 {
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .offer-package-info p {
          font-size: 0.875rem;
          color: var(--gray-500);
        }

        .offer-value-hint {
          font-size: 0.875rem;
          color: var(--gray-500);
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
};

export default Marketplace;
