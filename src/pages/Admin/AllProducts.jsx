import { useState, useEffect, useCallback } from 'react';
import { 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaSearch, 
  FaPlus, 
  FaSpinner, 
  FaSync,
  FaTimes,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaInfoCircle,
  FaImage,
  FaTags,
  FaBox,
  FaWarehouse,
  FaShieldAlt
} from 'react-icons/fa';
import { FiPackage, FiFileText, FiLayers } from 'react-icons/fi';
import { MdCategory, MdLocalOffer } from 'react-icons/md';
import { BsFillCalendarDateFill } from 'react-icons/bs';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import ViewProduct from './ViewProduct';

const AllProducts = () => {
  const axiosSecure = useAxiosSecure();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  
  // Filters and pagination
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Modal states
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, product: null });
  const [quickViewModal, setQuickViewModal] = useState({ 
    isOpen: false, 
    product: null,
    fullProductData: null,
    loading: false 
  });
  const [bulkDeleteModal, setBulkDeleteModal] = useState({ isOpen: false });

  // Enhanced fetch products with detailed data
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
        // Include more data in initial fetch
        populate: 'true',
        withDetails: 'true'
      });

      // Remove empty filter values
      Object.keys(filters).forEach(key => {
        if (filters[key] === '') {
          params.delete(key);
        }
      });

      // Add timestamp to prevent caching
      params.append('_t', Date.now());

      console.log('Fetching products with params:', params.toString());
      
      const response = await axiosSecure.get(`/products?${params}`);
      
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        const productsData = response.data.data.products || response.data.data || [];
        const paginationData = response.data.data.pagination || response.data.pagination || {};
        
        // Enrich product data with additional information
        const enrichedProducts = productsData.map(product => ({
          ...product,
          // Ensure all necessary fields exist
          title: product.title || product.name || 'Untitled Product',
          productCode: product.productCode || product.code || 'N/A',
          price: product.price || product.regularPrice || 0,
          discountPrice: product.discountPrice || product.salePrice || 0,
          quantity: product.quantity || product.stock || 0,
          productStatus: product.productStatus || product.status || 'draft',
          category: product.category || product.categoryName || 'Uncategorized',
          brand: product.brand || product.brandName || 'No Brand',
          gsmCode: product.gsmCode || product.sku || '',
          mainImage: product.mainImage || product.thumbnail || product.images?.[0] || '',
          images: product.images || product.gallery || [],
          description: product.description || product.shortDescription || '',
          longDescription: product.longDescription || product.fullDescription || '',
          specifications: product.specifications || product.features || {},
          tags: product.tags || product.keywords || [],
          weight: product.weight || 0,
          dimensions: product.dimensions || {},
          warranty: product.warranty || 'No warranty',
          shippingInfo: product.shippingInfo || 'Standard shipping',
          createdAt: product.createdAt || product.dateAdded || new Date().toISOString(),
          updatedAt: product.updatedAt || product.lastModified || new Date().toISOString()
        }));
        
        setProducts(enrichedProducts);
        setPagination(prev => ({
          ...prev,
          total: paginationData.total || enrichedProducts.length,
          pages: paginationData.pages || Math.ceil((paginationData.total || enrichedProducts.length) / prev.limit)
        }));
        
        setSelectedProducts(new Set());
        
        if (response.data.message) {
          toast.success(response.data.message);
        }
      } else {
        toast.error(response.data.message || 'Failed to load products');
        setProducts([]);
      }
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load products';
      toast.error(errorMessage);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [axiosSecure, pagination.page, pagination.limit, filters]);

  // Fetch complete product details for quick view
  const fetchFullProductDetails = useCallback(async (productId) => {
    if (!productId) return null;
    
    try {
      setQuickViewModal(prev => ({ ...prev, loading: true }));
      
      // Fetch with all possible query parameters to get complete data
      const response = await axiosSecure.get(`/products/${productId}`, {
        params: {
          populate: 'true',
          withDetails: 'true',
          withSpecifications: 'true',
          withGallery: 'true',
          withVariants: 'true',
          withReviews: 'true',
          withInventory: 'true'
        }
      });
      
      console.log('Full product details response:', response.data);
      
      if (response.data.success) {
        const fullProductData = response.data.data || response.data.product;
        
        // Normalize the data structure
        const normalizedProduct = {
          // Basic info
          _id: fullProductData._id,
          title: fullProductData.title || fullProductData.name || '',
          productCode: fullProductData.productCode || fullProductData.code || '',
          sku: fullProductData.sku || fullProductData.gsmCode || '',
          slug: fullProductData.slug || '',
          
          // Pricing
          price: fullProductData.price || fullProductData.regularPrice || 0,
          discountPrice: fullProductData.discountPrice || fullProductData.salePrice || 0,
          costPrice: fullProductData.costPrice || fullProductData.manufacturingCost || 0,
          taxRate: fullProductData.taxRate || fullProductData.tax || 0,
          
          // Inventory
          quantity: fullProductData.quantity || fullProductData.stock || 0,
          lowStockThreshold: fullProductData.lowStockThreshold || fullProductData.minimumQuantity || 10,
          manageStock: fullProductData.manageStock || false,
          allowBackorder: fullProductData.allowBackorder || false,
          
          // Status
          productStatus: fullProductData.productStatus || fullProductData.status || 'draft',
          isFeatured: fullProductData.isFeatured || fullProductData.featured || false,
          isNew: fullProductData.isNew || fullProductData.newArrival || false,
          isBestSeller: fullProductData.isBestSeller || false,
          
          // Categories & Brand
          category: fullProductData.category || fullProductData.categoryName || '',
          subcategory: fullProductData.subcategory || fullProductData.subCategory || '',
          brand: fullProductData.brand || fullProductData.brandName || '',
          
          // Images
          mainImage: fullProductData.mainImage || fullProductData.thumbnail || fullProductData.image || '',
          images: fullProductData.images || fullProductData.gallery || [],
          
          // Descriptions
          shortDescription: fullProductData.shortDescription || fullProductData.description || '',
          fullDescription: fullProductData.fullDescription || fullProductData.longDescription || '',
          keyFeatures: fullProductData.keyFeatures || fullProductData.features || [],
          
          // Specifications
          specifications: fullProductData.specifications || {},
          dimensions: fullProductData.dimensions || {
            length: fullProductData.length || 0,
            width: fullProductData.width || 0,
            height: fullProductData.height || 0,
            unit: fullProductData.dimensionUnit || 'cm'
          },
          weight: fullProductData.weight || 0,
          weightUnit: fullProductData.weightUnit || 'kg',
          material: fullProductData.material || fullProductData.materials || '',
          color: fullProductData.color || fullProductData.colors || '',
          size: fullProductData.size || fullProductData.sizes || '',
          
          // SEO
          metaTitle: fullProductData.metaTitle || fullProductData.seoTitle || '',
          metaDescription: fullProductData.metaDescription || fullProductData.seoDescription || '',
          metaKeywords: fullProductData.metaKeywords || fullProductData.tags || [],
          
          // Shipping
          shippingInfo: fullProductData.shippingInfo || '',
          shippingWeight: fullProductData.shippingWeight || fullProductData.weight || 0,
          shippingDimensions: fullProductData.shippingDimensions || fullProductData.dimensions || {},
          freeShipping: fullProductData.freeShipping || false,
          shippingCost: fullProductData.shippingCost || 0,
          
          // Warranty & Returns
          warranty: fullProductData.warranty || '',
          warrantyPeriod: fullProductData.warrantyPeriod || '',
          returnPolicy: fullProductData.returnPolicy || '',
          
          // Variants
          variants: fullProductData.variants || fullProductData.options || [],
          attributes: fullProductData.attributes || {},
          
          // Reviews & Ratings
          averageRating: fullProductData.averageRating || fullProductData.rating || 0,
          reviewCount: fullProductData.reviewCount || 0,
          reviews: fullProductData.reviews || [],
          
          // Analytics
          views: fullProductData.views || 0,
          salesCount: fullProductData.salesCount || fullProductData.totalSales || 0,
          wishlistCount: fullProductData.wishlistCount || 0,
          
          // Timestamps
          createdAt: fullProductData.createdAt || fullProductData.dateAdded || '',
          updatedAt: fullProductData.updatedAt || fullProductData.lastModified || '',
          publishedAt: fullProductData.publishedAt || ''
        };
        
        return normalizedProduct;
      } else {
        toast.error(response.data.message || 'Failed to load product details');
        return null;
      }
    } catch (error) {
      console.error('❌ Error fetching full product details:', error);
      toast.error('Failed to load complete product details');
      return null;
    } finally {
      setQuickViewModal(prev => ({ ...prev, loading: false }));
    }
  }, [axiosSecure]);

  // Handle quick view modal opening with full data
  const handleQuickView = useCallback(async (product) => {
    // First show modal with basic data
    setQuickViewModal({ 
      isOpen: true, 
      product: product,
      fullProductData: null,
      loading: true 
    });
    
    // Then fetch complete details
    const fullProductData = await fetchFullProductDetails(product._id);
    
    setQuickViewModal(prev => ({ 
      ...prev, 
      fullProductData,
      loading: false 
    }));
  }, [fetchFullProductDetails]);

  // Real-time refresh
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Enhanced delete product with proper error handling
  const handleDelete = async (productId) => {
    try {
      setDeleteLoading(productId);
      
      const response = await axiosSecure.delete(`/products/${productId}`);
      
      if (response.data.success) {
        toast.success('🎉 Product deleted successfully');
        setDeleteModal({ isOpen: false, product: null });
        await fetchProducts();
        toast.success('Product list updated');
      } else {
        throw new Error(response.data.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete product';
      toast.error(`Delete failed: ${errorMessage}`);
    } finally {
      setDeleteLoading(null);
    }
  };

  // Bulk delete products
  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) {
      toast.warning('Please select products to delete');
      return;
    }

    try {
      setBulkActionLoading(true);
      const productIds = Array.from(selectedProducts);
      
      const response = await axiosSecure.patch('/products/bulk/update', {
        productIds,
        updateData: { _deleted: true }
      });

      if (response.data.success) {
        toast.success(`🗑️ ${productIds.length} products deleted successfully`);
        setBulkDeleteModal({ isOpen: false });
        await fetchProducts();
      }
    } catch (error) {
      console.error('❌ Bulk delete error:', error);
      toast.error('Failed to delete products');
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Toggle product status with optimistic update
  const toggleStatus = async (productId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      // Optimistic update
      setProducts(prev => prev.map(product => 
        product._id === productId 
          ? { ...product, productStatus: newStatus }
          : product
      ));

      const response = await axiosSecure.patch(`/products/${productId}/status`, {
        productStatus: newStatus
      });

      if (!response.data.success) {
        // Revert on error
        setProducts(prev => prev.map(product => 
          product._id === productId 
            ? { ...product, productStatus: currentStatus }
            : product
        ));
        throw new Error('Status update failed');
      }

      toast.success(`Product ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('❌ Error updating status:', error);
      toast.error('Failed to update product status');
    }
  };

  // Enhanced filter handling
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Enhanced sort function
  const handleSort = useCallback((sortBy) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'desc' ? 'asc' : 'desc'
    }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      category: '',
      status: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Selection handlers
  const toggleProductSelection = useCallback((productId) => {
    setSelectedProducts(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(productId)) {
        newSelection.delete(productId);
      } else {
        newSelection.add(productId);
      }
      return newSelection;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map(p => p._id)));
    }
  }, [products, selectedProducts.size]);

  // Get status badge color
  const getStatusBadge = useCallback((status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Active', icon: '🟢' },
      inactive: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Inactive', icon: '🔴' },
      featured: { color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Featured', icon: '⭐' },
      draft: { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Draft', icon: '📝' },
      published: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Published', icon: '📢' },
      unpublished: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Unpublished', icon: '🚫' },
      archived: { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Archived', icon: '📦' },
      out_of_stock: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Out of Stock', icon: '❌' },
      low_stock: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Low Stock', icon: '⚠️' },
      pre_order: { color: 'bg-indigo-100 text-indigo-800 border-indigo-200', label: 'Pre-order', icon: '⏳' }
    };
    
    const statusKey = status?.toLowerCase()?.replace(' ', '_');
    return statusConfig[statusKey] || statusConfig.draft;
  }, []);

  // Format price
  const formatPrice = useCallback((price) => {
    if (price === null || price === undefined || price === '') return 'N/A';
    const numPrice = Number(price);
    if (isNaN(numPrice)) return 'Invalid';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numPrice);
  }, []);

  // Format date
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  }, []);

  // Get sort icon
  const getSortIcon = useCallback((column) => {
    if (filters.sortBy !== column) return <FaSort className="text-gray-400" />;
    return filters.sortOrder === 'asc' ? <FaSortUp className="text-blue-600" /> : <FaSortDown className="text-blue-600" />;
  }, [filters.sortBy, filters.sortOrder]);

  // Calculate discount percentage
  const calculateDiscountPercentage = useCallback((originalPrice, discountPrice) => {
    if (!originalPrice || !discountPrice || originalPrice <= discountPrice || originalPrice <= 0) return 0;
    return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
  }, []);

  // Format specifications
  const formatSpecifications = useCallback((specs) => {
    if (!specs || typeof specs !== 'object') return [];
    return Object.entries(specs).map(([key, value]) => ({
      key: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
      value: Array.isArray(value) ? value.join(', ') : String(value)
    }));
  }, []);

  // Delete confirmation modal
  const DeleteModal = ({ product, onClose, onConfirm, loading }) => {
    if (!product) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Delete Product
            </h3>
          </div>

          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to delete the product <strong>"{product.title || product.name}"</strong>? This action cannot be undone.
            </p>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-700 dark:text-red-400">
                <strong>Warning:</strong> This will permanently delete the product and all associated images.
              </p>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(product._id)}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2 cursor-pointer"
            >
              {loading && <FaSpinner className="animate-spin" />}
              <span>Delete Product</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Bulk Delete Modal
  const BulkDeleteModal = ({ onClose, onConfirm, loading, selectedCount }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Bulk Delete Products
            </h3>
          </div>

          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to delete <strong>{selectedCount} products</strong>? This action cannot be undone.
            </p>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-700 dark:text-red-400">
                <strong>Warning:</strong> This will permanently delete all selected products and their associated images.
              </p>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2 cursor-pointer"
            >
              {loading && <FaSpinner className="animate-spin" />}
              <span>Delete {selectedCount} Products</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 cursor-default">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                All Products
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage and monitor your product inventory • {pagination.total} total products
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchProducts}
                disabled={loading}
                className="inline-flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <FaSync className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <Link
                to="/dashboard/add-product"
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <FaPlus className="w-4 h-4" />
                <span>Add New Product</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedProducts.size > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <span className="text-blue-700 dark:text-blue-300 font-medium">
                  {selectedProducts.size} product(s) selected
                </span>
                <button
                  onClick={() => {
                    // Bulk status update example
                    const productIds = Array.from(selectedProducts);
                    toast.info(`Would update ${productIds.length} products`);
                  }}
                  className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm cursor-pointer"
                >
                  Update Status
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setBulkDeleteModal({ isOpen: true })}
                  className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm cursor-pointer"
                >
                  Delete Selected
                </button>
                <button
                  onClick={() => setSelectedProducts(new Set())}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm cursor-pointer"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters - Similar to your existing code, just making sure all filters work */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Products
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by title, code, SKU, description..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white cursor-text"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white cursor-pointer"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="featured">Featured</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="unpublished">Unpublished</option>
                <option value="archived">Archived</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="low_stock">Low Stock</option>
              </select>
            </div>

            {/* Price Range */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Min Price
                </label>
                <input
                  type="number"
                  placeholder="Min"
                  min="0"
                  step="0.01"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white cursor-text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-gray-300 mb-2">
                  Max Price
                </label>
                <input
                  type="number"
                  placeholder="Max"
                  min="0"
                  step="0.01"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white cursor-text"
                />
              </div>
            </div>

            {/* Results per page */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Items per page
              </label>
              <select
                value={pagination.limit}
                onChange={(e) => setPagination(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white cursor-pointer"
              >
                <option value="5">5 per page</option>
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={resetFilters}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {products.length} of {pagination.total} products • Page {pagination.page} of {pagination.pages}
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <FaSpinner className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Loading products...</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">Fetching from API...</p>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <FiPackage className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg">No products found</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm">
                  {filters.search || filters.status || filters.minPrice || filters.maxPrice ? 
                    'Try adjusting your filters' : 
                    'Get started by adding your first product'}
                </p>
                {filters.search || filters.status || filters.minPrice || filters.maxPrice ? (
                  <button
                    onClick={resetFilters}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    Clear Filters
                  </button>
                ) : (
                  <Link
                    to="/dashboard/add-product"
                    className="mt-4 inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    <FaPlus className="w-4 h-4" />
                    <span>Add Your First Product</span>
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                      <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedProducts.size === products.length && products.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Product
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('price')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Price</span>
                          {getSortIcon('price')}
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('quantity')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Stock</span>
                          {getSortIcon('quantity')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('createdAt')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Created</span>
                          {getSortIcon('createdAt')}
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {products.map((product) => {
                      const discountPercentage = calculateDiscountPercentage(product.price, product.discountPrice);
                      const statusBadge = getStatusBadge(product.productStatus);
                      
                      return (
                        <tr 
                          key={product._id} 
                          className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                            selectedProducts.has(product._id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}
                        >
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={selectedProducts.has(product._id)}
                              onChange={() => toggleProductSelection(product._id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              {product.mainImage ? (
                                <img
                                  src={product.mainImage}
                                  alt={product.title}
                                  className="w-12 h-12 rounded-lg object-cover bg-gray-200"
                                  onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/48?text=No+Image';
                                  }}
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                  <FiPackage className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {product.title}
                                </p>
                                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                                  <span>{product.productCode}</span>
                                  {product.sku && <span className="text-xs">SKU: {product.sku}</span>}
                                </div>
                                {product.category && (
                                  <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                                    <MdCategory className="inline mr-1" size={10} />
                                    {product.category}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 dark:text-white font-semibold">
                              {formatPrice(product.discountPrice || product.price)}
                              {discountPercentage > 0 && (
                                <span className="text-green-600 dark:text-green-400 text-xs ml-2">
                                  -{discountPercentage}%
                                </span>
                              )}
                            </div>
                            {discountPercentage > 0 && product.price && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 line-through">
                                {formatPrice(product.price)}
                              </div>
                            )}
                            {product.costPrice > 0 && (
                              <div className="text-xs text-gray-400 dark:text-gray-500">
                                Cost: {formatPrice(product.costPrice)}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col space-y-1">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadge.color}`}>
                                <span className="mr-1">{statusBadge.icon}</span>
                                {statusBadge.label}
                              </span>
                              {product.isFeatured && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                                  ⭐ Featured
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 dark:text-white font-medium">
                              {product.quantity || 0}
                            </div>
                            <div className={`text-xs font-medium ${
                              product.quantity > (product.lowStockThreshold || 10)
                                ? 'text-green-600 dark:text-green-400' 
                                : product.quantity > 0 
                                  ? 'text-yellow-600 dark:text-yellow-400'
                                  : 'text-red-600 dark:text-red-400'
                            }`}>
                              {product.quantity > (product.lowStockThreshold || 10) 
                                ? 'In Stock' 
                                : product.quantity > 0 
                                  ? `Low Stock (${product.quantity})`
                                  : 'Out of Stock'}
                            </div>
                            {product.manageStock && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Managed
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {formatDate(product.createdAt)}
                            </div>
                            {product.updatedAt !== product.createdAt && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Updated: {formatDate(product.updatedAt).split(',')[0]}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleQuickView(product)}
                                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer group relative"
                                title="Quick View with Full Details"
                                disabled={quickViewModal.loading}
                              >
                                {quickViewModal.loading && quickViewModal.product?._id === product._id ? (
                                  <FaSpinner className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <FaEye className="w-4 h-4" />
                                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                      View Details
                                    </span>
                                  </>
                                )}
                              </button>
                              
                              <Link
                                to={`/dashboard/edit-product/${product._id}`}
                                className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors cursor-pointer group relative"
                                title="Edit Product"
                              >
                                <FaEdit className="w-4 h-4" />
                                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                  Edit
                                </span>
                              </Link>
                              
                              <button
                                onClick={() => setDeleteModal({ isOpen: true, product })}
                                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer group relative"
                                title="Delete Product"
                                disabled={deleteLoading === product._id}
                              >
                                {deleteLoading === product._id ? (
                                  <FaSpinner className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <FaTrash className="w-4 h-4" />
                                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                      Delete
                                    </span>
                                  </>
                                )}
                              </button>
                              
                              <button
                                onClick={() => toggleStatus(product._id, product.productStatus)}
                                className={`p-2 rounded-lg transition-colors cursor-pointer group relative ${
                                  product.productStatus === 'active'
                                    ? 'text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                                    : 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                                }`}
                                title={product.productStatus === 'active' ? 'Deactivate' : 'Activate'}
                              >
                                {product.productStatus === 'active' ? (
                                  <>
                                    <span className="text-xs font-medium">Deactivate</span>
                                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                      Make Inactive
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <span className="text-xs font-medium">Activate</span>
                                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                      Make Active
                                    </span>
                                  </>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination - Same as your existing code */}
              {pagination.pages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      Showing {products.length} of {pagination.total} products • 
                      Page {pagination.page} of {pagination.pages}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        disabled={pagination.page === 1}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      >
                        Previous
                      </button>
                      
                      {/* Page Numbers */}
                      {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                        let pageNum;
                        if (pagination.pages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.page >= pagination.pages - 2) {
                          pageNum = pagination.pages - 4 + i;
                        } else {
                          pageNum = pagination.page - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                              pagination.page === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={pagination.page === pagination.pages}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {quickViewModal.isOpen && (
        <ViewProduct
          product={quickViewModal.fullProductData || quickViewModal.product}
          getStatusBadge={getStatusBadge}
          formatPrice={formatPrice}
          formatDate={formatDate}
          formatSpecifications={formatSpecifications}
          onClose={() => setQuickViewModal({ isOpen: false, product: null, fullProductData: null, loading: false })}
          loading={quickViewModal.loading}
        />
      )}

      {deleteModal.isOpen && (
        <DeleteModal
          product={deleteModal.product}
          onClose={() => setDeleteModal({ isOpen: false, product: null })}
          onConfirm={handleDelete}
          loading={deleteLoading === deleteModal.product?._id}
        />
      )}

      {bulkDeleteModal.isOpen && (
        <BulkDeleteModal
          onClose={() => setBulkDeleteModal({ isOpen: false })}
          onConfirm={handleBulkDelete}
          loading={bulkActionLoading}
          selectedCount={selectedProducts.size}
        />
      )}
    </div>
  );
};

export default AllProducts; 