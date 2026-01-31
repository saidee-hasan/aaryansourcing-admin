import React, { useRef, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FiHome, FiChevronRight, FiDollarSign, FiFileText, FiList,
  FiServer, FiHash, FiBox, FiLogOut, FiUser, FiSettings,
  FiPlus, FiUsers, FiDatabase, FiActivity,
  FiCalendar, FiBarChart2, FiTarget, FiMail, 
  FiAward, FiCreditCard, FiMoon, FiSun,
  FiBookOpen, FiChevronDown, FiClock, FiTool, FiLock, FiCheckSquare,
  FiInstagram, FiTag, FiLayers, FiEdit,
  FiShoppingBag, FiGrid, FiSliders, FiStar, FiTruck, FiArchive
} from 'react-icons/fi';
import { CiBank, CiPalette } from "react-icons/ci";

import { FaComments, FaTasks, FaTrophy, FaRegLightbulb, FaRegFileAlt, FaCloudUploadAlt, FaBullhorn, FaYoutube, FaFacebook, FaRecycle, FaCertificate } from 'react-icons/fa';
import { AiOutlineDashboard, AiOutlineTeam, AiOutlineProject } from 'react-icons/ai';
import { MdOutlineWork, MdOutlineSchedule, MdAdminPanelSettings, MdOutlineFeedback, MdOutlineSchool, MdOutlineLeaderboard, MdSchedule, MdCategory, MdStyle, MdColorLens } from "react-icons/md";
import { BsGraphUp, BsPersonLinesFill, BsShieldCheck, BsBox } from "react-icons/bs";
import useAuth from '../hooks/useAuth';
import useAdmin from '../hooks/useAdmin';
import { SiGooglemaps } from "react-icons/si";
import { PiggyBank, Users, Package, Settings, BarChart3, Palette, Ruler, Leaf, Shield, Zap, TrendingUp } from 'lucide-react';

import { FaBusinessTime } from 'react-icons/fa6';

// Custom Sliders icon component - MOVE THIS TO THE TOP
const Sliders = (props) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" />
    <line x1="9" y1="8" x2="15" y2="8" />
    <line x1="17" y1="16" x2="23" y2="16" />
  </svg>
);

