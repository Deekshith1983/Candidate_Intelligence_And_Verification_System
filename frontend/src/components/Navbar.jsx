// Navbar.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle body scroll locking when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      // Lock scroll
      document.documentElement.classList.add('scroll-locked');
      document.body.classList.add('scroll-locked');
    } else {
      // Unlock scroll
      document.documentElement.classList.remove('scroll-locked');
      document.body.classList.remove('scroll-locked');
    }

    // Cleanup on unmount
    return () => {
      document.documentElement.classList.remove('scroll-locked');
      document.body.classList.remove('scroll-locked');
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  const handleMobileMenuItemClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      <div
        className={`mobile-drawer ${mobileMenuOpen ? 'active' : ''}`}
        onClick={handleMobileMenuClose}
      >
        <div
          className="mobile-drawer-content"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mobile-drawer-menu">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/about"
                  className="nav-item"
                  onClick={handleMobileMenuItemClick}
                  style={{ color: 'var(--color-navbar-text)' }}
                >
                  About
                </Link>
                <Link
                  to="/login"
                  className="nav-item"
                  onClick={handleMobileMenuItemClick}
                  style={{ color: 'var(--color-navbar-text)' }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="nav-item"
                  onClick={handleMobileMenuItemClick}
                  style={{ color: 'var(--color-navbar-text)' }}
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  className="nav-item"
                  onClick={handleMobileMenuItemClick}
                  style={{ color: 'var(--color-navbar-text)' }}
                >
                  Dashboard
                </Link>

                {user?.role === 'recruiter' && (
                  <>
                    <Link
                      to="/recruiter/search"
                      className="nav-item"
                      onClick={handleMobileMenuItemClick}
                      style={{ color: 'var(--color-navbar-text)' }}
                    >
                      Search
                    </Link>
                    <Link
                      to="/recruiter/starred"
                      className="nav-item"
                      onClick={handleMobileMenuItemClick}
                      style={{ color: 'var(--color-navbar-text)' }}
                    >
                      Starred
                    </Link>
                  </>
                )}

                {user?.role === 'candidate' && (
                  <Link
                    to="/notifications"
                    className="nav-item"
                    onClick={handleMobileMenuItemClick}
                    style={{ color: 'var(--color-navbar-text)' }}
                  >
                    Notifications
                  </Link>
                )}

                <Link
                  to={user?.role === 'recruiter' ? '/recruiter/profile' : '/profile'}
                  className="nav-item"
                  onClick={handleMobileMenuItemClick}
                  style={{ color: 'var(--color-navbar-text)' }}
                >
                  Profile
                </Link>

                <button
                  onClick={handleLogout}
                  className="nav-item"
                  style={{ color: 'var(--color-navbar-text)' }}
                >
                  Log out
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav
        className="bg-primary-navy border-b border-slate-300 sticky top-0 z-50 shadow-soft"
        style={{
          backgroundColor: 'var(--color-navbar-bg)',
          borderBottomColor: 'var(--color-border)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 sm:h-20 flex items-center justify-between">
            {/* Logo */}
            <Link
              to="/"
              className="text-heading-3 font-bold flex-shrink-0 text-sm sm:text-base"
              style={{ color: 'var(--color-navbar-text)' }}
            >
              CredVerify
            </Link>

            {/* Desktop Navigation */}
            <div className="nav-desktop hidden md:flex items-center gap-1 sm:gap-2">
              {/* Public Navbar */}
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/about"
                    className="nav-item hover:text-primary-teal transition text-sm sm:text-base px-2 sm:px-4 py-2"
                    style={{ color: 'var(--color-navbar-text)' }}
                  >
                    About
                  </Link>

                  <Link
                    to="/login"
                    className="nav-item hover:text-primary-teal transition text-sm sm:text-base px-2 sm:px-4 py-2"
                    style={{ color: 'var(--color-navbar-text)' }}
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    className="px-4 sm:px-6 py-2 sm:py-2.5 bg-teal-500 text-white rounded-button font-semibold hover:bg-teal-600 transition text-xs sm:text-sm"
                  >
                    Register
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/dashboard"
                    className="nav-item hover:text-primary-teal transition text-sm sm:text-base px-2 sm:px-4 py-2"
                    style={{ color: 'var(--color-navbar-text)' }}
                  >
                    Dashboard
                  </Link>

                  {user?.role === 'recruiter' && (
                    <>
                      <Link
                        to="/recruiter/search"
                        className="nav-item hover:text-primary-teal transition text-sm sm:text-base px-2 sm:px-4 py-2"
                        style={{ color: 'var(--color-navbar-text)' }}
                      >
                        Search
                      </Link>

                      <Link
                        to="/recruiter/starred"
                        className="nav-item hover:text-primary-teal transition text-sm sm:text-base px-2 sm:px-4 py-2"
                        style={{ color: 'var(--color-navbar-text)' }}
                      >
                        Starred
                      </Link>
                    </>
                  )}

                  {user?.role === 'candidate' && (
                    <Link
                      to="/notifications"
                      className="nav-item hover:text-primary-teal transition text-sm sm:text-base px-2 sm:px-4 py-2"
                      style={{ color: 'var(--color-navbar-text)' }}
                    >
                      Notifications
                    </Link>
                  )}

                  <Link
                    to={
                      user?.role === 'recruiter'
                        ? '/recruiter/profile'
                        : '/profile'
                    }
                    className="nav-item hover:text-primary-teal transition text-sm sm:text-base px-2 sm:px-4 py-2"
                    style={{ color: 'var(--color-navbar-text)' }}
                  >
                    Profile
                  </Link>

                  {/* Circular Profile Avatar */}
                  <div
                    className="flex items-center justify-center w-9 sm:w-10 h-9 sm:h-10 rounded-full bg-teal-500 text-white font-semibold text-xs sm:text-sm cursor-pointer hover:bg-teal-600 transition flex-shrink-0 ml-2"
                    title={user?.username || 'User'}
                  >
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="nav-item hover:text-primary-teal transition text-sm sm:text-base px-2 sm:px-4 py-2"
                    style={{ color: 'var(--color-navbar-text)' }}
                  >
                    Log out
                  </button>
                </>
              )}
            </div>

            {/* Mobile Hamburger Menu */}
            <button
              className={`hamburger-menu md:hidden ${
                mobileMenuOpen ? 'active' : ''
              }`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};