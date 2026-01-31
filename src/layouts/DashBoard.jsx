import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import useDarkMode from '../hooks/useDarkMode';
import TopBar from './ TopBar';
import Sidebar from './Sidebar';
import useAuth from '../hooks/useAuth';
import DashboardHome from '../pages/Admin/DashboardHome';

export default function Dashboard() {



  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const { darkMode, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth < 768) {
        setIsOpen(false);
      } else {
        setMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    if (window.innerWidth < 768) setIsOpen(false);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleMobileSidebar = () => setMobileOpen(!mobileOpen);

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-white text-black">
        <TopBar
          isOpen={isOpen}
          mobileOpen={mobileOpen}
          toggleMobileSidebar={toggleMobileSidebar}
          windowWidth={windowWidth}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />
        
        <Sidebar
          isOpen={isOpen}
          mobileOpen={mobileOpen}
          toggleSidebar={toggleSidebar}
          toggleMobileSidebar={toggleMobileSidebar}
          windowWidth={windowWidth}
          location={location}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />

        {mobileOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden transition-opacity"
            onClick={toggleMobileSidebar}
          />
        )}

        <main className={`pt-16 transition-all duration-300 ${isOpen ? 'md:pl-72' : 'md:pl-20'}`}>
          <div className="p-4 md:p-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm md:p-6 border border-gray-100 dark:border-gray-700 min-h-[calc(100vh-6rem)]">
            
              <Outlet/>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}