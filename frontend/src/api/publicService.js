/**
 * Public Profile API functions
 * No authentication required
 */

import axios from 'axios';

// Use Vite's import.meta.env for environment variables
const API_BASE_URL = import.meta?.env?.VITE_API_URL || 'http://localhost:5000';

const publicAPI = axios.create({
  baseURL: API_BASE_URL
});

export const publicService = {
  // GET /api/public/profile/:shareId
  getPublicProfile: async (shareId) => {
    try {
      const response = await publicAPI.get(`/api/public/profile/${shareId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};
