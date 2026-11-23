import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pickupAPI } from '../services/api';
import { Truck, Plus, Calendar, MapPin, Package, List, Map as MapIcon } from 'lucide-react';
import Map from '../components/common/Map';
import ShippingLabelModal from '../components/common/ShippingLabelModal';
import toast from 'react-hot-toast';

const Pickups = () => {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [selectedTrackingCode, setSelectedTrackingCode] = useState(null);

  // Dummy coordinates mapping for demo purposes (since we might not have geocoding yet)
  const cityCoordinates = {
    'New Delhi': [28.6139, 77.2090],
    'Mumbai': [19.0760, 72.8777],
    'Bangalore': [12.9716, 77.5946],
    'Hyderabad': [17.3850, 78.4867],
    'Chennai': [13.0827, 80.2707],
    'Kolkata': [22.5726, 88.3639],
    'Pune': [18.5204, 73.8567],
    'Jaipur': [26.9124, 75.7873],
    'Ahmedabad': [23.0225, 72.5714],
    'Lucknow': [26.8467, 80.9462]
  };

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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pickups</h1>
          <p className="text-gray-500 mt-1">Manage your scheduled pickups</p>
        </div>
        <div className="flex gap-4">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-900'}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <List size={18} />
            </button>
            <button
              className={`p-2 rounded-md transition-all ${viewMode === 'map' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-900'}`}
              onClick={() => setViewMode('map')}
              title="Map View"
            >
              <MapIcon size={18} />
            </button>
          </div>
          <Link to="/pickups/schedule" className="btn btn-primary flex items-center gap-2">
            <Plus size={18} /> Schedule Pickup
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {['', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((status) => (
          <button
            key={status}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${filter === status
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            onClick={() => setFilter(status)}
          >
            {status || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center p-16">
          <div className="spinner"></div>
        </div>
      ) : pickups.length > 0 ? (
        <>
          {viewMode === 'list' ? (
            <div className="flex flex-col gap-4">
              {pickups.map((pickup) => (
                <Link
                  key={pickup.id}
                  to={`/pickups/${pickup.id}`}
                  className="block bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100 p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-base text-gray-900">{pickup.trackingCode}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold badge-${getStatusBadge(pickup.status)}`}>
                        {pickup.status}
                      </span>
                    </div>
                    <div className="font-semibold text-primary">
                      +{pickup.rewardPoints} pts
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={16} className="text-gray-400" />
                      <span>{formatDate(pickup.scheduledDate)} • {pickup.scheduledSlot}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin size={16} className="text-gray-400" />
                      <span>{pickup.city}, {pickup.state}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Package size={16} className="text-gray-400" />
                      <span>{pickup.totalItems} items • ${pickup.totalValue.toFixed(2)} value</span>
                    </div>
                  </div>

                  {pickup.recycler && (
                    <div className="mt-4 pt-4 border-t border-gray-100 text-sm">
                      <span className="text-gray-500 mr-2">Recycler:</span>
                      <span className="font-medium text-gray-900">{pickup.recycler.companyName || pickup.recycler.name}</span>
                    </div>
                  )}

                  <div className="mt-4 flex justify-end pt-2 border-t border-gray-50">
                    <button
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedTrackingCode(pickup.trackingCode);
                        setShowLabelModal(true);
                      }}
                    >
                      Print Label
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="h-[600px] rounded-xl overflow-hidden shadow-sm border border-gray-200">
              <Map
                height="100%"
                markers={pickups.map(p => {
                  const baseCoords = cityCoordinates[p.city] || cityCoordinates['New Delhi'];
                  const variance = 0.01;
                  const position = [
                    baseCoords[0] + (Math.random() - 0.5) * variance,
                    baseCoords[1] + (Math.random() - 0.5) * variance
                  ];

                  return {
                    position,
                    title: `Pickup #${p.trackingCode}`,
                    description: `${p.totalItems} items (${p.status})`,
                    action: {
                      label: 'View Details',
                      onClick: () => window.location.href = `/pickups/${p.id}`
                    }
                  };
                })}
              />
            </div>
          )}

          {viewMode === 'list' && pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                className="btn btn-outline btn-sm"
                disabled={pagination.page === 1}
                onClick={() => fetchPickups(pagination.page - 1)}
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">
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
        <div className="bg-white rounded-xl shadow-sm p-16 text-center border border-gray-100">
          <Truck className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No pickups yet</h3>
          <p className="text-gray-500 mb-6">
            Schedule your first pickup to get your packages recycled
          </p>
          <Link to="/pickups/schedule" className="btn btn-primary inline-flex items-center gap-2">
            <Plus size={18} /> Schedule Pickup
          </Link>
        </div>
      )}

      {showLabelModal && (
        <ShippingLabelModal
          trackingCode={selectedTrackingCode}
          onClose={() => {
            setShowLabelModal(false);
            setSelectedTrackingCode(null);
          }}
        />
      )}
    </div>
  );
};

export default Pickups;
