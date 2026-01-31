import React, { useState, useRef } from 'react';
import { FiMenu, FiX, FiSearch, FiBell, FiClock, FiCheckCircle, FiAlertOctagon, FiMoon, FiSun } from 'react-icons/fi';
import { FaTasks } from 'react-icons/fa';
import useAuth from '../hooks/useAuth';

const NOTIFICATIONS = [
  {
    id: 1,
    title: 'New lead assigned',
    message: 'You have a new lead from Fiverr - Web Development project',
    time: '5 mins ago',
    icon: <FiCheckCircle className="text-emerald-500" />,
    read: false
  },
  {
    id: 2,
    title: 'Task completed',
    message: 'Your team member completed the dashboard design task',
    time: '1 hour ago',
    icon: <FaTasks className="text-blue-500" />,
    read: false
  },
  {
    id: 3,
    title: 'New announcement',
    message: 'Team meeting tomorrow at 11 AM via Zoom',
    time: '3 hours ago',
    icon: <FiAlertOctagon className="text-amber-500" />,
    read: true
  }
];

const TopBar = ({ 
  isOpen, 
  mobileOpen, 
  toggleMobileSidebar, 

  isAdmin, 
  windowWidth,
  darkMode,
  toggleDarkMode
}) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const notificationsRef = useRef(null);
  const {user}= useAuth()

  const toggleNotifications = () => {
    if (!notificationsOpen) {
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    }
    setNotificationsOpen(!notificationsOpen);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderNotifications = () => (
    <div 
      className={`
        fixed md:absolute top-16 md:top-auto md:mt-2 
        bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden 
        transition-all duration-300 transform origin-top-right
        ${notificationsOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}
        ${windowWidth < 768 ? 
          'left-4 right-4 w-auto max-h-[70vh] z-50' : 
          'right-0 w-80 z-40'
        }
      `}
      ref={notificationsRef}
    >
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center">
          <FiBell className="mr-2" />
          Notifications
          {unreadCount > 0 && (
            <span className="ml-auto bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
              {unreadCount} new
            </span>
          )}
        </h3>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                !notification.read ? 'bg-blue-50 dark:bg-blue-900/30' : ''
              }`}
            >
              <div className="flex items-start">
                <div className="mt-1 mr-3">
                  {notification.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200">{notification.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notification.message}</p>
                  <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <FiClock className="mr-1" size={12} />
                    {notification.time}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <FiBell className="mx-auto text-gray-400 mb-2" size={24} />
            <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
          </div>
        )}
      </div>
      <div className="p-3 bg-gray-50 dark:bg-gray-700 text-center border-t border-gray-100 dark:border-gray-600">
        <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
          View all notifications
        </button>
      </div>
    </div>
  );

  return (
    <nav className={`fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 shadow-sm z-30 transition-all duration-300 
      ${isOpen ? 'md:pl-72' : 'md:pl-20'} backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90 flex items-center`}>
      <div className="flex items-center justify-between w-full px-4">
        <div className="flex items-center space-x-4">
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={toggleMobileSidebar}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <FiX size={20} className="text-gray-600 dark:text-gray-300" />
            ) : (
              <FiMenu size={20} className="text-gray-600 dark:text-gray-300" />
            )}
          </button>
          <div className="relative flex-1 max-w-xl hidden md:block">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search projects, clients..." 
              className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full transition-all bg-gray-50 dark:bg-gray-700 hover:bg-white dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? (
              <FiSun size={20} className="text-amber-400" />
            ) : (
              <FiMoon size={20} className="text-gray-600 dark:text-gray-300" />
            )}
          </button>
          
          <div className="relative" ref={notificationsRef}>
            <button 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 relative transition-colors"
              onClick={toggleNotifications}
            >
              <FiBell size={20} className="text-gray-600 dark:text-gray-300" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>
            {renderNotifications()}
          </div>
          
          <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-lg transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 flex items-center justify-center shadow-md overflow-hidden">
              {user?.photoURL ? (
                <img className="w-full h-full object-cover" src={user.photoURL} alt="Profile" />
              ) : (
                <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                  {user?.displayName?.charAt(0) || 'U'}
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 hidden md:block">
              {user?.displayName || 'User'}
              {isAdmin && <span className="text-xs text-red-600 dark:text-red-400 ml-1">(Admin)</span>}
            </p>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopBar;