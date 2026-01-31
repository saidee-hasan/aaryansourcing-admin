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
  CogIcon,
  EyeIcon,
  EyeSlashIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import useAuth from '../../hooks/useAuth';
import useAdmin from '../../hooks/useAdmin';

const ProductFitManagement = () => {
  const { user: currentUser } = useAuth();
  const { isAdmin } = useAdmin();
  const axiosSecure = useAxiosSecure();

  const [loading, setLoading] = useState(false);
  const [productFits, setProductFits] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [editingFit, setEditingFit] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active'
  });

  // Load product fits
  const loadProductFits = async () => {
    try {
      const params = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await axiosSecure.get('/product-fits', { params });
      if (response.data.success) {
        setProductFits(response.data.data?.productFits || []);
        setStats(response.data.data?.stats || { total: 0, active: 0, inactive: 0 });
      }
    } catch (error) {
      console.error('Error loading product fits:', error);
      showError('Failed to load product fits');
    }
  };

  useEffect(() => {
    loadProductFits();
  }, [statusFilter]);

  // Search with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadProductFits();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

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
      status: 'active'
    });
    setEditingFit(null);
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Create product fit
  const createProductFit = async () => {
    if (!isAdmin) {
      showError('Only administrators can create product fits');
      return;
    }

    if (!formData.name.trim()) {
      showError('Product fit name is required');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosSecure.post('/product-fits', formData);

      if (response.data.success) {
        await loadProductFits();
        showSuccess(`Product fit "${formData.name}" created successfully`);
        resetForm();
      } else {
        throw new Error(response.data.message || 'Failed to create product fit');
      }
    } catch (error) {
      console.error('Create product fit error:', error);
      showError(error.response?.data?.message || error.message || 'Failed to create product fit');
    } finally {
      setLoading(false);
    }
  };

  // Update product fit
  const updateProductFit = async () => {
    if (!isAdmin || !editingFit) {
      showError('Only administrators can update product fits');
      return;
    }

    if (!formData.name.trim()) {
      showError('Product fit name is required');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosSecure.put(`/product-fits/${editingFit._id}`, formData);

      if (response.data.success) {
        await loadProductFits();
        showSuccess(`Product fit "${formData.name}" updated successfully`);
        resetForm();
      } else {
        throw new Error(response.data.message || 'Failed to update product fit');
      }
    } catch (error) {
      console.error('Update product fit error:', error);
      showError(error.response?.data?.message || error.message || 'Failed to update product fit');
    } finally {
      setLoading(false);
    }
  };

  // Delete product fit
  const deleteProductFit = async (fitId, fitName) => {
    if (!isAdmin) return;

    if (!window.confirm(`Are you sure you want to delete the product fit "${fitName}"?`)) {
      return;
    }

    try {
      const response = await axiosSecure.delete(`/product-fits/${fitId}`);

      if (response.data.success) {
        await loadProductFits();
        showSuccess('Product fit deleted successfully');
      } else {
        throw new Error(response.data.message || 'Failed to delete product fit');
      }
    } catch (error) {
      console.error('Delete product fit error:', error);
      showError(error.response?.data?.message || error.message || 'Failed to delete product fit');
    }
  };

  // Toggle product fit status
  const toggleFitStatus = async (fitId, currentStatus) => {
    if (!isAdmin) return;

    try {
      const response = await axiosSecure.patch(`/product-fits/${fitId}/toggle-status`);

      if (response.data.success) {
        await loadProductFits();
        showSuccess(`Product fit ${response.data.data.newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      } else {
        throw new Error(response.data.message || 'Failed to toggle product fit status');
      }
    } catch (error) {
      console.error('Toggle product fit status error:', error);
      showError(error.response?.data?.message || error.message || 'Failed to toggle product fit status');
    }
  };

  // Start editing product fit
  const startEditing = (fit) => {
    setEditingFit(fit);
    setFormData({
      name: fit.name,
      description: fit.description || '',
      status: fit.status
    });
  };

  // Common product fits for quick add
  const commonFits = [
    'Regular Fit',
    'Slim Fit',
    'Skinny Fit',
    'Relaxed Fit',
    'Athletic Fit',
    'Tailored Fit',
    'Loose Fit',
    'Oversized Fit',
    'Classic Fit',
    'Modern Fit'
  ];

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">
            You need administrator privileges to manage product fits.
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Product Fit Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage different product fit types like Regular, Slim, Athletic, etc.
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Product Fit Form */}
        <div className="space-y-6">
          {/* Product Fit Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <PlusIcon className="h-5 w-5 mr-2 text-blue-500" />
              {editingFit ? 'Edit Product Fit' : 'Add New Product Fit'}
            </h3>

            <div className="space-y-4">
              {/* Product Fit Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fit Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Slim Fit, Regular Fit, Athletic Fit"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe this product fit type..."
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
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
                  onClick={editingFit ? updateProductFit : createProductFit}
                  disabled={loading || !formData.name.trim()}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
                      {editingFit ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <PlusIcon className="h-5 w-5 mr-2" />
                      {editingFit ? 'Update Fit' : 'Create Fit'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Add Common Fits */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <CogIcon className="h-5 w-5 mr-2 text-green-500" />
              Quick Add Common Fits
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {commonFits.map((fit) => (
                <button
                  key={fit}
                  onClick={() => {
                    if (!editingFit) {
                      setFormData(prev => ({ ...prev, name: fit }));
                    }
                  }}
                  disabled={!!editingFit}
                  className="p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
                >
                  {fit}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2 text-purple-500" />
              Overview
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.total}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Total</div>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-xl font-bold text-green-600 dark:text-green-400">
                  {stats.active}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">Active</div>
              </div>
              <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-xl font-bold text-red-600 dark:text-red-400">
                  {stats.inactive}
                </div>
                <div className="text-sm text-red-600 dark:text-red-400">Inactive</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Product Fits List */}
        <div className="space-y-6">
          {/* Filters and Search */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <CogIcon className="h-5 w-5 mr-2 text-purple-500" />
                Product Fits ({stats.total})
              </h3>
              
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>

                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search product fits..."
                    className="w-full sm:w-64 px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Product Fits List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {productFits.length === 0 ? (
              <div className="text-center py-12">
                <CogIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {stats.total === 0 ? 'No product fits yet' : 'No product fits found'}
                </h4>
                <p className="text-gray-500 dark:text-gray-400">
                  {stats.total === 0 
                    ? 'Create your first product fit to get started' 
                    : 'Try adjusting your search or filter'
                  }
                </p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {productFits.map((fit, index) => (
                  <motion.div
                    key={fit._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        fit.status === 'active' 
                          ? 'bg-green-100 dark:bg-green-900/30' 
                          : 'bg-red-100 dark:bg-red-900/30'
                      }`}>
                        <CogIcon className={`h-5 w-5 ${
                          fit.status === 'active' 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900 dark:text-white truncate">
                            {fit.name}
                          </h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            fit.status === 'active'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {fit.status}
                          </span>
                        </div>
                        {fit.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                            {fit.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Created: {new Date(fit.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => toggleFitStatus(fit._id, fit.status)}
                        className={`p-2 rounded-lg transition-colors ${
                          fit.status === 'active'
                            ? 'text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:text-yellow-300 dark:hover:bg-yellow-900/20'
                            : 'text-green-600 hover:text-green-800 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20'
                        }`}
                        title={fit.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        {fit.status === 'active' ? (
                          <EyeSlashIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => startEditing(fit)}
                        className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        title="Edit product fit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteProductFit(fit._id, fit.name)}
                        className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Delete product fit"
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

export default ProductFitManagement;