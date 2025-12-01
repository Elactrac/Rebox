import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout
import Layout from './components/common/Layout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import OAuthCallback from './pages/OAuthCallback';
import TrackPickup from './pages/TrackPickup';
import Dashboard from './pages/Dashboard';
import Packages from './pages/Packages';
import PackageDetail from './pages/PackageDetail';
import NewPackage from './pages/NewPackage';
import Pickups from './pages/Pickups';
import SchedulePickup from './pages/SchedulePickup';
import PickupDetail from './pages/PickupDetail';
import Rewards from './pages/Rewards';
import Impact from './pages/Impact';
import Profile from './pages/Profile';
import Marketplace from './pages/Marketplace';
import BuybackOffers from './pages/BuybackOffers';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';

// Protected Route component
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/oauth/callback/google" element={<OAuthCallback />} />
      <Route path="/track" element={<TrackPickup />} />

      {/* Protected routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout><Dashboard /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/packages" element={
        <ProtectedRoute>
          <Layout><Packages /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/packages/new" element={
        <ProtectedRoute>
          <Layout><NewPackage /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/packages/:id" element={
        <ProtectedRoute>
          <Layout><PackageDetail /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/pickups" element={
        <ProtectedRoute>
          <Layout><Pickups /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/pickups/schedule" element={
        <ProtectedRoute>
          <Layout><SchedulePickup /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/pickups/:id" element={
        <ProtectedRoute>
          <Layout><PickupDetail /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/rewards" element={
        <ProtectedRoute>
          <Layout><Rewards /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/impact" element={
        <ProtectedRoute>
          <Layout><Impact /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <Layout><Profile /></Layout>
        </ProtectedRoute>
      } />

      {/* Business routes */}
      <Route path="/marketplace" element={
        <ProtectedRoute roles={['BUSINESS', 'ADMIN']}>
          <Layout><Marketplace /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/buyback" element={
        <ProtectedRoute>
          <Layout><BuybackOffers /></Layout>
        </ProtectedRoute>
      } />

      {/* Admin routes */}
      <Route path="/admin" element={
        <ProtectedRoute roles={['ADMIN']}>
          <Layout><AdminDashboard /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin/users" element={
        <ProtectedRoute roles={['ADMIN']}>
          <Layout><AdminUsers /></Layout>
        </ProtectedRoute>
      } />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
