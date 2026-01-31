import React, { useState, useContext, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ArrowPathIcon,
  XMarkIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserPlusIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import useAuth from '../../hooks/useAuth';
import { AuthContext } from '../../provider/AuthProvider';
import useAdmin from '../../hooks/useAdmin';

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const { users, getUsers, loading: authLoading } = useContext(AuthContext);
  const { isAdmin, isModerator, userRole: currentUserRole } = useAdmin();
  const axiosSecure = useAxiosSecure();
  
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    role: 'user',
    password: ''
  });

  // Check if current user has access to user management
  const hasAccess = isAdmin || isModerator;

  // Stats data
  const [stats, setStats] = useState({
    total: 0,
    users: 0,
    sellers: 0,
    moderators: 0,
    admins: 0,
    active: 0,
    inactive: 0
  });

  // Available roles for assignment
  const availableRoles = [
    { value: 'user', label: 'User', color: 'blue', description: 'Regular platform user' },
    { value: 'seller', label: 'Seller', color: 'green', description: 'Can manage products and sales' },
    { value: 'moderator', label: 'Moderator', color: 'purple', description: 'Can manage content and users' },
    { value: 'admin', label: 'Admin', color: 'red', description: 'Full system access' }
  ];

  // Filtered users - handle both array and object formats
  const filteredUsers = (Array.isArray(users) ? users : []).filter(user => {
    if (!user || typeof user !== 'object') return false;
    
    const userName = user.name || user.displayName || '';
    const userEmail = user.email || '';
    const userRole = user.role || 'user';
    const isActive = user.isActive !== false; // Default to true if not specified
    
    const matchesSearch = userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || userRole === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' ? isActive : !isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Calculate stats
  useEffect(() => {
    if (Array.isArray(users)) {
      const statsData = {
        total: users.length,
        users: users.filter(u => (u.role || 'user') === 'user').length,
        sellers: users.filter(u => u.role === 'seller').length,
        moderators: users.filter(u => u.role === 'moderator').length,
        admins: users.filter(u => u.role === 'admin').length,
        active: users.filter(u => u.isActive !== false).length,
        inactive: users.filter(u => u.isActive === false).length
      };
      setStats(statsData);
    } else {
      setStats({
        total: 0,
        users: 0,
        sellers: 0,
        moderators: 0,
        admins: 0,
        active: 0,
        inactive: 0
      });
    }
  }, [users]);

  // Load users on component mount if user has access
  useEffect(() => {
    if (hasAccess && !authLoading) {
      refreshUsers();
    }
  }, [hasAccess, authLoading]);

  // Show success message
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Show error message
  const showError = (message) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(''), 5000);
  };

  // Refresh users
  const refreshUsers = async () => {
    if (!hasAccess) {
      showError('You do not have permission to access user management');
      return;
    }

    setLoading(true);
    try {
      await getUsers();
      showSuccess('Users refreshed successfully');
    } catch (error) {
      console.error('Refresh error:', error);
      showError('Failed to refresh users: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Add new user
  const addNewUser = async () => {
    if (!hasAccess) {
      showError('Permission denied');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosSecure.post('/users', newUserData);

      if (response.data.success) {
        await getUsers();
        showSuccess('User created successfully');
        setShowAddUserModal(false);
        setNewUserData({
          name: '',
          email: '',
          role: 'user',
          password: ''
        });
      } else {
        throw new Error(response.data.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Add user error:', error);
      showError(error.response?.data?.message || error.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  // Update user role
  const updateUserRole = async (userId, newRole) => {
    if (!hasAccess) {
      showError('Permission denied');
      return;
    }

    setActionLoading(userId);
    try {
      const response = await axiosSecure.patch(`/users/${userId}/role`, {
        role: newRole
      });

      if (response.data.success) {
        await getUsers();
        showSuccess(`User role updated to ${newRole}`);
        setShowRoleModal(false);
        setSelectedUser(null);
      } else {
        throw new Error(response.data.message || 'Failed to update role');
      }
    } catch (error) {
      console.error('Role update error:', error);
      showError(error.response?.data?.message || error.message || 'Failed to update user role');
    } finally {
      setActionLoading(null);
    }
  };

  // Promote to specific role
  const promoteUser = async (userId, targetRole) => {
    if (!hasAccess) {
      showError('Permission denied');
      return;
    }

    setActionLoading(userId);
    try {
      let endpoint = '';
      switch (targetRole) {
        case 'seller':
          endpoint = `/users/${userId}/promote/seller`;
          break;
        case 'moderator':
          endpoint = `/users/${userId}/promote/moderator`;
          break;
        default:
          throw new Error('Invalid promotion target');
      }

      const response = await axiosSecure.patch(endpoint);

      if (response.data.success) {
        await getUsers();
        showSuccess(`User promoted to ${targetRole} successfully`);
        setShowRoleModal(false);
        setSelectedUser(null);
      } else {
        throw new Error(response.data.message || 'Failed to promote user');
      }
    } catch (error) {
      console.error('Promotion error:', error);
      showError(error.response?.data?.message || error.message || 'Failed to promote user');
    } finally {
      setActionLoading(null);
    }
  };

  // Demote user to regular user
  const demoteUser = async (userId) => {
    if (!hasAccess) {
      showError('Permission denied');
      return;
    }

    setActionLoading(userId);
    try {
      const response = await axiosSecure.patch(`/users/${userId}/demote/user`);

      if (response.data.success) {
        await getUsers();
        showSuccess('User demoted to regular user');
        setShowRoleModal(false);
        setSelectedUser(null);
      } else {
        throw new Error(response.data.message || 'Failed to demote user');
      }
    } catch (error) {
      console.error('Demotion error:', error);
      showError(error.response?.data?.message || error.message || 'Failed to demote user');
    } finally {
      setActionLoading(null);
    }
  };

  // Delete user (soft delete)
  const deleteUser = async (userId) => {
    if (!hasAccess) {
      showError('Permission denied');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    setActionLoading(userId);
    try {
      const response = await axiosSecure.delete(`/users/${userId}`);

      if (response.data.success) {
        await getUsers();
        showSuccess('User deleted successfully');
      } else {
        throw new Error(response.data.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showError(error.response?.data?.message || error.message || 'Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle user active status
  const toggleUserStatus = async (userId, currentStatus) => {
    if (!hasAccess) {
      showError('Permission denied');
      return;
    }

    setActionLoading(userId);
    try {
      const response = await axiosSecure.patch(`/users/${userId}`, {
        isActive: !currentStatus
      });

      if (response.data.success) {
        await getUsers();
        showSuccess(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      } else {
        throw new Error(response.data.message || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Status toggle error:', error);
      showError(error.response?.data?.message || error.message || 'Failed to update user status');
    } finally {
      setActionLoading(null);
    }
  };

  // Get role badge color
  const getRoleBadge = (role) => {
    const roleConfig = {
      user: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', label: 'User' },
      seller: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', label: 'Seller' },
      moderator: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300', label: 'Moderator' },
      admin: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', label: 'Admin' }
    };
    
    return roleConfig[role] || { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', label: role };
  };

  // Get status badge
  const getStatusBadge = (user) => {
    if (user.isActive === false) {
      return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 rounded-full">Inactive</span>;
    }
    return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 rounded-full">Active</span>;
  };

  // Check if current user can modify target user
  const canModifyUser = (targetUser) => {
    if (!currentUser || !targetUser) return false;
    if (!hasAccess) return false;
    
    // Users cannot modify themselves
    if (targetUser._id === currentUser.uid || targetUser._id === currentUser._id) return false;
    
    const roleHierarchy = {
      'user': 1,
      'seller': 2,
      'moderator': 3,
      'admin': 4
    };
    
    const currentUserLevel = roleHierarchy[currentUserRole] || 0;
    const targetUserLevel = roleHierarchy[targetUser.role] || 0;
    
    return currentUserLevel >= targetUserLevel;
  };

  // Get user display name
  const getUserDisplayName = (user) => {
    return user.name || user.displayName || 'No Name';
  };

  // Get user photo URL
  const getUserPhotoUrl = (user) => {
    return user.photoURL || user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(getUserDisplayName(user))}&background=random`;
  };

  // Get user ID for comparison
  const getUserId = (user) => {
    return user._id || user.uid || user.id;
  };

  // Get role description
  const getRoleDescription = (role) => {
    const roleInfo = availableRoles.find(r => r.value === role);
    return roleInfo ? roleInfo.description : 'No description available';
  };

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have permission to access user management. This area is restricted to administrators and moderators.
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage users, roles, and permissions across the platform
            </p>
            <div className="flex items-center mt-2 space-x-2 text-sm">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(currentUserRole).color}`}>
                {getRoleBadge(currentUserRole).label}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                Logged in as: {currentUser?.email}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <button
              onClick={() => setShowStatsModal(true)}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <ChartBarIcon className="h-5 w-5 mr-2" />
              Stats
            </button>
            {isAdmin && (
              <button
                onClick={() => setShowAddUserModal(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <UserPlusIcon className="h-5 w-5 mr-2" />
                Add User
              </button>
            )}
            <button
              onClick={refreshUsers}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.active}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Moderators</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.moderators}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <ShieldCheckIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Admins</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.admins}</p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <ShieldCheckIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 pr-10 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                {availableRoles.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 pr-10 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
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

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="text-gray-500 dark:text-gray-400">
                      <UserGroupIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No users found</p>
                      <p className="mt-1">Try adjusting your search or filters</p>
                      {users.length === 0 && (
                        <button
                          onClick={refreshUsers}
                          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Load Users
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <motion.tr
                    key={getUserId(user) || index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={getUserPhotoUrl(user)}
                            alt={getUserDisplayName(user)}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {getUserDisplayName(user)}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(user.role).color}`}>
                        {getRoleBadge(user.role).label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(user)}
                        <button
                          onClick={() => toggleUserStatus(getUserId(user), user.isActive !== false)}
                          disabled={actionLoading === getUserId(user) || !canModifyUser(user)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                          title={user.isActive === false ? 'Activate User' : 'Deactivate User'}
                        >
                          {actionLoading === getUserId(user) ? (
                            <ArrowPathIcon className="h-4 w-4 animate-spin" />
                          ) : user.isActive === false ? (
                            <CheckCircleIcon className="h-4 w-4" />
                          ) : (
                            <XMarkIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {/* View Details */}
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserModal(true);
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>

                        {/* Change Role - Only show if current user can modify this user */}
                        {canModifyUser(user) && (
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowRoleModal(true);
                            }}
                            disabled={actionLoading === getUserId(user)}
                            className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors disabled:opacity-50"
                            title="Change Role"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        )}

                        {/* Delete User - Only show if current user can modify this user */}
                        {canModifyUser(user) && (
                          <button
                            onClick={() => deleteUser(getUserId(user))}
                            disabled={actionLoading === getUserId(user)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                            title="Delete User"
                          >
                            {actionLoading === getUserId(user) ? (
                              <ArrowPathIcon className="h-4 w-4 animate-spin" />
                            ) : (
                              <TrashIcon className="h-4 w-4" />
                            )}
                          </button>
                        )}

                        {/* Current user indicator */}
                        {getUserId(user) === getUserId(currentUser) && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                            You
                          </span>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      <AnimatePresence>
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  User Details
                </h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <img
                    className="h-16 w-16 rounded-full object-cover"
                    src={getUserPhotoUrl(selectedUser)}
                    alt={getUserDisplayName(selectedUser)}
                  />
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      {getUserDisplayName(selectedUser)}
                    </h4>
                    <p className="text-gray-500 dark:text-gray-400">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Role:</span>
                    <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(selectedUser.role).color}`}>
                      {getRoleBadge(selectedUser.role).label}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Status:</span>
                    <span className="ml-2">{getStatusBadge(selectedUser)}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500 dark:text-gray-400">Role Description:</span>
                    <p className="ml-2 text-gray-900 dark:text-white text-xs mt-1">
                      {getRoleDescription(selectedUser.role)}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500 dark:text-gray-400">Joined:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">
                      {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  {selectedUser.lastLogin && (
                    <div className="col-span-2">
                      <span className="text-gray-500 dark:text-gray-400">Last Login:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {new Date(selectedUser.lastLogin).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Change Role Modal */}
      <AnimatePresence>
        {showRoleModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Change User Role
                </h3>
               <button
  onClick={() => setShowRoleModal(false)}
  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
>
  <XMarkIcon className="h-6 w-6" />                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <img
                    className="h-12 w-12 rounded-full object-cover"
                    src={getUserPhotoUrl(selectedUser)}
                    alt={getUserDisplayName(selectedUser)}
                  />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {getUserDisplayName(selectedUser)}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedUser.email}
                    </p>
                    <div className="flex items-center mt-1 space-x-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(selectedUser.role).color}`}>
                        Current: {getRoleBadge(selectedUser.role).label}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">Select New Role:</h4>
                  <div className="grid gap-2">
                    {availableRoles.map((role) => (
                      <button
                        key={role.value}
                        onClick={() => updateUserRole(getUserId(selectedUser), role.value)}
                        disabled={actionLoading === getUserId(selectedUser) || selectedUser.role === role.value}
                        className={`flex items-center justify-between p-3 rounded-lg border-2 text-left transition-all ${
                          selectedUser.role === role.value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {role.label}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {role.description}
                          </div>
                        </div>
                        {actionLoading === getUserId(selectedUser) && selectedUser.role === role.value ? (
                          <ArrowPathIcon className="h-5 w-5 animate-spin text-blue-500" />
                        ) : (
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            selectedUser.role === role.value 
                              ? 'bg-blue-500 border-blue-500' 
                              : 'border-gray-400'
                          }`} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Quick Actions:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedUser.role === 'user' && (
                      <>
                        <button
                          onClick={() => promoteUser(getUserId(selectedUser), 'seller')}
                          disabled={actionLoading === getUserId(selectedUser)}
                          className="flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
                        >
                          Make Seller
                        </button>
                        <button
                          onClick={() => promoteUser(getUserId(selectedUser), 'moderator')}
                          disabled={actionLoading === getUserId(selectedUser)}
                          className="flex items-center justify-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm"
                        >
                          Make Moderator
                        </button>
                      </>
                    )}
                    {(selectedUser.role === 'seller' || selectedUser.role === 'moderator') && (
                      <button
                        onClick={() => demoteUser(getUserId(selectedUser))}
                        disabled={actionLoading === getUserId(selectedUser)}
                        className="flex items-center justify-center px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 text-sm col-span-2"
                      >
                        Demote to User
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Add New User
                </h3>
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={newUserData.name}
                    onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Role
                  </label>
                  <select
                    value={newUserData.role}
                    onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {availableRoles.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowAddUserModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addNewUser}
                    disabled={loading || !newUserData.name || !newUserData.email || !newUserData.password}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <ArrowPathIcon className="h-4 w-4 animate-spin mr-2" />
                        Creating...
                      </div>
                    ) : (
                      'Create User'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Stats Modal */}
      <AnimatePresence>
        {showStatsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  User Statistics
                </h3>
                <button
                  onClick={() => setShowStatsModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {Object.entries(stats).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {value}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {key.replace(/_/g, ' ')}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Role Distribution</h4>
                <div className="space-y-2">
                  {[
                    { label: 'Users', value: stats.users, color: 'bg-blue-500' },
                    { label: 'Sellers', value: stats.sellers, color: 'bg-green-500' },
                    { label: 'Moderators', value: stats.moderators, color: 'bg-purple-500' },
                    { label: 'Admins', value: stats.admins, color: 'bg-red-500' }
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${item.color}`}
                            style={{ width: `${(item.value / stats.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white w-8">
                          {item.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserManagement;