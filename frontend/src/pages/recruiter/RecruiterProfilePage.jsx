import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { recruiterService } from '../../api/recruiterService';
import { Card, Button, Input } from '../../components/UI';
import { Footer } from '../../components/Footer';

/**
 * RecruiterProfilePage
 * Manage recruiter company profile
 */
const RecruiterProfilePage = () => {
  const { isAuthenticated, user } = useAuth();
  const [profile, setProfile] = useState({
    company_name: '',
    company_email: '',
    about_company: '',
    address: '',
    logo_url: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'recruiter') {
      loadProfile();
    }
  }, [isAuthenticated, user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await recruiterService.getProfile();
      const profileData = response?.data || response;

      setProfile({
        company_name: profileData?.company_name || '',
        company_email: profileData?.company_email || '',
        about_company: profileData?.about_company || '',
        address: profileData?.address || '',
        logo_url: profileData?.logo_url || null,
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      await recruiterService.updateProfile(profile);
      setSuccess(true);
      setIsEditing(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save profile:', err);
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'recruiter') {
    return (
      <div className="p-6">
        <p className="text-slate-600">Access denied. This page is for recruiters only.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-grow py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-dark">Company Profile</h1>
            <p className="text-slate-600 mt-2">Manage your recruiter information</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-2 bg-teal-500 text-white font-medium rounded-lg hover:bg-teal-600 transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">
            Profile updated successfully!
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <Card className="p-8">
            <div className="space-y-6 animate-pulse">
              {[...Array(4)].map((_, idx) => (
                <div key={idx}>
                  <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
                  <div className="h-10 bg-slate-200 rounded"></div>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <Card className="p-8">
            <div className="space-y-6">
              {/* Company Information */}
              <div>
                <h2 className="text-lg font-semibold text-blue-600 mb-4">
                  Company Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Company Name"
                    name="company_name"
                    value={profile.company_name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-slate-50 cursor-not-allowed' : ''}
                  />
                  <Input
                    label="Company Email"
                    name="company_email"
                    type="email"
                    value={profile.company_email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-slate-50 cursor-not-allowed' : ''}
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <Input
                  label="Company Address"
                  name="address"
                  value={profile.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-slate-50 cursor-not-allowed' : ''}
                />
              </div>

              {/* About Company */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  About the Company
                </label>
                <textarea
                  name="about_company"
                  value={profile.about_company}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows="4"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all resize-vertical ${
                    !isEditing ? 'bg-slate-50 cursor-not-allowed border-slate-200' : ''
                  }`}
                  placeholder="Tell us more about your company..."
                />
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 px-6 py-3 bg-teal-500 text-white font-medium rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      loadProfile();
                    }}
                    disabled={saving}
                    className="flex-1 px-6 py-3 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
      </div>
      <Footer />
    </div>
  );
};

export default RecruiterProfilePage;
