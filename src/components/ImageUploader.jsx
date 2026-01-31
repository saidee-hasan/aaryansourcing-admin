// src/components/ImageUploader.jsx
import React, { useRef, useState } from 'react';
import {
  PhotoIcon,
  XMarkIcon,
  CloudArrowUpIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const ImageUploader = ({ 
  images = [], 
  onImagesChange, 
  multiple = true, 
  maxFiles = 10,
  maxSizeMB = 5
}) => {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (files) => {
    const validFiles = Array.from(files).filter(file => {
      // Check file type
      const isValidType = file.type.startsWith('image/');
      // Check file size
      const isValidSize = file.size <= maxSizeMB * 1024 * 1024;
      
      if (!isValidType) {
        alert('Please select only image files');
        return false;
      }
      if (!isValidSize) {
        alert(`File size should be less than ${maxSizeMB}MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    if (!multiple && validFiles.length > 1) {
      alert('Please select only one image');
      return;
    }

    if (images.length + validFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} images allowed`);
      return;
    }

    // Create image objects with preview URLs
    const newImages = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending',
      progress: 0
    }));

    onImagesChange([...images, ...newImages]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeImage = (imageId) => {
    const imageToRemove = images.find(img => img.id === imageId);
    if (imageToRemove?.preview) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
    
    const updatedImages = images.filter(img => img.id !== imageId);
    onImagesChange(updatedImages);
  };

  const updateImage = (imageId, updates) => {
    const updatedImages = images.map(img => 
      img.id === imageId ? { ...img, ...updates } : img
    );
    onImagesChange(updatedImages);
  };

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  const clearAllImages = () => {
    // Clean up object URLs
    images.forEach(img => {
      if (img.preview && img.preview.startsWith('blob:')) {
        URL.revokeObjectURL(img.preview);
      }
    });
    onImagesChange([]);
  };

  return (
    <div className="space-y-4">
      {/* File Input */}
      <input
        type="file"
        ref={fileInputRef}
        multiple={multiple}
        accept="image/*"
        onChange={(e) => {
          handleFileSelect(e.target.files);
          // Reset input value to allow selecting same file again
          e.target.value = '';
        }}
        className="hidden"
      />

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileSelector}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
          ${dragOver 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
        `}
      >
        <div className="space-y-3">
          <CloudArrowUpIcon className="h-12 w-12 mx-auto text-gray-400" />
          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              Drop images here or click to browse
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Supports JPG, PNG, WEBP • Max {maxSizeMB}MB per file • Max {maxFiles} files
            </p>
          </div>
        </div>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Selected Images ({images.length}/{maxFiles})
            </h4>
            {multiple && images.length > 0 && (
              <button
                type="button"
                onClick={clearAllImages}
                className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <AnimatePresence>
              {images.map((image) => (
                <motion.div
                  key={image.id} // ✅ Unique key added
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group"
                >
                  {/* Image Card */}
                  <div className="aspect-square rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <img
                      src={image.preview || image.url}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(image.preview || image.url, '_blank');
                          }}
                          className="p-2 bg-white rounded-full text-gray-700 hover:text-blue-600 transition-colors"
                          title="View full size"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(image.id);
                          }}
                          className="p-2 bg-white rounded-full text-gray-700 hover:text-red-600 transition-colors"
                          title="Remove image"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Upload Progress */}
                    {image.status === 'uploading' && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gray-200 dark:bg-gray-600 h-1">
                        <div 
                          className="bg-blue-500 h-1 transition-all duration-300"
                          style={{ width: `${image.progress}%` }}
                        />
                      </div>
                    )}

                    {/* Status Badges */}
                    {image.status === 'success' && (
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                          Uploaded
                        </span>
                      </div>
                    )}

                    {image.status === 'error' && (
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                          Failed
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Image Info */}
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {image.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {(image.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;