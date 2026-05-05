// Navbar.jsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-primary-navy border-b border-slate-300 sticky top-0 z-50 shadow-soft" style={{ backgroundColor: 'var(--color-navbar-bg)', borderBottomColor: 'var(--color-border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-heading-3 font-bold flex-shrink-0" style={{ color: 'var(--color-navbar-text)' }}>
            CredVerify
          </Link>

          {/* Public Navbar */}
          {!isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/about"
                className="nav-item hover:text-primary-teal transition"
                style={{ color: 'var(--color-navbar-text)' }}
              >
                About
              </Link>

              <Link
                to="/login"
                className="nav-item hover:text-primary-teal transition"
                style={{ color: 'var(--color-navbar-text)' }}
              >
                Login
              </Link>

              <Link
                to="/register"
                className="px-6 py-2.5 bg-primary-teal text-white-primary rounded-button font-semibold hover:bg-teal-600 transition text-navbar"
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-2 flex-1">
              {/* All Authenticated Navigation Items */}
              <Link
                to="/dashboard"
                className="nav-item hover:text-primary-teal transition"
                style={{ color: 'var(--color-navbar-text)' }}
              >
                Dashboard
              </Link>

              {user?.role === 'recruiter' && (
                <>
                  <Link
                    to="/recruiter/search"
                    className="nav-item hover:text-primary-teal transition"
                    style={{ color: 'var(--color-navbar-text)' }}
                  >
                    Search
                  </Link>

                  <Link
                    to="/recruiter/starred"
                    className="nav-item hover:text-primary-teal transition"
                    style={{ color: 'var(--color-navbar-text)' }}
                  >
                    Starred
                  </Link>
                </>
              )}

              {user?.role === 'candidate' && (
                <Link
                  to="/notifications"
                  className="nav-item hover:text-primary-teal transition"
                  style={{ color: 'var(--color-navbar-text)' }}
                >
                  Notifications
                </Link>
              )}

              <Link
                to={user?.role === 'recruiter' ? '/recruiter/profile' : '/profile'}
                className="nav-item hover:text-primary-teal transition"
                style={{ color: 'var(--color-navbar-text)' }}
              >
                Profile
              </Link>

              {/* Circular Profile Avatar */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-teal text-white-primary font-semibold text-sm cursor-pointer hover:bg-teal-600 transition flex-shrink-0">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="nav-item hover:text-primary-teal transition"
                style={{ color: 'var(--color-navbar-text)' }}
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};