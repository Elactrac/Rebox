import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { packageAPI } from '../../services/api';

const SearchFilter = ({ onFilterChange, initialFilters = {}, showSearch = true }) => {
  const [filters, setFilters] = useState({
    search: '',
    types: [],
    conditions: [],
    statuses: [],
    brand: '',
    city: '',
    state: '',
    minValue: '',
    maxValue: '',
    minWeight: '',
    maxWeight: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...initialFilters
  });

  const [filterOptions, setFilterOptions] = useState({
    brands: [],
    cities: [],
    states: [],
    types: ['BOX', 'BOTTLE', 'CONTAINER', 'BAG', 'OTHER'],
    conditions: ['EXCELLENT', 'GOOD', 'FAIR', 'POOR'],
    statuses: ['LISTED', 'SCHEDULED', 'PICKED_UP', 'PROCESSING', 'RECYCLED', 'REUSED'],
    valueRange: { min: 0, max: 100 },
    weightRange: { min: 0, max: 50 },
    typeCounts: {},
    conditionCounts: {},
    statusCounts: {}
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  // Fetch filter options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await packageAPI.getFilterOptions();
        if (response.data.success) {
          setFilterOptions(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch filter options:', error);
      }
    };
    fetchOptions();
  }, []);

  // Debounced filter change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFilterChange = useCallback(
    debounce((newFilters) => {
      // Convert arrays to comma-separated strings for API
      const apiFilters = { ...newFilters };
      if (apiFilters.types.length > 0) {
        apiFilters.types = apiFilters.types.join(',');
      } else {
        delete apiFilters.types;
      }
      if (apiFilters.conditions.length > 0) {
        apiFilters.conditions = apiFilters.conditions.join(',');
      } else {
        delete apiFilters.conditions;
      }
      if (apiFilters.statuses.length > 0) {
        apiFilters.statuses = apiFilters.statuses.join(',');
      } else {
        delete apiFilters.statuses;
      }

      // Remove empty values
      Object.keys(apiFilters).forEach(key => {
        if (apiFilters[key] === '' || apiFilters[key] === null || apiFilters[key] === undefined) {
          delete apiFilters[key];
        }
      });

      onFilterChange(apiFilters);
    }, 300),
    [onFilterChange]
  );

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    debouncedFilterChange(newFilters);
  };

  // Handle multi-select toggle
  const toggleMultiSelect = (key, value) => {
    const current = filters[key];
    const newValues = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    handleFilterChange(key, newValues);
  };

  // Clear all filters
  const clearFilters = () => {
    const defaultFilters = {
      search: '',
      types: [],
      conditions: [],
      statuses: [],
      brand: '',
      city: '',
      state: '',
      minValue: '',
      maxValue: '',
      minWeight: '',
      maxWeight: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    setFilters(defaultFilters);
    onFilterChange({});
  };

  // Count active filters
  const activeFilterCount = [
    filters.types.length > 0,
    filters.conditions.length > 0,
    filters.statuses.length > 0,
    filters.brand,
    filters.city,
    filters.state,
    filters.minValue,
    filters.maxValue,
    filters.minWeight,
    filters.maxWeight
  ].filter(Boolean).length;

  return (
    <div className="search-filter">
      {/* Search Bar */}
      {showSearch && (
        <div className="search-bar">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search packages by brand, description..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="search-input"
          />
          {filters.search && (
            <button
              className="clear-search"
              onClick={() => handleFilterChange('search', '')}
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}

      {/* Quick Filters */}
      <div className="quick-filters">
        <div className="filter-group">
          <label>Type</label>
          <div className="chip-select">
            {filterOptions.types.map(type => (
              <button
                key={type}
                className={`chip ${filters.types.includes(type) ? 'active' : ''}`}
                onClick={() => toggleMultiSelect('types', type)}
              >
                {type}
                {filterOptions.typeCounts[type] && (
                  <span className="chip-count">{filterOptions.typeCounts[type]}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label>Condition</label>
          <div className="chip-select">
            {filterOptions.conditions.map(condition => (
              <button
                key={condition}
                className={`chip ${filters.conditions.includes(condition) ? 'active' : ''}`}
                onClick={() => toggleMultiSelect('conditions', condition)}
              >
                {condition}
                {filterOptions.conditionCounts[condition] && (
                  <span className="chip-count">{filterOptions.conditionCounts[condition]}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div className="filter-group sort-group">
          <label>Sort by</label>
          <div className="sort-controls">
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="sort-select"
            >
              <option value="createdAt">Date Created</option>
              <option value="estimatedValue">Value</option>
              <option value="weight">Weight</option>
              <option value="quantity">Quantity</option>
            </select>
            <button
              className="sort-order-btn"
              onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {filters.sortOrder === 'asc' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <div className="advanced-toggle">
        <button
          className="toggle-btn"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <Filter size={16} />
          Advanced Filters
          {activeFilterCount > 0 && (
            <span className="filter-badge">{activeFilterCount}</span>
          )}
          {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {activeFilterCount > 0 && (
          <button className="clear-btn" onClick={clearFilters}>
            Clear All
          </button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div className="advanced-filters">
          <div className="filter-row">
            <div className="filter-group">
              <label>Status</label>
              <div className="chip-select">
                {filterOptions.statuses.map(status => (
                  <button
                    key={status}
                    className={`chip ${filters.statuses.includes(status) ? 'active' : ''}`}
                    onClick={() => toggleMultiSelect('statuses', status)}
                  >
                    {status.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="filter-row">
            <div className="filter-group">
              <label>Brand</label>
              <select
                value={filters.brand}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
                className="filter-select"
              >
                <option value="">All Brands</option>
                {filterOptions.brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>City</label>
              <select
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                className="filter-select"
              >
                <option value="">All Cities</option>
                {filterOptions.cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>State</label>
              <select
                value={filters.state}
                onChange={(e) => handleFilterChange('state', e.target.value)}
                className="filter-select"
              >
                <option value="">All States</option>
                {filterOptions.states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="filter-row">
            <div className="filter-group range-group">
              <label>Value Range ($)</label>
              <div className="range-inputs">
                <input
                  type="number"
                  placeholder={`Min (${filterOptions.valueRange.min})`}
                  value={filters.minValue}
                  onChange={(e) => handleFilterChange('minValue', e.target.value)}
                  className="range-input"
                  min="0"
                  step="0.01"
                />
                <span className="range-separator">to</span>
                <input
                  type="number"
                  placeholder={`Max (${filterOptions.valueRange.max})`}
                  value={filters.maxValue}
                  onChange={(e) => handleFilterChange('maxValue', e.target.value)}
                  className="range-input"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="filter-group range-group">
              <label>Weight Range (kg)</label>
              <div className="range-inputs">
                <input
                  type="number"
                  placeholder={`Min (${filterOptions.weightRange.min})`}
                  value={filters.minWeight}
                  onChange={(e) => handleFilterChange('minWeight', e.target.value)}
                  className="range-input"
                  min="0"
                  step="0.1"
                />
                <span className="range-separator">to</span>
                <input
                  type="number"
                  placeholder={`Max (${filterOptions.weightRange.max})`}
                  value={filters.maxWeight}
                  onChange={(e) => handleFilterChange('maxWeight', e.target.value)}
                  className="range-input"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .search-filter {
          background: white;
          border-radius: 0.75rem;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .search-bar {
          position: relative;
          margin-bottom: 1rem;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--gray-400);
        }

        .search-input {
          width: 100%;
          padding: 0.875rem 2.5rem 0.875rem 3rem;
          border: 1px solid var(--gray-200);
          border-radius: 0.5rem;
          font-size: 1rem;
          transition: all 0.2s;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
        }

        .clear-search {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--gray-400);
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 50%;
        }

        .clear-search:hover {
          background: var(--gray-100);
          color: var(--gray-600);
        }

        .quick-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          margin-bottom: 1rem;
        }

        .filter-group {
          flex: 1;
          min-width: 200px;
        }

        .filter-group label {
          display: block;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--gray-500);
          margin-bottom: 0.5rem;
        }

        .chip-select {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .chip {
          padding: 0.375rem 0.75rem;
          background: var(--gray-100);
          border: 1px solid var(--gray-200);
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--gray-600);
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .chip:hover {
          background: var(--gray-200);
        }

        .chip.active {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
        }

        .chip-count {
          background: rgba(255, 255, 255, 0.2);
          padding: 0.125rem 0.375rem;
          border-radius: 9999px;
          font-size: 0.625rem;
        }

        .chip.active .chip-count {
          background: rgba(255, 255, 255, 0.3);
        }

        .sort-group {
          min-width: 180px;
        }

        .sort-controls {
          display: flex;
          gap: 0.5rem;
        }

        .sort-select {
          flex: 1;
          padding: 0.5rem 0.75rem;
          border: 1px solid var(--gray-200);
          border-radius: 0.375rem;
          font-size: 0.875rem;
          background: white;
        }

        .sort-order-btn {
          padding: 0.5rem;
          border: 1px solid var(--gray-200);
          border-radius: 0.375rem;
          background: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sort-order-btn:hover {
          background: var(--gray-50);
        }

        .advanced-toggle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 1rem;
          border-top: 1px solid var(--gray-100);
        }

        .toggle-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: none;
          border: 1px solid var(--gray-200);
          border-radius: 0.375rem;
          font-size: 0.875rem;
          color: var(--gray-600);
          cursor: pointer;
          transition: all 0.2s;
        }

        .toggle-btn:hover {
          background: var(--gray-50);
        }

        .filter-badge {
          background: var(--primary);
          color: white;
          padding: 0.125rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.75rem;
        }

        .clear-btn {
          background: none;
          border: none;
          color: var(--gray-500);
          font-size: 0.875rem;
          cursor: pointer;
          text-decoration: underline;
        }

        .clear-btn:hover {
          color: var(--gray-700);
        }

        .advanced-filters {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--gray-100);
        }

        .filter-row {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .filter-row:last-child {
          margin-bottom: 0;
        }

        .filter-select {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid var(--gray-200);
          border-radius: 0.375rem;
          font-size: 0.875rem;
          background: white;
        }

        .range-group {
          min-width: 250px;
        }

        .range-inputs {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .range-input {
          flex: 1;
          padding: 0.5rem 0.75rem;
          border: 1px solid var(--gray-200);
          border-radius: 0.375rem;
          font-size: 0.875rem;
        }

        .range-separator {
          color: var(--gray-400);
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .quick-filters {
            flex-direction: column;
          }

          .filter-row {
            flex-direction: column;
          }

          .filter-group {
            min-width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default SearchFilter;
