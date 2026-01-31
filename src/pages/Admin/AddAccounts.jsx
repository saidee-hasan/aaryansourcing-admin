import React, { useState, useEffect } from 'react';
import { 
  EnvelopeIcon,
  XMarkIcon,
  PencilIcon,
  ArrowPathIcon,
  EyeIcon,
  EyeSlashIcon,
  DevicePhoneMobileIcon,
  CurrencyDollarIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  ClockIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useAxiosSecure from '../../hooks/useAxiosSecure';

function UserManagementDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState('accounts'); // 'accounts' or 'schedules'
  const axiosSecure = useAxiosSecure();

  // Account form state
  const [accountFormData, setAccountFormData] = useState({
    email: '',
    facebookPassword: '',
    fiverrPassword: '',
    upworkPassword: ''
  });

  // Schedule form state
  const [scheduleData, setScheduleData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    duration: 10
  });

  const [showPasswords, setShowPasswords] = useState({
    facebook: false,
    fiverr: false,
    upwork: false
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosSecure.get('/users');
        setUsers(response.data);
      } catch (err) {
        setError(err.message);
        toast.error('Failed to load users', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [axiosSecure]);

  // Account management handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAccountFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (platform) => {
    setShowPasswords(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setAccountFormData({
      email: user.email || '',
      facebookPassword: '',
      fiverrPassword: '',
      upworkPassword: ''
    });
    setShowEditModal(true);
  };

  const handleSubmitAccount = async (e) => {
    e.preventDefault();
    try {
  
      await axiosSecure.patch(`/users/accounts/${selectedUser._id}`, accountFormData);
      
      // Update local state
      const updatedUsers = users.map(user => 
        user._id === selectedUser._id 
          ? { ...user, ...accountFormData } 
          : user
      );
      setUsers(updatedUsers);
      
      setShowEditModal(false);
      toast.success('Account updated successfully!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (err) {
      setError(err.message);
      toast.error('Failed to update account', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  // Schedule management handlers
  const handleScheduleInputChange = (e) => {
    const { name, value } = e.target;
    setScheduleData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleScheduleClick = (user) => {
    setSelectedUser(user);
    setShowScheduleModal(true);
    if (user.schedule) {
      setScheduleData({
        date: user.schedule.rawData.date,
        startTime: user.schedule.rawData.startTime,
        endTime: user.schedule.rawData.endTime,
        duration: user.schedule.rawData.duration
      });
    } else {
      setScheduleData({
        date: '',
        startTime: '',
        endTime: '',
        duration: 10
      });
    }
  };

  const calculateEndDate = (startDate, days) => {
    if (!startDate) return '';
    const date = new Date(startDate);
    date.setDate(date.getDate() + parseInt(days));
    return date.toISOString().split('T')[0];
  };

  const formatTimeToAMPM = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleSubmitSchedule = async () => {
    if (!scheduleData.date || !scheduleData.startTime || !scheduleData.endTime) {
      toast.error('Please fill all required fields', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    try {
      const endDate = calculateEndDate(scheduleData.date, scheduleData.duration);

      const formattedSchedule = {
        userId: selectedUser._id,
        userName: selectedUser.displayName,
        startDate: formatDate(scheduleData.date),
        endDate: formatDate(endDate),
        startTime: formatTimeToAMPM(scheduleData.startTime),
        endTime: formatTimeToAMPM(scheduleData.endTime),
        duration: `${scheduleData.duration} days`,
        rawData: scheduleData
      };

      await axiosSecure.patch(`/users/schedule/${selectedUser._id}`, formattedSchedule);

      // Update local state
      const updatedUsers = users.map(user => 
        user._id === selectedUser._id 
          ? { ...user, schedule: formattedSchedule } 
          : user
      );
      setUsers(updatedUsers);

      setShowScheduleModal(false);
      
      toast.success('Schedule saved successfully!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast.error('Failed to save schedule', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 dark:bg-gray-900">
        <ArrowPathIcon className="h-12 w-12 text-purple-500 dark:text-purple-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-4 rounded-lg flex items-center gap-2">
        <XMarkIcon className="h-5 w-5" />
        <span>Error: {error}</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 dark:bg-gray-900 min-h-screen">
      <ToastContainer />
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">User Management Dashboard</h1>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'accounts' ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
          onClick={() => setActiveTab('accounts')}
        >
          <UserIcon className="h-5 w-5" />
          Account Management
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'schedules' ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
          onClick={() => setActiveTab('schedules')}
        >
          <CalendarIcon className="h-5 w-5" />
          Schedule Management
        </button>
      </div>

      {/* Accounts Tab */}
      {activeTab === 'accounts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map(user => (
            <div key={user._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="p-4 flex flex-col items-center border-b dark:border-gray-700">
                <img 
                  src={user.photoURL || '/default-avatar.png'} 
                  alt={user.displayName} 
                  className="w-20 h-20 rounded-full object-cover border-2 border-purple-100 dark:border-purple-900 mb-3"
                />
                <h3 className="font-semibold text-gray-800 dark:text-white text-center">{user.displayName}</h3>
              </div>

              <div className="p-4 space-y-4">
                {/* Email */}
                <div className="flex items-start gap-3">
                  <EnvelopeIcon className="h-5 w-5 text-purple-500 dark:text-purple-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-gray-800 dark:text-gray-200">{user.email}</p>
                  </div>
                </div>

                {/* Facebook Password */}
                <div className="flex items-start gap-3">
                  <DevicePhoneMobileIcon className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Facebook Password</p>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-800 dark:text-gray-200">••••••••</span>
                    </div>
                  </div>
                </div>

                {/* Fiverr Password */}
                <div className="flex items-start gap-3">
                  <CurrencyDollarIcon className="h-5 w-5 text-green-500 dark:text-green-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Fiverr Password</p>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-800 dark:text-gray-200">••••••••</span>
                    </div>
                  </div>
                </div>

                {/* Upwork Password */}
                <div className="flex items-start gap-3">
                  <BriefcaseIcon className="h-5 w-5 text-purple-500 dark:text-purple-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Upwork Password</p>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-800 dark:text-gray-200">••••••••</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/30 flex justify-center">
                <button 
                  onClick={() => handleEditUser(user)}
                  className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center gap-1"
                >
                  <PencilIcon className="h-4 w-4" />
                  Edit Accounts
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedules Tab */}
      {activeTab === 'schedules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map(user => (
            <div key={user._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-col">
              <div className="flex items-center space-x-4 mb-3">
                <img 
                  src={user.photoURL || '/default-avatar.png'} 
                  alt={user.displayName} 
                  className="w-12 h-12 rounded-full object-cover" 
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 dark:text-white">{user.displayName}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{user.email}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Role: {user.role}</p>
                </div>
                
                {user.schedule ? (
                  <CheckCircleIcon className="h-6 w-6 text-green-500" title="Schedule exists" />
                ) : (
                  <ClockIcon className="h-6 w-6 text-gray-400" title="No schedule" />
                )}
              </div>
              
              {user.schedule && (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-1">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {user.schedule.startDate} - {user.schedule.endDate}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    {user.schedule.startTime} - {user.schedule.endTime}
                  </div>
                </div>
              )}
              
              <button 
                onClick={() => handleScheduleClick(user)}
                className={`mt-3 w-full py-2 rounded text-sm flex items-center justify-center ${
                  user.schedule
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {user.schedule ? 'Edit Schedule' : 'Add 10-Day Schedule'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Edit Account Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center border-b dark:border-gray-700 p-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Edit {selectedUser.displayName}'s Accounts
              </h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitAccount} className="p-6">
              <div className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={accountFormData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                {/* Facebook Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Facebook Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.facebook ? 'text' : 'password'}
                      name="facebookPassword"
                      value={accountFormData.facebookPassword}
                      onChange={handleInputChange}
                      placeholder="Leave blank to keep current"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('facebook')}
                      className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      {showPasswords.facebook ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Fiverr Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fiverr Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.fiverr ? 'text' : 'password'}
                      name="fiverrPassword"
                      value={accountFormData.fiverrPassword}
                      onChange={handleInputChange}
                      placeholder="Leave blank to keep current"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('fiverr')}
                      className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      {showPasswords.fiverr ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Upwork Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Upwork Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.upwork ? 'text' : 'password'}
                      name="upworkPassword"
                      value={accountFormData.upworkPassword}
                      onChange={handleInputChange}
                      placeholder="Leave blank to keep current"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('upwork')}
                      className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      {showPasswords.upwork ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-800 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {selectedUser.schedule ? 'Edit' : 'Create'} Schedule for {selectedUser.displayName}
              </h2>
              <button 
                onClick={() => setShowScheduleModal(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                <input 
                  type="date" 
                  name="date"
                  value={scheduleData.date}
                  onChange={handleScheduleInputChange}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
                {scheduleData.date && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    End Date: {formatDate(calculateEndDate(scheduleData.date, scheduleData.duration))}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (Days)</label>
                <input
                  type="number"
                  name="duration"
                  value={scheduleData.duration}
                  onChange={handleScheduleInputChange}
                  min="1"
                  max="30"
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Time</label>
                <input
                  type="time"
                  name="startTime"
                  value={scheduleData.startTime}
                  onChange={handleScheduleInputChange}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
                {scheduleData.startTime && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {formatTimeToAMPM(scheduleData.startTime)}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Time</label>
                <input
                  type="time"
                  name="endTime"
                  value={scheduleData.endTime}
                  onChange={handleScheduleInputChange}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
                {scheduleData.endTime && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {formatTimeToAMPM(scheduleData.endTime)}
                  </p>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex justify-between">
              <button 
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmitSchedule}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                disabled={!scheduleData.date || !scheduleData.startTime || !scheduleData.endTime}
              >
                {selectedUser.schedule ? 'Update Schedule' : 'Create Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagementDashboard;