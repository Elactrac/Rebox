import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { 
  Package, 
  Truck, 
  Gift, 
  Leaf, 
  Plus, 
  ArrowRight,
  TrendingUp,
  Droplets,
  TreePine
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await userAPI.getDashboardStats();
      setStats(response.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getStatusCount = (items, status) => {
    const item = items?.find(i => i.status === status);
    return item?._count?.status || 0;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  const packageStats = stats?.packageStats || [];
  const pickupStats = stats?.pickupStats || [];
  const rewards = stats?.rewards || { availablePoints: 0, level: 'Bronze' };
  const impact = stats?.impact || { co2Saved: 0, waterSaved: 0, treesEquivalent: 0 };

  const totalPackages = packageStats.reduce((sum, s) => sum + (s._count?.status || 0), 0);
  const listedPackages = getStatusCount(packageStats, 'LISTED');
  const pendingPickups = getStatusCount(pickupStats, 'PENDING') + getStatusCount(pickupStats, 'CONFIRMED');
  const completedPickups = getStatusCount(pickupStats, 'COMPLETED');

  // Show admin-specific dashboard
  if (user?.role === 'ADMIN') {
    return (
      <div className="dashboard">
        <div className="page-header">
          <div>
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="page-description">Platform overview and management</p>
          </div>
          <Link to="/admin" className="btn btn-primary">
            <TrendingUp size={18} /> Full Admin Panel
          </Link>
        </div>

        {/* Admin Quick Stats */}
        <div className="grid grid-cols-4 mb-6">
          <div className="stat-card">
            <div className="stat-icon packages">
              <Package size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Total Packages</span>
              <span className="stat-value">{totalPackages}</span>
              <span className="stat-sub">{listedPackages} active</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon pickups">
              <Truck size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Total Pickups</span>
              <span className="stat-value">{completedPickups + pendingPickups}</span>
              <span className="stat-sub">{pendingPickups} pending</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon rewards">
              <Gift size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Platform Users</span>
              <span className="stat-value">{stats?.totalUsers || 0}</span>
              <span className="stat-sub">Total registered</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon impact">
              <Leaf size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Total Impact</span>
              <span className="stat-value">{(stats?.totalImpact?.co2Saved || 0).toFixed(1)} kg</span>
              <span className="stat-sub">CO2 saved</span>
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="grid grid-cols-2">
          <div className="card">
            <h3 className="card-title">Admin Actions</h3>
            <div className="quick-actions">
              <Link to="/admin/users" className="action-item">
                <div className="action-icon">
                  <Gift size={20} />
                </div>
                <div className="action-info">
                  <span className="action-title">Manage Users</span>
                  <span className="action-desc">View and edit all users</span>
                </div>
                <ArrowRight size={18} />
              </Link>
              <Link to="/pickups" className="action-item">
                <div className="action-icon">
                  <Truck size={20} />
                </div>
                <div className="action-info">
                  <span className="action-title">Monitor Pickups</span>
                  <span className="action-desc">Track all platform pickups</span>
                </div>
                <ArrowRight size={18} />
              </Link>
              <Link to="/packages" className="action-item">
                <div className="action-icon">
                  <Package size={20} />
                </div>
                <div className="action-info">
                  <span className="action-title">View Packages</span>
                  <span className="action-desc">Browse all listed packages</span>
                </div>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          <div className="card">
            <div className="card-header flex justify-between items-center">
              <h3 className="card-title">Recent Activity</h3>
              <Link to="/admin" className="text-sm text-primary">View all</Link>
            </div>
            {stats?.recentPickups?.length > 0 ? (
              <div className="recent-list">
                {stats.recentPickups.slice(0, 4).map((pickup) => (
                  <Link key={pickup.id} to={`/pickups/${pickup.id}`} className="recent-item">
                    <div className="recent-info">
                      <span className="recent-title">{pickup.trackingCode}</span>
                      <span className="recent-meta">{pickup.totalItems} items</span>
                    </div>
                    <span className={`badge badge-${getStatusBadge(pickup.status)}`}>
                      {pickup.status}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>

        <style>{recyclerStyles}</style>
      </div>
    );
  }

  // Show business-specific dashboard
  if (user?.role === 'BUSINESS') {
    return (
      <div className="dashboard">
        <div className="page-header">
          <div>
            <h1 className="page-title">Welcome back, {user?.companyName || user?.name?.split(' ')[0]}!</h1>
            <p className="page-description">Manage your business packaging and buyback offers</p>
          </div>
          <Link to="/marketplace" className="btn btn-primary">
            <Plus size={18} /> Create Buyback Offer
          </Link>
        </div>

        {/* Business Quick Stats */}
        <div className="grid grid-cols-4 mb-6">
          <div className="stat-card">
            <div className="stat-icon packages">
              <Package size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Packages Listed</span>
              <span className="stat-value">{totalPackages}</span>
              <span className="stat-sub">{listedPackages} available</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon pickups">
              <Truck size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Pickups</span>
              <span className="stat-value">{completedPickups}</span>
              <span className="stat-sub">{pendingPickups} pending</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon rewards">
              <Gift size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Active Offers</span>
              <span className="stat-value">{stats?.buybackOffers || 0}</span>
              <span className="stat-sub">Buyback offers</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon impact">
              <Leaf size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Sustainability Score</span>
              <span className="stat-value">{impact.co2Saved.toFixed(1)} kg</span>
              <span className="stat-sub">CO2 reduced</span>
            </div>
          </div>
        </div>

        {/* Business Actions */}
        <div className="grid grid-cols-2">
          <div className="card">
            <h3 className="card-title">Quick Actions</h3>
            <div className="quick-actions">
              <Link to="/marketplace" className="action-item">
                <div className="action-icon">
                  <TrendingUp size={20} />
                </div>
                <div className="action-info">
                  <span className="action-title">Marketplace</span>
                  <span className="action-desc">Post buyback offers for packaging</span>
                </div>
                <ArrowRight size={18} />
              </Link>
              <Link to="/buyback" className="action-item">
                <div className="action-icon">
                  <Gift size={20} />
                </div>
                <div className="action-info">
                  <span className="action-title">My Offers</span>
                  <span className="action-desc">Manage your buyback offers</span>
                </div>
                <ArrowRight size={18} />
              </Link>
              <Link to="/packages/new" className="action-item">
                <div className="action-icon">
                  <Package size={20} />
                </div>
                <div className="action-info">
                  <span className="action-title">List Packaging</span>
                  <span className="action-desc">Add packaging to recycle</span>
                </div>
                <ArrowRight size={18} />
              </Link>
              <Link to="/impact" className="action-item">
                <div className="action-icon">
                  <Leaf size={20} />
                </div>
                <div className="action-info">
                  <span className="action-title">Impact Report</span>
                  <span className="action-desc">View your sustainability metrics</span>
                </div>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          <div className="card">
            <div className="card-header flex justify-between items-center">
              <h3 className="card-title">Recent Pickups</h3>
              <Link to="/pickups" className="text-sm text-primary">View all</Link>
            </div>
            {stats?.recentPickups?.length > 0 ? (
              <div className="recent-list">
                {stats.recentPickups.slice(0, 4).map((pickup) => (
                  <Link key={pickup.id} to={`/pickups/${pickup.id}`} className="recent-item">
                    <div className="recent-info">
                      <span className="recent-title">{pickup.trackingCode}</span>
                      <span className="recent-meta">{pickup.totalItems} items</span>
                    </div>
                    <span className={`badge badge-${getStatusBadge(pickup.status)}`}>
                      {pickup.status}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No pickups yet</p>
                <Link to="/pickups/schedule" className="btn btn-primary btn-sm mt-2">
                  Schedule First Pickup
                </Link>
              </div>
            )}
          </div>
        </div>

        <style>{recyclerStyles}</style>
      </div>
    );
  }

  // Show recycler-specific dashboard
  if (user?.role === 'RECYCLER') {
    return (
      <div className="dashboard">
        <div className="page-header">
          <div>
            <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]}!</h1>
            <p className="page-description">Manage your pickups and recycling operations</p>
          </div>
          <Link to="/pickups" className="btn btn-primary">
            <Truck size={18} /> View Available Pickups
          </Link>
        </div>

        {/* Recycler Quick Stats */}
        <div className="grid grid-cols-4 mb-6">
          <div className="stat-card">
            <div className="stat-icon pickups">
              <Truck size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Available Pickups</span>
              <span className="stat-value">{getStatusCount(pickupStats, 'PENDING')}</span>
              <span className="stat-sub">Ready to claim</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon impact">
              <TrendingUp size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">In Progress</span>
              <span className="stat-value">{getStatusCount(pickupStats, 'CONFIRMED') + getStatusCount(pickupStats, 'IN_TRANSIT')}</span>
              <span className="stat-sub">Active pickups</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon rewards">
              <Package size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Completed</span>
              <span className="stat-value">{completedPickups}</span>
              <span className="stat-sub">Total pickups</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon packages">
              <Leaf size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Total Weight</span>
              <span className="stat-value">{(stats?.totalWeight || 0).toFixed(1)} kg</span>
              <span className="stat-sub">Recycled</span>
            </div>
          </div>
        </div>

        {/* Recycler Actions */}
        <div className="grid grid-cols-2">
          <div className="card">
            <h3 className="card-title">Quick Actions</h3>
            <div className="quick-actions">
              <Link to="/pickups" className="action-item">
                <div className="action-icon">
                  <Truck size={20} />
                </div>
                <div className="action-info">
                  <span className="action-title">Browse Pickups</span>
                  <span className="action-desc">Find available pickups in your area</span>
                </div>
                <ArrowRight size={18} />
              </Link>
              <Link to="/pickups?status=CONFIRMED" className="action-item">
                <div className="action-icon">
                  <TrendingUp size={20} />
                </div>
                <div className="action-info">
                  <span className="action-title">My Active Pickups</span>
                  <span className="action-desc">View pickups you're handling</span>
                </div>
                <ArrowRight size={18} />
              </Link>
              <Link to="/impact" className="action-item">
                <div className="action-icon">
                  <Leaf size={20} />
                </div>
                <div className="action-info">
                  <span className="action-title">Impact Report</span>
                  <span className="action-desc">See your environmental contribution</span>
                </div>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          <div className="card">
            <div className="card-header flex justify-between items-center">
              <h3 className="card-title">Recent Pickups</h3>
              <Link to="/pickups" className="text-sm text-primary">View all</Link>
            </div>
            {stats?.recentPickups?.length > 0 ? (
              <div className="recent-list">
                {stats.recentPickups.slice(0, 4).map((pickup) => (
                  <Link key={pickup.id} to={`/pickups/${pickup.id}`} className="recent-item">
                    <div className="recent-info">
                      <span className="recent-title">{pickup.trackingCode}</span>
                      <span className="recent-meta">{pickup.totalItems} items • {pickup.city}, {pickup.state}</span>
                    </div>
                    <span className={`badge badge-${getStatusBadge(pickup.status)}`}>
                      {pickup.status}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No pickups yet</p>
                <Link to="/pickups" className="btn btn-primary btn-sm mt-2">
                  Browse Available Pickups
                </Link>
              </div>
            )}
          </div>
        </div>

        <style>{recyclerStyles}</style>
      </div>
    );
  }

  // Default dashboard for INDIVIDUAL and BUSINESS users
  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]}!</h1>
          <p className="page-description">Here's your recycling overview</p>
        </div>
        <Link to="/packages/new" className="btn btn-primary">
          <Plus size={18} /> List Package
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 mb-6">
        <div className="stat-card">
          <div className="stat-icon packages">
            <Package size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Packages</span>
            <span className="stat-value">{totalPackages}</span>
            <span className="stat-sub">{listedPackages} available</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pickups">
            <Truck size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Pickups</span>
            <span className="stat-value">{completedPickups}</span>
            <span className="stat-sub">{pendingPickups} pending</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon rewards">
            <Gift size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Reward Points</span>
            <span className="stat-value">{rewards.availablePoints.toLocaleString()}</span>
            <span className="stat-sub">{rewards.level} member</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon impact">
            <Leaf size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">CO2 Saved</span>
            <span className="stat-value">{impact.co2Saved.toFixed(1)} kg</span>
            <span className="stat-sub">{impact.treesEquivalent.toFixed(1)} trees equiv.</span>
          </div>
        </div>
      </div>

      {/* Impact Overview */}
      <div className="grid grid-cols-3 mb-6">
        <div className="card impact-card">
          <div className="impact-icon co2">
            <TrendingUp size={32} />
          </div>
          <div className="impact-value">{impact.co2Saved.toFixed(1)} kg</div>
          <div className="impact-label">CO2 Emissions Prevented</div>
          <div className="impact-equiv">
            Equivalent to {(impact.co2Saved / 0.4).toFixed(0)} car miles
          </div>
        </div>

        <div className="card impact-card">
          <div className="impact-icon water">
            <Droplets size={32} />
          </div>
          <div className="impact-value">{impact.waterSaved.toFixed(0)} L</div>
          <div className="impact-label">Water Saved</div>
          <div className="impact-equiv">
            Equivalent to {(impact.waterSaved / 65).toFixed(0)} showers
          </div>
        </div>

        <div className="card impact-card">
          <div className="impact-icon trees">
            <TreePine size={32} />
          </div>
          <div className="impact-value">{impact.treesEquivalent.toFixed(1)}</div>
          <div className="impact-label">Trees Equivalent</div>
          <div className="impact-equiv">
            Based on annual CO2 absorption
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2">
        <div className="card">
          <h3 className="card-title">Quick Actions</h3>
          <div className="quick-actions">
            <Link to="/packages/new" className="action-item">
              <div className="action-icon">
                <Package size={20} />
              </div>
              <div className="action-info">
                <span className="action-title">List New Package</span>
                <span className="action-desc">Add packaging to recycle</span>
              </div>
              <ArrowRight size={18} />
            </Link>
            <Link to="/pickups/schedule" className="action-item">
              <div className="action-icon">
                <Truck size={20} />
              </div>
              <div className="action-info">
                <span className="action-title">Schedule Pickup</span>
                <span className="action-desc">Arrange collection</span>
              </div>
              <ArrowRight size={18} />
            </Link>
            <Link to="/rewards" className="action-item">
              <div className="action-icon">
                <Gift size={20} />
              </div>
              <div className="action-info">
                <span className="action-title">Redeem Rewards</span>
                <span className="action-desc">Use your points</span>
              </div>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card-header flex justify-between items-center">
            <h3 className="card-title">Recent Pickups</h3>
            <Link to="/pickups" className="text-sm text-primary">View all</Link>
          </div>
          {stats?.recentPickups?.length > 0 ? (
            <div className="recent-list">
              {stats.recentPickups.slice(0, 4).map((pickup) => (
                <Link key={pickup.id} to={`/pickups/${pickup.id}`} className="recent-item">
                  <div className="recent-info">
                    <span className="recent-title">{pickup.trackingCode}</span>
                    <span className="recent-meta">{pickup.totalItems} items</span>
                  </div>
                  <span className={`badge badge-${getStatusBadge(pickup.status)}`}>
                    {pickup.status}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No pickups yet</p>
              <Link to="/pickups/schedule" className="btn btn-primary btn-sm mt-2">
                Schedule First Pickup
              </Link>
            </div>
          )}
        </div>
      </div>

      <style>{userStyles}</style>
    </div>
  );
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

const recyclerStyles = `
  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
  }

  .stat-card {
    background: white;
    border-radius: 0.75rem;
    padding: 1.25rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .stat-icon.packages {
    background: rgba(59, 130, 246, 0.1);
    color: #3B82F6;
  }

  .stat-icon.pickups {
    background: rgba(245, 158, 11, 0.1);
    color: #F59E0B;
  }

  .stat-icon.rewards {
    background: rgba(168, 85, 247, 0.1);
    color: #A855F7;
  }

  .stat-icon.impact {
    background: rgba(16, 185, 129, 0.1);
    color: #10B981;
  }

  .stat-info {
    display: flex;
    flex-direction: column;
  }

  .stat-card .stat-label {
    font-size: 0.75rem;
    color: var(--gray-500);
  }

  .stat-card .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--gray-900);
  }

  .stat-sub {
    font-size: 0.75rem;
    color: var(--gray-400);
  }

  .quick-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .action-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border-radius: 0.5rem;
    text-decoration: none;
    color: var(--gray-900);
    transition: background 0.2s;
  }

  .action-item:hover {
    background: var(--gray-50);
  }

  .action-icon {
    width: 40px;
    height: 40px;
    background: var(--gray-100);
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--gray-600);
  }

  .action-info {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .action-title {
    font-weight: 500;
  }

  .action-desc {
    font-size: 0.75rem;
    color: var(--gray-500);
  }

  .recent-list {
    display: flex;
    flex-direction: column;
  }

  .recent-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.875rem 0;
    border-bottom: 1px solid var(--gray-100);
    text-decoration: none;
    color: var(--gray-900);
  }

  .recent-item:last-child {
    border-bottom: none;
  }

  .recent-info {
    display: flex;
    flex-direction: column;
  }

  .recent-title {
    font-weight: 500;
  }

  .recent-meta {
    font-size: 0.75rem;
    color: var(--gray-500);
  }
`;

const userStyles = `
  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
  }

        .stat-card {
          background: white;
          border-radius: 0.75rem;
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-icon.packages {
          background: rgba(59, 130, 246, 0.1);
          color: #3B82F6;
        }

        .stat-icon.pickups {
          background: rgba(245, 158, 11, 0.1);
          color: #F59E0B;
        }

        .stat-icon.rewards {
          background: rgba(168, 85, 247, 0.1);
          color: #A855F7;
        }

        .stat-icon.impact {
          background: rgba(16, 185, 129, 0.1);
          color: #10B981;
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-card .stat-label {
          font-size: 0.75rem;
          color: var(--gray-500);
        }

        .stat-card .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--gray-900);
        }

        .stat-sub {
          font-size: 0.75rem;
          color: var(--gray-400);
        }

        .impact-card {
          text-align: center;
          padding: 2rem;
        }

        .impact-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        }

        .impact-icon.co2 {
          background: rgba(16, 185, 129, 0.1);
          color: #10B981;
        }

        .impact-icon.water {
          background: rgba(59, 130, 246, 0.1);
          color: #3B82F6;
        }

        .impact-icon.trees {
          background: rgba(34, 197, 94, 0.1);
          color: #22C55E;
        }

        .impact-value {
          font-size: 2rem;
          font-weight: 800;
          color: var(--gray-900);
        }

        .impact-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--gray-600);
          margin-top: 0.25rem;
        }

        .impact-equiv {
          font-size: 0.75rem;
          color: var(--gray-400);
          margin-top: 0.5rem;
        }

        .quick-actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .action-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border-radius: 0.5rem;
          text-decoration: none;
          color: var(--gray-900);
          transition: background 0.2s;
        }

        .action-item:hover {
          background: var(--gray-50);
        }

        .action-icon {
          width: 40px;
          height: 40px;
          background: var(--gray-100);
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--gray-600);
        }

        .action-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .action-title {
          font-weight: 500;
        }

        .action-desc {
          font-size: 0.75rem;
          color: var(--gray-500);
        }

        .recent-list {
          display: flex;
          flex-direction: column;
        }

        .recent-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.875rem 0;
          border-bottom: 1px solid var(--gray-100);
          text-decoration: none;
          color: var(--gray-900);
        }

        .recent-item:last-child {
          border-bottom: none;
        }

        .recent-info {
          display: flex;
          flex-direction: column;
        }

        .recent-title {
          font-weight: 500;
        }

        .recent-meta {
          font-size: 0.75rem;
          color: var(--gray-500);
        }
`;

export default Dashboard;
