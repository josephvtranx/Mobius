import api from './api.js';

const timePackageService = {
  // Get all time packages
  getAllTimePackages: async () => {
    try {
      const response = await api.get('/time-packages');
      return response.data;
    } catch (error) {
      console.error('Error fetching time packages:', error);
      throw error;
    }
  },

  // Get time package by ID
  getTimePackageById: async (id) => {
    try {
      const response = await api.get(`/time-packages/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching time package:', error);
      throw error;
    }
  },

  // Create new time package
  createTimePackage: async (timePackageData) => {
    try {
      const response = await api.post('/time-packages', timePackageData);
      return response.data;
    } catch (error) {
      console.error('Error creating time package:', error);
      throw error;
    }
  },

  // Update time package
  updateTimePackage: async (id, timePackageData) => {
    try {
      const response = await api.put(`/time-packages/${id}`, timePackageData);
      return response.data;
    } catch (error) {
      console.error('Error updating time package:', error);
      throw error;
    }
  },

  // Delete time package
  deleteTimePackage: async (id) => {
    try {
      const response = await api.delete(`/time-packages/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting time package:', error);
      throw error;
    }
  }
};

export default timePackageService; 