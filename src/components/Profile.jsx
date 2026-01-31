import React, { useState } from 'react';
import useAuth from '../hooks/useAuth';
import { 
  FiUser, 
  FiMail, 
  FiCalendar, 
  FiEdit2, 
  FiLogOut, 
  FiCheck, 
  FiX,
  FiFacebook,
  FiLink,
  FiShield,
  FiMonitor,
  FiLock,
  FiUnlock,
  FiGlobe,
  FiLinkedin,
  FiGithub
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

function Profile() {
  const { user, signOutUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.displayName || '');
  const [role, setRole] = useState('Senior Developer');
  const [status, setStatus] = useState('Active');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Enhanced device login history
  const [deviceHistory, setDeviceHistory] = useState([
    { 
      id: 1, 
      device: 'Windows 10, Chrome', 
      location: 'Dhaka, BD', 
      ip: '192.168.1.101',
      time: '2 hours ago', 
      current: true,
      osIcon: 'windows'
    },
    { 
      id: 2, 
      device: 'Android 12, Firefox', 
      location: 'Chittagong, BD', 
      ip: '192.168.1.102',
      time: '1 day ago', 
      current: false,
      osIcon: 'android'
    },
    { 
      id: 3, 
      device: 'Mac OS Monterey, Safari', 
      location: 'Sylhet, BD', 
      ip: '192.168.1.103',
      time: '1 week ago', 
      current: false,
      osIcon: 'mac'
    }
  ]);

  // Enhanced social account links
  const [socialAccounts, setSocialAccounts] = useState([
    { 
      platform: 'Facebook', 
      url: 'https://facebook.com/johndoe', 
      connected: true,
      icon: <FiFacebook className="text-blue-500" />,
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    },
    { 
      platform: 'LinkedIn', 
      url: 'https://linkedin.com/in/johndoe', 
      connected: true,
      icon: <FiLinkedin className="text-blue-600" />,
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    },
    { 
      platform: 'GitHub', 
      url: 'https://github.com/johndoe', 
      connected: true,
      icon: <FiGithub className="text-gray-800 dark:text-gray-200" />,
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    },
    { 
      platform: 'Portfolio', 
      url: 'https://johndoe.dev', 
      connected: false,
      icon: <FiGlobe className="text-indigo-500" />,
      color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400'
    }
  ]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mb-4"></div>
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    // API call to update user's name would go here
    setIsEditing(false);
  };

  const toggleTwoFactor = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    // API call to update 2FA status would go here
  };

  const membershipDate = new Date(user.metadata?.creationTime || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const getOSIcon = (os) => {
    switch(os) {
      case 'windows':
        return '💻';
      case 'android':
        return '📱';
      case 'mac':
        return '🍎';
      default:
        return '🖥️';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-sm"
            >
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Confirm Logout</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">Are you sure you want to sign out from all devices?</p>
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={signOutUser}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center justify-center"
                >
                  <FiLogOut className="mr-2" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-6xl mx-auto px-4 py-8"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-colors duration-200">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-6 text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">User Profile</h1>
                <p className="text-indigo-100">Manage your account settings and preferences</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium">
                  {role}
                </span>
                <span className="bg-emerald-500 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                  {status}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'profile' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'security' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                Security
              </button>
              <button
                onClick={() => setActiveTab('devices')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'devices' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                Devices
              </button>
            </nav>
          </div>

          {/* Profile Content */}
          <div className="p-6 md:p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Avatar Section */}
              <div className="flex flex-col items-center w-full lg:w-auto lg:min-w-[280px]">
                <div className="relative">
                  <img
                    src={user.photoURL || 'https://i.pravatar.cc/300?u=' + user.email}
                    alt="User Avatar"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
                  />
                  <button 
                    className="absolute bottom-2 right-2 bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded-full shadow-md transition-transform hover:scale-110"
                    aria-label="Edit profile picture"
                  >
                    <FiEdit2 size={16} />
                  </button>
                </div>
                
                {/* Stats */}
                <div className="mt-6 grid grid-cols-3 gap-4 w-full">
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Projects</div>
                    <div className="font-bold text-indigo-600 dark:text-indigo-400">24</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Following</div>
                    <div className="font-bold text-indigo-600 dark:text-indigo-400">156</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Followers</div>
                    <div className="font-bold text-indigo-600 dark:text-indigo-400">89</div>
                  </div>
                </div>
                
                {/* Member Since */}
                <div className="mt-6 w-full">
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                    <FiCalendar className="flex-shrink-0" />
                    <span className="text-sm">Member since {membershipDate}</span>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 w-full">
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    {/* Name Field */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Full Name</label>
                      {isEditing ? (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="flex-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-600 dark:text-white"
                            aria-label="Edit name"
                          />
                          <div className="flex gap-2 w-full sm:w-auto">
                            <button
                              onClick={handleSave}
                              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors w-full sm:w-auto flex items-center justify-center"
                              aria-label="Save changes"
                            >
                              <FiCheck className="mr-1" /> Save
                            </button>
                            <button
                              onClick={() => setIsEditing(false)}
                              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors w-full sm:w-auto flex items-center justify-center"
                              aria-label="Cancel editing"
                            >
                              <FiX className="mr-1" /> Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <h2 className="text-xl font-semibold text-gray-800 dark:text-white break-words">{name}</h2>
                          <button
                            onClick={() => setIsEditing(true)}
                            className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            aria-label="Edit name"
                          >
                            <FiEdit2 size={18} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Email Field */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Email Address</label>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FiMail className="text-gray-400 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300 break-all">{user.email}</span>
                        </div>
                        <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">
                          Verified
                        </span>
                      </div>
                    </div>

                    {/* Role Field */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Role</label>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FiUser className="text-gray-400 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300">{role}</span>
                        </div>
                        <button className="text-sm text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-400">
                          Request Change
                        </button>
                      </div>
                    </div>

                    {/* Connected Accounts */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Connected Accounts</label>
                      <div className="space-y-3">
                        {socialAccounts.map((account) => (
                          <div key={account.platform} className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-600">
                            <div className="flex items-center space-x-3">
                              {account.icon}
                              <div>
                                <p className="text-gray-800 dark:text-gray-200 font-medium">{account.platform}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]">{account.url}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className={`text-xs px-2 py-1 rounded-full ${account.connected ? account.color : 'bg-gray-200 text-gray-800 dark:bg-gray-500 dark:text-gray-300'}`}>
                                {account.connected ? 'Connected' : 'Connect'}
                              </span>
                              {account.connected && (
                                <button className="text-red-500 hover:text-red-700">
                                  <FiX size={16} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-6">
                    {/* Password Management */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Password</label>
                        <button className="text-sm text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-400">
                          Change Password
                        </button>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-600">
                        <FiLock className="text-gray-400 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">•••••••••••</span>
                      </div>
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Last changed 3 months ago</p>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Two-Factor Authentication</label>
                        <button
                          onClick={toggleTwoFactor}
                          className={`text-sm font-medium ${twoFactorEnabled ? 'text-red-500 hover:text-red-700' : 'text-emerald-500 hover:text-emerald-700'}`}
                        >
                          {twoFactorEnabled ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                      <div className="p-3 bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <FiShield className={`flex-shrink-0 ${twoFactorEnabled ? 'text-emerald-500' : 'text-gray-400'}`} />
                            <div>
                              <p className="text-gray-800 dark:text-gray-200 font-medium">
                                {twoFactorEnabled ? '2FA is enabled' : '2FA is disabled'}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {twoFactorEnabled ? 'Your account is secured with two-factor authentication' : 'Add an extra layer of security to your account'}
                              </p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${twoFactorEnabled ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-200 text-gray-800 dark:bg-gray-500 dark:text-gray-300'}`}>
                            {twoFactorEnabled ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        {twoFactorEnabled && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Recovery Codes:</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {['A1B2-C3D4', 'E5F6-G7H8', 'I9J0-K1L2', 'M3N4-O5P6', 'Q7R8-S9T0', 'U1V2-W3X4'].map((code) => (
                                <div key={code} className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-center font-mono text-sm">
                                  {code}
                                </div>
                              ))}
                            </div>
                            <button className="mt-3 text-xs text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-400">
                              Generate new recovery codes
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Active Sessions */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Active Sessions</label>
                      <div className="space-y-3">
                        {deviceHistory.filter(d => d.current).map((device) => (
                          <div key={device.id} className="p-3 bg-white dark:bg-gray-600 rounded-lg border border-indigo-200 dark:border-indigo-700">
                            <div className="flex items-start space-x-3">
                              <div className="text-2xl mt-1">{getOSIcon(device.osIcon)}</div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium text-indigo-700 dark:text-indigo-300">{device.device}</p>
                                  <span className="text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 px-2 py-1 rounded-full">
                                    Current Session
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{device.location} • {device.ip}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Last active {device.time}</p>
                              </div>
                            </div>
                            <button className="mt-3 text-sm text-red-500 hover:text-red-700">
                              Log out from this device
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'devices' && (
                  <div className="space-y-6">
                    {/* Current Device */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">This Device</label>
                      {deviceHistory.filter(d => d.current).map((device) => (
                        <div key={device.id} className="p-4 bg-white dark:bg-gray-600 rounded-lg border border-indigo-200 dark:border-indigo-700 shadow-sm">
                          <div className="flex items-start space-x-4">
                            <div className="text-3xl mt-1">{getOSIcon(device.osIcon)}</div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">{device.device}</h3>
                                <span className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded-full">
                                  Active now
                                </span>
                              </div>
                              <div className="mt-2 grid grid-cols-2 gap-2">
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                                  <p className="text-sm text-gray-700 dark:text-gray-300">{device.location}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">IP Address</p>
                                  <p className="text-sm text-gray-700 dark:text-gray-300">{device.ip}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">First Seen</p>
                                  <p className="text-sm text-gray-700 dark:text-gray-300">{device.time}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                                  <p className="text-sm text-gray-700 dark:text-gray-300">Trusted</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 flex space-x-3">
                            <button className="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md text-sm hover:bg-red-100 dark:hover:bg-red-900/30">
                              Log Out
                            </button>
                            <button className="px-3 py-1 bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-300 rounded-md text-sm hover:bg-gray-200 dark:hover:bg-gray-500/30">
                              Forget Device
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Device History */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Login History</label>
                        <button className="text-xs text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-400">
                          Clear All History
                        </button>
                      </div>
                      <div className="space-y-3">
                        {deviceHistory.filter(d => !d.current).map((device) => (
                          <div key={device.id} className="p-3 bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-600">
                            <div className="flex items-start space-x-3">
                              <div className="text-2xl mt-1">{getOSIcon(device.osIcon)}</div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-800 dark:text-gray-200">{device.device}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{device.location} • {device.ip}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Last active {device.time}</p>
                              </div>
                              <button className="text-red-500 hover:text-red-700 text-sm">
                                Revoke
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Last updated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  Download Data
                </button>
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-lg shadow-md transition-all hover:shadow-lg flex items-center justify-center"
                >
                  <FiLogOut className="mr-2" />
                  Sign Out All Devices
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Profile;