import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout
import Layout from './components/common/Layout';

// Eager load critical pages (public + first view after login)
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

// Lazy load secondary pages to reduce initial bundle size
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const OAuthCallback = lazy(() => import('./pages/OAuthCallback'));
const TrackPickup = lazy(() => import('./pages/TrackPickup'));
const Packages = lazy(() => import('./pages/Packages'));
const PackageDetail = lazy(() => import('./pages/PackageDetail'));
const NewPackage = lazy(() => import('./pages/NewPackage'));
const Pickups = lazy(() => import('./pages/Pickups'));
const SchedulePickup = lazy(() => import('./pages/SchedulePickup'));
const PickupDetail = lazy(() => import('./pages/PickupDetail'));
const Rewards = lazy(() => import('./pages/Rewards'));
const Impact = lazy(() => import('./pages/Impact'));
const Profile = lazy(() => import('./pages/Profile'));
const Marketplace = lazy(() => import('./pages/Marketplace'));
const BuybackOffers = lazy(() => import('./pages/BuybackOffers'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));

// Footer pages
const AboutUs = lazy(() => import('./pages/AboutUs'));
const Careers = lazy(() => import('./pages/Careers'));
const Press = lazy(() => import('./pages/Press'));
const FAQ = lazy(() => import('./pages/FAQ'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const HelpCenter = lazy(() => import('./pages/HelpCenter'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="spinner"></div>
  </div>
);

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
    <Suspense fallback={<PageLoader />}>
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
        
        {/* Footer pages - public */}
        <Route path="/about" element={<AboutUs />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/press" element={<Press />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />

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
    </Suspense>
  );
}

export default App;
