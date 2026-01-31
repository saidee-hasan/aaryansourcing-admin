import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  BuildingLibraryIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import useAdmin from '../../hooks/useAdmin';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import useAuth from '../../hooks/useAuth';

// Custom hook for delete confirmation
const useDeleteConfirmation = () => {
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, item: null, type: '' });

  const confirmDelete = useCallback((item, type = '') => {
    setDeleteConfirm({ show: true, item, type });
  }, []);

  const cancelDelete = useCallback(() => {
    setDeleteConfirm({ show: false, item: null, type: '' });
  }, []);

  return { deleteConfirm, confirmDelete, cancelDelete };
};

// Custom hook for form management
const useCertificationForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    issuingOrganization: '',
    description: '',
    validityPeriod: '',
    website: '',
    imageUrl: '',
    status: 'active'
  });

  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      issuingOrganization: '',
      description: '',
      validityPeriod: '',
      website: '',
      imageUrl: '',
      status: 'active'
    });
  }, []);

  return { formData, updateField, resetForm, setFormData };
};

// Custom hook for image upload
const useImageUpload = () => {
  const [uploadingImage, setUploadingImage] = useState(false);
  const IMGBB_API_KEY = '5208745dacce2f0b8ea7cce043481d64';

  const uploadToImgBB = useCallback(async (file) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        return data.data.url;
      } else {
        throw new Error(data.error?.message || 'Upload failed');
      }
    } catch (error) {
      console.error('ImgBB upload error:', error);
      throw new Error('Failed to upload image to ImgBB');
    } finally {
      setUploadingImage(false);
    }
  }, []);

  return { uploadingImage, uploadToImgBB };
};

