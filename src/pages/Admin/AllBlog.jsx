import React, { useState, useEffect } from 'react'
import { toast, Toaster } from 'react-hot-toast'
import { 
  FaEye, FaEdit, FaTrash, FaList, FaTh, 
  FaCalendarAlt, FaUser, FaTag, FaSearch,
  FaArrowUp, FaArrowDown, FaFilter, FaExternalLinkAlt,
  FaTrashAlt, FaUndo, FaCheckCircle, FaTimesCircle,
  FaChartLine, FaRegCommentDots, FaRegHeart, FaBookmark
} from 'react-icons/fa'
import useAxiosSecure from '../../hooks/useAxiosSecure'
import { Link } from 'react-router-dom'

function AllBlogs() {
  const axiosSecure = useAxiosSecure()
  const [blogs, setBlogs] = useState([])
  const [filteredBlogs, setFilteredBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState('table')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [selectedBlogs, setSelectedBlogs] = useState([])
  const [stats, setStats] = useState(null)
  
  // Delete modal states
  const [deleteModal, setDeleteModal] = useState({ 
    open: false, 
    blogId: null,
    blogTitle: '',
    permanent: false 
  })
  
  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
    onCancel: () => {}
  })

  const categories = [
    'All Categories', 'Sustainability', 'Trends', 'Materials', 
    'Activewear', 'Menswear', 'Womenswear'
  ]

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
    { value: 'deleted', label: 'Deleted' }
  ]

  // Fetch blogs
  const fetchBlogs = async () => {
    try {
      setLoading(true)
      const response = await axiosSecure.get('/blogs', {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
          search: searchTerm || undefined,
          sortBy,
          sortOrder
        }
      })
      
      if (response.data.success) {
        setBlogs(response.data.data.blogs || [])
        setFilteredBlogs(response.data.data.blogs || [])
      }
    } catch (error) {
      console.error('Error fetching blogs:', error)
      setError('Failed to load blogs')
      toast.error('Failed to load blogs')
    } finally {
      setLoading(false)
    }
  }

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await axiosSecure.get('/blogs/stats')
      if (response.data.success) {
        setStats(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  useEffect(() => {
    fetchBlogs()
    fetchStats()
  }, [currentPage, selectedCategory, selectedStatus, sortBy, sortOrder])

  // Filter blogs based on search
  useEffect(() => {
    if (!searchTerm) {
      setFilteredBlogs(blogs)
    } else {
      const filtered = blogs.filter(blog => 
        blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredBlogs(filtered)
    }
  }, [searchTerm, blogs])

  // Handle soft delete blog
  const handleSoftDelete = async (blogId, blogTitle) => {
    setDeleteModal({
      open: true,
      blogId,
      blogTitle,
      permanent: false
    })
  }

  // Handle permanent delete blog
  const handlePermanentDelete = async (blogId, blogTitle) => {
    setDeleteModal({
      open: true,
      blogId,
      blogTitle,
      permanent: true
    })
  }

  // Execute delete
  const executeDelete = async () => {
    const { blogId, permanent } = deleteModal
    
    try {
      let response
      if (permanent) {
        response = await axiosSecure.delete(`/blogs/${blogId}/permanent`)
      } else {
        response = await axiosSecure.delete(`/blogs/${blogId}`)
      }
      
      if (response.data.success) {
        toast.success(
          permanent 
            ? 'Blog permanently deleted successfully'
            : 'Blog moved to trash successfully'
        )
        
        // Remove from local state
        setBlogs(prev => prev.filter(blog => blog._id !== blogId))
        setFilteredBlogs(prev => prev.filter(blog => blog._id !== blogId))
        setSelectedBlogs(prev => prev.filter(id => id !== blogId))
        
        fetchStats()
      }
    } catch (error) {
      console.error('Error deleting blog:', error)
      toast.error(
        permanent 
          ? 'Failed to permanently delete blog'
          : 'Failed to delete blog'
      )
    } finally {
      setDeleteModal({ open: false, blogId: null, blogTitle: '', permanent: false })
    }
  }

  // Handle restore blog
  const handleRestoreBlog = async (blogId) => {
    try {
      const response = await axiosSecure.put(`/blogs/${blogId}`, {
        status: 'published'
      })
      
      if (response.data.success) {
        toast.success('Blog restored successfully')
        fetchBlogs()
        fetchStats()
      }
    } catch (error) {
      console.error('Error restoring blog:', error)
      toast.error('Failed to restore blog')
    }
  }

  // Handle bulk actions
  const handleBulkAction = async (action) => {
    if (selectedBlogs.length === 0) {
      toast.error('Please select blogs to perform this action')
      return
    }

    const actionMessages = {
      delete: `Are you sure you want to move ${selectedBlogs.length} blog(s) to trash?`,
      permanentDelete: `Are you sure you want to permanently delete ${selectedBlogs.length} blog(s)? This cannot be undone!`,
      restore: `Are you sure you want to restore ${selectedBlogs.length} blog(s)?`
    }

    setConfirmModal({
      open: true,
      title: `Confirm ${action}`,
      message: actionMessages[action],
      onConfirm: async () => {
        try {
          let promises = []
          
          switch (action) {
            case 'delete':
              promises = selectedBlogs.map(blogId => 
                axiosSecure.delete(`/blogs/${blogId}`)
              )
              break
            case 'permanentDelete':
              promises = selectedBlogs.map(blogId => 
                axiosSecure.delete(`/blogs/${blogId}/permanent`)
              )
              break
            case 'restore':
              promises = selectedBlogs.map(blogId => 
                axiosSecure.put(`/blogs/${blogId}`, { status: 'published' })
              )
              break
          }

          await Promise.all(promises)
          
          toast.success(`${selectedBlogs.length} blog(s) ${action === 'restore' ? 'restored' : 'deleted'} successfully`)
          setSelectedBlogs([])
          fetchBlogs()
          fetchStats()
        } catch (error) {
          console.error(`Error performing bulk ${action}:`, error)
          toast.error(`Failed to ${action} blogs`)
        }
      },
      onCancel: () => setConfirmModal({ open: false, title: '', message: '', onConfirm: () => {}, onCancel: () => {} })
    })
  }

  // Toggle blog selection
  const toggleBlogSelection = (blogId) => {
    setSelectedBlogs(prev => 
      prev.includes(blogId) 
        ? prev.filter(id => id !== blogId)
        : [...prev, blogId]
    )
  }

  // Toggle all selection
  const toggleAllSelection = () => {
    if (selectedBlogs.length === filteredBlogs.length) {
      setSelectedBlogs([])
    } else {
      setSelectedBlogs(filteredBlogs.map(blog => blog._id))
    }
  }

  // Handle sort
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Get status badge color and icon
  const getStatusInfo = (status) => {
    switch (status) {
      case 'published':
        return {
          color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
          icon: <FaCheckCircle className="inline mr-1" />
        }
      case 'draft':
        return {
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
          icon: <FaEdit className="inline mr-1" />
        }
      case 'deleted':
        return {
          color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
          icon: <FaTrashAlt className="inline mr-1" />
        }
      default:
        return {
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
          icon: null
        }
    }
  }

  // Get engagement stats
  const getEngagementStats = (blog) => {
    return [
      { icon: <FaEye />, value: blog.views || 0, label: 'Views' },
      { icon: <FaRegHeart />, value: blog.likes || 0, label: 'Likes' },
      { icon: <FaRegCommentDots />, value: blog.comments || 0, label: 'Comments' },
      { icon: <FaBookmark />, value: blog.saves || 0, label: 'Saves' }
    ]
  }

  // Pagination
  const totalPages = Math.ceil(blogs.length / itemsPerPage) || 1
  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  if (loading && blogs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4 md:p-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Blog Management</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your blog posts, view statistics, and perform actions
            </p>
          </div>
          <Link
            to="/dashboard/trash"
            className="px-4 py-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 font-medium"
          >
            <FaTrashAlt className="inline mr-2" />
            View Trash ({blogs.filter(b => b.status === 'deleted').length})
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Total Blogs</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {blogs.length}
                </p>
              </div>
              <FaChartLine className="text-3xl text-blue-500 opacity-50" />
            </div>
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="text-green-600 font-medium">
                {blogs.filter(b => b.status === 'published').length} Published
              </span>
              {' • '}
              <span className="text-yellow-600 font-medium">
                {blogs.filter(b => b.status === 'draft').length} Drafts
              </span>
              {' • '}
              <span className="text-red-600 font-medium">
                {blogs.filter(b => b.status === 'deleted').length} Deleted
              </span>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Total Views</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {blogs.reduce((sum, blog) => sum + (blog.views || 0), 0)}
                </p>
              </div>
              <FaEye className="text-3xl text-purple-500 opacity-50" />
            </div>
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Average: {Math.round(blogs.reduce((sum, blog) => sum + (blog.views || 0), 0) / (blogs.length || 1))} views per blog
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Engagement</h3>
                <p className="text-3xl font-bold text-green-600">
                  {blogs.reduce((sum, blog) => sum + (blog.likes || 0), 0)}
                </p>
              </div>
              <FaRegHeart className="text-3xl text-green-500 opacity-50" />
            </div>
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Total likes across all blogs
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Categories</h3>
                <p className="text-3xl font-bold text-orange-600">
                  {stats.categories?.length || 0}
                </p>
              </div>
              <FaTag className="text-3xl text-orange-500 opacity-50" />
            </div>
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Unique categories used
            </div>
          </div>
        </div>
      )}

      {/* Controls Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {statuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            {/* View Toggle */}
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700'}`}
                title="Table View"
              >
                <FaList />
              </button>
              <button
                onClick={() => setViewMode('card')}
                className={`px-4 py-2 ${viewMode === 'card' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700'}`}
                title="Card View"
              >
                <FaTh />
              </button>
            </div>

            {/* Add New */}
            <Link
              to="/dashboard/add-blog"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-medium"
            >
              + Add New Blog
            </Link>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedBlogs.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <span className="text-blue-700 dark:text-blue-300 font-medium">
                <FaFilter className="inline mr-2" />
                {selectedBlogs.length} blog(s) selected
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedBlogs.every(id => {
                  const blog = blogs.find(b => b._id === id)
                  return blog?.status === 'deleted'
                }) ? (
                  <>
                    <button
                      onClick={() => handleBulkAction('restore')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
                    >
                      <FaUndo />
                      Restore Selected
                    </button>
                    <button
                      onClick={() => handleBulkAction('permanentDelete')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center gap-2"
                    >
                      <FaTrashAlt />
                      Delete Permanently
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleBulkAction('delete')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center gap-2"
                    >
                      <FaTrashAlt />
                      Move to Trash
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedBlogs([])}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={fetchBlogs}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">No blogs found</p>
          <p className="text-gray-400 dark:text-gray-500">
            Try adjusting your search or filters
          </p>
          <button
            onClick={() => {
              setSearchTerm('')
              setSelectedCategory('all')
              setSelectedStatus('all')
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        // Table View
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 w-12">
                    <input
                      type="checkbox"
                      checked={selectedBlogs.length === filteredBlogs.length && filteredBlogs.length > 0}
                      onChange={toggleAllSelection}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th 
                    className="px-6 py-4 text-left cursor-pointer min-w-[300px]"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center gap-2">
                      Title
                      {sortBy === 'title' && (
                        sortOrder === 'asc' ? <FaArrowUp /> : <FaArrowDown />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left min-w-[120px]">Author</th>
                  <th className="px-6 py-4 text-left min-w-[120px]">Category</th>
                  <th className="px-6 py-4 text-left min-w-[100px]">Status</th>
                  <th 
                    className="px-6 py-4 text-left cursor-pointer min-w-[120px]"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center gap-2">
                      Date
                      {sortBy === 'createdAt' && (
                        sortOrder === 'asc' ? <FaArrowUp /> : <FaArrowDown />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left min-w-[100px]">Engagement</th>
                  <th className="px-6 py-4 text-left min-w-[180px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredBlogs.map((blog) => {
                  const statusInfo = getStatusInfo(blog.status)
                  const engagement = getEngagementStats(blog)
                  
                  return (
                    <tr 
                      key={blog._id} 
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                        blog.status === 'deleted' ? 'opacity-60' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedBlogs.includes(blog._id)}
                          onChange={() => toggleBlogSelection(blog._id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {blog.image && (
                            <img 
                              src={blog.image} 
                              alt={blog.title}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div>
                            <p className="font-medium">{blog.title}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                              {blog.excerpt}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FaUser className="text-gray-400" />
                          {blog.author || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                          {blog.category || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                          {statusInfo.icon}
                          {blog.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-gray-400" />
                          {formatDate(blog.date || blog.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-4">
                          {engagement.map((stat, index) => (
                            <div key={index} className="text-center">
                              <div className="text-lg font-bold">{stat.value}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/blog/${blog.slug || blog._id}`}
                            target="_blank"
                            className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30"
                            title="View Blog"
                          >
                            <FaEye />
                          </Link>
                          
                          {blog.status !== 'deleted' && (
                            <>
                              <Link
                                to={`/dashboard/edit-blog/${blog._id}`}
                                className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30"
                                title="Edit Blog"
                              >
                                <FaEdit />
                              </Link>
                              
                              <button
                                onClick={() => handleSoftDelete(blog._id, blog.title)}
                                className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30"
                                title="Move to Trash"
                              >
                                <FaTrashAlt />
                              </button>
                            </>
                          )}
                          
                          {blog.status === 'deleted' && (
                            <>
                              <button
                                onClick={() => handleRestoreBlog(blog._id)}
                                className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30"
                                title="Restore Blog"
                              >
                                <FaUndo />
                              </button>
                              
                              <button
                                onClick={() => handlePermanentDelete(blog._id, blog.title)}
                                className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30"
                                title="Delete Permanently"
                              >
                                <FaTrash />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Card View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => {
            const statusInfo = getStatusInfo(blog.status)
            const engagement = getEngagementStats(blog)
            
            return (
              <div 
                key={blog._id} 
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all ${
                  blog.status === 'deleted' ? 'opacity-70 border-red-200 dark:border-red-800' : ''
                }`}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  {blog.image ? (
                    <img 
                      src={blog.image} 
                      alt={blog.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                      <span className="text-gray-500 dark:text-gray-400">No Image</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <input
                      type="checkbox"
                      checked={selectedBlogs.includes(blog._id)}
                      onChange={() => toggleBlogSelection(blog._id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-5 h-5"
                    />
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                      {statusInfo.icon}
                      {blog.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="mb-4">
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm mb-3 inline-block">
                      {blog.category || 'Uncategorized'}
                    </span>
                    <h3 className="text-xl font-semibold mb-3 line-clamp-2">
                      {blog.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                      {blog.excerpt || 'No description available'}
                    </p>
                  </div>

                  {/* Engagement Stats */}
                  <div className="grid grid-cols-4 gap-2 mb-6 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    {engagement.map((stat, index) => (
                      <div key={index} className="text-center">
                        <div className="flex items-center justify-center gap-1 text-lg font-bold">
                          {stat.icon}
                          {stat.value}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-6">
                    <div className="flex items-center gap-2">
                      <FaUser />
                      {blog.author || 'Unknown'}
                    </div>
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt />
                      {formatDate(blog.date || blog.createdAt)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex gap-2">
                      <Link
                        to={`/blog/${blog.slug || blog._id}`}
                        target="_blank"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        title="View Blog"
                      >
                        <FaExternalLinkAlt />
                        View
                      </Link>
                    </div>
                    
                    <div className="flex gap-2">
                      {blog.status !== 'deleted' ? (
                        <>
                          <Link
                            to={`/dashboard/edit-blog/${blog._id}`}
                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                            title="Edit Blog"
                          >
                            <FaEdit />
                          </Link>
                          <button
                            onClick={() => handleSoftDelete(blog._id, blog.title)}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                            title="Move to Trash"
                          >
                            <FaTrashAlt />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleRestoreBlog(blog._id)}
                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                            title="Restore Blog"
                          >
                            <FaUndo />
                          </button>
                          <button
                            onClick={() => handlePermanentDelete(blog._id, blog.title)}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                            title="Delete Permanently"
                          >
                            <FaTrash />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="flex items-center gap-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Previous
            </button>
            
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => paginate(index + 1)}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === index + 1
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {index + 1}
              </button>
            ))}
            
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </nav>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-full ${deleteModal.permanent ? 'bg-red-100 dark:bg-red-900' : 'bg-yellow-100 dark:bg-yellow-900'}`}>
                <FaTrashAlt className={`text-2xl ${deleteModal.permanent ? 'text-red-600 dark:text-red-300' : 'text-yellow-600 dark:text-yellow-300'}`} />
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  {deleteModal.permanent ? 'Permanently Delete Blog' : 'Move to Trash'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {deleteModal.permanent ? 'This action cannot be undone' : 'Blog can be restored from trash'}
                </p>
              </div>
            </div>
            
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="font-medium">{deleteModal.blogTitle}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {deleteModal.permanent 
                  ? 'This blog will be permanently deleted from the database.'
                  : 'This blog will be moved to trash. You can restore it later.'}
              </p>
            </div>
            
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setDeleteModal({ open: false, blogId: null, blogTitle: '', permanent: false })}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className={`px-4 py-2 text-white rounded-lg font-medium ${
                  deleteModal.permanent
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-yellow-600 hover:bg-yellow-700'
                }`}
              >
                {deleteModal.permanent ? 'Delete Permanently' : 'Move to Trash'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Bulk Actions */}
      {confirmModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">{confirmModal.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {confirmModal.message}
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={confirmModal.onCancel}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AllBlogs