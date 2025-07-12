import React, { useState, useRef } from 'react';
import uploadService from '../services/uploadService';
import authService from '../services/authService';
import ImageCropper from './ImageCropper';
import './ProfilePictureUpload.css';

const ProfilePictureUpload = ({ onUploadSuccess, currentUser }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCropper, setShowCropper] = useState(false);
  const [originalImageUrl, setOriginalImageUrl] = useState(null);
  const fileInputRef = useRef(null);

  // Get current profile picture URL
  const currentProfilePic = currentUser?.profile_pic_url;
  const displayImageUrl = previewUrl || (currentProfilePic ? uploadService.getProfilePictureUrl(currentProfilePic) : null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, or GIF)');
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    setError('');
    setSuccess('');

    // Create preview and show cropper
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImageUrl(e.target.result);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile && !previewUrl) {
      setError('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    setError('');
    setSuccess('');

    try {
      let fileToUpload = selectedFile;
      
      // If we have a preview URL (cropped image), convert it to a blob
      if (previewUrl && previewUrl.startsWith('blob:')) {
        const response = await fetch(previewUrl);
        fileToUpload = await response.blob();
      }

      const result = await uploadService.uploadProfilePicture(fileToUpload);
      
      setSuccess('Profile picture uploaded successfully!');
      setSelectedFile(null);
      setPreviewUrl(null);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Call parent callback if provided
      if (onUploadSuccess) {
        onUploadSuccess(result.imageUrl);
      }

      // Update current user in auth service
      const updatedUser = { ...currentUser, profile_pic_url: result.imageUrl };
      authService.setCurrentUser(updatedUser);

      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('profile-updated'));

    } catch (error) {
      setError(error.message || 'Failed to upload profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentProfilePic) {
      setError('No profile picture to delete');
      return;
    }

    setIsUploading(true);
    setError('');
    setSuccess('');

    try {
      await uploadService.deleteProfilePicture();
      
      setSuccess('Profile picture deleted successfully!');
      setPreviewUrl(null);

      // Call parent callback if provided
      if (onUploadSuccess) {
        onUploadSuccess(null);
      }

      // Update current user in auth service
      const updatedUser = { ...currentUser, profile_pic_url: null };
      authService.setCurrentUser(updatedUser);

      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('profile-updated'));

    } catch (error) {
      setError(error.message || 'Failed to delete profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setOriginalImageUrl(null);
    setShowCropper(false);
    setError('');
    setSuccess('');
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropComplete = (croppedImageUrl) => {
    setPreviewUrl(croppedImageUrl);
    setShowCropper(false);
    setOriginalImageUrl(null);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setOriginalImageUrl(null);
    setSelectedFile(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="profile-picture-upload">
      
      {/* Image Cropper Modal */}
      {showCropper && originalImageUrl && (
        <ImageCropper
          image={originalImageUrl}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
      
      {/* Current Profile Picture */}
      {displayImageUrl && (
        <div className="current-picture">
          <img 
            src={displayImageUrl} 
            alt="Profile" 
            className="profile-preview"
          />
        </div>
      )}

      {/* File Input */}
      <div className="file-input-container">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="file-input"
          id="profile-picture-input"
        />
        <label htmlFor="profile-picture-input" className="file-input-label">
          {selectedFile ? 'Change File' : 'Choose File'}
        </label>
        {selectedFile && (
          <span className="selected-file-name">
            {selectedFile.name}
          </span>
        )}
      </div>

      {/* Error and Success Messages */}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Action Buttons */}
      <div className="action-buttons">
        {selectedFile && (
          <>
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="btn btn-primary"
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isUploading}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </>
        )}
        
        {currentProfilePic && !selectedFile && (
          <button
            onClick={handleDelete}
            disabled={isUploading}
            className="btn btn-danger"
          >
            {isUploading ? 'Deleting...' : 'Delete Current Picture'}
          </button>
        )}
      </div>

      {/* File Requirements */}
      <div className="file-requirements">
        <p><strong>Requirements:</strong></p>
        <ul>
          <li>File types: JPEG, PNG, GIF</li>
          <li>Maximum size: 5MB</li>
          <li>Images will be cropped to a perfect circle</li>
          <li>You can zoom and adjust the crop area</li>
        </ul>
      </div>
    </div>
  );
};

export default ProfilePictureUpload; 