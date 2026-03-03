import { useState, useRef } from 'react';
import axios from 'axios';
import API from '../api/axios';

const FileUploader = ({ onUploadSuccess, onUploadError }) => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setError('');
    setFile(selectedFile);
    setUploadedUrl(null);

    // Create preview URL
    const preview = URL.createObjectURL(selectedFile);
    setPreviewUrl(preview);
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', file);

      // Method 1: Upload via your backend [citation:6]
      const response = await API.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        },
      });

      if (response.data.success) {
        setUploadedUrl(response.data.imageUrl);
        
        // Call success callback
        if (onUploadSuccess) {
          onUploadSuccess(response.data);
        }
      }

    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
      
      // Call error callback
      if (onUploadError) {
        onUploadError(err);
      }
    } finally {
      setUploading(false);
    }
  };

  // Alternative Method 2: Direct upload to Cloudinary (signed) [citation:9]
  const handleSignedUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setError('');

    try {
      // Get signature from backend
      const { data: signatureData } = await API.get('/upload/signature');

      // Direct upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', signatureData.apiKey);
      formData.append('timestamp', signatureData.timestamp);
      formData.append('upload_preset', signatureData.uploadPreset);
      formData.append('signature', signatureData.signature);

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/auto/upload`,
        formData,
        {
          onUploadProgress: (e) => {
            const percent = Math.round((e.loaded * 100) / e.total);
            setProgress(percent);
          },
        }
      );

      setUploadedUrl(response.data.secure_url);
      
      if (onUploadSuccess) {
        onUploadSuccess({ imageUrl: response.data.secure_url });
      }

    } catch (err) {
      console.error('Signed upload error:', err);
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Clear selected file
  const handleClear = () => {
    setFile(null);
    setPreviewUrl(null);
    setUploadedUrl(null);
    setProgress(0);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Image</h3>
      
      {/* File input */}
      <div className="mb-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-teal-50 file:text-teal-700
            hover:file:bg-teal-100
            disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Image preview */}
      {previewUrl && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Preview:</p>
          <div className="relative">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              onClick={handleClear}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Progress bar */}
      {uploading && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-teal-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Uploaded result */}
      {uploadedUrl && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg">
          <p className="text-sm font-medium mb-2">✅ Upload successful!</p>
          <a
            href={uploadedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-teal-600 hover:underline break-all"
          >
            {uploadedUrl}
          </a>
        </div>
      )}

      {/* Upload button */}
      <div className="flex gap-2">
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="flex-1 bg-gradient-to-r from-teal-600 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-teal-700 hover:to-purple-700 focus:ring-2 focus:ring-teal-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : 'Upload Image'}
        </button>
        
        {/* Optional: Signed upload button (more secure) */}
        <button
          onClick={handleSignedUpload}
          disabled={!file || uploading}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="More secure upload method"
        >
          🔒
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Supported formats: JPG, PNG, GIF, WEBP (max 5MB)
      </p>
    </div>
  );
};

export default FileUploader;