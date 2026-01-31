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
  ChartBarIcon,
  EyeIcon,
  EyeSlashIcon,
  TagIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import useAuth from '../../hooks/useAuth';
import useAdmin from '../../hooks/useAdmin';

// Custom hook for delete confirmation
const useDeleteConfirmation = () => {
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, item: null, type: '' });

  const confirmDelete = useCallback((item, type = '') => {
    setDeleteConfirm({ show: true, item, type });
  }, []);

  const cancelDelete = useCallback(() => {
    setDeleteConfirm({ show: false, item: null, type: '' });
  }, []);

  return { deleteConfirm, confirmDelete, cancelDelete, setDeleteConfirm };
};

// Custom hook for form management
const useSustainabilityForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'material',
    impactLevel: 'medium',
    co2Reduction: 0,
    waterSaved: 0,
    energySaved: 0,
    tags: [],
    status: 'active'
  });

  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      description: '',
      type: 'material',
      impactLevel: 'medium',
      co2Reduction: 0,
      waterSaved: 0,
      energySaved: 0,
      tags: [],
      status: 'active'
    });
  }, []);

  return { formData, updateField, resetForm, setFormData };
};

const SustainabilityManagement = () => {
  // Hooks
  const { user: currentUser } = useAuth();
  const { isAdmin } = useAdmin();
  const axiosSecure = useAxiosSecure();
  
  // Custom hooks
  const { deleteConfirm, confirmDelete, cancelDelete } = useDeleteConfirmation();
  const { formData, updateField, resetForm, setFormData } = useSustainabilityForm();

  // State
  const [loading, setLoading] = useState(false);
  const [sustainabilityAttributes, setSustainabilityAttributes] = useState([]);
  const [stats, setStats] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [impactFilter, setImpactFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingAttribute, setEditingAttribute] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  // Constants
  const sustainabilityTypes = useMemo(() => [
    { value: 'material', label: 'Material', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: '🧵' },
    { value: 'process', label: 'Process', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: '⚙️' },
    { value: 'certification', label: 'Certification', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', icon: '🏆' },
    { value: 'initiative', label: 'Initiative', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', icon: '🌱' }
  ], []);

  const impactLevels = useMemo(() => [
    { value: 'low', label: 'Low Impact', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
    { value: 'medium', label: 'Medium Impact', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
    { value: 'high', label: 'High Impact', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
    { value: 'very-high', label: 'Very High Impact', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' }
  ], []);

  const commonAttributes = useMemo(() => [
    { name: 'Organic Cotton', type: 'material', impactLevel: 'high', co2Reduction: 45, tags: ['organic', 'cotton', 'natural'] },
    { name: 'Recycled Polyester', type: 'material', impactLevel: 'high', co2Reduction: 32, tags: ['recycled', 'polyester', 'plastic'] },
    { name: 'Waterless Dyeing', type: 'process', impactLevel: 'very-high', waterSaved: 100, tags: ['water-saving', 'dyeing', 'process'] },
    { name: 'Solar Powered', type: 'process', impactLevel: 'high', energySaved: 80, tags: ['solar', 'renewable', 'energy'] },
    { name: 'GOTS Certified', type: 'certification', impactLevel: 'high', tags: ['certification', 'organic', 'textile'] },
    { name: 'Fair Trade', type: 'certification', impactLevel: 'medium', tags: ['certification', 'ethical', 'fair'] },
    { name: 'Carbon Neutral', type: 'initiative', impactLevel: 'high', co2Reduction: 100, tags: ['carbon', 'neutral', 'climate'] },
    { name: 'Zero Waste', type: 'initiative', impactLevel: 'very-high', tags: ['waste', 'recycling', 'circular'] }
  ], []);

  // Message handler
  const showMessage = useCallback((type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), type === 'success' ? 3000 : 5000);
  }, []);

  // Data operations
  const loadSustainabilityAttributes = useCallback(async () => {
    try {
      const params = {};
      if (typeFilter !== 'all') params.type = typeFilter;
      if (impactFilter !== 'all') params.impactLevel = impactFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;

      const response = await axiosSecure.get('/sustainability', { params });
      if (response.data.success) {
        setSustainabilityAttributes(response.data.data?.sustainabilityAttributes || []);
      }
    } catch (error) {
      console.error('Error loading sustainability attributes:', error);
      showMessage('error', 'Failed to load sustainability attributes');
    }
  }, [axiosSecure, typeFilter, impactFilter, statusFilter, searchTerm, showMessage]);

  const loadStats = useCallback(async () => {
    try {
      const response = await axiosSecure.get('/sustainability/stats');
      if (response.data.success) {
        setStats(response.data.data?.overview || {});
      }
    } catch (error) {
      console.error('Error loading sustainability stats:', error);
    }
  }, [axiosSecure]);

  // Effects
  useEffect(() => {
    loadSustainabilityAttributes();
    loadStats();
  }, [loadSustainabilityAttributes, loadStats]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadSustainabilityAttributes();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, loadSustainabilityAttributes]);

  // Tag handlers
  const handleTagInput = useCallback((e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim().toLowerCase())) {
        updateField('tags', [...formData.tags, tagInput.trim().toLowerCase()]);
      }
      setTagInput('');
    }
  }, [formData.tags, tagInput, updateField]);

  const removeTag = useCallback((tagToRemove) => {
    updateField('tags', formData.tags.filter(tag => tag !== tagToRemove));
  }, [formData.tags, updateField]);

  // CRUD operations
  const createSustainability = useCallback(async () => {
    if (!isAdmin) return showMessage('error', 'Only administrators can create sustainability attributes');
    if (!formData.name.trim()) return showMessage('error', 'Sustainability attribute name is required');

    setLoading(true);
    try {
      const response = await axiosSecure.post('/sustainability', formData);
      if (response.data.success) {
        await loadSustainabilityAttributes();
        await loadStats();
        showMessage('success', `"${formData.name}" created successfully`);
        resetForm();
      }
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to create sustainability attribute');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, formData, axiosSecure, loadSustainabilityAttributes, loadStats, showMessage, resetForm]);

  const updateSustainability = useCallback(async () => {
    if (!isAdmin || !editingAttribute) return showMessage('error', 'Only administrators can update sustainability attributes');
    if (!formData.name.trim()) return showMessage('error', 'Sustainability attribute name is required');

    setLoading(true);
    try {
      const response = await axiosSecure.put(`/sustainability/${editingAttribute._id}`, formData);
      if (response.data.success) {
        await loadSustainabilityAttributes();
        await loadStats();
        showMessage('success', `"${formData.name}" updated successfully`);
        resetForm();
        setEditingAttribute(null);
      }
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to update sustainability attribute');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, editingAttribute, formData, axiosSecure, loadSustainabilityAttributes, loadStats, showMessage, resetForm]);

  const executeDelete = useCallback(async () => {
    if (!isAdmin || !deleteConfirm.item) return;

    try {
      const response = await axiosSecure.delete(`/sustainability/${deleteConfirm.item._id}`);
      if (response.data.success) {
        await loadSustainabilityAttributes();
        await loadStats();
        showMessage('success', `"${deleteConfirm.item.name}" deleted successfully`);
        cancelDelete();
      }
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to delete sustainability attribute');
      cancelDelete();
    }
  }, [isAdmin, deleteConfirm.item, axiosSecure, loadSustainabilityAttributes, loadStats, showMessage, cancelDelete]);

  const toggleSustainabilityStatus = useCallback(async (attributeId) => {
    if (!isAdmin) return;

    try {
      const response = await axiosSecure.patch(`/sustainability/${attributeId}/toggle-status`);
      if (response.data.success) {
        await loadSustainabilityAttributes();
        showMessage('success', `Sustainability attribute ${response.data.data.newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      }
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to toggle status');
    }
  }, [isAdmin, axiosSecure, loadSustainabilityAttributes, showMessage]);

  // UI helpers
  const startEditing = useCallback((attribute) => {
    setEditingAttribute(attribute);
    setFormData({
      name: attribute.name,
      description: attribute.description || '',
      type: attribute.type,
      impactLevel: attribute.impactLevel,
      co2Reduction: attribute.co2Reduction || 0,
      waterSaved: attribute.waterSaved || 0,
      energySaved: attribute.energySaved || 0,
      tags: attribute.tags || [],
      status: attribute.status
    });
  }, [setFormData]);

  const quickAddAttribute = useCallback((attribute) => {
    if (!editingAttribute) {
      setFormData(prev => ({
        ...prev,
        name: attribute.name,
        type: attribute.type,
        impactLevel: attribute.impactLevel,
        co2Reduction: attribute.co2Reduction || 0,
        waterSaved: attribute.waterSaved || 0,
        energySaved: attribute.energySaved || 0,
        tags: attribute.tags || []
      }));
    }
  }, [editingAttribute, setFormData]);

  const getTypeColor = useCallback((type) => {
    const typeObj = sustainabilityTypes.find(t => t.value === type);
    return typeObj ? typeObj.color : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }, [sustainabilityTypes]);

  const getImpactColor = useCallback((impact) => {
    const impactObj = impactLevels.find(i => i.value === impact);
    return impactObj ? impactObj.color : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }, [impactLevels]);

  const getTypeIcon = useCallback((type) => {
    const typeObj = sustainabilityTypes.find(t => t.value === type);
    return typeObj ? typeObj.icon : '📊';
  }, [sustainabilityTypes]);

  // Filtered attributes
  const filteredAttributes = useMemo(() => 
    sustainabilityAttributes.filter(attr => {
      const matchesSearch = !searchTerm || 
        attr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attr.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attr.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = typeFilter === 'all' || attr.type === typeFilter;
      const matchesImpact = impactFilter === 'all' || attr.impactLevel === impactFilter;
      const matchesStatus = statusFilter === 'all' || attr.status === statusFilter;
      
      return matchesSearch && matchesType && matchesImpact && matchesStatus;
    }), 
    [sustainabilityAttributes, searchTerm, typeFilter, impactFilter, statusFilter]
  );

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Attribute</h3>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">"{deleteConfirm.item?.name}"</span>? This action cannot be undone.
              </p>

              {deleteConfirm.item && (
                <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getTypeColor(deleteConfirm.item.type)} text-lg`}>
                    {getTypeIcon(deleteConfirm.item.type)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{deleteConfirm.item.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {sustainabilityTypes.find(t => t.value === deleteConfirm.item.type)?.label}
                    </div>
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
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sustainability Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage eco-friendly materials, processes, certifications, and initiatives
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
            <p className="flex items-center">
              {message.type === 'success' ? 
                <CheckCircleIcon className="h-5 w-5 mr-2" /> : 
                <XMarkIcon className="h-5 w-5 mr-2" />
              }
              {message.text}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column - Form and Quick Add */}
        <div className="xl:col-span-1 space-y-6">
          {/* Sustainability Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingAttribute ? '✏️ Edit Sustainability' : '➕ Add Sustainability Attribute'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Attribute Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g., Organic Cotton, Solar Powered, GOTS Certified"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => updateField('type', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {sustainabilityTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Impact Level
                  </label>
                  <select
                    value={formData.impactLevel}
                    onChange={(e) => updateField('impactLevel', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {impactLevels.map(impact => (
                      <option key={impact.value} value={impact.value}>{impact.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Environmental Impact Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    CO₂ (%)
                  </label>
                  <input
                    type="number"
                    value={formData.co2Reduction}
                    onChange={(e) => updateField('co2Reduction', parseInt(e.target.value) || 0)}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Water (L)
                  </label>
                  <input
                    type="number"
                    value={formData.waterSaved}
                    onChange={(e) => updateField('waterSaved', parseInt(e.target.value) || 0)}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Energy (kWh)
                  </label>
                  <input
                    type="number"
                    value={formData.energySaved}
                    onChange={(e) => updateField('energySaved', parseInt(e.target.value) || 0)}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Describe this sustainability attribute..."
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInput}
                  placeholder="Type tag and press Enter..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-sm rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={resetForm}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingAttribute ? updateSustainability : createSustainability}
                  disabled={loading || !formData.name.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold shadow-lg"
                >
                  {loading ? (
                    <>
                      <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
                      {editingAttribute ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <PlusIcon className="h-5 w-5 mr-2" />
                      {editingAttribute ? 'Update' : 'Create'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Add Common Attributes */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <TagIcon className="h-5 w-5 mr-2 text-blue-500" />
              Quick Add Common Attributes
            </h4>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {commonAttributes.map((attribute, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => quickAddAttribute(attribute)}
                  disabled={!!editingAttribute}
                  className="w-full p-3 text-left border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getTypeColor(attribute.type)} text-sm`}>
                      {getTypeIcon(attribute.type)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        {attribute.name}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(attribute.type)}`}>
                          {sustainabilityTypes.find(t => t.value === attribute.type)?.label}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getImpactColor(attribute.impactLevel)}`}>
                          {impactLevels.find(i => i.value === attribute.impactLevel)?.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Stats and List */}
        <div className="xl:col-span-2 space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Attributes', value: stats.totalAttributes || 0, color: 'bg-gradient-to-r from-blue-500 to-cyan-500', icon: '📊' },
              { label: 'CO₂ Reduction', value: `${stats.totalCO2Reduction || 0}%`, color: 'bg-gradient-to-r from-green-500 to-emerald-500', icon: '🌿' },
              { label: 'Water Saved', value: `${stats.totalWaterSaved || 0}L`, color: 'bg-gradient-to-r from-cyan-500 to-blue-500', icon: '💧' },
              { label: 'Energy Saved', value: `${stats.totalEnergySaved || 0}kWh`, color: 'bg-gradient-to-r from-orange-500 to-red-500', icon: '⚡' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg ${stat.color}`}>
                    {stat.icon}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Filters and Search */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                🌱 Sustainability Attributes ({filteredAttributes.length})
              </h3>
              
              <div className="flex flex-col lg:flex-row gap-3">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  {sustainabilityTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>

                <select
                  value={impactFilter}
                  onChange={(e) => setImpactFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Impacts</option>
                  {impactLevels.map(impact => (
                    <option key={impact.value} value={impact.value}>{impact.label}</option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search attributes..."
                    className="w-full lg:w-64 px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Sustainability Attributes List */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {filteredAttributes.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                    📊
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {sustainabilityAttributes.length === 0 ? 'No sustainability attributes yet' : 'No attributes found'}
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400">
                    {sustainabilityAttributes.length === 0 
                      ? 'Create your first sustainability attribute to get started' 
                      : 'Try adjusting your search or filters'
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {filteredAttributes.map((attribute, index) => (
                  <motion.div
                    key={attribute._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getTypeColor(attribute.type)} text-lg`}>
                        {getTypeIcon(attribute.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                            {attribute.name}
                          </h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${getImpactColor(attribute.impactLevel)}`}>
                            {impactLevels.find(i => i.value === attribute.impactLevel)?.label}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            attribute.status === 'active'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {attribute.status}
                          </span>
                        </div>
                        
                        {attribute.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                            {attribute.description}
                          </p>
                        )}

                        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                          {attribute.co2Reduction > 0 && (
                            <span>CO₂: {attribute.co2Reduction}% reduction</span>
                          )}
                          {attribute.waterSaved > 0 && (
                            <span>Water: {attribute.waterSaved}L saved</span>
                          )}
                          {attribute.energySaved > 0 && (
                            <span>Energy: {attribute.energySaved}kWh saved</span>
                          )}
                        </div>

                        {attribute.tags && attribute.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {attribute.tags.slice(0, 3).map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                            {attribute.tags.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                                +{attribute.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => toggleSustainabilityStatus(attribute._id)}
                        className={`p-2 rounded-lg transition-colors ${
                          attribute.status === 'active'
                            ? 'text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:text-yellow-300 dark:hover:bg-yellow-900/20'
                            : 'text-green-600 hover:text-green-800 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20'
                        }`}
                        title={attribute.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        {attribute.status === 'active' ? (
                          <EyeSlashIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => startEditing(attribute)}
                        className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        title="Edit attribute"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => confirmDelete(attribute, 'sustainability')}
                        className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Delete attribute"
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

export default SustainabilityManagement;