import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSpinner, FaArrowLeft, FaExclamationTriangle, FaBolt } from 'react-icons/fa';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { toast } from 'react-toastify';
import EditProductForm from './EditProductForm';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Ultra-fast product fetch with performance optimization
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🚀 Fast fetching product:', id);
        const response = await axiosSecure.get(`/products/${id}`, {
          timeout: 10000 // 10 second timeout
        });
        
        if (response.data.success) {
          setProduct(response.data.data);
          toast.success('✅ Product loaded');
        } else {
          setError('Product not found');
          toast.error('❌ Product not found');
        }
      } catch (error) {
        console.error('❌ Fast fetch error:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Load failed';
        setError(errorMessage);
        toast.error(`Failed: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    if (id && id !== 'undefined' && id !== 'null') {
      fetchProduct();
    } else {
      setError('Invalid product ID');
      setLoading(false);
    }
  }, [id, axiosSecure]);

  // High-performance form submission
  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      setError(null);
      
      console.log('🚀 Fast product update...');
      const response = await axiosSecure.put(`/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000, // 30 second timeout for large files
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload Progress: ${percentCompleted}%`);
        }
      });

      if (response.data.success) {
        toast.success('🎉 Product updated successfully!');
        // Clear any cached data
        sessionStorage.removeItem('productFormData');
        navigate('/dashboard/products');
      } else {
        throw new Error(response.data.message || 'Update failed');
      }
    } catch (error) {
      console.error('❌ Fast update error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Update failed';
      setError(errorMessage);
      toast.error(`Update failed: ${errorMessage}`);
      
      // Auto-retry for network errors
      if (error.message.includes('Network Error') || error.message.includes('timeout')) {
        setTimeout(() => {
          toast.info('🔄 Retrying upload...');
          handleSubmit(formData);
        }, 2000);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">Fast loading product...</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Optimized for 100+ edits</p>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <FaExclamationTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Load Failed
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/dashboard/products')}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Back to Products
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Performance Optimized Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard/products')}
                className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <FaArrowLeft className="w-4 h-4" />
                <span>Back to Products</span>
              </button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Edit: {product?.productCode}
              </h1>
            </div>
            <div className="flex items-center space-x-2 bg-green-100 dark:bg-green-900 px-3 py-1 rounded-full">
              <FaBolt className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                Fast Mode
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* High Performance Edit Form */}
      {product && (
        <EditProductForm
          initialData={product}
          onSubmit={handleSubmit}
          isSubmitting={submitting}
        />
      )}
    </div>
  );
};

export default EditProduct;