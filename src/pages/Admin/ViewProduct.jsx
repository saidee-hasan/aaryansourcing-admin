import { useState, useEffect, useMemo, useCallback } from 'react';
import { FaTimes, FaEdit, FaCopy, FaTrash, FaExternalLinkAlt, FaTag, FaBox, FaDollarSign, FaPalette, FaRulerVertical, FaCertificate, FaLeaf, FaVenusMars, FaCalendarAlt, FaImage, FaSpinner, FaChevronLeft, FaChevronRight, FaExpand, FaShoppingCart, FaShareAlt, FaEye, FaStar, FaHistory, FaUser, FaInfoCircle, FaTshirt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ViewProduct = ({ product, onClose }) => {
  const axiosSecure = useAxiosSecure();
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [expandedImage, setExpandedImage] = useState(null);
  const [showAllImages, setShowAllImages] = useState(false);
  
  // 🚀 All dropdown data states
  const [dropdownData, setDropdownData] = useState({
    categories: [],
    subCategories: [],
    brands: [],
    colors: [],
    sizes: [],
    productFits: [],
    sustainability: [],
    certifications: []
  });

  // 🚀 Enhanced Clean HTML function to remove data attributes
  const cleanHtml = useCallback((html) => {
    if (!html || typeof html !== 'string') return '';
    
    try {
      // First, decode HTML entities
      const textArea = document.createElement('textarea');
      textArea.innerHTML = html;
      let decodedHtml = textArea.value;
      
      // Remove data-start and data-end attributes from all tags
      decodedHtml = decodedHtml.replace(/data-start="[^"]*"\s*data-end="[^"]*"/g, '');
      
      // Also remove any other data-* attributes
      decodedHtml = decodedHtml.replace(/data-\w+="[^"]*"/g, '');
      
      // Remove any script tags and their content
      decodedHtml = decodedHtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      
      // Fix common HTML issues
      decodedHtml = decodedHtml.replace(/<p>\s*<\/p>/g, ''); // Remove empty paragraphs
      decodedHtml = decodedHtml.replace(/<br\s*\/?>\s*<br\s*\/?>/g, '<br />'); // Remove double line breaks
      decodedHtml = decodedHtml.replace(/<p>\s*<br\s*\/?>\s*<\/p>/g, ''); // Remove paragraphs with only line breaks
      
      // Fix unicode characters (like \u003C)
      decodedHtml = decodedHtml.replace(/\\u003C/g, '<');
      decodedHtml = decodedHtml.replace(/\\u003E/g, '>');
      decodedHtml = decodedHtml.replace(/\\u0026/g, '&');
      decodedHtml = decodedHtml.replace(/\\"/g, '"');
      
      // Clean up any escape sequences
      decodedHtml = decodedHtml.replace(/\\n/g, '');
      decodedHtml = decodedHtml.replace(/\\r/g, '');
      decodedHtml = decodedHtml.replace(/\\t/g, '');
      
      // Remove HTML comments
      decodedHtml = decodedHtml.replace(/<!--.*?-->/gs, '');
      
      // Fix self-closing tags
      decodedHtml = decodedHtml.replace(/<img([^>]+)\s*\/?>/g, '<img$1 />');
      decodedHtml = decodedHtml.replace(/<br\s*\/?>/g, '<br />');
      
      // Fix common tag issues
      decodedHtml = decodedHtml.replace(/<strong>([^<]+)<\/strong>/g, '<strong>$1</strong>');
      decodedHtml = decodedHtml.replace(/<em>([^<]+)<\/em>/g, '<em>$1</em>');
      decodedHtml = decodedHtml.replace(/<span[^>]*>([^<]+)<\/span>/g, '$1');
      
      // Remove any leftover escape sequences
      decodedHtml = decodedHtml.replace(/&lt;/g, '<');
      decodedHtml = decodedHtml.replace(/&gt;/g, '>');
      decodedHtml = decodedHtml.replace(/&amp;/g, '&');
      decodedHtml = decodedHtml.replace(/&quot;/g, '"');
      decodedHtml = decodedHtml.replace(/&#39;/g, "'");
      
      // Remove style attributes that might cause issues
      decodedHtml = decodedHtml.replace(/style="[^"]*"/g, '');
      
      // Trim whitespace and normalize line breaks
      decodedHtml = decodedHtml.trim().replace(/\s+/g, ' ');
      
      return decodedHtml;
    } catch (error) {
      console.error('Error cleaning HTML:', error);
      
      // Fallback: try simple cleaning
      try {
        const simpleCleaned = html
          .replace(/data-\w+="[^"]*"/g, '')
          .replace(/\\u003C/g, '<')
          .replace(/\\u003E/g, '>')
          .replace(/\\u0026/g, '&')
          .replace(/\\"/g, '"');
        return simpleCleaned;
      } catch (fallbackError) {
        console.error('Fallback cleaning also failed:', fallbackError);
        return html; // Return original if all cleaning fails
      }
    }
  }, []);

  // 🚀 Fetch all dropdown data in parallel
  useEffect(() => {
    const fetchAllDropdownData = async () => {
      try {
        setLoading(true);
        
        // Check cache first
        const cachedData = sessionStorage.getItem('productDropdownCache');
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          setDropdownData(parsedData);
          setLoading(false);
          return;
        }

        const endpoints = [
          { key: 'categories', url: '/categories' },
          { key: 'subCategories', url: '/sub-categories' },
          { key: 'brands', url: '/brands' },
          { key: 'colors', url: '/colors' },
          { key: 'sizes', url: '/sizes' },
          { key: 'productFits', url: '/product-fits' },
          { key: 'sustainability', url: '/sustainability' },
          { key: 'certifications', url: '/certifications' }
        ];

        const promises = endpoints.map(async ({ key, url }) => {
          try {
            const response = await axiosSecure.get(url);
            if (response.data.success) {
              let data = [];
              
              // Handle different response structures
              if (key === 'subCategories' && response.data.data?.subCategories) {
                data = response.data.data.subCategories;
              } else if (key === 'colors' && response.data.data?.colors) {
                data = response.data.data.colors;
              } else if (key === 'sustainability' && response.data.data?.sustainabilityAttributes) {
                data = response.data.data.sustainabilityAttributes;
              } else if (response.data.data) {
                data = Array.isArray(response.data.data) 
                  ? response.data.data 
                  : response.data.data[key] || [];
              }
              
              return { key, data: data || [] };
            }
            return { key, data: [] };
          } catch (error) {
            console.error(`Error fetching ${key}:`, error);
            return { key, data: [] };
          }
        });

        const results = await Promise.allSettled(promises);
        const newData = {};
        
        // Initialize all keys
        endpoints.forEach(({ key }) => {
          newData[key] = [];
        });

        // Process results
        results.forEach((result) => {
          if (result.status === 'fulfilled' && result.value) {
            const { key, data } = result.value;
            if (data && Array.isArray(data)) {
              newData[key] = data;
            }
          }
        });

        setDropdownData(newData);
        // Cache for 30 minutes
        sessionStorage.setItem('productDropdownCache', JSON.stringify(newData));
        setTimeout(() => {
          sessionStorage.removeItem('productDropdownCache');
        }, 30 * 60 * 1000);
        
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    if (product) {
      fetchAllDropdownData();
    }
  }, [product, axiosSecure]);

  // 🚀 Safe data mapping functions with memoization
  const getCategoryName = useMemo(() => (id) => {
    if (!id || !dropdownData.categories || !Array.isArray(dropdownData.categories)) return 'N/A';
    const category = dropdownData.categories.find(cat => cat._id === id);
    return category ? (category.value || category.name || 'Unknown') : id;
  }, [dropdownData.categories]);

  const getSubCategoryName = useMemo(() => (id) => {
    if (!id || !dropdownData.subCategories || !Array.isArray(dropdownData.subCategories)) return 'N/A';
    const subCategory = dropdownData.subCategories.find(sub => sub._id === id);
    return subCategory ? (subCategory.name || 'Unknown') : id;
  }, [dropdownData.subCategories]);

  const getBrandName = useMemo(() => (id) => {
    if (!id || !dropdownData.brands || !Array.isArray(dropdownData.brands)) return 'N/A';
    const brand = dropdownData.brands.find(b => b._id === id);
    return brand ? (brand.name || 'Unknown') : id;
  }, [dropdownData.brands]);

  const getSizeNames = useMemo(() => (sizeIds) => {
    if (!sizeIds || !Array.isArray(sizeIds) || sizeIds.length === 0) return 'N/A';
    if (!dropdownData.sizes || !Array.isArray(dropdownData.sizes)) return 'Loading...';
    
    return sizeIds.map(id => {
      const size = dropdownData.sizes.find(s => s._id === id);
      return size ? (size.value || size.name || 'Unknown') : id;
    });
  }, [dropdownData.sizes]);

  const getColorNames = useMemo(() => (colorIds) => {
    if (!colorIds || !Array.isArray(colorIds) || colorIds.length === 0) return 'N/A';
    if (!dropdownData.colors || !Array.isArray(dropdownData.colors)) return 'Loading...';
    
    return colorIds.map(id => {
      const color = dropdownData.colors.find(c => c._id === id);
      return color ? {
        name: color.name || 'Unknown',
        hex: color.hex || '#CCCCCC',
        id: color._id
      } : { name: id, hex: '#CCCCCC', id };
    });
  }, [dropdownData.colors]);

  const getFitName = useMemo(() => (id) => {
    if (!id || !dropdownData.productFits || !Array.isArray(dropdownData.productFits)) return 'N/A';
    const fit = dropdownData.productFits.find(f => f._id === id);
    return fit ? (fit.name || 'Unknown') : id;
  }, [dropdownData.productFits]);

  const getSustainabilityName = useMemo(() => (id) => {
    if (!id || !dropdownData.sustainability || !Array.isArray(dropdownData.sustainability)) return 'N/A';
    const sustainability = dropdownData.sustainability.find(s => s._id === id);
    return sustainability ? (sustainability.name || 'Unknown') : id;
  }, [dropdownData.sustainability]);

  const getCertificationDetails = useMemo(() => (certIds) => {
    if (!certIds || !Array.isArray(certIds) || certIds.length === 0) return [];
    if (!dropdownData.certifications || !Array.isArray(dropdownData.certifications)) return [];
    
    return certIds.map(id => {
      const cert = dropdownData.certifications.find(c => c._id === id);
      return cert ? {
        name: cert.name || 'Unknown',
        imageUrl: cert.imageUrl || '',
        issuingOrganization: cert.issuingOrganization || '',
        id: cert._id
      } : { name: id, imageUrl: '', issuingOrganization: '', id };
    });
  }, [dropdownData.certifications]);

  // 🚀 Get all images including main image
  const allImages = useMemo(() => {
    if (!product) return [];
    
    const images = [];
    
    // Add main image
    if (product.mainImage) {
      images.push({
        url: product.mainImage,
        type: 'main',
        alt: product.mainImageAltText || product.title,
        title: 'Main Image'
      });
    }
    
    // Add gallery images
    if (product.galleryImages && Array.isArray(product.galleryImages)) {
      product.galleryImages.forEach((img, index) => {
        images.push({
          url: img.url || img,
          type: 'gallery',
          alt: img.altText || `Gallery image ${index + 1}`,
          title: `Gallery Image ${index + 1}`,
          index
        });
      });
    }
    
    // Add size chart image
    if (product.sizeChartImage) {
      images.push({
        url: product.sizeChartImage,
        type: 'sizeChart',
        alt: 'Size Chart',
        title: 'Size Chart'
      });
    }
    
    return images;
  }, [product]);

  // 🚀 Helper functions
  const formatPrice = useMemo(() => (price) => {
    if (price === null || price === undefined || price === 0) return '$0.00';
    const priceNum = typeof price === 'object' ? price.$numberInt || price.$numberDouble || 0 : price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(priceNum);
  }, []);

  const formatDate = useMemo(() => (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = typeof dateString === 'object' ? new Date(dateString.$date) : new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  }, []);

  const getStatusBadge = useMemo(() => (status) => {
    const statusConfig = {
      active: { label: 'Active', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border border-green-200 dark:border-green-700' },
      inactive: { label: 'Inactive', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border border-red-200 dark:border-red-700' },
      featured: { label: 'Featured', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-700' },
      draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 border border-gray-200 dark:border-gray-700' }
    };
    
    return statusConfig[status] || statusConfig.draft;
  }, []);

  // 🚀 Process and clean description fields
  const processedProduct = useMemo(() => {
    if (!product) return null;
    
    const processed = { ...product };
    
    // Clean each description field
    const cleanDescriptionField = (fieldValue) => {
      if (!fieldValue) return '';
      
      // First, handle unicode escape sequences
      let cleaned = fieldValue
        .replace(/\\u003C/g, '<')
        .replace(/\\u003E/g, '>')
        .replace(/\\u0026/g, '&')
        .replace(/\\"/g, '"')
        .replace(/\\n/g, '')
        .replace(/\\r/g, '')
        .replace(/\\t/g, '');
      
      // Remove data attributes
      cleaned = cleaned.replace(/data-\w+="[^"]*"/g, '');
      
      // Decode HTML entities
      const textArea = document.createElement('textarea');
      textArea.innerHTML = cleaned;
      cleaned = textArea.value;
      
      return cleaned;
    };
    
    // Apply cleaning to all description fields
    processed.shortDescription = cleanDescriptionField(processed.shortDescription);
    processed.richDescription = cleanDescriptionField(processed.richDescription);
    processed.printingEmbroidery = cleanDescriptionField(processed.printingEmbroidery);
    processed.textileCare = cleanDescriptionField(processed.textileCare);
    
    return processed;
  }, [product]);

  // 🚀 Debug: Log product data
  useEffect(() => {
    if (product) {
      console.log('📦 Product Data Received:', product);
      console.log('🔍 Short Description:', product?.shortDescription?.substring(0, 100) + '...');
      console.log('🔍 Rich Description:', product?.richDescription?.substring(0, 100) + '...');
      console.log('🔍 Processed Product:', processedProduct);
    }
  }, [product, processedProduct]);

  // 🚀 Image navigation
  const nextImage = useCallback(() => {
    if (allImages.length === 0) return;
    setActiveImageIndex((prev) => 
      prev === allImages.length - 1 ? 0 : prev + 1
    );
  }, [allImages]);

  const prevImage = useCallback(() => {
    if (allImages.length === 0) return;
    setActiveImageIndex((prev) => 
      prev === 0 ? allImages.length - 1 : prev - 1
    );
  }, [allImages]);

  // 🚀 Copy to clipboard
  const copyToClipboard = useCallback((text) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  // 🚀 Share product
  const shareProduct = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: `Check out ${product.title}`,
        url: window.location.href,
      });
    } else {
      copyToClipboard(window.location.href);
    }
  }, [product, copyToClipboard]);

  // 🚀 Handle image click for zoom
  const handleImageClick = (index) => {
    setActiveImageIndex(index);
  };

  // 🚀 Calculate discount percentage
  const discountPercentage = useMemo(() => {
    if (!product?.price || !product?.discountPrice || product.discountPrice === 0) return 0;
    const price = typeof product.price === 'object' ? product.price.$numberInt || product.price.$numberDouble || 0 : product.price;
    const discountPrice = typeof product.discountPrice === 'object' ? product.discountPrice.$numberInt || product.discountPrice.$numberDouble || 0 : product.discountPrice;
    return Math.round(((price - discountPrice) / price) * 100);
  }, [product]);

  // 🚀 Get display images (limited for thumbnail view)
  const displayImages = useMemo(() => {
    if (showAllImages) return allImages;
    return allImages.slice(0, 6);
  }, [allImages, showAllImages]);

  // 🚀 Get current data
  const sizeNames = useMemo(() => getSizeNames(product?.sizes), [product?.sizes, getSizeNames]);
  const colorDetails = useMemo(() => getColorNames(product?.colors), [product?.colors, getColorNames]);
  const certificationDetails = useMemo(() => getCertificationDetails(product?.certifications), [product?.certifications, getCertificationDetails]);

  if (!product) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
          <FaTimes className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No product data available</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
          <FaSpinner className="animate-spin w-12 h-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading product details...</p>
        </div>
      </div>
    );
  }

  const activeImage = allImages[activeImageIndex];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      {/* 🚀 Main Container */}
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-7xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white dark:bg-gray-800 p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {product.title || 'Untitled Product'}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Code: <span className="font-medium">{product.productCode}</span>
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">•</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(product.productStatus || 'draft').color}`}>
                  {getStatusBadge(product.productStatus || 'draft').label}
                </span>
                {product.gsmCode && (
                  <>
                    <span className="text-sm text-gray-500 dark:text-gray-400">•</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      GSM: <span className="font-medium">{product.gsmCode}</span>
                    </span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={shareProduct}
                className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors cursor-pointer"
                title="Share"
              >
                <FaShareAlt className="w-5 h-5" />
              </button>
              <button
                onClick={() => copyToClipboard(product._id)}
                className="p-2 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-colors cursor-pointer"
                title="Copy ID"
              >
                <FaCopy className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors cursor-pointer"
                title="Close"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 sm:p-6">
          {/* 🚀 Product Images & Basic Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image Viewer */}
              <div className="relative bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                {allImages.length > 0 ? (
                  <>
                    <img
                      src={activeImage?.url}
                      alt={activeImage?.alt || product.title}
                      className="w-full h-80 sm:h-96 object-contain p-4"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/800x800?text=Image+Not+Available';
                      }}
                    />
                    
                    {/* Navigation Arrows */}
                    {allImages.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 text-gray-800 dark:text-white p-2 rounded-full shadow-lg transition-all cursor-pointer"
                        >
                          <FaChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 text-gray-800 dark:text-white p-2 rounded-full shadow-lg transition-all cursor-pointer"
                        >
                          <FaChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    
                    {/* Image Counter */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                      {activeImageIndex + 1} / {allImages.length}
                    </div>
                    
                    {/* Zoom Button */}
                    <button
                      onClick={() => setExpandedImage(activeImage?.url)}
                      className="absolute top-4 right-4 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full transition-colors cursor-pointer"
                      title="Zoom"
                    >
                      <FaExpand className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <div className="w-full h-80 sm:h-96 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-xl">
                    <FaImage className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Image Thumbnails Grid */}
              {displayImages.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Product Images ({allImages.length})
                    </h3>
                    {allImages.length > 6 && (
                      <button
                        onClick={() => setShowAllImages(!showAllImages)}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        {showAllImages ? 'Show Less' : 'View All'}
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {displayImages.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => handleImageClick(index)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                          activeImageIndex === index 
                            ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/30' 
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <img
                          src={img.url}
                          alt={img.alt}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {img.type === 'sizeChart' && (
                          <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-1 rounded">
                            Chart
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Product Information */}
            <div className="space-y-6">
              {/* Pricing Section */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {product.discountPrice > 0 ? (
                      <>
                        <span className="text-green-600 dark:text-green-400">
                          {formatPrice(product.discountPrice)}
                        </span>
                        <span className="ml-3 text-lg text-gray-500 dark:text-gray-400 line-through">
                          {formatPrice(product.price)}
                        </span>
                      </>
                    ) : (
                      formatPrice(product.price)
                    )}
                  </h2>
                  {product.discountPrice > 0 && (
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Save {discountPercentage}%
                    </span>
                  )}
                </div>

                {/* Bulk Pricing */}
                {(product.price100Pcs || product.price200Pcs || product.price500Pcs) && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Bulk Pricing</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {product.price100Pcs > 0 && (
                        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="text-sm text-gray-600 dark:text-gray-400">100 Pcs</div>
                          <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
                            {formatPrice(product.price100Pcs)}
                          </div>
                        </div>
                      )}
                      {product.price200Pcs > 0 && (
                        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="text-sm text-gray-600 dark:text-gray-400">200 Pcs</div>
                          <div className="text-lg font-bold text-green-700 dark:text-green-300">
                            {formatPrice(product.price200Pcs)}
                          </div>
                        </div>
                      )}
                      {product.price500Pcs > 0 && (
                        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <div className="text-sm text-gray-600 dark:text-gray-400">500 Pcs</div>
                          <div className="text-lg font-bold text-purple-700 dark:text-purple-300">
                            {formatPrice(product.price500Pcs)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Stock Information */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Available Stock</span>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {product.quantity || 0} units
                      </p>
                    </div>
                    {product.bulkQuantity > 0 && (
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Bulk Quantity</span>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {product.bulkQuantity} units
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-500 dark:text-gray-400">Category</label>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {getCategoryName(product.category)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 dark:text-gray-400">Sub Category</label>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {getSubCategoryName(product.subCategory)}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-500 dark:text-gray-400">Brand</label>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {getBrandName(product.brand)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-500 dark:text-gray-400">Fit</label>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {getFitName(product.fit)}
                    </p>
                  </div>
                  
                  {product.sustainability && (
                    <div>
                      <label className="block text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <FaLeaf className="w-3 h-3 mr-1" />
                        Sustainability
                      </label>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {getSustainabilityName(product.sustainability)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to={`/dashboard/edit-product/${product._id}`}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <FaEdit className="w-5 h-5" />
                  <span>Edit Product</span>
                </Link>
                <button
                  onClick={() => toast.info('View mode - Add to Cart disabled')}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <FaShoppingCart className="w-5 h-5" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          </div>

          {/* 🚀 Specifications Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Sizes */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FaRulerVertical className="w-4 h-4 mr-2" />
                Available Sizes ({Array.isArray(sizeNames) ? sizeNames.length : 0})
              </h3>
              {Array.isArray(sizeNames) && sizeNames.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {sizeNames.map((size, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-lg text-sm font-medium border border-blue-200 dark:border-blue-700"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No sizes available</p>
              )}
            </div>

            {/* Colors */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FaPalette className="w-4 h-4 mr-2" />
                Available Colors ({Array.isArray(colorDetails) ? colorDetails.length : 0})
              </h3>
              {Array.isArray(colorDetails) && colorDetails.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {colorDetails.slice(0, 8).map((color, index) => (
                      <div 
                        key={index} 
                        className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                        title={color.name}
                      >
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-20">
                          {color.name}
                        </span>
                      </div>
                    ))}
                  </div>
                  {colorDetails.length > 8 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      + {colorDetails.length - 8} more colors
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No colors available</p>
              )}
            </div>

            {/* Certifications */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FaCertificate className="w-4 h-4 mr-2" />
                Certifications ({certificationDetails.length})
              </h3>
              {certificationDetails.length > 0 ? (
                <div className="space-y-3">
                  {certificationDetails.map((cert, index) => (
                    <div 
                      key={index} 
                      className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800"
                    >
                      {cert.imageUrl ? (
                        <img 
                          src={cert.imageUrl} 
                          alt={cert.name}
                          className="w-10 h-10 object-contain rounded"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/40x40?text=Cert';
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 flex items-center justify-center bg-green-100 dark:bg-green-800 rounded">
                          <FaCertificate className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {cert.name}
                        </p>
                        {cert.issuingOrganization && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {cert.issuingOrganization}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No certifications</p>
              )}
            </div>
          </div>

          {/* 🚀 Gender Section */}
          {product.gender && product.gender.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700 mb-8">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FaVenusMars className="w-4 h-4 mr-2" />
                Gender
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.gender.map((gender, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-lg text-sm font-medium border border-purple-200 dark:border-purple-700"
                  >
                    {gender}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 🚀 Product Descriptions - USING PROCESSED PRODUCT DATA */}
          <div className="space-y-6 mb-8">
            {/* Short Description */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Overview</h3>
              {processedProduct?.shortDescription ? (
                <div 
                  className="prose prose-gray dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: processedProduct.shortDescription }}
                />
              ) : (
                <div className="text-gray-500 dark:text-gray-400 italic p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  No overview description provided.
                </div>
              )}
            </div>

            {/* Rich Description */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Detailed Description</h3>
              {processedProduct?.richDescription ? (
                <div 
                  className="prose prose-gray dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: processedProduct.richDescription }}
                />
              ) : (
                <div className="text-gray-500 dark:text-gray-400 italic p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  No detailed description provided.
                </div>
              )}
            </div>

            {/* Printing & Embroidery */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Printing & Embroidery Options</h3>
              {processedProduct?.printingEmbroidery ? (
                <div 
                  className="prose prose-gray dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: processedProduct.printingEmbroidery }}
                />
              ) : (
                <div className="text-gray-500 dark:text-gray-400 italic p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  No printing and embroidery information provided.
                </div>
              )}
            </div>

            {/* Textile Care */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Care Instructions</h3>
              {processedProduct?.textileCare ? (
                <div 
                  className="prose prose-gray dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: processedProduct.textileCare }}
                />
              ) : (
                <div className="text-gray-500 dark:text-gray-400 italic p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  No care instructions provided.
                </div>
              )}
            </div>
          </div>

          {/* 🚀 SEO Information */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700 mb-8">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <FaTag className="w-4 h-4 mr-2" />
              SEO Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Meta Title</label>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {product.metaTitle || 'Not set'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Meta Description</label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {product.metaDescription || 'Not set'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Meta Keywords</label>
                {Array.isArray(product.metaKeywords) && product.metaKeywords.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {product.metaKeywords.map((keyword, index) => (
                      <span 
                        key={index} 
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">Not set</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Image Alt Text</label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {product.mainImageAltText || 'Not set'}
                </p>
              </div>
            </div>
          </div>

          {/* 🚀 Product Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
              <div className="flex items-center">
                <FaEye className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Views</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {product.viewCount || 0}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
              <div className="flex items-center">
                <FaStar className="w-8 h-8 text-green-600 dark:text-green-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Popularity</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {product.popularityScore || 0}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
              <div className="flex items-center">
                <FaHistory className="w-8 h-8 text-purple-600 dark:text-purple-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Created</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(product.createdAt)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
              <div className="flex items-center">
                <FaUser className="w-8 h-8 text-orange-600 dark:text-orange-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Updated By</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {product.updatedBy || 'System'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 🚀 Footer Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <FaInfoCircle className="w-4 h-4" />
              <span>Product ID: </span>
              <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">
                {product._id}
              </code>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this product?')) {
                    toast.info('Delete functionality would be implemented here');
                  }
                }}
                className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center space-x-2 cursor-pointer"
              >
                <FaTrash className="w-4 h-4" />
                <span>Delete</span>
              </button>
              
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 Expanded Image Modal */}
      {expandedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-4">
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={expandedImage}
              alt="Expanded view"
              className="max-w-full max-h-[90vh] object-contain"
            />
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute top-4 right-4 bg-black/70 hover:bg-black text-white p-3 rounded-full transition-colors cursor-pointer"
            >
              <FaTimes className="w-6 h-6" />
            </button>
            <button
              onClick={() => window.open(expandedImage, '_blank')}
              className="absolute top-4 left-4 bg-black/70 hover:bg-black text-white p-3 rounded-full transition-colors cursor-pointer"
              title="Open in new tab"
            >
              <FaExternalLinkAlt className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewProduct;