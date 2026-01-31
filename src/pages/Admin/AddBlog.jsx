import React, { useState, useRef, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import JoditEditor from 'jodit-react';

function AddBlog() {
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const editor = useRef(null);
  const fileInputRef = useRef(null);

  // Categories
  const categories = ["Sustainability", "Trends", "Materials", "Activewear", "Menswear", "Womenswear", "Accessories", "Luxury", "Streetwear"];
  
  // Initial form state
  const initialFormData = {
    title: "", vtitle: "", excerpt: "", shortDescription: "", note: "", category: "", tags: "",
    author: "", date: new Date().toISOString().split('T')[0], readTime: "5 min read", content: "",
    image: "", mainImageAltText: "", metaTitle: "", metaDescription: "", metaKeywords: "",
    metaRobotsIndex: true, metaRobotsFollow: true, metaImage: "", ogTitle: "", ogDescription: "",
    twitterTitle: "", twitterDescription: "", slug: "", featured: false, status: "published"
  };

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Check API endpoints on mount
  useEffect(() => {
    checkApiEndpoints();
  }, []);

  const checkApiEndpoints = async () => {
    try {
      const response = await fetch('https://admin.aaryansourcing.com/');
      const data = await response.json();
      console.log('Available API endpoints:', data.endpoints);
      toast.success('API connected successfully');
    } catch (error) {
      console.error('Cannot connect to API:', error);
      toast.error('Cannot connect to API server');
    }
  };

  // Editor config
  const editorConfig = {
    readonly: false,
    placeholder: 'Start writing...',
    height: 400,
    theme: 'dark',
    buttons: ['bold', 'italic', 'underline', '|', 'ul', 'ol', '|', 'image', 'link', '|', 'undo', 'redo'],
    uploader: {
      insertImageAsBase64URI: true
    }
  };

  // Generate slug
  const generateSlug = (text) => {
    if (!text) return '';
    return text.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => {
      const updated = { ...prev, [name]: newValue };
      
      if (name === 'title' && value) {
        const slug = generateSlug(value);
        updated.slug = prev.slug || slug;
        updated.metaTitle = value;
        updated.ogTitle = value;
        updated.twitterTitle = value;
        if (!prev.mainImageAltText) {
          updated.mainImageAltText = value;
        }
      }
      
      return updated;
    });
  };

  // Handle content change
  const handleContentChange = (newContent) => {
    setFormData(prev => ({ ...prev, content: newContent }));
  };

  // Calculate read time
  const calculateReadTime = () => {
    if (!formData.content) {
      toast.error('No content to calculate');
      return;
    }
    const words = formData.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    setFormData(prev => ({ ...prev, readTime: `${minutes} min read` }));
    toast.success(`${minutes} minutes read`);
  };

  // Test API connection
  const testApiConnection = async () => {
    try {
      console.log('Testing API connection...');
      
      // Test 1: Check if server is running
      const healthCheck = await fetch('https://admin.aaryansourcing.com/health');
      const healthData = await healthCheck.json();
      console.log('Health check:', healthData);
      
      // Test 2: Check blogs endpoint
      const blogsCheck = await fetch('https://admin.aaryansourcing.com/api/v1/blogs');
      const blogsData = await blogsCheck.json();
      console.log('Blogs endpoint:', blogsData);
      
      // Test 3: Check if POST method is allowed
      const optionsCheck = await fetch('https://admin.aaryansourcing.com/api/v1/blogs', { method: 'OPTIONS' });
      console.log('OPTIONS response:', optionsCheck.headers.get('allow'));
      
      toast.success('API tests completed. Check console.');
    } catch (error) {
      console.error('API test failed:', error);
      toast.error('API test failed. Check console.');
    }
  };

  // Load test data
  const loadTestData = () => {
    const testData = {
      title: "The Future of Sustainable Fashion",
      vtitle: "স্থায়ী ফ্যাশনের ভবিষ্যত",
      excerpt: "Explore groundbreaking innovations in sustainable fashion that are revolutionizing the industry.",
      shortDescription: "Discover how technology is shaping fashion's future",
      note: "Sample blog for testing",
      category: "Sustainability",
      tags: "sustainable-fashion, eco-friendly, innovation",
      author: "Eco Fashionista",
      date: new Date().toISOString().split('T')[0],
      readTime: "7 min read",
      content: `<h2>The Sustainable Fashion Revolution</h2><p>The fashion industry is transforming with sustainable innovations.</p>`,
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&auto=format&fit=crop",
      mainImageAltText: "Sustainable fashion innovations",
      metaTitle: "Future of Sustainable Fashion",
      metaDescription: "Explore sustainable fashion innovations changing the industry",
      metaKeywords: "sustainable fashion, eco-friendly, innovation",
      metaRobotsIndex: true,
      metaRobotsFollow: true,
      metaImage: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&auto=format&fit=crop",
      ogTitle: "The Future of Sustainable Fashion",
      ogDescription: "Innovations changing fashion",
      twitterTitle: "Sustainable Fashion Future",
      twitterDescription: "Discover fashion innovations",
      slug: "future-sustainable-fashion-innovations",
      featured: true,
      status: "published"
    };
    
    setFormData(prev => ({ ...prev, ...testData }));
    toast.success('Test data loaded');
  };

  // Clear form
  const clearForm = () => {
    if (window.confirm('Clear all data?')) {
      setFormData(initialFormData);
      toast.success('Form cleared');
    }
  };

  // Test the actual POST request
  const testPostRequest = async () => {
    setLoading(true);
    try {
      console.log('Testing POST request with data:', {
        title: formData.title || 'Test Blog',
        excerpt: formData.excerpt || 'Test excerpt',
        category: formData.category || 'Sustainability',
        author: formData.author || 'Test Author',
        content: formData.content || '<p>Test content</p>',
        slug: formData.slug || 'test-blog-' + Date.now(),
        status: 'published'
      });

      const testData = {
        title: formData.title || 'Test Blog',
        excerpt: formData.excerpt || 'Test excerpt',
        category: formData.category || 'Sustainability',
        author: formData.author || 'Test Author',
        content: formData.content || '<p>Test content</p>',
        slug: formData.slug || 'test-blog-' + Date.now(),
        status: 'published',
        date: new Date().toISOString().split('T')[0],
        readTime: '5 min read'
      };

      // Try with plain fetch first
      const response = await fetch('https://admin.aaryansourcing.com/api/v1/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add auth headers if needed
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(testData)
      });

      console.log('Fetch response status:', response.status);
      console.log('Fetch response headers:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log('Fetch response data:', data);

      if (response.ok) {
        toast.success('POST request successful!');
      } else {
        toast.error(`POST failed: ${response.status} - ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('POST test error:', error);
      toast.error('POST test failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form data being submitted:', formData);
    
    // Validation
    const required = [
      { field: 'title', message: 'Title is required' },
      { field: 'excerpt', message: 'Excerpt is required' },
      { field: 'category', message: 'Category is required' },
      { field: 'author', message: 'Author is required' },
      { field: 'content', message: 'Content is required' },
      { field: 'slug', message: 'Slug is required' }
    ];
    
    const missing = required.filter(({ field }) => !formData[field]);
    
    if (missing.length) {
      missing.forEach(({ message }) => toast.error(message));
      return;
    }

    setLoading(true);
    
    try {
      // Prepare data for submission
      const submissionData = {
        title: formData.title,
        excerpt: formData.excerpt,
        category: formData.category,
        author: formData.author,
        content: formData.content,
        slug: formData.slug,
        status: formData.status,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        readTime: formData.readTime || "5 min read",
        date: formData.date || new Date().toISOString().split('T')[0],
        featured: formData.featured,
        image: formData.image || '',
        mainImageAltText: formData.mainImageAltText || formData.title
      };

      console.log('Submitting data to /api/v1/blogs:', submissionData);
      console.log('Using axiosSecure instance:', axiosSecure);
      
      const response = await axiosSecure.post('/blogs', submissionData);
      
      console.log('API Response:', response);
      
      if (response.data.success) {
        toast.success('Blog published successfully!');
        console.log('Published blog:', response.data.data);
        
        // Reset form
        setFormData(initialFormData);
      } else {
        console.error('API returned success:false', response.data);
        toast.error(response.data.message || 'Publish failed on server');
      }
      
    } catch (error) {
      console.error('Full error object:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        console.error('Error status:', status);
        console.error('Error data:', data);
        
        if (status === 404) {
          toast.error(
            <div>
              <p className="font-bold">404 Error: Route not found</p>
              <p className="text-sm">Endpoint: {error.config?.url}</p>
              <p className="text-sm mt-2">Please check:</p>
              <ul className="text-sm list-disc pl-4">
                <li>Server is running on port 5000</li>
                <li>Blog routes are properly defined</li>
                <li>POST method is allowed for /api/v1/blogs</li>
              </ul>
            </div>,
            { duration: 8000 }
          );
          
          // Show available endpoints
          if (data.availableEndpoints) {
            console.log('Available endpoints from server:', data.availableEndpoints);
          }
        } else {
          toast.error(data?.message || `Error ${status}`);
        }
      } else if (error.request) {
        console.error('No response received:', error.request);
        toast.error('No response from server. Is the server running?');
      } else {
        console.error('Error setting up request:', error.message);
        toast.error('Request failed: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#1f2937',
            color: '#f9fafb',
          },
        }}
      />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Create New Blog Post
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Craft engaging content with our powerful editor
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/dashboard/all-blogs')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                ← Back to Blogs
              </button>
            </div>
          </div>

          {/* Debug Actions */}
          <div className="flex flex-wrap gap-3 mb-8">
            <button
              onClick={loadTestData}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Load Test Data
            </button>
            
            <button
              onClick={() => {
                if (formData.title) {
                  const slug = generateSlug(formData.title);
                  setFormData(prev => ({ ...prev, slug }));
                  toast.success('Slug generated from title');
                } else {
                  toast.error('Please enter a title first');
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Generate Slug
            </button>
            
            <button
              onClick={calculateReadTime}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Calculate Read Time
            </button>
            
            <button
              onClick={clearForm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Clear Form
            </button>
            
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              {previewMode ? 'Edit Mode' : 'Preview Mode'}
            </button>
            
            <button
              onClick={testApiConnection}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              Test API
            </button>
            
            <button
              onClick={testPostRequest}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              Test POST
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Basic Information (Required)
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter blog title"
                  required
                />
              </div>

              {/* Excerpt */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Excerpt <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  rows="3"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  placeholder="Brief summary of the blog"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat, index) => (
                    <option key={index} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Author */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Author <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Author name"
                  required
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="blog-url-slug"
                  required
                />
              </div>

              {/* Content */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Content <span className="text-red-500">*</span>
                </label>
                {previewMode ? (
                  <div className="prose dark:prose-invert max-w-none p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
                    <div dangerouslySetInnerHTML={{ __html: formData.content }} />
                  </div>
                ) : (
                  <JoditEditor
                    ref={editor}
                    value={formData.content}
                    config={editorConfig}
                    onChange={handleContentChange}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Ready to Publish?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Click "Test API" and "Test POST" buttons first to debug
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 font-medium"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Publishing...
                    </span>
                  ) : 'Publish Blog'}
                </button>
              </div>
            </div>
            
            {/* Debug Info */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Debug Information:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Backend URL:</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400">https://admin.aaryansourcing.com</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Target Endpoint:</span>
                  <span className="font-mono text-purple-600 dark:text-purple-400">/api/v1/blogs</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Request Method:</span>
                  <span className="font-mono text-green-600 dark:text-green-400">POST</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddBlog;