import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationCenter from './NotificationCenter';
import {
  Package,
  Truck,
  Gift,
  Leaf,
  User,
  LogOut,
  Menu,
  X,
  ShoppingBag,
  LayoutDashboard,
  Shield,
  Users
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/packages', icon: Package, label: 'My Packages' },
    { path: '/pickups', icon: Truck, label: 'Pickups' },
    { path: '/rewards', icon: Gift, label: 'Rewards' },
    { path: '/impact', icon: Leaf, label: 'Impact' },
    { path: '/buyback', icon: ShoppingBag, label: 'Offers' },
  ];

  // Add marketplace for business users
  if (user?.role === 'BUSINESS' || user?.role === 'ADMIN') {
    navItems.splice(5, 0, { path: '/marketplace', icon: ShoppingBag, label: 'Marketplace' });
  }

  // Admin navigation items
  const adminNavItems = user?.role === 'ADMIN' ? [
    { path: '/admin', icon: Shield, label: 'Admin Dashboard' },
    { path: '/admin/users', icon: Users, label: 'User Management' },
  ] : [];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="layout">
      {/* Mobile header */}
      <header className="mobile-header">
        <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
          <Menu size={24} />
        </button>
        <Link to="/dashboard" className="logo">
          <Leaf className="logo-icon" />
          <span>ReBox</span>
        </Link>
        <div className="header-actions">
          <NotificationCenter />
          <Link to="/profile" className="profile-btn">
            <div className="avatar">{user?.name?.charAt(0)}</div>
          </Link>
        </div>
      </header>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/dashboard" className="logo">
            <Leaf className="logo-icon" />
            <span>ReBox</span>
          </Link>
          <div className="sidebar-header-actions">
            <NotificationCenter />
            <button className="close-btn" onClick={() => setSidebarOpen(false)}>
              <X size={24} />
            </button>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}

          {adminNavItems.length > 0 && (
            <>
              <div className="nav-divider">
                <span>Admin</span>
              </div>
              {adminNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-item admin ${isActive(item.path) ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <Link to="/profile" className="nav-item" onClick={() => setSidebarOpen(false)}>
            <User size={20} />
            <span>Profile</span>
          </Link>
          <button className="nav-item logout" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        {children}
      </main>

      <style>{`
        .layout {
          min-height: 100vh;
          display: flex;
        }

        .mobile-header {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 60px;
          background: white;
          border-bottom: 1px solid var(--gray-200);
          padding: 0 1rem;
          align-items: center;
          justify-content: space-between;
          z-index: 40;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .menu-btn,
        .close-btn {
          background: none;
          border: none;
          padding: 0.5rem;
          cursor: pointer;
          color: var(--gray-700);
        }

        .sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 45;
        }

        .sidebar {
          width: 260px;
          background: white;
          border-right: 1px solid var(--gray-200);
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          z-index: 50;
        }

        .sidebar-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--gray-200);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .sidebar-header-actions {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .sidebar-header .close-btn {
          display: none;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--gray-900);
        }

        .logo-icon {
          color: var(--primary);
        }

        .sidebar-nav {
          flex: 1;
          padding: 1rem 0;
          overflow-y: auto;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.5rem;
          color: var(--gray-600);
          font-size: 0.9375rem;
          font-weight: 500;
          transition: all 0.2s;
          text-decoration: none;
          border: none;
          background: none;
          width: 100%;
          cursor: pointer;
          text-align: left;
        }

        .nav-item:hover {
          color: var(--gray-900);
          background: var(--gray-50);
        }

        .nav-item.active {
          color: var(--primary);
          background: rgba(16, 185, 129, 0.1);
        }

        .nav-item.logout {
          color: var(--danger);
        }

        .nav-item.logout:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        .nav-divider {
          padding: 1rem 1.5rem 0.5rem;
          font-size: 0.75rem;
          text-transform: uppercase;
          color: var(--gray-400);
          font-weight: 600;
          letter-spacing: 0.05em;
        }

        .nav-item.admin {
          color: var(--gray-600);
        }

        .nav-item.admin.active {
          color: #DC2626;
          background: rgba(220, 38, 38, 0.1);
        }

        .sidebar-footer {
          border-top: 1px solid var(--gray-200);
          padding: 0.5rem 0;
        }

        .main-content {
          flex: 1;
          margin-left: 260px;
          padding: 2rem;
          min-height: 100vh;
        }

        .profile-btn {
          text-decoration: none;
        }

        .avatar {
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          background: var(--primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.875rem;
        }

        @media (max-width: 1024px) {
          .mobile-header {
            display: flex;
          }

          .sidebar {
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }

          .sidebar.open {
            transform: translateX(0);
          }

          .sidebar-header .close-btn {
            display: block;
          }

          .sidebar-overlay {
            display: block;
          }

          .main-content {
            margin-left: 0;
            padding-top: 76px;
          }
        }

        @media (max-width: 640px) {
          .main-content {
            padding: 1rem;
            padding-top: 76px;
          }
        }
      `}</style>
    </div>
  );
};

export default Layout;
