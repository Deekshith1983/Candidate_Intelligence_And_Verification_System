import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../api/authService';
import { Footer } from '../components/Footer';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, setAuthError, error } = useAuth();
  const [loading, setLoading] = useState(false);

  // auto-select role from landing page buttons
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') || 'candidate';

  const [role, setRole] = useState(defaultRole);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setAuthError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register(
        formData.name,
        formData.email,
        formData.password,
        role
      );

      register(response.user, response.token);

      // role based redirect - direct to dashboard, not profile
      const dashboardRoute =
        response.user.role === 'candidate'
          ? '/candidate/dashboard'
          : '/recruiter/dashboard';

      navigate(dashboardRoute);
    } catch (err) {
      setAuthError(
        err.message || 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-grey-mild flex flex-col">
      <div className="flex-grow flex items-center justify-center px-3 sm:px-4 py-8 sm:py-12">
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md">
          {/* Card */}
          <div className="bg-white-primary border border-slate-300 rounded-card p-4 sm:p-6 md:p-8 shadow-soft">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="heading-2 text-primary-navy mb-2 sm:mb-3 text-xl sm:text-2xl">
                Create your account
              </h1>

              <p className="text-xs sm:text-sm text-slate-grey">
                Already have one?{' '}
                <Link
                  to="/login"
                  className="text-primary-teal font-bold hover:underline"
                >
                  Log in
                </Link>
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-button border border-status-error bg-status-error">
                <p className="text-xs sm:text-sm text-status-error-text">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-300 rounded-input text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-teal focus:border-transparent"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-300 rounded-input text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-teal focus:border-transparent"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-300 rounded-input text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-teal focus:border-transparent"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-300 rounded-input text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-teal focus:border-transparent"
                />
              </div>

              {/* Role Selection */}
              <div className="pt-1 sm:pt-2">
                <p className="text-primary-navy font-bold mb-3 sm:mb-4 text-xs sm:text-sm">
                  I am a
                </p>

                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  {/* Candidate */}
                  <button
                    type="button"
                    onClick={() => setRole('candidate')}
                    className={`py-2 sm:py-2.5 rounded-button border font-semibold text-xs sm:text-sm transition ${
                      role === 'candidate'
                        ? 'border-primary-teal bg-teal-light text-primary-navy'
                        : 'border-slate-300 bg-white-primary text-primary-navy'
                    }`}
                  >
                    Candidate
                  </button>

                  {/* Recruiter */}
                  <button
                    type="button"
                    onClick={() => setRole('recruiter')}
                    className={`py-2 sm:py-2.5 rounded-button border font-semibold text-xs sm:text-sm transition ${
                      role === 'recruiter'
                        ? 'border-primary-teal bg-teal-light text-primary-navy'
                        : 'border-slate-300 bg-white-primary text-primary-navy'
                    }`}
                  >
                    Recruiter
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 sm:mt-4 py-2 sm:py-2.5 bg-primary-teal text-white-primary rounded-button font-semibold text-xs sm:text-sm hover:bg-teal-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};