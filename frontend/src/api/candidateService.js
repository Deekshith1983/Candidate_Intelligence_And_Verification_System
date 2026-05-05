/**
 * Candidate-related API functions
 */

import axiosInstance from './axios';

export const candidateService = {
  // GET /api/candidate/profile
  getProfile: async () => {
    try {
      const response = await axiosInstance.get('/api/candidate/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // PUT /api/candidate/profile
  updateProfile: async (profileData) => {
    try {
      const response = await axiosInstance.put('/api/candidate/profile', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // GET /api/candidate/resume
  getResume: async () => {
    try {
      const response = await axiosInstance.get('/api/candidate/resume');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // POST /api/candidate/resume
  uploadResume: async (file) => {
    try {
      const formData = new FormData();
      formData.append('resume', file);
      // Don't set Content-Type header - let axios/browser handle it with correct boundary
      const response = await axiosInstance.post('/api/candidate/resume', formData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // GET /api/projects - Get all projects for candidate
  getProjects: async () => {
    try {
      const response = await axiosInstance.get('/api/projects');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // POST /api/projects - Create new project
  createProject: async (projectData) => {
    try {
      const response = await axiosInstance.post('/api/projects', projectData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // PUT /api/projects/:id - Update project
  updateProject: async (projectId, projectData) => {
    try {
      const response = await axiosInstance.put(
        `/api/projects/${projectId}`,
        projectData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // DELETE /api/projects/:id - Delete project
  deleteProject: async (projectId) => {
    try {
      const response = await axiosInstance.delete(`/api/projects/${projectId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // GET /api/candidate/resume-score - Get resume ATS score
  getResumeScore: async () => {
    try {
      const response = await axiosInstance.get('/api/candidate/resume-score');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // GET /api/candidate/score
  getScoreCard: async () => {
    try {
      const response = await axiosInstance.get('/api/candidate/score');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // POST /api/candidate/github/verify - Verify GitHub connection
  verifyGithub: async () => {
    try {
      const response = await axiosInstance.post('/api/candidate/github/verify');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // GET /api/auth/github - Initiate GitHub OAuth
  initiateGithubAuth: async () => {
    try {
      const response = await axiosInstance.get('/api/auth/github');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // GET /api/notifications - Get all notifications
  getNotifications: async () => {
    try {
      const response = await axiosInstance.get('/api/notifications');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // PUT /api/notifications/:id/read - Mark notification as read
  markNotificationRead: async (notificationId) => {
    try {
      const response = await axiosInstance.put(`/api/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // PUT /api/notifications/read-all - Mark all notifications as read
  markAllNotificationsRead: async () => {
    try {
      const response = await axiosInstance.put('/api/notifications/read-all');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // POST /api/candidate/share - Generate shareable link
  generateShareLink: async () => {
    try {
      const response = await axiosInstance.post('/api/candidate/share');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // GET /api/candidate/share - Get share status
  getShareStatus: async () => {
    try {
      const response = await axiosInstance.get('/api/candidate/share');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
