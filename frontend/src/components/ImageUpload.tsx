'use client';

import { useState } from 'react';
import { useEffect } from 'react';

interface UploadedImage {
  id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  uploadedAt: string;
}

export default function ImageUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [images, setImages] = useState<ImageItem[]>([]);

  interface ImageItem {
  id: string;
  originalName: string;
  webpUrl: string;
  rawUrl: string;
  
}

  const handleDelete = async (id: string) => {
  // Show a prompt with options
  const action = window.prompt(
    'Type "trash" to move to trash, or "delete" to delete permanently:',
    'trash'
  );

  if (!action) return;

  try {
    if (action.toLowerCase() === 'trash') {
      // Move to trash
      const response = await fetch(`http://localhost:3001/api/images/trash/${id}`, {
        method: 'POST',
      });
      const result = await response.json();
      if (result.success) {
        setImages(prevImages => prevImages.filter(img => img.id !== id));
        setMessage('Image moved to trash.');
        setError('');
      } else {
        setError(result.message || 'Failed to move image to trash.');
      }
    } else if (action.toLowerCase() === 'delete') {
      // Delete permanently
      const response = await fetch(`http://localhost:3001/api/images/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        setImages(prevImages => prevImages.filter(img => img.id !== id));
        setMessage('Image deleted permanently.');
        setError('');
      } else {
        setError(result.message || 'Failed to delete image.');
      }
    } else {
      setError('Invalid action. Please type "trash" or "delete".');
    }
  } catch (err) {
    setError('Network error. Please make sure the backend server is running.');
  }
};

   const fetchImages = async () => {
    const res = await fetch('http://localhost:3001/api/images');
    const data = await res.json();
    if (data.success) setImages(data.data);
  };

  useEffect(() => {
    fetchImages();
  }, []);



  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a JPEG, PNG, or WebP image file.');
        setSelectedFile(null);
        return;
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB.');
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
      setError('');
      setMessage('');
      setUploadedImage(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first.');
      return;
    }

    setUploading(true);
    setError('');
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('http://localhost:3001/api/images/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setMessage('Image uploaded successfully!');
        setUploadedImage(result.data);
        setSelectedFile(null);
        // Reset file input
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setError(result.message || 'Upload failed');
      }
    } catch (err) {
      setError('Network error. Please make sure the backend server is running.');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };


  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Image Upload System
      </h1>

      <div className="space-y-6">
        {/* File Selection */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
          <input
            id="file-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
          <label
            htmlFor="file-input"
            className="cursor-pointer flex flex-col items-center space-y-2"
          >
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span className="text-lg text-gray-600">
              Click to select an image file
            </span>
            <span className="text-sm text-gray-500">
              Supports JPEG, PNG, and WebP (max 10MB)
            </span>
          </label>
        </div>

        {/* Selected File Info */}
        {selectedFile && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Selected File:</h3>
            <p className="text-sm text-gray-600">
              <strong>Name:</strong> {selectedFile.name}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Type:</strong> {selectedFile.type}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Size:</strong> {formatFileSize(selectedFile.size)}
            </p>
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
            !selectedFile || uploading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {uploading ? 'Uploading...' : 'Upload Image'}
        </button>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {message}
          </div>
        )}

        {/* Uploaded Image Display */}
        {uploadedImage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-3">
              ✅ Upload Successful!
            </h3>
            <div className="space-y-2 text-sm text-green-700">
              <p><strong>File ID:</strong> {uploadedImage.id}</p>
              <p><strong>Original Name:</strong> {uploadedImage.originalName}</p>
              <p><strong>File Type:</strong> {uploadedImage.mimetype}</p>
              <p><strong>Size:</strong> {formatFileSize(uploadedImage.size)}</p>
              <p><strong>Uploaded:</strong> {new Date(uploadedImage.uploadedAt).toLocaleString()}</p>
            </div>
            
            {/* Display the uploaded image */}
            <div className="mt-4">
              <img
                src={`http://localhost:3001/api/images/${uploadedImage.id}`}
                alt={uploadedImage.originalName}
                className="max-w-full h-auto rounded-lg shadow-md"
                style={{ maxHeight: '300px' }}
              />
            </div>
          </div>
        )}
      </div>
      {images.length > 0 && (
  <div className="mt-8">
    {/* View uploaded images */}
    <h2 className="text-xl font-bold mb-4">Uploaded Images</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {images.map(image => (
        <div key={image.id} className="bg-gray-50 p-4 rounded-lg shadow">
          <img
            src={`http://localhost:3001${image.webpUrl}`}
            alt={image.originalName}
            className="w-full h-48 object-contain mb-2"
          />
          <div className="mb-2">{image.originalName}</div>
          <button
            onClick={() => window.open(`http://localhost:3001${image.webpUrl}`, '_blank')}
            className="mr-2 px-3 py-1 bg-blue-600 text-white rounded"
          >
            View
          </button>
          <button
            onClick={() => handleDelete(image.id)}
            className="px-3 py-1 bg-red-600 text-white rounded"
          >
            Delete
          </button>
          <a
            href={`http://localhost:3001${image.rawUrl}`}
            download={image.originalName}
            className="px-3 py-1 bg-green-600 text-white rounded inline-block text-center"
          >
            Download
          </a>
        </div>
      ))}
    </div>
  </div>
)}
    </div>
    
  );
  
}

