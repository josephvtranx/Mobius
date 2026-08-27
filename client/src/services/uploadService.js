import api from './api';
import { profilePictureUrl } from '../lib/profilePictureUrl';

const uploadService = {
  // Upload profile picture
  uploadProfilePicture: async (file) => {
    const formData = new FormData();
    
    // If file is a blob (cropped image), use it directly
    if (file instanceof Blob) {
      formData.append('profilePicture', file, 'profile-picture.jpg');
    } else {
      formData.append('profilePicture', file);
    }

    try {
      const response = await api.post('/upload/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete profile picture
  deleteProfilePicture: async () => {
    try {
      const response = await api.delete('/upload/profile-picture');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get full URL for profile picture
  getProfilePictureUrl: (imageUrl) => profilePictureUrl(imageUrl, api.defaults.baseURL),
};

export default uploadService;