const NAV_CONFIG = {
  logo: {
    collapsed: 'A',
    expanded: 'aaryan',
    iconGradient: 'from-blue-600 to-indigo-600',
    textGradient: 'from-blue-600 to-indigo-500',
    darkIconGradient: 'from-blue-400 to-indigo-400',
    darkTextGradient: 'from-blue-400 to-indigo-400'
  },
  userItems: [
    { 
      icon: <FiUser size={20} />, 
      text: 'My Profile', 
      path: '/profile',
      badge: 'Personal'
    },
  ],
  adminItems: [
    { 
      icon: <AiOutlineDashboard size={20} />, 
      text: 'Dashboard Overview', 
      path: '/',
      alert: true,
      pulse: true,
      badge: 'Home'
    },
        { 
      icon: <AiOutlineDashboard size={20} />, 
      text: 'All order', 
      path: '/dashboard/all-order',
      alert: true,
      pulse: true,
      badge: 'Home'
    },
    { 
      icon: <Users size={20} />, 
      text: 'User Management', 
      path: '/admin/users',
      count: 24,
      trend: 'up'
    },
    
    // Product Management Section
    {
      section: 'Product Management',
      icon: <Package size={16} />,
      items: [
        { 
          icon: <FiList size={20} />, 
          text: 'All Products', 
          path: '/dashboard/products',
          count: 156,
          trend: 'up',
          progress: 75
        },
        { 
          icon: <FiPlus size={20} />, 
          text: 'Add Product', 
          path: '/dashboard/add-product',
          new: true,
          badge: 'New'
        },
     
      ]
    },
    
    // Catalog Management Section
    {
      section: 'Catalog Management',
      icon: <FiGrid size={16} />,
      items: [
        { 
          icon: <MdStyle size={20} />, 
          text: 'Brand Management', 
          path: '/dashboard/add-brand',
          count: 45,
          trend: 'up'
        },
        { 
          icon: <MdCategory size={20} />, 
          text: 'Category Management', 
          path: '/dashboard/add-category',
          count: 23,
          progress: 85
        },
        { 
          icon: <FiLayers size={20} />, 
          text: 'Sub Categories', 
          path: '/dashboard/add-sub-category',
          count: 67
        },
        { 
          icon: <Ruler size={20} />, 
          text: 'Size Management', 
          path: '/dashboard/add-size',
          count: 12,
          new: true
        },
        { 
          icon: <FiCheckSquare size={20} />, 
          text: 'Product Fit', 
          path: '/dashboard/add-fit',
          count: 8
        },
           { 
          icon: <FaCertificate size={20} />, 
          text: ' Certification', 
          path: '/dashboard/certification',
          count: 8
        }
      ]
    },
   
    // Attributes & Features Section
    {
      section: 'Attributes & Features',
      icon: <Sliders size={16} />, // Now this works because Sliders is defined above
      items: [
        { 
          icon: <MdColorLens size={20} />, 
          text: 'Color Management', 
          path: '/dashboard/add-color',
          count: 34,
          trend: 'up'
        },
    
        { 
          icon: <Leaf size={20} />, 
          text: 'Sustainability', 
          path: '/dashboard/add-sustainability',
          badge: 'Eco',
          new: true
        }
      ]
    },
    
    // System & Settings Section
    {
      section: 'Blogs',
      icon: <Settings size={16} />,
      items: [
        { 
          icon: <Shield size={20} />, 
          text: 'Add Blog', 
          path: '/dashboard/add-blog',
          badge: 'Secure'
        },
        { 
          icon: <BarChart3 size={20} />, 
          text: 'All Blogs', 
          path: '/dashboard/all-blogs',
          progress: 45,
          badge: 'Beta'
        },
        // { 
        //   icon: <FiSettings size={20} />, 
        //   text: 'System Settings', 
        //   path: '/settings',
        //   badge: 'Config'
        // }
      ]
    }
  ],
  user: {
    status: 'Premium Member',
    statusColor: 'bg-emerald-400',
    darkStatusColor: 'bg-emerald-500'
  },
  styles: {
    activeItem: 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/50 dark:to-indigo-900/50 text-blue-600 dark:text-blue-300 border-l-4 border-blue-500 dark:border-blue-400 shadow-sm',
    inactiveItem: 'hover:bg-gray-50/50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-200',
    iconActive: 'text-blue-600 dark:text-blue-400',
    iconInactive: 'text-gray-500 dark:text-gray-400',
    badge: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-0.5 rounded-full font-semibold',
    sectionHeader: 'text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-6 mb-2 px-3',
    adminBadge: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs px-2 py-0.5 rounded-full font-semibold ml-2',
    newFeatureBadge: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs px-2 py-0.5 rounded-full font-semibold',
    warningBadge: 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 text-xs px-2 py-0.5 rounded-full font-semibold',
    successBadge: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-0.5 rounded-full font-semibold',
    dangerBadge: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs px-2 py-0.5 rounded-full font-semibold',
    countBadge: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs px-1.5 py-0.5 rounded-full font-medium',
    ecoBadge: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs px-2 py-0.5 rounded-full font-semibold'
  }
};

