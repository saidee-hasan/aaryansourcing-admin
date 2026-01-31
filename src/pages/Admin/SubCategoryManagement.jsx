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
  FolderIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import useAuth from '../../hooks/useAuth';
import useAdmin from '../../hooks/useAdmin';

const SubCategoryManagement = () => {
  const { user: currentUser } = useAuth();
  const { isAdmin } = useAdmin();
  const axiosSecure = useAxiosSecure();

  const [loading, setLoading] = useState(false);
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [editingSubCategory, setEditingSubCategory] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    description: ''
  });

  // Load categories and sub categories
  const loadCategories = async () => {
    try {
      const response = await axiosSecure.get('/categories');
      if (response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadSubCategories = async () => {
    try {
      const params = {};
      if (selectedCategory) {
        params.categoryId = selectedCategory;
      }

      const response = await axiosSecure.get('/sub-categories', { params });
      if (response.data.success) {
        setSubCategories(response.data.data?.subCategories || []);
      }
    } catch (error) {
      console.error('Error loading sub categories:', error);
      showError('Failed to load sub categories');
    }
  };

  useEffect(() => {
    loadCategories();
    loadSubCategories();
  }, [selectedCategory]);

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
      categoryId: '',
      description: ''
    });
    setEditingSubCategory(null);
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Create sub category
  const createSubCategory = async () => {
    if (!isAdmin) {
      showError('Only administrators can create sub categories');
      return;
    }

    if (!formData.name.trim()) {
      showError('Sub category name is required');
      return;
    }

    if (!formData.categoryId) {
      showError('Please select a parent category');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosSecure.post('/sub-categories', formData);

      if (response.data.success) {
        await loadSubCategories();
        showSuccess(`Sub category "${formData.name}" created successfully`);
        resetForm();
      } else {
        throw new Error(response.data.message || 'Failed to create sub category');
      }
    } catch (error) {
      console.error('Create sub category error:', error);
      showError(error.response?.data?.message || error.message || 'Failed to create sub category');
    } finally {
      setLoading(false);
    }
  };

  // Update sub category
  const updateSubCategory = async () => {
    if (!isAdmin || !editingSubCategory) {
      showError('Only administrators can update sub categories');
      return;
    }

    if (!formData.name.trim()) {
      showError('Sub category name is required');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosSecure.put(`/sub-categories/${editingSubCategory._id}`, {
        name: formData.name,
        description: formData.description
      });

      if (response.data.success) {
        await loadSubCategories();
        showSuccess(`Sub category "${formData.name}" updated successfully`);
        resetForm();
      } else {
        throw new Error(response.data.message || 'Failed to update sub category');
      }
    } catch (error) {
      console.error('Update sub category error:', error);
      showError(error.response?.data?.message || error.message || 'Failed to update sub category');
    } finally {
      setLoading(false);
    }
  };

  // Delete sub category
  const deleteSubCategory = async (subCategoryId, subCategoryName) => {
    if (!isAdmin) return;

    if (!window.confirm(`Are you sure you want to delete the sub category "${subCategoryName}"?`)) {
      return;
    }

    try {
      const response = await axiosSecure.delete(`/sub-categories/${subCategoryId}`);

      if (response.data.success) {
        await loadSubCategories();
        showSuccess('Sub category deleted successfully');
      } else {
        throw new Error(response.data.message || 'Failed to delete sub category');
      }
    } catch (error) {
      console.error('Delete sub category error:', error);
      showError(error.response?.data?.message || error.message || 'Failed to delete sub category');
    }
  };

  // Start editing sub category
  const startEditing = (subCategory) => {
    setEditingSubCategory(subCategory);
    setFormData({
      name: subCategory.name,
      categoryId: subCategory.categoryId,
      description: subCategory.description || ''
    });
  };

  // Filter sub categories based on search
  const filteredSubCategories = subCategories.filter(subCategory =>
    subCategory.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subCategory.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subCategory.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">
            You need administrator privileges to manage sub categories.
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sub Category Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage product sub categories under parent categories
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
        {/* Left Column - Sub Category Form */}
        <div className="space-y-6">
          {/* Sub Category Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <PlusIcon className="h-5 w-5 mr-2 text-blue-500" />
              {editingSubCategory ? 'Edit Sub Category' : 'Add New Sub Category'}
            </h3>

            <div className="space-y-4">
              {/* Parent Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Parent Category *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => handleInputChange('categoryId', e.target.value)}
                  disabled={!!editingSubCategory}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.value}
                    </option>
                  ))}
                </select>
                {editingSubCategory && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Parent category cannot be changed when editing
                  </p>
                )}
              </div>

              {/* Sub Category Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sub Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter sub category name"
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
                  placeholder="Enter sub category description"
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
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
                  onClick={editingSubCategory ? updateSubCategory : createSubCategory}
                  disabled={loading || !formData.name.trim() || !formData.categoryId}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
                      {editingSubCategory ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <PlusIcon className="h-5 w-5 mr-2" />
                      {editingSubCategory ? 'Update Sub Category' : 'Create Sub Category'}
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
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {subCategories.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Sub Categories</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {categories.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Parent Categories</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Sub Categories List */}
        <div className="space-y-6">
          {/* Filters and Search */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <FolderIcon className="h-5 w-5 mr-2 text-purple-500" />
                Sub Categories ({subCategories.length})
              </h3>
              
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.value}
                    </option>
                  ))}
                </select>

                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search sub categories..."
                    className="w-full sm:w-64 px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Sub Categories List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {filteredSubCategories.length === 0 ? (
              <div className="text-center py-12">
                <FolderIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {subCategories.length === 0 ? 'No sub categories yet' : 'No sub categories found'}
                </h4>
                <p className="text-gray-500 dark:text-gray-400">
                  {subCategories.length === 0 
                    ? 'Create your first sub category to get started' 
                    : 'Try adjusting your search or filter'
                  }
                </p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {filteredSubCategories.map((subCategory, index) => (
                  <motion.div
                    key={subCategory._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <FolderIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white truncate">
                          {subCategory.name}
                        </h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                          <span>Under: {subCategory.categoryName}</span>
                          {subCategory.description && (
                            <>
                              <span>•</span>
                              <span className="truncate">{subCategory.description}</span>
                            </>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Created: {new Date(subCategory.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEditing(subCategory)}
                        className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        title="Edit sub category"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteSubCategory(subCategory._id, subCategory.name)}
                        className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Delete sub category"
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

export default SubCategoryManagement;