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
  TagIcon,
  ArrowsUpDownIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import useAuth from '../../hooks/useAuth';
import useAdmin from '../../hooks/useAdmin';

const SizeManagement = () => {
  const { user: currentUser } = useAuth();
  const { isAdmin } = useAdmin();
  const axiosSecure = useAxiosSecure();
  
  const [loading, setLoading] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [editingSize, setEditingSize] = useState(null);
  const [showBulkCreate, setShowBulkCreate] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  
  // Size form state - Only Size Value field
  const [formData, setFormData] = useState({
    value: '',
    status: 'active'
  });

  const inputRef = useRef(null);

const predefinedSizes = [
  // Adult Standard
  "XS", "S", "M", "L", "XL", "XXL",
  "3XL", "4XL", "5XL",

  // Baby Sizes (Months)
  "0-6M", "6-12M", "12-18M", "18-24M",

  // Kids Sizes (Years)
  "1-2Y", "3-4Y", "5-6Y", "7-8Y",
  "9-10Y", "11-12Y", "13-14Y",

  // Numeric Sizes (Pants/Denim)
  "30", "32", "34", "36", "38",
  "40", "42", "44", "46", "48", "50",

  // Shoe Sizes (if needed)
  "5", "6", "7", "8", "9", "10", "11", "12", "13",

  // Free Size Options
  "One Size",
  "Free Size",
  "Universal",
  "Small",
  "Medium",
  "Large"
];


  // Load sizes
  const loadSizes = async () => {
    try {
      const response = await axiosSecure.get('/sizes', {
        params: { 
          search: searchTerm, 
          status: statusFilter
        }
      });
      if (response.data.success) {
        setSizes(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading sizes:', error);
      showError('Failed to load sizes');
    }
  };

  useEffect(() => {
    loadSizes();
  }, [searchTerm, statusFilter]);

  // Filter suggestions based on input
  useEffect(() => {
    if (formData.value) {
      const filtered = predefinedSizes.filter(size =>
        size.toLowerCase().includes(formData.value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  }, [formData.value]);

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
      value: '',
      status: 'active'
    });
    setEditingSize(null);
    setShowBulkCreate(false);
    setShowSuggestions(false);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setFormData(prev => ({
      ...prev,
      value: suggestion
    }));
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Create size
  const createSize = async () => {
    if (!isAdmin) {
      showError('Only administrators can create sizes');
      return;
    }

    if (!formData.value.trim()) {
      showError('Size value is required');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosSecure.post('/sizes', formData);

      if (response.data.success) {
        await loadSizes();
        showSuccess(`Size "${formData.value}" created successfully`);
        resetForm();
      } else {
        throw new Error(response.data.message || 'Failed to create size');
      }
    } catch (error) {
      console.error('Create size error:', error);
      showError(error.response?.data?.message || error.message || 'Failed to create size');
    } finally {
      setLoading(false);
    }
  };

  // Update size
  const updateSize = async () => {
    if (!isAdmin || !editingSize) {
      showError('Only administrators can update sizes');
      return;
    }

    if (!formData.value.trim()) {
      showError('Size value is required');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosSecure.put(`/sizes/${editingSize._id}`, formData);

      if (response.data.success) {
        await loadSizes();
        showSuccess(`Size "${formData.value}" updated successfully`);
        resetForm();
      } else {
        throw new Error(response.data.message || 'Failed to update size');
      }
    } catch (error) {
      console.error('Update size error:', error);
      showError(error.response?.data?.message || error.message || 'Failed to update size');
    } finally {
      setLoading(false);
    }
  };

  // Delete size
  const deleteSize = async (sizeId, sizeValue) => {
    if (!isAdmin) return;

    if (!window.confirm(`Are you sure you want to delete the size "${sizeValue}"?`)) {
      return;
    }

    try {
      const response = await axiosSecure.delete(`/sizes/${sizeId}`);

      if (response.data.success) {
        await loadSizes();
        showSuccess('Size deleted successfully');
      } else {
        throw new Error(response.data.message || 'Failed to delete size');
      }
    } catch (error) {
      console.error('Delete size error:', error);
      showError(error.response?.data?.message || error.message || 'Failed to delete size');
    }
  };

  // Toggle size status
  const toggleSizeStatus = async (sizeId, currentStatus) => {
    if (!isAdmin) return;

    try {
      const response = await axiosSecure.patch(`/sizes/${sizeId}/toggle-status`);

      if (response.data.success) {
        await loadSizes();
        showSuccess(`Size ${currentStatus === 'active' ? 'deactivated' : 'activated'} successfully`);
      } else {
        throw new Error(response.data.message || 'Failed to update size status');
      }
    } catch (error) {
      console.error('Toggle status error:', error);
      showError(error.response?.data?.message || error.message || 'Failed to update size status');
    }
  };

  // Start editing size
  const startEditing = (size) => {
    setEditingSize(size);
    setFormData({
      value: size.value,
      status: size.status
    });
  };

  // Bulk create predefined sizes
  const bulkCreateSizes = async () => {
    if (!isAdmin) return;

    const sizesToCreate = predefinedSizes.map(value => ({
      value: value,
      status: 'active'
    }));

    setLoading(true);
    try {
      const response = await axiosSecure.post('/sizes/bulk', { sizes: sizesToCreate });

      if (response.data.success) {
        await loadSizes();
        showSuccess(`${response.data.message}`);
        setShowBulkCreate(false);
      } else {
        throw new Error(response.data.message || 'Failed to create sizes');
      }
    } catch (error) {
      console.error('Bulk create sizes error:', error);
      showError(error.response?.data?.message || error.message || 'Failed to create sizes');
    } finally {
      setLoading(false);
    }
  };

  // Filter sizes based on search
  const filteredSizes = sizes.filter(size =>
    size.value?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const stats = {
    total: sizes.length,
    active: sizes.filter(s => s.status === 'active').length,
    inactive: sizes.filter(s => s.status === 'inactive').length
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">
            You need administrator privileges to manage sizes.
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Size Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage product sizes
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <button
              onClick={() => setShowBulkCreate(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CubeIcon className="h-5 w-5 mr-2" />
              Bulk Create
            </button>
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

      {/* Bulk Create Modal */}
      <AnimatePresence>
        {showBulkCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Bulk Create Predefined Sizes
              </h3>
              
              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    All Available Sizes
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {predefinedSizes.map(size => (
                      <span key={size} className="px-3 py-1 bg-white dark:bg-gray-600 rounded-lg text-sm border">
                        {size}
                      </span>
                    ))}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This will create {predefinedSizes.length} predefined sizes.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowBulkCreate(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={bulkCreateSizes}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CubeIcon className="h-5 w-5 mr-2" />
                      Create All Sizes
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Size Form */}
        <div className="space-y-6">
          {/* Size Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <PlusIcon className="h-5 w-5 mr-2 text-blue-500" />
              {editingSize ? 'Edit Size' : 'Add New Size'}
            </h3>

            <div className="space-y-4">
              {/* Size Value with Suggestions */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Size Value *
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  name="value"
                  value={formData.value}
                  onChange={handleInputChange}
                  onFocus={() => {
                    if (formData.value) {
                      setShowSuggestions(true);
                    }
                  }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Type size value (e.g., XS, M, 32, 5-6Y)"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                {/* Suggestions Dropdown */}
                <AnimatePresence>
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                    >
                      {filteredSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors first:rounded-t-lg last:rounded-b-lg border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                        >
                          <span className="text-gray-900 dark:text-white font-medium">{suggestion}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Quick Size Buttons */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Popular Sizes
                </label>
                <div className="flex flex-wrap gap-2">
                  {['XS', 'S', 'M', 'L', 'XL', '32', '34', '36', '5-6Y', 'One Size'].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, value: size }))}
                      className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border"
                    >
                      {size}
                    </button>
                  ))}
                </div>
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
                  onClick={editingSize ? updateSize : createSize}
                  disabled={loading || !formData.value.trim()}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
                      {editingSize ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <PlusIcon className="h-5 w-5 mr-2" />
                      {editingSize ? 'Update Size' : 'Create Size'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Overview</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.total}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Total Sizes</div>
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
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {filteredSizes.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Showing</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Sizes List */}
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <ArrowsUpDownIcon className="h-5 w-5 mr-2 text-purple-500" />
                Sizes ({sizes.length})
              </h3>
              
              <div className="flex flex-col sm:flex-row gap-3 flex-1 sm:flex-none">
                <div className="relative flex-1 sm:w-64">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search sizes..."
                    className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sizes List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {filteredSizes.length === 0 ? (
              <div className="text-center py-12">
                <ArrowsUpDownIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {sizes.length === 0 ? 'No sizes yet' : 'No sizes found'}
                </h4>
                <p className="text-gray-500 dark:text-gray-400">
                  {sizes.length === 0 
                    ? 'Create your first size or use bulk create' 
                    : 'Try adjusting your search terms'
                  }
                </p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {filteredSizes.map((size, index) => (
                  <motion.div
                    key={size._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <TagIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900 dark:text-white text-lg">
                            {size.value}
                          </h4>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            size.status === 'active' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {size.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Created: {new Date(size.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEditing(size)}
                        className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        title="Edit size"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => toggleSizeStatus(size._id, size.status)}
                        className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
                        title={size.status === 'active' ? 'Deactivate size' : 'Activate size'}
                      >
                        {size.status === 'active' ? (
                          <XMarkIcon className="h-4 w-4" />
                        ) : (
                          <CheckCircleIcon className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteSize(size._id, size.value)}
                        className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Delete size"
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

export default SizeManagement;