const Sidebar = ({ 
  isOpen, 
  mobileOpen, 
  toggleSidebar, 
  windowWidth, 
  darkMode,
  toggleDarkMode
}) => {
  const { isAdmin, isModerator, isTeamMember } = useAdmin();
  const { signOutUser } = useAuth();
  const { user } = useAuth();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const userMenuRef = useRef(null);

  const currentNavItems = isAdmin
    ? NAV_CONFIG.adminItems
    : isTeamMember
      ? NAV_CONFIG.userItems
      : [];

  // Auto-expand section if current path matches any item in it
  useEffect(() => {
    const newExpandedSections = {};
    currentNavItems.forEach(section => {
      if (section.section) {
        const hasActiveItem = section.items?.some(item => location.pathname === item.path);
        if (hasActiveItem) {
          newExpandedSections[section.section] = true;
        }
      }
    });
    setExpandedSections(newExpandedSections);
  }, [location.pathname, currentNavItems]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderLogo = () => (
    <div className="flex items-center">
      <div className={`w-9 h-9 flex items-center justify-center transition-all duration-300`}>
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${darkMode ? NAV_CONFIG.logo.darkIconGradient : NAV_CONFIG.logo.iconGradient} flex items-center justify-center shadow-lg`}>
          <span className="text-white font-bold text-sm">{NAV_CONFIG.logo.collapsed}</span>
        </div>
      </div>
      {(isOpen || mobileOpen) && (
        <h1 className={`ml-3 text-xl font-bold text-gray-800 dark:text-gray-200 bg-gradient-to-r ${
          darkMode ? NAV_CONFIG.logo.darkTextGradient : NAV_CONFIG.logo.textGradient
        } bg-clip-text text-transparent transition-all duration-300`}>
          {NAV_CONFIG.logo.expanded}
          {isAdmin && (
            <span className={`${NAV_CONFIG.styles.adminBadge} ml-2 animate-pulse`}>ADMIN</span>
          )}
        </h1>
      )}
    </div>
  );

  const renderBadge = (item) => {
    if (item.badge) {
      return (
        <span className={`${NAV_CONFIG.styles.badge} ${
          item.badge === 'New' ? NAV_CONFIG.styles.newFeatureBadge :
          item.badge === 'Admin' ? NAV_CONFIG.styles.adminBadge :
          item.badge === 'Edit' ? NAV_CONFIG.styles.warningBadge :
          item.badge === 'Eco' ? NAV_CONFIG.styles.ecoBadge :
          item.badge === 'Secure' ? NAV_CONFIG.styles.successBadge :
          item.badge === 'Beta' ? NAV_CONFIG.styles.newFeatureBadge :
          item.badge === 'Config' ? NAV_CONFIG.styles.warningBadge :
          item.badge === 'Home' ? NAV_CONFIG.styles.successBadge :
          item.badge === 'Personal' ? NAV_CONFIG.styles.badge : ''
        }`}>
          {item.badge}
        </span>
      );
    }
    if (item.count) {
      return (
        <span className={`${NAV_CONFIG.styles.countBadge}`}>
          {item.count}
        </span>
      );
    }
    if (item.new) {
      return (
        <span className={`${NAV_CONFIG.styles.newFeatureBadge}`}>
          New
        </span>
      );
    }
    return null;
  };

  const renderProgressIndicator = (progress) => {
    if (!progress) return null;
    
    return (
      <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ml-2">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500" 
          style={{ width: `${progress}%` }}
        />
      </div>
    );
  };

  const renderTrendIndicator = (trend) => {
    if (trend === 'up') {
      return (
        <TrendingUp size={14} className="text-green-500 dark:text-green-400 ml-1" />
      );
    }
    if (trend === 'down') {
      return (
        <TrendingUp size={14} className="text-red-500 dark:text-red-400 ml-1 rotate-180" />
      );
    }
    return null;
  };

  const renderNavItem = (item, index) => {
    const isActive = location.pathname === item.path;
    
    return (
      <li key={item.path || index}>
        <Link 
          to={item.path}
          className={`group flex items-center p-3 rounded-lg transition-all duration-200
            ${isActive ? NAV_CONFIG.styles.activeItem : NAV_CONFIG.styles.inactiveItem}
            ${(!isOpen && !mobileOpen) ? 'justify-center' : ''}
            ${windowWidth < 768 ? 'justify-start' : ''}
            my-1 hover:shadow-sm relative hover:scale-105 hover:translate-x-1`}
          onClick={() => windowWidth < 768 && toggleSidebar()}
        >
          <span className={`relative ${isActive ? NAV_CONFIG.styles.iconActive : NAV_CONFIG.styles.iconInactive} 
            transition-colors duration-200 group-hover:text-blue-500 dark:group-hover:text-blue-400`}>
            {item.icon}
            {item.pulse && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
            )}
            {item.alert && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </span>
          {(isOpen || mobileOpen) && (
            <div className="flex items-center justify-between w-full ml-3 overflow-hidden">
              <span className="font-medium text-sm truncate">{item.text}</span>
              <div className="flex items-center ml-2 space-x-1">
                {renderTrendIndicator(item.trend)}
                {renderBadge(item)}
                {renderProgressIndicator(item.progress)}
              </div>
            </div>
          )}
          {!isOpen && !mobileOpen && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 whitespace-nowrap flex items-center space-x-1">
              {item.text}
              {renderBadge(item)}
            </div>
          )}
        </Link>
      </li>
    );
  };

  const renderSection = (section, index) => {
    const isExpanded = expandedSections[section.section] !== false;
    
    return (
      <div key={section.section || index} className="mt-6">
        {(isOpen || mobileOpen) ? (
          <div 
            className={`${NAV_CONFIG.styles.sectionHeader} flex items-center justify-between cursor-pointer px-3 py-2 rounded-lg hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors group`}
            onClick={() => toggleSection(section.section)}
          >
            <div className="flex items-center">
              <span className="bg-gray-100 dark:bg-gray-700 p-1 rounded mr-2 group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors">
                {section.icon || <FiHash className="text-gray-500 dark:text-gray-400 text-xs" />}
              </span>
              <span className="font-semibold">{section.section}</span>
            </div>
            <FiChevronDown 
              className={`text-gray-400 dark:text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              size={16}
            />
          </div>
        ) : (
          <div className="relative">
            <button 
              className="w-full flex justify-center p-3 group hover:bg-gray-50/50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
              onClick={() => toggleSection(section.section)}
            >
              <div className="relative">
                {section.icon || <FiHash className="text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400" />}
                {!isExpanded && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                )}
              </div>
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 whitespace-nowrap">
                {section.section}
              </div>
            </button>
          </div>
        )}
        
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96' : 'max-h-0'}`}>
          <ul className="space-y-1">
            {section.items?.map(renderNavItem)}
          </ul>
        </div>
      </div>
    );
  };

  const renderUserProfile = () => (
    <div className="px-3 py-4 border-t border-gray-100/50 dark:border-gray-700/50" ref={userMenuRef}>
      <div 
        className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-700/50 group ${
          (!isOpen && !mobileOpen) ? 'justify-center' : ''
        }`}
        onClick={() => setUserMenuOpen(!userMenuOpen)}
      >
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 flex items-center justify-center shadow-md overflow-hidden transition-all duration-300 group-hover:shadow-lg">
            {user?.photoURL ? (
              <img className="w-full h-full object-cover" src={user.photoURL} alt="Profile" />
            ) : (
              <span className="text-blue-600 dark:text-blue-400 font-semibold">
                {user?.displayName?.charAt(0) || 'U'}
              </span>
            )}
          </div>
          <span className={`absolute -top-1 -right-1 w-3 h-3 ${
            darkMode ? NAV_CONFIG.user.darkStatusColor : NAV_CONFIG.user.statusColor
          } rounded-full border-2 border-white dark:border-gray-800 animate-pulse`}></span>
        </div>
        {(isOpen || mobileOpen) && (
          <div className="ml-3 flex-1">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
              {user?.displayName || 'User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
              {isAdmin ? 'Admin User' : NAV_CONFIG.user.status}
              {isAdmin && (
                <span className="ml-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  PRO
                </span>
              )}
            </p>
          </div>
        )}
        {(isOpen || mobileOpen) && (
          <FiChevronDown 
            className={`text-gray-400 dark:text-gray-500 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
            size={16}
          />
        )}
      </div>
      
      {(userMenuOpen && (isOpen || mobileOpen)) && (
        <div className="mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-slide-down">
          <div className="p-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/50 dark:to-indigo-900/50 border-b border-gray-100/50 dark:border-gray-700/50">
            <p className="font-medium text-gray-800 dark:text-gray-200">{user?.displayName || 'User'}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email || 'Premium member'}</p>
            {isAdmin && (
              <span className="inline-block mt-1 text-xs font-medium bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                Administrator
              </span>
            )}
          </div>
          <Link 
            to="/profile" 
            className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100/50 dark:border-gray-700/50"
            onClick={() => setUserMenuOpen(false)}
          >
            <FiUser className="mr-3 text-gray-500 dark:text-gray-400" /> Profile
          </Link>
    
          {isAdmin && (
            <Link 
              to="/admin" 
              className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100/50 dark:border-gray-700/50"
              onClick={() => setUserMenuOpen(false)}
            >
              <MdAdminPanelSettings className="mr-3 text-gray-500 dark:text-gray-400" /> Admin Panel
            </Link>
          )}
          <button
            onClick={toggleDarkMode}
            className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100/50 dark:border-gray-700/50"
          >
            {darkMode ? (
              <FiSun className="mr-3 text-gray-500 dark:text-gray-400" />
            ) : (
              <FiMoon className="mr-3 text-gray-500 dark:text-gray-400" />
            )}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
            <span className="ml-auto bg-gray-200 dark:bg-gray-700 w-10 h-5 rounded-full relative">
              <span className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-300 ${
                darkMode ? 'left-0.5 bg-blue-500' : 'right-0.5 bg-gray-400'
              }`}></span>
            </span>
          </button>
          <button
            className="flex items-center w-full px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/20 transition-colors"
            onClick={() => signOutUser()}
          >
            <FiLogOut className="mr-3" /> Sign Out
          </button>
        </div>
      )}
    </div>
  );

  return (
    <aside 
      className={`
        fixed h-screen bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-2xl transition-all duration-300 ease-in-out
        ${mobileOpen ? 'left-0 w-72' : '-left-72'} 
        md:left-0 ${isOpen ? 'md:w-72' : 'md:w-20'}
        z-40 border-r border-gray-200/50 dark:border-gray-700/50 flex flex-col
        transform-gpu
      `}
    >
      <div className="px-4 py-4 flex items-center justify-between border-b border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        {renderLogo()}
        <button 
          className={`hidden md:flex items-center justify-center p-2 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-all hover:scale-110 ${!isOpen && 'mx-auto'}`}
          onClick={toggleSidebar}
        >
          <FiChevronRight 
            size={20} 
            className={`text-gray-500 dark:text-gray-400 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        <ul className="space-y-1">
          {currentNavItems.filter(item => !item.section).map(renderNavItem)}
        </ul>
        {currentNavItems.filter(item => item.section).map(renderSection)}
      </div>

      {renderUserProfile()}
    </aside>
  );
};

export default Sidebar;