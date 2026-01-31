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
  TagIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import useAuth from '../../hooks/useAuth';
import useAdmin from '../../hooks/useAdmin';

const CategoryManagement = () => {
  const { user: currentUser } = useAuth();
  const { isAdmin } = useAdmin();
  const axiosSecure = useAxiosSecure();
  
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  
  // Category form state
  const [categoryName, setCategoryName] = useState('');

  // Load categories
  const loadCategories = async () => {
    try {
      const response = await axiosSecure.get('/categories');
      if (response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      showError('Failed to load categories');
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

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
    setCategoryName('');
    setEditingCategory(null);
  };

  // Create category
  const createCategory = async () => {
    if (!isAdmin) {
      showError('Only administrators can create categories');
      return;
    }

    if (!categoryName.trim()) {
      showError('Category name is required');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosSecure.post('/categories', {
        value: categoryName.trim()
      });

      if (response.data.success) {
        await loadCategories();
        showSuccess(`Category "${categoryName}" created successfully`);
        resetForm();
      } else {
        throw new Error(response.data.message || 'Failed to create category');
      }
    } catch (error) {
      console.error('Create category error:', error);
      showError(error.response?.data?.message || error.message || 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  // Update category
  const updateCategory = async () => {
    if (!isAdmin || !editingCategory) {
      showError('Only administrators can update categories');
      return;
    }

    if (!categoryName.trim()) {
      showError('Category name is required');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosSecure.put(`/categories/${editingCategory._id}`, {
        value: categoryName.trim()
      });

      if (response.data.success) {
        await loadCategories();
        showSuccess(`Category "${categoryName}" updated successfully`);
        resetForm();
      } else {
        throw new Error(response.data.message || 'Failed to update category');
      }
    } catch (error) {
      console.error('Update category error:', error);
      showError(error.response?.data?.message || error.message || 'Failed to update category');
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const deleteCategory = async (categoryId, categoryName) => {
    if (!isAdmin) return;

    if (!window.confirm(`Are you sure you want to delete the category "${categoryName}"?`)) {
      return;
    }

    try {
      const response = await axiosSecure.delete(`/categories/${categoryId}`);

      if (response.data.success) {
        await loadCategories();
        showSuccess('Category deleted successfully');
      } else {
        throw new Error(response.data.message || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Delete category error:', error);
      showError(error.response?.data?.message || error.message || 'Failed to delete category');
    }
  };

  // Start editing category
  const startEditing = (category) => {
    setEditingCategory(category);
    setCategoryName(category.value);
  };

  // Filter categories based on search
  const filteredCategories = categories.filter(category =>
    category.value?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">
            You need administrator privileges to manage categories.
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Category Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Add, edit, and manage product categories
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
        {/* Left Column - Category Form */}
        <div className="space-y-6">
          {/* Category Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <PlusIcon className="h-5 w-5 mr-2 text-blue-500" />
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>

            <div className="space-y-4">
              {/* Category Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Enter category name"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  onClick={editingCategory ? updateCategory : createCategory}
                  disabled={loading || !categoryName.trim()}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
                      {editingCategory ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <PlusIcon className="h-5 w-5 mr-2" />
                      {editingCategory ? 'Update Category' : 'Create Category'}
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
                  {categories.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Categories</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {filteredCategories.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Showing</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Categories List */}
        <div className="space-y-6">
          {/* Search */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <TagIcon className="h-5 w-5 mr-2 text-purple-500" />
                Categories ({categories.length})
              </h3>
              
              <div className="relative flex-1 sm:flex-none sm:w-64">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search categories..."
                  className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Categories List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <TagIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {categories.length === 0 ? 'No categories yet' : 'No categories found'}
                </h4>
                <p className="text-gray-500 dark:text-gray-400">
                  {categories.length === 0 
                    ? 'Create your first category to get started' 
                    : 'Try adjusting your search terms'
                  }
                </p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {filteredCategories.map((category, index) => (
                  <motion.div
                    key={category._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <TagIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {category.value}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Created: {new Date(category.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => startEditing(category)}
                        className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        title="Edit category"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteCategory(category._id, category.value)}
                        className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Delete category"
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

export default CategoryManagement;