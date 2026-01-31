import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  PlusIcon, MagnifyingGlassIcon, XMarkIcon, CheckCircleIcon,
  ExclamationTriangleIcon, EyeDropperIcon, ClipboardIcon,
  SwatchIcon, ArrowPathIcon, PencilIcon, TrashIcon,
  AdjustmentsHorizontalIcon, EyeIcon, ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import useAuth from '../../hooks/useAuth';
import useAdmin from '../../hooks/useAdmin';

const AddColor = () => {
  // Hooks
  const { user: currentUser } = useAuth();
  const { isAdmin } = useAdmin();
  const axiosSecure = useAxiosSecure();
  
  // State
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [colorInput, setColorInput] = useState({ name: '', hex: '', rgb: '', families: [] });
  const [savedColors, setSavedColors] = useState([]);
  const [colorStats, setColorStats] = useState({ saved: 0, available: 0 });
  const [editingColor, setEditingColor] = useState(null);
  const [activeTab, setActiveTab] = useState('search');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('name');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, color: null });

  // Refs
  const mobileMenuRef = useRef(null);
  const deleteConfirmRef = useRef(null);

  // Derived state
  const showPreview = useMemo(() => 
    !!(colorInput.hex || colorInput.rgb || colorInput.name), 
    [colorInput]
  );

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
      if (deleteConfirmRef.current && !deleteConfirmRef.current.contains(event.target) && deleteConfirm.show) {
        setDeleteConfirm({ show: false, color: null });
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [deleteConfirm.show]);

  // Messages
  const showMessage = useCallback((type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), type === 'success' ? 3000 : 5000);
  }, []);

  // Color conversion utilities
  const hexToRgb = useCallback((hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? { r: +result[1], g: +result[2], b: +result[3] } : null;
  }, []);

  const rgbToHex = useCallback((r, g, b) => 
    "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1), []);

  const parseRgbString = useCallback((rgbString) => {
    const match = rgbString.match(/RGB\((\d+),\s*(\d+),\s*(\d+)\)/i);
    return match ? { r: +match[1], g: +match[2], b: +match[3] } : null;
  }, []);

  const generateColorName = useCallback((hex) => 
    `COLOR_${hex.replace('#', '').toUpperCase()}`, []);

  const getTextColor = useCallback((hexColor) => {
    if (!hexColor) return '#000000';
    const hex = hexColor.replace('#', '');
    if (hex.length !== 6) return '#000000';
    const [r, g, b] = [hex.substr(0,2), hex.substr(2,2), hex.substr(4,2)].map(x => parseInt(x,16));
    return ((r * 299 + g * 587 + b * 114) / 1000) > 128 ? '#000000' : '#FFFFFF';
  }, []);

  // Data operations
  const loadSavedColors = useCallback(async () => {
    try {
      const [colorsRes, statsRes] = await Promise.all([
        axiosSecure.get('/colors'),
        axiosSecure.get('/colors/stats')
      ]);
      if (colorsRes.data.success) setSavedColors(colorsRes.data.data?.colors || []);
      if (statsRes.data.success) setColorStats(statsRes.data.data);
    } catch (error) {
      console.error('Error loading saved colors:', error);
    }
  }, [axiosSecure]);

  useEffect(() => { loadSavedColors(); }, [loadSavedColors]);

  const searchColors = useCallback(async (query) => {
    if (!query.trim()) return setSearchResults([]);
    try {
      const res = await axiosSecure.get(`/colors/data?search=${encodeURIComponent(query)}&limit=10`);
      if (res.data.success) setSearchResults(res.data.data?.colors || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    }
  }, [axiosSecure]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => searchColors(searchTerm), 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, searchColors]);

  // Color validation and transformation
  const isColorSaved = useCallback((colorData) => 
    savedColors.some(color => 
      color.name?.toLowerCase() === colorData.name?.toLowerCase() ||
      color.hex?.toLowerCase() === colorData.hex?.toLowerCase()
    ), [savedColors]);

  const handleColorInput = useCallback((type, value) => {
    if (type === 'hex' && /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value.startsWith('#') ? value : `#${value}`)) {
      const rgb = hexToRgb(value);
      if (rgb) {
        setColorInput(prev => ({
          name: prev.name || generateColorName(value),
          hex: value.toUpperCase(),
          rgb: `RGB(${rgb.r}, ${rgb.g}, ${rgb.b})`,
          families: prev.families
        }));
      }
    } else if (type === 'rgb') {
      const rgb = parseRgbString(value);
      if (rgb) {
        const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
        setColorInput(prev => ({
          name: prev.name || generateColorName(hex),
          hex: hex.toUpperCase(),
          rgb: value.toUpperCase(),
          families: prev.families
        }));
      }
    } else {
      setColorInput(prev => ({ ...prev, [type]: value }));
    }
  }, [hexToRgb, rgbToHex, parseRgbString, generateColorName]);

  // CRUD operations
  const saveColor = useCallback(async () => {
    if (!isAdmin) return showMessage('error', 'Only administrators can add colors');
    if (!colorInput.name && !colorInput.hex && !colorInput.rgb) {
      return showMessage('error', 'Please provide at least one of: Name, HEX, or RGB');
    }
    if (isColorSaved(colorInput)) return showMessage('error', 'Color already exists');

    setLoading(true);
    try {
      const colorData = {
        name: colorInput.name || generateColorName(colorInput.hex),
        hex: colorInput.hex,
        rgb: colorInput.rgb,
        families: colorInput.families
      };
      const endpoint = editingColor ? `/colors/${editingColor._id}` : '/colors';
      const method = editingColor ? 'put' : 'post';
      
      const res = await axiosSecure[method](endpoint, colorData);
      if (res.data.success) {
        await loadSavedColors();
        showMessage('success', `Color "${colorData.name}" ${editingColor ? 'updated' : 'added'} successfully`);
        resetForm();
        setActiveTab('saved');
      }
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to save color');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, colorInput, editingColor, axiosSecure, loadSavedColors, showMessage, isColorSaved, generateColorName]);

  // Delete confirmation handler
  const confirmDelete = useCallback((color) => {
    setDeleteConfirm({ show: true, color });
  }, []);

  const cancelDelete = useCallback(() => {
    setDeleteConfirm({ show: false, color: null });
  }, []);

  const executeDelete = useCallback(async () => {
    if (!isAdmin || !deleteConfirm.color) return;
    
    try {
      const res = await axiosSecure.delete(`/colors/${deleteConfirm.color._id}`);
      if (res.data.success) {
        await loadSavedColors();
        showMessage('success', `Color "${deleteConfirm.color.name}" deleted successfully`);
        setDeleteConfirm({ show: false, color: null });
      }
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to delete color');
      setDeleteConfirm({ show: false, color: null });
    }
  }, [isAdmin, deleteConfirm.color, axiosSecure, loadSavedColors, showMessage]);

  const startEditing = useCallback((color) => {
    setEditingColor(color);
    setColorInput({
      name: color.name || '',
      hex: color.hex || '',
      rgb: color.rgb || '',
      families: color.families || []
    });
    setActiveTab('manual');
  }, []);

  const resetForm = useCallback(() => {
    setColorInput({ name: '', hex: '', rgb: '', families: [] });
    setSearchTerm('');
    setEditingColor(null);
    setSearchResults([]);
  }, []);

  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text);
    showMessage('success', 'Copied to clipboard!');
  }, [showMessage]);

  const getSortedColors = useCallback(() => 
    [...savedColors].sort((a, b) => {
      switch (sortBy) {
        case 'name': return (a.name || '').localeCompare(b.name || '');
        case 'hex': return (a.hex || '').localeCompare(b.hex || '');
        case 'date': return new Date(b.createdAt) - new Date(a.createdAt);
        default: return 0;
      }
    }), [savedColors, sortBy]);

  // Event handlers
  const handleSearchSelect = useCallback((color) => {
    setColorInput({
      name: color.name || '',
      hex: color.hex || '',
      rgb: color.rgb || '',
      families: color.families || []
    });
    setSearchTerm(color.name);
    setSearchResults([]);
    setActiveTab('manual');
  }, []);

  const handleColorPickerChange = useCallback((hex) => {
    const rgb = hexToRgb(hex);
    if (rgb) {
      setColorInput(prev => ({
        name: prev.name || generateColorName(hex),
        hex: hex.toUpperCase(),
        rgb: `RGB(${rgb.r}, ${rgb.g}, ${rgb.b})`,
        families: prev.families
      }));
    }
  }, [hexToRgb, generateColorName]);

  // Admin check
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
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
              ref={deleteConfirmRef}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-xl border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                  <ExclamationCircleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Color</h3>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">"{deleteConfirm.color?.name}"</span>? This action cannot be undone.
              </p>

              {deleteConfirm.color && (
                <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div 
                    className="w-12 h-12 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm"
                    style={{ backgroundColor: deleteConfirm.color.hex }}
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{deleteConfirm.color.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">{deleteConfirm.color.hex}</div>
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
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <SwatchIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Color Manager</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">Search, create, and manage colors</p>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex items-center space-x-6">
              <button onClick={resetForm} className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <ArrowPathIcon className="h-5 w-5 mr-2" /> Reset
              </button>
              <div className="flex items-center space-x-4 text-sm">
                <div className="text-center"><div className="font-semibold text-gray-900 dark:text-white">{savedColors.length}</div><div className="text-gray-500 dark:text-gray-400">Saved</div></div>
                <div className="text-center"><div className="font-semibold text-gray-900 dark:text-white">{colorStats.available || 0}</div><div className="text-gray-500 dark:text-gray-400">Available</div></div>
              </div>
            </div>

            <button ref={mobileMenuRef} onClick={() => setShowMobileMenu(!showMobileMenu)} className="lg:hidden p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
              <AdjustmentsHorizontalIcon className="h-6 w-6" />
            </button>
          </div>

          <AnimatePresence>
            {showMobileMenu && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="lg:hidden border-t border-gray-200 dark:border-gray-700 py-4">
                <div className="flex flex-col space-y-3">
                  <button onClick={resetForm} className="flex items-center justify-center w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <ArrowPathIcon className="h-5 w-5 mr-2" /> Reset Form
                  </button>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3"><div className="font-semibold text-gray-900 dark:text-white">{savedColors.length}</div><div className="text-gray-500 dark:text-gray-400 text-xs">Saved Colors</div></div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3"><div className="font-semibold text-gray-900 dark:text-white">{colorStats.available || 0}</div><div className="text-gray-500 dark:text-gray-400 text-xs">Available</div></div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Messages */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <AnimatePresence>
          {message.text && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={`mb-6 p-4 rounded-xl border ${
              message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-400'
            }`}>
              <p className="flex items-center">{message.type === 'success' ? <CheckCircleIcon className="h-5 w-5 mr-2" /> : <XMarkIcon className="h-5 w-5 mr-2" />}{message.text}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="grid grid-cols-3">
                {['search', 'manual', 'saved'].map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`p-4 text-center font-medium transition-colors ${
                    activeTab === tab ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}>
                    {tab === 'search' && <MagnifyingGlassIcon className="h-5 w-5 mx-auto mb-1" />}
                    {tab === 'manual' && <PlusIcon className="h-5 w-5 mx-auto mb-1" />}
                    {tab === 'saved' && <SwatchIcon className="h-5 w-5 mx-auto mb-1" />}
                    <span className="text-xs sm:text-sm capitalize">{tab}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Search Tab */}
            <AnimatePresence>
              {activeTab === 'search' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center"><MagnifyingGlassIcon className="h-5 w-5 mr-2 text-blue-500" />Search Colors</h3>
                  <div className="relative mb-4">
                    <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Type color name..." className="w-full px-4 py-3 pl-11 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  <AnimatePresence>
                    {searchResults.length > 0 && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2 max-h-64 overflow-y-auto">
                        {searchResults.map((color, index) => (
                          <motion.button key={color._id || index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} onClick={() => handleSearchSelect(color)} className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm" style={{ backgroundColor: color.hex }} />
                            <div className="flex-1 min-w-0"><div className="font-medium text-gray-900 dark:text-white text-sm truncate">{color.name}</div><div className="text-xs text-gray-500 dark:text-gray-400 truncate">{color.hex}</div></div>
                            {isColorSaved(color) && <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0" />}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {searchTerm && searchResults.length === 0 && <div className="text-center py-8 text-gray-500 dark:text-gray-400"><EyeDropperIcon className="h-8 w-8 mx-auto mb-2 opacity-50" /><p className="text-sm">No colors found</p></div>}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Manual Tab */}
            <AnimatePresence>
              {activeTab === 'manual' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center"><PlusIcon className="h-5 w-5 mr-2 text-green-500" />Create Color</h3>
                  <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color Picker</label><div className="flex items-center space-x-4"><input type="color" value={colorInput.hex || '#000000'} onChange={(e) => handleColorPickerChange(e.target.value)} className="w-16 h-16 cursor-pointer rounded-xl border border-gray-300 dark:border-gray-600 shadow-sm" /><div className="flex-1"><p className="text-sm text-gray-600 dark:text-gray-400">Click to pick a color</p></div></div></div>
                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">HEX Code</label><input type="text" value={colorInput.hex} onChange={(e) => handleColorInput('hex', e.target.value)} placeholder="#FF5733" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">RGB Values</label><input type="text" value={colorInput.rgb} onChange={(e) => handleColorInput('rgb', e.target.value)} placeholder="RGB(255, 87, 51)" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color Name</label><input type="text" value={colorInput.name} onChange={(e) => handleColorInput('name', e.target.value)} placeholder="Enter color name" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Main Content */}
          <div className="xl:col-span-2 space-y-6">
            {/* Color Preview */}
            <AnimatePresence>
              {showPreview && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{editingColor ? 'Edit Color' : 'Color Preview'}</h3>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => copyToClipboard(colorInput.hex)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" title="Copy HEX"><ClipboardIcon className="h-5 w-5" /></button>
                      <button onClick={resetForm} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"><XMarkIcon className="h-5 w-5" /></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-48 lg:h-64 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-3xl font-bold transition-colors shadow-lg" style={{ backgroundColor: colorInput.hex || '#000000', color: getTextColor(colorInput.hex || '#000000') }}>{colorInput.name || 'Color Preview'}</div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 text-center"><div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{colorInput.hex || '--'}</div><div className="text-xs text-gray-500 dark:text-gray-400">HEX</div></div>
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 text-center"><div className="text-lg font-bold text-gray-900 dark:text-white mb-1 truncate">{colorInput.rgb || '--'}</div><div className="text-xs text-gray-500 dark:text-gray-400">RGB</div></div>
                      </div>
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4"><div className="text-sm font-medium text-gray-900 dark:text-white mb-2">Color Details</div><div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Name:</span><span className="font-medium text-gray-900 dark:text-white">{colorInput.name || 'Not set'}</span></div><div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Status:</span><span className={`font-medium ${isColorSaved(colorInput) ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>{isColorSaved(colorInput) ? 'Saved' : 'New'}</span></div></div></div>
                      <button onClick={saveColor} disabled={loading || (!colorInput.name && !colorInput.hex && !colorInput.rgb)} className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold shadow-lg">
                        {loading ? <><ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />{editingColor ? 'Updating...' : 'Adding...'}</> : <><PlusIcon className="h-5 w-5 mr-2" />{editingColor ? 'Update Color' : 'Add to Collection'}</>}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Saved Colors */}
            <AnimatePresence>
              {activeTab === 'saved' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-3 sm:space-y-0">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your Color Collection ({savedColors.length})</h3>
                    <div className="flex items-center space-x-3">
                      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="name">Sort by Name</option><option value="hex">Sort by HEX</option><option value="date">Sort by Date</option>
                      </select>
                      <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                        <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}><SwatchIcon className="h-4 w-4" /></button>
                        <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}><EyeIcon className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </div>
                  {savedColors.length === 0 ? (
                    <div className="text-center py-12"><div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 max-w-md mx-auto"><SwatchIcon className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" /><h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No colors saved yet</h4><p className="text-gray-600 dark:text-gray-400 mb-4">Start by searching for colors or creating new ones</p><button onClick={() => setActiveTab('search')} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Explore Colors</button></div></div>
                  ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {getSortedColors().map((color, index) => (
                        <motion.div key={color._id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }} className="group relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all">
                          <div className="w-full h-20 rounded-lg mb-3 border border-gray-300 dark:border-gray-600 shadow-inner" style={{ backgroundColor: color.hex }} />
                          <div className="text-center space-y-1"><div className="font-medium text-gray-900 dark:text-white text-sm truncate">{color.name}</div><div className="text-xs text-gray-500 dark:text-gray-400 font-mono">{color.hex}</div></div>
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                            <button onClick={() => startEditing(color)} className="p-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors" title="Edit color"><PencilIcon className="h-3 w-3" /></button>
                            <button onClick={() => confirmDelete(color)} className="p-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors" title="Delete color"><TrashIcon className="h-3 w-3" /></button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {getSortedColors().map((color, index) => (
                        <motion.div key={color._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all">
                          <div className="flex items-center space-x-4 flex-1"><div className="w-12 h-12 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm" style={{ backgroundColor: color.hex }} /><div className="flex-1 min-w-0"><div className="font-semibold text-gray-900 dark:text-white truncate">{color.name}</div><div className="text-sm text-gray-500 dark:text-gray-400 space-x-4"><span className="font-mono">{color.hex}</span><span>{color.rgb}</span></div></div></div>
                          <div className="flex items-center space-x-2">
                            <button onClick={() => copyToClipboard(color.hex)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" title="Copy HEX"><ClipboardIcon className="h-4 w-4" /></button>
                            <button onClick={() => startEditing(color)} className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors" title="Edit color"><PencilIcon className="h-4 w-4" /></button>
                            <button onClick={() => confirmDelete(color)} className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors" title="Delete color"><TrashIcon className="h-4 w-4" /></button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddColor;