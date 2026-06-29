import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuth } from './hooks/useAuth';
import { motion } from 'framer-motion';
import { Building } from 'lucide-react';

const Landing = React.lazy(() => import('./pages/Landing'));
const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));
const GuestSearch = React.lazy(() => import('./pages/GuestSearch'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const PublicProperty = React.lazy(() => import('./pages/PublicProperty'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <PageLoader />;
  return user ? children : <Navigate to="/login" state={{ from: location }} replace />;
};

const PageLoader = () => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
    <motion.div
      animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"
    >
      <Building className="w-8 h-8" />
    </motion.div>
    <p className="text-muted-foreground font-medium animate-pulse">Loading Mezenga...</p>
  </div>
);

function App() {
  return (
    <Router>
      <Toaster position="top-right" richColors />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/guest" element={<GuestSearch />} />
          <Route path="/p/:slug" element={<PublicProperty />} />
          <Route path="/admin" element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          } />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-background">
              <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold">404</h1>
                <p className="text-muted-foreground">Page not found</p>
                <a href="/" className="text-primary hover:underline">Go back home</a>
              </div>
            </div>
          } />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
