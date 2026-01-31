import React, { useState, useEffect, useRef } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  BuildingStorefrontIcon,
  PhotoIcon,
  MapPinIcon,
  CalendarIcon,
  GlobeAmericasIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import useAuth from '../../hooks/useAuth';
import useAdmin from '../../hooks/useAdmin';

const BrandManagement = () => {
  const { user: currentUser } = useAuth();
  const { isAdmin } = useAdmin();
  const axiosSecure = useAxiosSecure();
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [brands, setBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [editingBrand, setEditingBrand] = useState(null);
  
  // Brand form state - Only 3 main fields
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    images: []
  });

  const fileInputRef = useRef(null);

  // Load brands
  const loadBrands = async () => {
    try {
      const response = await axiosSecure.get('/brands', {
        params: { search: searchTerm, status: statusFilter }
      });
      if (response.data.success) {
        setBrands(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading brands:', error);
      showError('Failed to load brands');
    }
  };

  useEffect(() => {
    loadBrands();
  }, [searchTerm, statusFilter]);

  // Show messages
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const showError = (message) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(''), 5000);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      images: []
    });
    setEditingBrand(null);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Upload image to ImgBB
  const uploadImageToImgBB = async (file) => {
    if (!file) return null;
    
    const uploadFormData = new FormData();
    uploadFormData.append('image', file);
    
    try {
      const response = await fetch('https://api.imgbb.com/1/upload?key=5208745dacce2f0b8ea7cce043481d64', {
        method: 'POST',
        body: uploadFormData
      });
      
      const data = await response.json();
      if (data.success) {
        return data.data.url;
      }
      throw new Error(data.error?.message || 'Image upload failed');
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Image upload failed');
    }
  };

  // Handle multiple images upload
  const handleImagesUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Validate files
    const validTypes = ['image/png', 'image/svg+xml', 'image/jpeg', 'image/jpg', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      showError('Please upload only PNG, SVG, JPG, or WebP images');
      return;
    }

    // Check total size
    const totalSize = files.reduce((acc, file) => acc + file.size, 0);
    if (totalSize > 10 * 1024 * 1024) {
      showError('Total images size should be less than 10MB');
      return;
    }

    setUploading(true);
    const uploadedUrls = [];

    try {
      for (const file of files) {
        const imageUrl = await uploadImageToImgBB(file);
        if (imageUrl) {
          uploadedUrls.push(imageUrl);
        }
      }

      if (uploadedUrls.length > 0) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...uploadedUrls]
        }));
        showSuccess(`${uploadedUrls.length} images uploaded successfully!`);
      }
    } catch (error) {
      showError('Failed to upload some images');
    } finally {
      setUploading(false);
    }
  };

  // Remove image from gallery
  const removeImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  // Set first image as logo (auto-select)
  const getLogo = () => {
    return formData.images.length > 0 ? formData.images[0] : '';
  };

  // Create brand
  const createBrand = async () => {
    if (!isAdmin) {
      showError('Only administrators can create brands');
      return;
    }

    if (!formData.name.trim()) {
      showError('Brand name is required');
      return;
    }

    if (!formData.description.trim()) {
      showError('Brand description is required');
      return;
    }

    setLoading(true);
    try {
      const brandData = {
        name: formData.name,
        description: formData.description,
        logo: getLogo(), // Auto-set first image as logo
        images: formData.images
      };

      const response = await axiosSecure.post('/brands', brandData);

      if (response.data.success) {
        await loadBrands();
        showSuccess(`Brand "${formData.name}" created successfully`);
        resetForm();
      } else {
        throw new Error(response.data.message || 'Failed to create brand');
      }
    } catch (error) {
      console.error('Create brand error:', error);
      showError(error.response?.data?.message || error.message || 'Failed to create brand');
    } finally {
      setLoading(false);
    }
  };

  // Update brand
  const updateBrand = async () => {
    if (!isAdmin || !editingBrand) {
      showError('Only administrators can update brands');
      return;
    }

    if (!formData.name.trim()) {
      showError('Brand name is required');
      return;
    }

    if (!formData.description.trim()) {
      showError('Brand description is required');
      return;
    }

    setLoading(true);
    try {
      const brandData = {
        name: formData.name,
        description: formData.description,
        logo: getLogo(), // Auto-set first image as logo
        images: formData.images
      };

      const response = await axiosSecure.put(`/brands/${editingBrand._id}`, brandData);

      if (response.data.success) {
        await loadBrands();
        showSuccess(`Brand "${formData.name}" updated successfully`);
        resetForm();
      } else {
        throw new Error(response.data.message || 'Failed to update brand');
      }
    } catch (error) {
      console.error('Update brand error:', error);
      showError(error.response?.data?.message || error.message || 'Failed to update brand');
    } finally {
      setLoading(false);
    }
  };

  // Delete brand
  const deleteBrand = async (brandId, brandName) => {
    if (!isAdmin) return;

    if (!window.confirm(`Are you sure you want to delete the brand "${brandName}"?`)) {
      return;
    }

    try {
      const response = await axiosSecure.delete(`/brands/${brandId}`);

      if (response.data.success) {
        await loadBrands();
        showSuccess('Brand deleted successfully');
      } else {
        throw new Error(response.data.message || 'Failed to delete brand');
      }
    } catch (error) {
      console.error('Delete brand error:', error);
      showError(error.response?.data?.message || error.message || 'Failed to delete brand');
    }
  };

  // Toggle brand status
  const toggleBrandStatus = async (brandId, currentStatus) => {
    if (!isAdmin) return;

    try {
      const response = await axiosSecure.patch(`/brands/${brandId}/toggle-status`);

      if (response.data.success) {
        await loadBrands();
        showSuccess(`Brand ${currentStatus === 'active' ? 'deactivated' : 'activated'} successfully`);
      } else {
        throw new Error(response.data.message || 'Failed to update brand status');
      }
    } catch (error) {
      console.error('Toggle status error:', error);
      showError(error.response?.data?.message || error.message || 'Failed to update brand status');
    }
  };

  // Start editing brand
  const startEditing = (brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      description: brand.description,
      images: brand.images || []
    });
  };

  // Filter brands based on search
  const filteredBrands = brands.filter(brand =>
    brand.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const stats = {
    total: brands.length,
    active: brands.filter(b => b.status === 'active').length,
    inactive: brands.filter(b => b.status === 'inactive').length
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">
            You need administrator privileges to manage brands.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Brand Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your brand portfolio with images
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <button
              onClick={resetForm}
              className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
          >
            <p className="text-green-800 dark:text-green-400 flex items-center">
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              {successMessage}
            </p>
          </motion.div>
        )}

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <p className="text-red-800 dark:text-red-400 flex items-center">
              <XMarkIcon className="h-5 w-5 mr-2" />
              {errorMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column - Brand Form */}
        <div className="xl:col-span-2 space-y-6">
          {/* Brand Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <PlusIcon className="h-5 w-5 mr-2 text-blue-500" />
              {editingBrand ? 'Edit Brand' : 'Add New Brand'}
            </h3>

            <div className="space-y-6">
              {/* Brand Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Brand Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your brand name"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Brand Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Brand Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Describe your brand story, mission, and values..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Brand Gallery Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Brand Gallery Images
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    (First image will be used as logo)
                  </span>
                </label>
                
                {/* Upload Button */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImagesUpload}
                  accept="image/png, image/svg+xml, image/jpeg, image/jpg, image/webp"
                  multiple
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4"
                >
                  <div className="flex flex-col items-center justify-center gap-3">
                    {uploading ? (
                      <ArrowPathIcon className="h-8 w-8 animate-spin" />
                    ) : (
                      <PhotoIcon className="h-8 w-8" />
                    )}
                    <span className="text-sm font-medium">
                      {uploading ? 'Uploading...' : 'Upload Brand Images'}
                    </span>
                    <span className="text-xs text-center">
                      PNG, SVG, JPG, WebP (max 10MB total)
                      <br />
                      First image will be set as brand logo
                    </span>
                  </div>
                </button>

                {/* Images Gallery */}
                {formData.images.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Uploaded Images ({formData.images.length})
                      </p>
                      {formData.images.length > 0 && (
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          🏷️ First image is the logo
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="relative">
                            <img
                              src={image}
                              alt={`Brand image ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600 group-hover:border-blue-500 transition-colors"
                            />
                            {index === 0 && (
                              <div className="absolute top-1 left-1 bg-blue-500 text-white rounded-full p-1">
                                <StarIcon className="h-3 w-3" />
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <XMarkIcon className="h-3 w-3" />
                          </button>
                          {index === 0 && (
                            <div className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-1 rounded">
                              Logo
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={resetForm}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingBrand ? updateBrand : createBrand}
                  disabled={loading || !formData.name.trim() || !formData.description.trim()}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
                      {editingBrand ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <PlusIcon className="h-5 w-5 mr-2" />
                      {editingBrand ? 'Update Brand' : 'Create Brand'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Brands List & Stats */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Brand Overview</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.total}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Total Brands</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.active}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">Active</div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats.inactive}
                </div>
                <div className="text-sm text-red-600 dark:text-red-400">Inactive</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {filteredBrands.length}
                </div>
                <div className="text-sm text-purple-600 dark:text-purple-400">Showing</div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <BuildingStorefrontIcon className="h-5 w-5 mr-2 text-purple-500" />
                Brands ({brands.length})
              </h3>
              
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search brands by name or description..."
                  className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>

              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>

          {/* Brands List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {filteredBrands.length === 0 ? (
              <div className="text-center py-12">
                <BuildingStorefrontIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {brands.length === 0 ? 'No brands yet' : 'No brands found'}
                </h4>
                <p className="text-gray-500 dark:text-gray-400">
                  {brands.length === 0 
                    ? 'Create your first brand to get started' 
                    : 'Try adjusting your search terms'
                  }
                </p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {filteredBrands.map((brand, index) => (
                  <motion.div
                    key={brand._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        {brand.logo ? (
                          <img
                            src={brand.logo}
                            alt={brand.name}
                            className="w-12 h-12 object-contain rounded-lg bg-white p-1 border border-gray-200"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <BuildingStorefrontIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900 dark:text-white truncate">
                            {brand.name}
                          </h4>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            brand.status === 'active' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {brand.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                          {brand.description}
                        </p>
                        <div className="flex items-center space-x-3 mt-1">
                          {brand.images && brand.images.length > 0 && (
                            <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center">
                              <PhotoIcon className="h-3 w-3 mr-1" />
                              {brand.images.length} images
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEditing(brand)}
                        className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        title="Edit brand"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => toggleBrandStatus(brand._id, brand.status)}
                        className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
                        title={brand.status === 'active' ? 'Deactivate brand' : 'Activate brand'}
                      >
                        {brand.status === 'active' ? (
                          <XMarkIcon className="h-4 w-4" />
                        ) : (
                          <CheckCircleIcon className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteBrand(brand._id, brand.name)}
                        className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Delete brand"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandManagement;