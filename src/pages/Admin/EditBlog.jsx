import React, { useState, useEffect, useRef } from 'react'
import { toast, Toaster } from 'react-hot-toast'
import { useParams, useNavigate } from 'react-router-dom'
import useAxiosSecure from '../../hooks/useAxiosSecure'
import JoditEditor from 'jodit-react'

function EditBlog() {
  const { id } = useParams()
  const navigate = useNavigate()
  const axiosSecure = useAxiosSecure()
  const editor = useRef(null)
  const fileInputRef = useRef(null)
  
  const [formData, setFormData] = useState({
    title: "",
    vtitle: "",
    excerpt: "",
    shortDescription: "",
    note: "",
    category: "",
    tags: "",
    author: "",
    date: new Date().toISOString().split('T')[0],
    readTime: "5 min read",
    content: "",
    image: "",
    mainImageAltText: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    metaRobotsIndex: true,
    metaRobotsFollow: true,
    metaImage: "",
    ogTitle: "",
    ogDescription: "",
    twitterTitle: "",
    twitterDescription: "",
    slug: "",
    featured: false,
    status: "published"
  })

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [changesMade, setChangesMade] = useState(false)
  const [originalData, setOriginalData] = useState(null)
  
  const categories = ["Sustainability", "Trends", "Materials", "Activewear", "Menswear", "Womenswear", "Accessories", "Luxury", "Streetwear"]
  
  // Editor config
  const editorConfig = {
    readonly: false,
    placeholder: 'Edit your blog content...',
    height: 500,
    theme: 'dark',
    buttons: [
      'bold', 'italic', 'underline', 'strikethrough', '|',
      'ul', 'ol', '|',
      'font', 'fontsize', 'brush', '|',
      'align', '|',
      'image', 'table', 'link', '|',
      'undo', 'redo', '|',
      'fullsize', 'preview'
    ]
  }

  useEffect(() => {
    if (id) {
      fetchBlog()
    }
  }, [id])

  // Fetch blog data
  const fetchBlog = async () => {
    try {
      setLoading(true)
      console.log('Fetching blog with ID:', id)
      
      // Try different endpoints
      const response = await axiosSecure.get(`/blogs/${id}`)
      
      console.log('Blog fetch response:', response.data)
      
      if (response.data.success) {
        const blog = response.data.data.blog || response.data.data
        console.log('Blog data received:', blog)
        
        const blogData = {
          title: blog.title || "",
          vtitle: blog.vtitle || "",
          excerpt: blog.excerpt || "",
          shortDescription: blog.shortDescription || "",
          note: blog.note || "",
          category: blog.category || "",
          tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : (blog.tags || ""),
          author: blog.author?.name || blog.author || "",
          date: blog.date || blog.createdAt ? new Date(blog.date || blog.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          readTime: blog.readTime || "5 min read",
          content: blog.content || "",
          image: blog.image || "",
          mainImageAltText: blog.mainImageAltText || blog.title || "",
          metaTitle: blog.metaTitle || blog.title || "",
          metaDescription: blog.metaDescription || blog.excerpt || "",
          metaKeywords: blog.metaKeywords || "",
          metaRobotsIndex: blog.metaRobotsIndex !== false,
          metaRobotsFollow: blog.metaRobotsFollow !== false,
          metaImage: blog.metaImage || blog.image || "",
          ogTitle: blog.ogTitle || blog.title || "",
          ogDescription: blog.ogDescription || blog.excerpt || "",
          twitterTitle: blog.twitterTitle || blog.title || "",
          twitterDescription: blog.twitterDescription || blog.excerpt || "",
          slug: blog.slug || "",
          featured: blog.featured || false,
          status: blog.status || "published"
        }
        
        setFormData(blogData)
        setOriginalData(blogData)
        toast.success('Blog loaded successfully')
      } else {
        toast.error('Failed to load blog')
        navigate('/dashboard/all-blogs')
      }
    } catch (error) {
      console.error('Error fetching blog:', error)
      console.error('Error response:', error.response?.data)
      
      if (error.response?.status === 404) {
        toast.error('Blog not found')
      } else {
        toast.error('Failed to load blog data')
      }
      navigate('/dashboard/all-blogs')
    } finally {
      setLoading(false)
    }
  }

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    setChangesMade(true)
  }

  // Handle content change
  const handleContentChange = (newContent) => {
    setFormData(prev => ({ ...prev, content: newContent }))
    setChangesMade(true)
  }

  // Handle image upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid image format')
      return
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error('Image too large (max 15MB)')
      return
    }

    setUploading(true)

    // Mock upload for now
    setTimeout(() => {
      const mockUrl = `https://images.unsplash.com/photo-${Date.now()}`
      setFormData(prev => ({
        ...prev,
        image: mockUrl,
        metaImage: mockUrl,
        mainImageAltText: prev.mainImageAltText || file.name.split('.')[0]
      }))
      setChangesMade(true)
      setUploading(false)
      toast.success('Image uploaded successfully!')
    }, 1500)
  }

  // Generate slug
  const generateSlug = () => {
    if (!formData.title) {
      toast.error('Please enter a title first')
      return
    }
    
    const slug = formData.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    
    setFormData(prev => ({ ...prev, slug }))
    setChangesMade(true)
    toast.success('Slug generated from title')
  }

  // Calculate read time
  const calculateReadTime = () => {
    if (!formData.content) {
      toast.error('No content to calculate')
      return
    }
    const words = formData.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length
    const minutes = Math.max(1, Math.ceil(words / 200))
    setFormData(prev => ({ ...prev, readTime: `${minutes} min read` }))
    setChangesMade(true)
    toast.success(`${minutes} minutes read`)
  }

  // Reset form
  const resetForm = () => {
    if (window.confirm('Are you sure you want to discard all changes?')) {
      setFormData(originalData)
      setChangesMade(false)
      toast.success('Changes discarded')
    }
  }

  // Submit form
  const handleSubmit = async (status = formData.status) => {
    // Validation
    const requiredFields = ['title', 'excerpt', 'category', 'author', 'content', 'slug']
    const missingFields = requiredFields.filter(field => !formData[field])
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in required fields: ${missingFields.join(', ')}`)
      return
    }

    setSubmitting(true)
    
    try {
      // Prepare data
      const submissionData = {
        ...formData,
        status,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      }

      console.log('Submitting update data:', submissionData)
      console.log('Target URL:', `/blogs/${id}`)

      // First, check if PUT method is available
      try {
        const optionsResponse = await fetch(`https://admin.aaryansourcing.com/api/v1/blogs/${id}`, {
          method: 'OPTIONS'
        })
        console.log('Available methods:', optionsResponse.headers.get('allow'))
      } catch (optionsError) {
        console.log('OPTIONS check failed:', optionsError)
      }

      // Try PUT request
      const response = await axiosSecure.put(`/blogs/${id}`, submissionData)
      
      console.log('Update response:', response.data)

      if (response.data.success) {
        toast.success(`Blog ${status === 'draft' ? 'saved as draft' : 'updated'} successfully!`)
        setChangesMade(false)
        setOriginalData(formData)
        
        // Redirect after delay
        setTimeout(() => {
          navigate('/dashboard/all-blogs')
        }, 1500)
      } else {
        toast.error(response.data.message || 'Failed to update blog')
      }
    } catch (error) {
      console.error('Error updating blog:', error)
      console.error('Error response:', error.response)
      
      // Fallback to PATCH if PUT doesn't work
      if (error.response?.status === 404 || error.response?.status === 405) {
        console.log('Trying PATCH as fallback...')
        try {
          const patchResponse = await axiosSecure.patch(`/blogs/${id}`, formData)
          if (patchResponse.data.success) {
            toast.success('Blog updated successfully!')
            setChangesMade(false)
            setOriginalData(formData)
            setTimeout(() => {
              navigate('/dashboard/all-blogs')
            }, 1500)
          }
        } catch (patchError) {
          console.error('PATCH also failed:', patchError)
          toast.error('Update failed. Check if the update route exists.')
        }
      } else if (error.response?.status === 400) {
        toast.error(error.response.data?.message || 'Validation failed')
      } else if (error.response?.status === 409) {
        toast.error('Blog with this slug already exists')
      } else {
        toast.error('Failed to update blog. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Save as draft
  const saveAsDraft = async () => {
    await handleSubmit('draft')
  }

  // Test API connection
  const testApi = async () => {
    try {
      console.log('Testing API for blog ID:', id)
      
      // Test GET
      const getResponse = await axiosSecure.get(`/blogs/${id}`)
      console.log('GET response:', getResponse.data)
      
      // Test OPTIONS
      const optionsResponse = await fetch(`https://admin.aaryansourcing.com/api/v1/blogs/${id}`, {
        method: 'OPTIONS'
      })
      console.log('Allowed methods:', optionsResponse.headers.get('allow'))
      
      toast.success('API tests completed. Check console.')
    } catch (error) {
      console.error('API test failed:', error)
      toast.error('API test failed')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading blog data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4 md:p-6">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Edit Blog Post</h1>
              <p className="text-gray-600 dark:text-gray-400">ID: {id}</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {changesMade && (
                <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 rounded-full text-sm">
                  Unsaved Changes
                </span>
              )}
              <button
                onClick={() => navigate('/dashboard/all-blogs')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                ← Back to Blogs
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={generateSlug}
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
              onClick={resetForm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Reset Changes
            </button>
            
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              {previewMode ? 'Edit Mode' : 'Preview'}
            </button>
            
            <button
              onClick={testApi}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              Test API
            </button>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  required
                />
              </div>

              {/* Excerpt */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Excerpt <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  rows="3"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 resize-none"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
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
                <label className="block text-sm font-medium mb-2">
                  Author <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  required
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  required
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  placeholder="tag1, tag2, tag3"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  required
                />
              </div>

              {/* Read Time */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Read Time
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="readTime"
                    value={formData.readTime}
                    onChange={handleChange}
                    className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  />
                  <button
                    type="button"
                    onClick={calculateReadTime}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Auto
                  </button>
                </div>
              </div>

              {/* Status & Featured */}
              <div className="flex items-center gap-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    id="featured"
                  />
                  <label htmlFor="featured" className="ml-2 text-sm">
                    Featured
                  </label>
                </div>

                <div>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                Content <span className="text-red-500">*</span>
              </h2>
              <div className="text-sm text-gray-600">
                {formData.content.replace(/<[^>]*>/g, '').length} characters
              </div>
            </div>
            
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

          {/* Image Upload */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Featured Image</h2>
            
            <div className="text-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                disabled={uploading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload Image'}
              </button>
              
              <p className="text-sm text-gray-500 mt-3">
                JPG, PNG, WEBP • Max 15MB
              </p>

              {formData.image && (
                <div className="mt-6">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full max-h-64 object-cover rounded-lg mx-auto"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, image: '', metaImage: '' }))}
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Remove Image
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Update Blog</h3>
                <p className="text-sm text-gray-600">
                  {changesMade ? 'You have unsaved changes' : 'No changes made'}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={saveAsDraft}
                  disabled={!changesMade || submitting}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                >
                  Save as Draft
                </button>
                
                <button
                  type="submit"
                  disabled={!changesMade || submitting}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Updating...
                    </span>
                  ) : 'Update Blog'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditBlog