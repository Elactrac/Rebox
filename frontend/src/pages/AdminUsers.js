import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { 
  Search, Filter, ChevronLeft, ChevronRight,
  UserCheck, UserX, Shield, User, Building, Recycle,
  Calendar, Package, Award, Truck, Droplets, Leaf,
  TrendingUp, ArrowUpRight, ArrowDownRight, X
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [filters, setFilters] = useState({ role: '', search: '' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, filters]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getUsers({
        page: pagination.page,
        limit: pagination.limit,
        role: filters.role || undefined,
        search: filters.search || undefined
      });
      setUsers(response.data.data.users);
      setPagination(prev => ({ ...prev, ...response.data.data.pagination }));
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchUsers();
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminAPI.updateUser(userId, { role: newRole });
      toast.success('User role updated');
      fetchUsers();
      setShowModal(false);
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleVerifyToggle = async (userId, isVerified) => {
    try {
      await adminAPI.updateUser(userId, { isVerified: !isVerified });
      toast.success(`User ${!isVerified ? 'verified' : 'unverified'}`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const fetchUserDetails = async (userId) => {
    setLoadingDetails(true);
    try {
      const response = await adminAPI.getUserById(userId);
      setUserDetails(response.data.data);
    } catch (error) {
      toast.error('Failed to load user details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowModal(true);
    fetchUserDetails(user.id);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ADMIN': return <Shield size={16} className="role-icon admin" />;
      case 'BUSINESS': return <Building size={16} className="role-icon business" />;
      case 'RECYCLER': return <Recycle size={16} className="role-icon recycler" />;
      default: return <User size={16} className="role-icon individual" />;
    }
  };

  return (
    <div className="admin-users">
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        <p className="page-description">View and manage all platform users</p>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <form onSubmit={handleSearch} className="search-form">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>

        <div className="filter-group">
          <Filter size={18} />
          <select
            value={filters.role}
            onChange={(e) => {
              setFilters(prev => ({ ...prev, role: e.target.value }));
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
          >
            <option value="">All Roles</option>
            <option value="INDIVIDUAL">Individual</option>
            <option value="BUSINESS">Business</option>
            <option value="RECYCLER">Recycler</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Packages</th>
              <th>Points</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="loading-cell">
                  <div className="spinner"></div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-cell">No users found</td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="user-details">
                        <span className="user-name">{user.name}</span>
                        <span className="user-email">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`role-badge ${user.role.toLowerCase()}`}>
                      {getRoleIcon(user.role)}
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.isVerified ? 'verified' : 'unverified'}`}>
                      {user.isVerified ? <UserCheck size={14} /> : <UserX size={14} />}
                      {user.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td>{user._count?.packages || 0}</td>
                  <td>{user.rewards?.totalPoints || 0}</td>
                  <td>{format(new Date(user.createdAt), 'MMM d, yyyy')}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleViewDetails(user)}
                      >
                        View Details
                      </button>
                      <button
                        className={`btn btn-sm ${user.isVerified ? 'btn-warning' : 'btn-success'}`}
                        onClick={() => handleVerifyToggle(user.id, user.isVerified)}
                      >
                        {user.isVerified ? 'Unverify' : 'Verify'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-sm btn-secondary"
            disabled={pagination.page === 1}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
          >
            <ChevronLeft size={18} /> Previous
          </button>
          <span className="page-info">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            className="btn btn-sm btn-secondary"
            disabled={pagination.page === pagination.pages}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
          >
            Next <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="modal-overlay" onClick={() => {
          setShowModal(false);
          setUserDetails(null);
        }}>
          <div className="user-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>User Details</h2>
              <button 
                className="close-btn" 
                onClick={() => {
                  setShowModal(false);
                  setUserDetails(null);
                }}
              >
                <X size={24} />
              </button>
            </div>

            {loadingDetails ? (
              <div className="detail-loading">
                <div className="spinner"></div>
                <p>Loading user details...</p>
              </div>
            ) : userDetails ? (
              <div className="modal-content">
                {/* User Info Header */}
                <div className="user-info-header">
                  <div className="user-avatar large">
                    {userDetails.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info-text">
                    <h3>{userDetails.name}</h3>
                    <p>{userDetails.email}</p>
                    <div className="user-badges">
                      <span className={`role-badge ${userDetails.role.toLowerCase()}`}>
                        {getRoleIcon(userDetails.role)}
                        {userDetails.role}
                      </span>
                      <span className={`status-badge ${userDetails.isVerified ? 'verified' : 'unverified'}`}>
                        {userDetails.isVerified ? <UserCheck size={14} /> : <UserX size={14} />}
                        {userDetails.isVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="quick-stats">
                  <div className="quick-stat">
                    <Package size={20} />
                    <div>
                      <div className="stat-value">{userDetails._count?.packages || 0}</div>
                      <div className="stat-label">Packages</div>
                    </div>
                  </div>
                  <div className="quick-stat">
                    <Truck size={20} />
                    <div>
                      <div className="stat-value">{userDetails._count?.pickupsAsUser || 0}</div>
                      <div className="stat-label">Pickups</div>
                    </div>
                  </div>
                  <div className="quick-stat">
                    <Award size={20} />
                    <div>
                      <div className="stat-value">{userDetails.rewards?.totalPoints || 0}</div>
                      <div className="stat-label">Points</div>
                    </div>
                  </div>
                  <div className="quick-stat">
                    <TrendingUp size={20} />
                    <div>
                      <div className="stat-value">{userDetails._count?.transactions || 0}</div>
                      <div className="stat-label">Transactions</div>
                    </div>
                  </div>
                </div>

                {/* Environmental Impact */}
                {userDetails.impactStats && (
                  <div className="detail-section">
                    <h4>Environmental Impact</h4>
                    <div className="impact-stats">
                      <div className="impact-stat">
                        <Leaf className="impact-icon green" />
                        <div>
                          <div className="impact-value">{userDetails.impactStats.co2Saved?.toFixed(1) || 0} kg</div>
                          <div className="impact-label">CO2 Saved</div>
                        </div>
                      </div>
                      <div className="impact-stat">
                        <Droplets className="impact-icon blue" />
                        <div>
                          <div className="impact-value">{userDetails.impactStats.waterSaved?.toFixed(0) || 0} L</div>
                          <div className="impact-label">Water Saved</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Transactions */}
                {userDetails.transactions && userDetails.transactions.length > 0 && (
                  <div className="detail-section">
                    <h4>Recent Transactions ({userDetails._count?.transactions || 0} total)</h4>
                    <div className="transactions-list">
                      {userDetails.transactions.slice(0, 5).map(tx => (
                        <div key={tx.id} className="transaction-item">
                          <div className="transaction-icon">
                            {tx.type === 'EARN' ? (
                              <ArrowUpRight size={16} className="earn" />
                            ) : (
                              <ArrowDownRight size={16} className="spend" />
                            )}
                          </div>
                          <div className="transaction-details">
                            <div className="transaction-desc">{tx.description}</div>
                            <div className="transaction-date">{format(new Date(tx.createdAt), 'MMM d, yyyy h:mm a')}</div>
                          </div>
                          <div className={`transaction-amount ${tx.type.toLowerCase()}`}>
                            {tx.type === 'EARN' ? '+' : '-'}{tx.points} pts
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Packages */}
                {userDetails.packages && userDetails.packages.length > 0 && (
                  <div className="detail-section">
                    <h4>Recent Packages ({userDetails._count?.packages || 0} total)</h4>
                    <div className="items-list">
                      {userDetails.packages.slice(0, 3).map(pkg => (
                        <div key={pkg.id} className="list-item">
                          <Package size={16} />
                          <div className="item-info">
                            <div className="item-title">{pkg.type} - {pkg.material}</div>
                            <div className="item-meta">{format(new Date(pkg.createdAt), 'MMM d, yyyy')}</div>
                          </div>
                          <span className={`item-badge ${pkg.status.toLowerCase()}`}>
                            {pkg.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Pickups */}
                {userDetails.pickupsAsUser && userDetails.pickupsAsUser.length > 0 && (
                  <div className="detail-section">
                    <h4>Recent Pickups ({userDetails._count?.pickupsAsUser || 0} total)</h4>
                    <div className="items-list">
                      {userDetails.pickupsAsUser.slice(0, 3).map(pickup => (
                        <div key={pickup.id} className="list-item">
                          <Truck size={16} />
                          <div className="item-info">
                            <div className="item-title">Pickup #{pickup.trackingCode}</div>
                            <div className="item-meta">{format(new Date(pickup.scheduledDate), 'MMM d, yyyy')}</div>
                          </div>
                          <span className={`item-badge ${pickup.status.toLowerCase()}`}>
                            {pickup.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Account Management */}
                <div className="detail-section">
                  <h4>Account Management</h4>
                  <div className="form-group">
                    <label className="form-label">Change Role</label>
                    <select
                      className="form-input"
                      defaultValue={userDetails.role}
                      onChange={(e) => handleRoleChange(userDetails.id, e.target.value)}
                    >
                      <option value="INDIVIDUAL">Individual</option>
                      <option value="BUSINESS">Business</option>
                      <option value="RECYCLER">Recycler</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                  <div className="account-info">
                    <Calendar size={16} />
                    <span>Joined {format(new Date(userDetails.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="detail-error">
                <p>Failed to load user details</p>
              </div>
            )}

            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  setShowModal(false);
                  setUserDetails(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin-users {
          padding-bottom: 2rem;
        }

        .filters-bar {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .search-form {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
          background: white;
          border-radius: 0.5rem;
          padding: 0.5rem 1rem;
          border: 1px solid var(--gray-200);
        }

        .search-form input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 0.875rem;
        }

        .search-form svg {
          color: var(--gray-400);
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: white;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          border: 1px solid var(--gray-200);
        }

        .filter-group select {
          border: none;
          outline: none;
          font-size: 0.875rem;
          background: transparent;
        }

        .table-container {
          background: white;
          border-radius: 1rem;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th,
        .data-table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid var(--gray-100);
        }

        .data-table th {
          background: var(--gray-50);
          font-weight: 600;
          font-size: 0.75rem;
          text-transform: uppercase;
          color: var(--gray-500);
        }

        .loading-cell,
        .empty-cell {
          text-align: center !important;
          padding: 3rem !important;
          color: var(--gray-500);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }

        .user-avatar.large {
          width: 64px;
          height: 64px;
          font-size: 1.5rem;
        }

        .user-details {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-weight: 500;
          color: var(--gray-900);
        }

        .user-email {
          font-size: 0.75rem;
          color: var(--gray-500);
        }

        .role-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .role-badge.admin { background: #FEE2E2; color: #991B1B; }
        .role-badge.business { background: #DBEAFE; color: #1E40AF; }
        .role-badge.recycler { background: #D1FAE5; color: #065F46; }
        .role-badge.individual { background: #F3F4F6; color: #374151; }

        .role-icon.admin { color: #DC2626; }
        .role-icon.business { color: #2563EB; }
        .role-icon.recycler { color: #10B981; }
        .role-icon.individual { color: #6B7280; }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
        }

        .status-badge.verified { background: #D1FAE5; color: #065F46; }
        .status-badge.unverified { background: #FEE2E2; color: #991B1B; }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .btn-warning {
          background: #F59E0B;
          color: white;
        }

        .btn-success {
          background: #10B981;
          color: white;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .page-info {
          color: var(--gray-600);
          font-size: 0.875rem;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .user-detail-modal {
          background: white;
          border-radius: 1rem;
          width: 90%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid var(--gray-200);
          position: sticky;
          top: 0;
          background: white;
          z-index: 10;
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

        .detail-loading,
        .detail-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          gap: 1rem;
          color: var(--gray-500);
        }

        .modal-content {
          padding: 1.5rem;
          flex: 1;
        }

        .user-info-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding: 1.5rem;
          background: var(--gray-50);
          border-radius: 0.75rem;
        }

        .user-info-text h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .user-info-text p {
          font-size: 0.875rem;
          color: var(--gray-500);
          margin-bottom: 0.75rem;
        }

        .user-badges {
          display: flex;
          gap: 0.5rem;
        }

        .quick-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .quick-stat {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: white;
          border: 1px solid var(--gray-200);
          border-radius: 0.5rem;
          padding: 1rem;
        }

        .quick-stat svg {
          color: var(--primary);
        }

        .stat-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--gray-900);
        }

        .stat-label {
          font-size: 0.75rem;
          color: var(--gray-500);
        }

        .detail-section {
          margin-bottom: 1.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--gray-200);
        }

        .detail-section:last-of-type {
          border-bottom: none;
        }

        .detail-section h4 {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--gray-900);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 1rem;
        }

        .impact-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .impact-stat {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: var(--gray-50);
          padding: 1rem;
          border-radius: 0.5rem;
        }

        .impact-icon {
          width: 40px;
          height: 40px;
          min-width: 40px;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .impact-icon.green { color: #10B981; }
        .impact-icon.blue { color: #3B82F6; }

        .impact-value {
          font-size: 1rem;
          font-weight: 700;
          color: var(--gray-900);
        }

        .impact-label {
          font-size: 0.75rem;
          color: var(--gray-500);
        }

        .transactions-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .transaction-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: var(--gray-50);
          border-radius: 0.5rem;
        }

        .transaction-icon {
          width: 32px;
          height: 32px;
          min-width: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
        }

        .transaction-icon .earn { color: #10B981; }
        .transaction-icon .spend { color: #EF4444; }

        .transaction-details {
          flex: 1;
        }

        .transaction-desc {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--gray-900);
          margin-bottom: 0.125rem;
        }

        .transaction-date {
          font-size: 0.75rem;
          color: var(--gray-500);
        }

        .transaction-amount {
          font-weight: 600;
          font-size: 0.875rem;
        }

        .transaction-amount.earn { color: #10B981; }
        .transaction-amount.spend { color: #EF4444; }

        .items-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .list-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: var(--gray-50);
          border-radius: 0.5rem;
        }

        .list-item svg {
          color: var(--gray-400);
          min-width: 16px;
        }

        .item-info {
          flex: 1;
        }

        .item-title {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--gray-900);
          margin-bottom: 0.125rem;
        }

        .item-meta {
          font-size: 0.75rem;
          color: var(--gray-500);
        }

        .item-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.7rem;
          font-weight: 500;
          text-transform: uppercase;
        }

        .item-badge.available,
        .item-badge.confirmed,
        .item-badge.completed { 
          background: #D1FAE5; 
          color: #065F46; 
        }
        
        .item-badge.pending,
        .item-badge.in_transit { 
          background: #FEF3C7; 
          color: #92400E; 
        }
        
        .item-badge.sold { 
          background: #DBEAFE; 
          color: #1E40AF; 
        }
        
        .item-badge.cancelled,
        .item-badge.removed { 
          background: #FEE2E2; 
          color: #991B1B; 
        }

        .account-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1rem;
          font-size: 0.875rem;
          color: var(--gray-600);
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          padding: 1rem 1.5rem;
          border-top: 1px solid var(--gray-200);
          position: sticky;
          bottom: 0;
          background: white;
        }

        @media (max-width: 768px) {
          .quick-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .impact-stats {
            grid-template-columns: 1fr;
          }

          .user-info-header {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminUsers;
