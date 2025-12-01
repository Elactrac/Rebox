import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { 
  Users, Package, Truck, TrendingUp, 
  Leaf, Droplets, Award,
  UserCheck, UserX, Clock, CheckCircle,
  Send, X, Database, Trash2, RefreshCw
} from 'lucide-react';
import { 
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastData, setBroadcastData] = useState({
    title: '',
    message: '',
    type: 'SYSTEM'
  });
  const [timelinePeriod, setTimelinePeriod] = useState('30d');
  const [timelineData, setTimelineData] = useState(null);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [cacheStats, setCacheStats] = useState(null);
  const [loadingCache, setLoadingCache] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchTimeline('30d');
    fetchCacheStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getStats();
      setStats(response.data.data);
    } catch (error) {
      toast.error('Failed to load admin stats');
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeline = async (period) => {
    setLoadingTimeline(true);
    try {
      const response = await adminAPI.getAnalyticsTimeline(period);
      setTimelineData(response.data.data);
      setTimelinePeriod(period);
    } catch (error) {
      toast.error('Failed to load timeline data');
    } finally {
      setLoadingTimeline(false);
    }
  };

  const fetchCacheStats = async () => {
    setLoadingCache(true);
    try {
      const response = await adminAPI.getCacheStats();
      setCacheStats(response.data.data);
    } catch (error) {
      toast.error('Failed to load cache stats');
    } finally {
      setLoadingCache(false);
    }
  };

  const handleClearCache = async () => {
    if (!window.confirm('Are you sure you want to clear all cache? This may temporarily slow down the application.')) {
      return;
    }

    setClearingCache(true);
    try {
      await adminAPI.clearCache();
      toast.success('Cache cleared successfully');
      await fetchCacheStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to clear cache');
    } finally {
      setClearingCache(false);
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    
    if (!broadcastData.title || !broadcastData.message) {
      toast.error('Please fill in all fields');
      return;
    }

    setBroadcasting(true);
    try {
      await adminAPI.sendBroadcast(broadcastData);
      toast.success('Broadcast sent to all users!');
      setShowBroadcast(false);
      setBroadcastData({ title: '', message: '', type: 'SYSTEM' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send broadcast');
    } finally {
      setBroadcasting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

  const userRoleData = stats?.users?.byRole ? 
    Object.entries(stats.users.byRole).map(([name, value]) => ({ name, value })) : [];

  const pickupStatusData = stats?.pickups?.byStatus ?
    Object.entries(stats.pickups.byStatus).map(([name, value]) => ({ name, value })) : [];

  const packageTypeData = stats?.packages?.byType?.map(item => ({
    name: item.type,
    count: item._count.id,
    value: item._sum.estimatedValue || 0
  })) || [];

  return (
    <div className="admin-dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-description">Platform overview and analytics</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowBroadcast(true)}
        >
          <Send size={18} />
          Send Broadcast
        </button>
      </div>

      {/* Broadcast Modal */}
      {showBroadcast && (
        <>
          <div className="modal-overlay" onClick={() => setShowBroadcast(false)} />
          <div className="broadcast-modal">
            <div className="modal-header">
              <h2>Send Broadcast Notification</h2>
              <button onClick={() => setShowBroadcast(false)} className="close-btn">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleBroadcast} className="modal-body">
              <div className="form-group">
                <label className="form-label">Notification Type</label>
                <select
                  className="form-input"
                  value={broadcastData.type}
                  onChange={(e) => setBroadcastData({ ...broadcastData, type: e.target.value })}
                >
                  <option value="SYSTEM">System Announcement</option>
                  <option value="PACKAGE">Package Update</option>
                  <option value="PICKUP">Pickup Update</option>
                  <option value="REWARD">Rewards & Points</option>
                  <option value="OFFER">Special Offer</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Platform Maintenance Scheduled"
                  value={broadcastData.title}
                  onChange={(e) => setBroadcastData({ ...broadcastData, title: e.target.value })}
                  maxLength={100}
                  required
                />
                <span className="char-count">{broadcastData.title.length}/100</span>
              </div>
              <div className="form-group">
                <label className="form-label">Message *</label>
                <textarea
                  className="form-input"
                  rows={5}
                  placeholder="Enter your message to all users..."
                  value={broadcastData.message}
                  onChange={(e) => setBroadcastData({ ...broadcastData, message: e.target.value })}
                  maxLength={500}
                  required
                />
                <span className="char-count">{broadcastData.message.length}/500</span>
              </div>
              <div className="broadcast-preview">
                <div className="preview-label">Preview:</div>
                <div className="notification-preview">
                  <div className="preview-title">{broadcastData.title || 'Notification Title'}</div>
                  <div className="preview-message">{broadcastData.message || 'Your message will appear here...'}</div>
                </div>
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowBroadcast(false)}
                  disabled={broadcasting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={broadcasting}
                >
                  {broadcasting ? 'Sending...' : `Send to ${stats?.overview?.totalUsers || 0} Users`}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Overview Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon users">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats?.overview?.totalUsers || 0}</h3>
            <p>Total Users</p>
            <span className="stat-change positive">
              +{stats?.overview?.recentSignups || 0} this week
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon packages">
            <Package size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats?.overview?.totalPackages || 0}</h3>
            <p>Total Packages</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pickups">
            <Truck size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats?.overview?.totalPickups || 0}</h3>
            <p>Total Pickups</p>
            <span className="stat-change positive">
              +{stats?.overview?.recentPickups || 0} this week
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h3>${(stats?.pickups?.completed?._sum?.totalValue || 0).toFixed(2)}</h3>
            <p>Total Value Processed</p>
          </div>
        </div>
      </div>

      {/* Environmental Impact */}
      <div className="section">
        <h2 className="section-title">Environmental Impact</h2>
        <div className="impact-grid">
          <div className="impact-card">
            <Leaf size={32} className="impact-icon green" />
            <div className="impact-value">{(stats?.impact?.co2Saved || 0).toFixed(1)} kg</div>
            <div className="impact-label">CO2 Saved</div>
          </div>
          <div className="impact-card">
            <Droplets size={32} className="impact-icon blue" />
            <div className="impact-value">{(stats?.impact?.waterSaved || 0).toFixed(0)} L</div>
            <div className="impact-label">Water Saved</div>
          </div>
          <div className="impact-card">
            <Package size={32} className="impact-icon orange" />
            <div className="impact-value">{(stats?.impact?.landfillDiverted || 0).toFixed(1)} kg</div>
            <div className="impact-label">Landfill Diverted</div>
          </div>
          <div className="impact-card">
            <Award size={32} className="impact-icon purple" />
            <div className="impact-value">{(stats?.rewards?.totalPointsIssued || 0).toLocaleString()}</div>
            <div className="impact-label">Points Issued</div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        {/* Users by Role */}
        <div className="chart-card">
          <h3>Users by Role</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={userRoleData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {userRoleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pickup Status */}
        <div className="chart-card">
          <h3>Pickup Status Distribution</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={pickupStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Packages by Type */}
        <div className="chart-card">
          <h3>Packages by Type</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={packageTypeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Count" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Analytics Timeline */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Analytics Timeline</h2>
          <div className="period-selector">
            <button 
              className={`period-btn ${timelinePeriod === '7d' ? 'active' : ''}`}
              onClick={() => fetchTimeline('7d')}
              disabled={loadingTimeline}
            >
              7 Days
            </button>
            <button 
              className={`period-btn ${timelinePeriod === '30d' ? 'active' : ''}`}
              onClick={() => fetchTimeline('30d')}
              disabled={loadingTimeline}
            >
              30 Days
            </button>
            <button 
              className={`period-btn ${timelinePeriod === '90d' ? 'active' : ''}`}
              onClick={() => fetchTimeline('90d')}
              disabled={loadingTimeline}
            >
              90 Days
            </button>
          </div>
        </div>

        {loadingTimeline ? (
          <div className="timeline-loading">
            <div className="spinner"></div>
            <span>Loading timeline data...</span>
          </div>
        ) : timelineData ? (
          <div className="timeline-chart card">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                />
                <Legend />
                <Bar dataKey="signups" name="New Signups" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pickups" name="Pickups" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completedPickups" name="Completed" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="timeline-error card">
            <p>Failed to load timeline data</p>
          </div>
        )}
      </div>

      {/* Pickup Stats */}
      <div className="section">
        <h2 className="section-title">Pickup Statistics</h2>
        <div className="pickup-stats-grid">
          <div className="pickup-stat">
            <Clock size={20} />
            <span className="label">Pending</span>
            <span className="value">{stats?.pickups?.byStatus?.PENDING || 0}</span>
          </div>
          <div className="pickup-stat">
            <UserCheck size={20} />
            <span className="label">Confirmed</span>
            <span className="value">{stats?.pickups?.byStatus?.CONFIRMED || 0}</span>
          </div>
          <div className="pickup-stat">
            <Truck size={20} />
            <span className="label">In Transit</span>
            <span className="value">{stats?.pickups?.byStatus?.IN_TRANSIT || 0}</span>
          </div>
          <div className="pickup-stat completed">
            <CheckCircle size={20} />
            <span className="label">Completed</span>
            <span className="value">{stats?.pickups?.byStatus?.COMPLETED || 0}</span>
          </div>
          <div className="pickup-stat cancelled">
            <UserX size={20} />
            <span className="label">Cancelled</span>
            <span className="value">{stats?.pickups?.byStatus?.CANCELLED || 0}</span>
          </div>
        </div>
      </div>

      {/* Cache Management */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Cache Management</h2>
          <div className="cache-actions">
            <button 
              className="btn btn-secondary"
              onClick={fetchCacheStats}
              disabled={loadingCache}
            >
              <RefreshCw size={16} className={loadingCache ? 'spinning' : ''} />
              Refresh Stats
            </button>
            <button 
              className="btn btn-danger"
              onClick={handleClearCache}
              disabled={clearingCache}
            >
              <Trash2 size={16} />
              {clearingCache ? 'Clearing...' : 'Clear Cache'}
            </button>
          </div>
        </div>

        {loadingCache ? (
          <div className="cache-loading card">
            <div className="spinner"></div>
            <span>Loading cache statistics...</span>
          </div>
        ) : cacheStats ? (
          <div className="cache-stats-grid">
            <div className="cache-stat-card">
              <div className="cache-icon">
                <Database size={24} />
              </div>
              <div className="cache-details">
                <div className="cache-label">Total Keys</div>
                <div className="cache-value">{cacheStats.keys || 0}</div>
              </div>
            </div>
            <div className="cache-stat-card">
              <div className="cache-icon hits">
                <CheckCircle size={24} />
              </div>
              <div className="cache-details">
                <div className="cache-label">Cache Hits</div>
                <div className="cache-value">{cacheStats.hits || 0}</div>
              </div>
            </div>
            <div className="cache-stat-card">
              <div className="cache-icon misses">
                <X size={24} />
              </div>
              <div className="cache-details">
                <div className="cache-label">Cache Misses</div>
                <div className="cache-value">{cacheStats.misses || 0}</div>
              </div>
            </div>
            <div className="cache-stat-card">
              <div className="cache-icon ratio">
                <TrendingUp size={24} />
              </div>
              <div className="cache-details">
                <div className="cache-label">Hit Rate</div>
                <div className="cache-value">
                  {cacheStats.hits || cacheStats.misses 
                    ? ((cacheStats.hits / (cacheStats.hits + cacheStats.misses)) * 100).toFixed(1) 
                    : 0}%
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="cache-error card">
            <p>Failed to load cache statistics</p>
          </div>
        )}

        {cacheStats?.keysByPrefix && Object.keys(cacheStats.keysByPrefix).length > 0 && (
          <div className="cache-breakdown card">
            <h3>Cache Keys by Type</h3>
            <div className="cache-breakdown-list">
              {Object.entries(cacheStats.keysByPrefix).map(([prefix, count]) => (
                <div key={prefix} className="cache-breakdown-item">
                  <span className="prefix-label">{prefix || 'other'}</span>
                  <span className="prefix-count">{count} keys</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .admin-dashboard {
          padding-bottom: 2rem;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 1rem;
          color: var(--gray-500);
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999;
        }

        .broadcast-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          border-radius: 1rem;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          z-index: 1000;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid var(--gray-200);
        }

        .modal-header h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--gray-900);
        }

        .close-btn {
          background: none;
          border: none;
          color: var(--gray-500);
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 0.375rem;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: var(--gray-100);
          color: var(--gray-900);
        }

        .modal-body {
          padding: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
          position: relative;
        }

        .char-count {
          position: absolute;
          right: 0;
          top: 0;
          font-size: 0.75rem;
          color: var(--gray-400);
        }

        .broadcast-preview {
          background: var(--gray-50);
          border-radius: 0.5rem;
          padding: 1rem;
          margin-bottom: 1.5rem;
        }

        .preview-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--gray-500);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }

        .notification-preview {
          background: white;
          border-radius: 0.5rem;
          padding: 1rem;
          border-left: 3px solid var(--primary);
        }

        .preview-title {
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--gray-900);
          margin-bottom: 0.25rem;
        }

        .preview-message {
          font-size: 0.8125rem;
          color: var(--gray-600);
          line-height: 1.5;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          border-radius: 1rem;
          padding: 1.5rem;
          display: flex;
          align-items: flex-start;
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
          color: white;
        }

        .stat-icon.users { background: linear-gradient(135deg, #3B82F6, #1D4ED8); }
        .stat-icon.packages { background: linear-gradient(135deg, #10B981, #059669); }
        .stat-icon.pickups { background: linear-gradient(135deg, #F59E0B, #D97706); }
        .stat-icon.revenue { background: linear-gradient(135deg, #8B5CF6, #7C3AED); }

        .stat-content h3 {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: 0.25rem;
        }

        .stat-content p {
          color: var(--gray-500);
          font-size: 0.875rem;
        }

        .stat-change {
          font-size: 0.75rem;
          font-weight: 500;
        }

        .stat-change.positive { color: var(--primary); }

        .section {
          margin-bottom: 2rem;
        }

        .section-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: 1rem;
        }

        .impact-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }

        .impact-card {
          background: white;
          border-radius: 1rem;
          padding: 1.5rem;
          text-align: center;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .impact-icon {
          margin-bottom: 0.75rem;
        }

        .impact-icon.green { color: #10B981; }
        .impact-icon.blue { color: #3B82F6; }
        .impact-icon.orange { color: #F59E0B; }
        .impact-icon.purple { color: #8B5CF6; }

        .impact-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--gray-900);
        }

        .impact-label {
          font-size: 0.875rem;
          color: var(--gray-500);
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .chart-card {
          background: white;
          border-radius: 1rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .chart-card h3 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: 1rem;
        }

        .chart-container {
          height: 250px;
        }

        .pickup-stats-grid {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .pickup-stat {
          background: white;
          border-radius: 0.75rem;
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          flex: 1;
          min-width: 150px;
        }

        .pickup-stat svg {
          color: var(--gray-400);
        }

        .pickup-stat .label {
          color: var(--gray-600);
          font-size: 0.875rem;
        }

        .pickup-stat .value {
          font-weight: 700;
          color: var(--gray-900);
          margin-left: auto;
          font-size: 1.25rem;
        }

        .pickup-stat.completed svg { color: var(--primary); }
        .pickup-stat.cancelled svg { color: var(--danger); }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .cache-actions {
          display: flex;
          gap: 0.75rem;
        }

        .cache-loading,
        .cache-error {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 2rem;
          color: var(--gray-500);
        }

        .cache-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .cache-stat-card {
          background: white;
          border-radius: 1rem;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .cache-icon {
          width: 48px;
          height: 48px;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #6366F1, #4F46E5);
          color: white;
        }

        .cache-icon.hits {
          background: linear-gradient(135deg, #10B981, #059669);
        }

        .cache-icon.misses {
          background: linear-gradient(135deg, #EF4444, #DC2626);
        }

        .cache-icon.ratio {
          background: linear-gradient(135deg, #F59E0B, #D97706);
        }

        .cache-details {
          flex: 1;
        }

        .cache-label {
          font-size: 0.875rem;
          color: var(--gray-500);
          margin-bottom: 0.25rem;
        }

        .cache-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--gray-900);
        }

        .cache-breakdown {
          background: white;
          border-radius: 1rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .cache-breakdown h3 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: 1rem;
        }

        .cache-breakdown-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .cache-breakdown-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background: var(--gray-50);
          border-radius: 0.5rem;
        }

        .prefix-label {
          font-weight: 500;
          color: var(--gray-700);
          font-family: 'Courier New', monospace;
        }

        .prefix-count {
          font-size: 0.875rem;
          color: var(--gray-500);
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 1200px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .charts-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .impact-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .stats-grid,
          .charts-grid,
          .impact-grid,
          .cache-stats-grid {
            grid-template-columns: 1fr;
          }

          .page-header,
          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .cache-actions {
            width: 100%;
          }

          .cache-actions button {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