const CertificationManagement = () => {
  // Hooks
  const { user: currentUser } = useAuth();
  const { isAdmin } = useAdmin();
  const axiosSecure = useAxiosSecure();
  
  // Custom hooks
  const { deleteConfirm, confirmDelete, cancelDelete } = useDeleteConfirmation();
  const { formData, updateField, resetForm, setFormData } = useCertificationForm();
  const { uploadingImage, uploadToImgBB } = useImageUpload();

  // State
  const [loading, setLoading] = useState(false);
  const [certifications, setCertifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [editingCertification, setEditingCertification] = useState(null);
  const [stats, setStats] = useState({ total: 0, byStatus: [] });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Message handler
  const showMessage = useCallback((type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), type === 'success' ? 3000 : 5000);
  }, []);

  // Data operations
  const loadCertifications = useCallback(async () => {
    try {
      const params = {};
      if (selectedStatus !== 'all') params.status = selectedStatus;
      if (searchTerm) params.search = searchTerm;

      const response = await axiosSecure.get('/certifications', { params });
      if (response.data.success) {
        setCertifications(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading certifications:', error);
      showMessage('error', 'Failed to load certifications');
    }
  }, [axiosSecure, selectedStatus, searchTerm, showMessage]);

  const loadStats = useCallback(async () => {
    try {
      const response = await axiosSecure.get('/certifications/stats');
      if (response.data.success) {
        setStats(response.data.data || {});
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, [axiosSecure]);

  // Effects
  useEffect(() => {
    loadCertifications();
    loadStats();
  }, [loadCertifications, loadStats]);

  // Search with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadCertifications();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, loadCertifications]);

  // Image handlers
  const handleImageUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showMessage('error', 'Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showMessage('error', 'Image size should be less than 5MB');
      return;
    }

    try {
      const imageUrl = await uploadToImgBB(file);
      updateField('imageUrl', imageUrl);
      showMessage('success', 'Image uploaded successfully!');
    } catch (error) {
      showMessage('error', error.message);
    }
  }, [uploadToImgBB, updateField, showMessage]);

  const removeImage = useCallback(() => {
    updateField('imageUrl', '');
  }, [updateField]);

  // CRUD operations
  const createCertification = useCallback(async () => {
    if (!isAdmin) return showMessage('error', 'Only administrators can create certifications');
    if (!formData.name.trim() || !formData.issuingOrganization.trim()) {
      return showMessage('error', 'Name and issuing organization are required');
    }

    setLoading(true);
    try {
      const response = await axiosSecure.post('/certifications', formData);
      if (response.data.success) {
        await loadCertifications();
        await loadStats();
        showMessage('success', `"${formData.name}" created successfully`);
        resetForm();
      }
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to create certification');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, formData, axiosSecure, loadCertifications, loadStats, showMessage, resetForm]);

  const updateCertification = useCallback(async () => {
    if (!isAdmin || !editingCertification) return showMessage('error', 'Only administrators can update certifications');
    if (!formData.name.trim() || !formData.issuingOrganization.trim()) {
      return showMessage('error', 'Name and issuing organization are required');
    }

    setLoading(true);
    try {
      const response = await axiosSecure.put(`/certifications/${editingCertification._id}`, formData);
      if (response.data.success) {
        await loadCertifications();
        await loadStats();
        showMessage('success', `"${formData.name}" updated successfully`);
        resetForm();
        setEditingCertification(null);
      }
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to update certification');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, editingCertification, formData, axiosSecure, loadCertifications, loadStats, showMessage, resetForm]);

  const executeDelete = useCallback(async () => {
    if (!isAdmin || !deleteConfirm.item) return;

    try {
      const response = await axiosSecure.delete(`/certifications/${deleteConfirm.item._id}`);
      if (response.data.success) {
        await loadCertifications();
        await loadStats();
        showMessage('success', `"${deleteConfirm.item.name}" deleted successfully`);
        cancelDelete();
      }
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to delete certification');
      cancelDelete();
    }
  }, [isAdmin, deleteConfirm.item, axiosSecure, loadCertifications, loadStats, showMessage, cancelDelete]);

  const toggleCertificationStatus = useCallback(async (certificationId) => {
    if (!isAdmin) return;

    try {
      const response = await axiosSecure.patch(`/certifications/${certificationId}/toggle-status`);
      if (response.data.success) {
        await loadCertifications();
        await loadStats();
        showMessage('success', `Certification ${response.data.data.newStatus === 'active' ? 'activated' : 'deactivated'}`);
      }
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to update status');
    }
  }, [isAdmin, axiosSecure, loadCertifications, loadStats, showMessage]);

  // UI helpers
  const startEditing = useCallback((certification) => {
    setEditingCertification(certification);
    setFormData({
      name: certification.name,
      issuingOrganization: certification.issuingOrganization,
      description: certification.description || '',
      validityPeriod: certification.validityPeriod || '',
      website: certification.website || '',
      imageUrl: certification.imageUrl || '',
      status: certification.status
    });
  }, [setFormData]);

  // Filter certifications
  const filteredCertifications = useMemo(() => 
    certifications.filter(certification =>
      certification.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      certification.issuingOrganization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      certification.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ), 
    [certifications, searchTerm]
  );

  // Get status count
  const getStatusCount = useCallback((status) => {
    return stats.byStatus?.find(s => s._id === status)?.count || 0;
  }, [stats.byStatus]);

  // Stats data
  const statsData = useMemo(() => [
    { 
      label: 'Total Certifications', 
      value: stats.total || 0, 
      color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      icon: '📊'
    },
    { 
      label: 'Active', 
      value: getStatusCount('active'), 
      color: 'bg-gradient-to-r from-green-500 to-emerald-500',
      icon: '✅'
    },
    { 
      label: 'Inactive', 
      value: getStatusCount('inactive'), 
      color: 'bg-gradient-to-r from-gray-500 to-slate-500',
      icon: '⏸️'
    }
  ], [stats.total, getStatusCount]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
            <ExclamationTriangleIcon className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Administrator access required.</p>
            <button onClick={() => window.history.back()} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6">
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm.show && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-xl border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                  <ExclamationCircleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Certification</h3>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">"{deleteConfirm.item?.name}"</span>? This action cannot be undone.
              </p>

              {deleteConfirm.item && (
                <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  {deleteConfirm.item.imageUrl ? (
                    <img
                      src={deleteConfirm.item.imageUrl}
                      alt={deleteConfirm.item.name}
                      className="w-12 h-12 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <DocumentTextIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{deleteConfirm.item.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{deleteConfirm.item.issuingOrganization}</div>
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDelete}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
                >
                  <TrashIcon className="h-5 w-5 mr-2" />
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Certification Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">
              Manage product certifications and quality standards
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <button
              onClick={resetForm}
              className="flex items-center px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base"
            >
              <ArrowPathIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-6 p-4 rounded-xl border ${
              message.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-400' 
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-400'
            }`}
          >
            <p className="flex items-center text-sm sm:text-base">
              {message.type === 'success' ? 
                <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> : 
                <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              }
              {message.text}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Left Column - Certification Form */}
        <div className="xl:col-span-2 space-y-4 sm:space-y-6">
          {/* Certification Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <PlusIcon className="h-5 w-5 mr-2 text-blue-500" />
              {editingCertification ? 'Edit Certification' : 'Add New Certification'}
            </h3>

            <div className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Certification Image
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <div className="flex-1">
                    <input
                      type="file"
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  {uploadingImage && (
                    <ArrowPathIcon className="h-5 w-5 animate-spin text-blue-500" />
                  )}
                </div>
                {formData.imageUrl && (
                  <div className="mt-3 flex items-center space-x-3">
                    <img
                      src={formData.imageUrl}
                      alt="Certification preview"
                      className="h-12 w-12 sm:h-16 sm:w-16 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Certification Name */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Certification Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Enter certification name"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Issuing Organization */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Issuing Organization *
                  </label>
                  <input
                    type="text"
                    value={formData.issuingOrganization}
                    onChange={(e) => updateField('issuingOrganization', e.target.value)}
                    placeholder="Enter issuing organization"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Validity Period */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Validity Period
                  </label>
                  <input
                    type="text"
                    value={formData.validityPeriod}
                    onChange={(e) => updateField('validityPeriod', e.target.value)}
                    placeholder="e.g., 2 years"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => updateField('status', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {/* Website */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => updateField('website', e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Enter certification description"
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
                <button
                  onClick={resetForm}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingCertification ? updateCertification : createCertification}
                  disabled={loading || !formData.name.trim() || !formData.issuingOrganization.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold shadow-lg"
                >
                  {loading ? (
                    <>
                      <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
                      {editingCertification ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <PlusIcon className="h-5 w-5 mr-2" />
                      {editingCertification ? 'Update' : 'Create'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Stats & Certifications List */}
        <div className="space-y-4 sm:space-y-6">
          {/* Mobile Filters Toggle */}
          <div className="xl:hidden">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <span className="font-medium text-gray-900 dark:text-white">Filters & Stats</span>
              <ArrowPathIcon className={`h-5 w-5 text-gray-500 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <AnimatePresence>
            {(showMobileFilters || window.innerWidth >= 1280) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="xl:block space-y-4 sm:space-y-6"
              >
                {/* Quick Stats */}
                <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Overview</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    {statsData.map((stat, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="text-center p-3 sm:p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800"
                      >
                        <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                          {stat.value}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <DocumentTextIcon className="h-5 w-5 mr-2 text-purple-500" />
                      Certifications ({filteredCertifications.length})
                    </h3>
                    
                    {/* Search */}
                    <div className="relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search certifications..."
                        className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>

                    {/* Status Filter */}
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Certifications List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {filteredCertifications.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <DocumentTextIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {certifications.length === 0 ? 'No certifications yet' : 'No certifications found'}
                </h4>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {certifications.length === 0 
                    ? 'Create your first certification to get started' 
                    : 'Try adjusting your search or filter'
                  }
                </p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {filteredCertifications.map((certification, index) => (
                  <motion.div
                    key={certification._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-600 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {certification.imageUrl ? (
                        <img
                          src={certification.imageUrl}
                          alt={certification.name}
                          className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded-lg border border-gray-200 dark:border-gray-600 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          <DocumentTextIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white truncate text-sm sm:text-base">
                          {certification.name}
                        </h4>
                        <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <BuildingLibraryIcon className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{certification.issuingOrganization}</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            certification.status === 'active' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {certification.status}
                          </span>
                          {certification.validityPeriod && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {certification.validityPeriod}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-1 sm:space-x-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        onClick={() => toggleCertificationStatus(certification._id)}
                        className={`p-1 sm:p-2 rounded-lg transition-colors ${
                          certification.status === 'active'
                            ? 'text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                            : 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20'
                        }`}
                        title={certification.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        {certification.status === 'active' ? (
                          <EyeSlashIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                        ) : (
                          <EyeIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => startEditing(certification)}
                        className="p-1 sm:p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        title="Edit certification"
                      >
                        <PencilIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                      <button
                        onClick={() => confirmDelete(certification, 'certification')}
                        className="p-1 sm:p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Delete certification"
                      >
                        <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4" />
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

export default CertificationManagement;