import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { PrivateRoute, PublicRoute } from './components/PrivateRoute';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { GitHubCallbackPage } from './pages/GitHubCallbackPage';
import CandidateProfilePage from './pages/candidate/ProfilePageNew';
import CandidateDashboardPage from './pages/candidate/CandidateDashboardPage';
import RecruiterDashboardPage from './pages/recruiter/RecruiterDashboardPage';
import TalentSearchPage from './pages/recruiter/TalentSearchPage';
import StarredCandidatesPage from './pages/recruiter/StarredCandidatesPage';
import RecruiterProfilePage from './pages/recruiter/RecruiterProfilePage';
import RecruiterCandidateViewPage from './pages/recruiter/RecruiterCandidateViewPage';
import NotificationsPage from './pages/NotificationsPage';
import PublicProfilePage from './pages/PublicProfilePage';

function AppContent() {
  const location = useLocation();
  // Check if current route is a public profile share (no navbar needed)
  const isPublicProfileShare = location.pathname.startsWith('/profile/share/');

  return (
    <>
      {/* Only show navbar for non-public routes */}
      {!isPublicProfileShare && <Navbar />}

      {/* Main content - with padding only for routes that have navbar */}
      <main 
        className={isPublicProfileShare ? '' : 'min-h-[calc(100vh-64px)]'} 
        style={isPublicProfileShare ? {} : { backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)' }}
      >
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <HomePage />
              </PublicRoute>
            }
          />

          {/* ADD THIS ABOUT ROUTE */}
          <Route
            path="/about"
            element={
              <PublicRoute>
                <AboutPage />
              </PublicRoute>
            }
          />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          <Route
            path="/auth/github/callback"
            element={<GitHubCallbackPage />}
          />

          {/* Public Profile Share Route (No authentication required) */}
          <Route
            path="/profile/share/:shareId"
            element={<PublicProfilePage />}
          />

          {/* Protected Routes - Role-Based Dashboard Redirect */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardRedirect />
              </PrivateRoute>
            }
          />

          {/* Candidate Routes */}
          <Route
            path="/candidate/dashboard"
            element={
              <PrivateRoute requiredRole="candidate">
                <CandidateDashboardPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/candidate/profile"
            element={
              <PrivateRoute requiredRole="candidate">
                <CandidateProfilePage />
              </PrivateRoute>
            }
          />

          {/* Recruiter Routes */}
          <Route
            path="/recruiter/dashboard"
            element={
              <PrivateRoute requiredRole="recruiter">
                <RecruiterDashboardPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/recruiter/search"
            element={
              <PrivateRoute requiredRole="recruiter">
                <TalentSearchPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/recruiter/starred"
            element={
              <PrivateRoute requiredRole="recruiter">
                <StarredCandidatesPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/recruiter/profile"
            element={
              <PrivateRoute requiredRole="recruiter">
                <RecruiterProfilePage />
              </PrivateRoute>
            }
          />

          <Route
            path="/recruiter/candidate/:candidateId"
            element={
              <PrivateRoute requiredRole="recruiter">
                <RecruiterCandidateViewPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <CandidateProfilePage />
              </PrivateRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <PrivateRoute requiredRole="candidate">
                <NotificationsPage />
              </PrivateRoute>
            }
          />

          {/* 404 Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

// Main App component wrapper with Router
function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppContent />
    </Router>
  );
}

// Helper component to redirect to role-based dashboard
function DashboardRedirect() {
  const { user } = useAuth();
  
  if (user?.role === 'recruiter') {
    return <Navigate to="/recruiter/dashboard" replace />;
  } else if (user?.role === 'candidate') {
    return <Navigate to="/candidate/dashboard" replace />;
  }
  
  return <DashboardPage />;
}

export default App;