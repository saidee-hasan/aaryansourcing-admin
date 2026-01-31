import React, { useState, useEffect } from 'react';
import { 
  FiUsers, FiClock, FiTarget, FiActivity, 
  FiTrendingUp, FiCheckCircle, FiPlay, FiPause,
  FiChevronRight, FiPhone, FiMessageSquare, FiMapPin,
  FiCalendar, FiGlobe, FiDollarSign, FiBarChart2,
  FiRefreshCw, FiFilter, FiSearch,
  FiUser, FiChevronDown, FiChevronUp, FiUserCheck,
  FiAward, FiAlertCircle, FiSliders,
  FiPlus
} from 'react-icons/fi';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, 
  Pie, Cell, RadialBarChart, RadialBar, PolarAngleAxis,
  LineChart, Line
} from 'recharts';
import { motion } from 'framer-motion';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import useAuth from '../../hooks/useAuth';

const AdminDashboard = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const [clientData, setClientData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch all client data and user data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, usersRes] = await Promise.all([
          axiosSecure.get('/client-data'),
          axiosSecure.get('/users')
        ]);
        setClientData(clientsRes.data);
        setUserData(usersRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [axiosSecure]);

  // Process and filter data
  const processData = (data) => {
    const today = new Date().toLocaleDateString('en-US', { 
      month: 'short', 
      day: '2-digit', 
      year: 'numeric' 
    });
    
    // Filter data based on search and filter
    let filteredData = [...data];
    if (searchQuery) {
      filteredData = filteredData.filter(client => 
        client?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client?.phone?.includes(searchQuery) ||
        client?.whatsapp?.includes(searchQuery)
      );
    }

    if (filter !== 'all') {
      filteredData = filteredData.filter(client => client.status === filter);
    }

    const todayClients = filteredData.filter(client => client.date === today);
    const pendingClients = filteredData.filter(client => client.status === 'pending');
    const completeClients = filteredData.filter(client => client.status === 'complete');
    
    // Category analysis
    const categoryData = filteredData.reduce((acc, client) => {
      if (!acc[client.category]) {
        acc[client.category] = { count: 0, name: client.category };
      }
      acc[client.category].count += 1;
      return acc;
    }, {});
    
    const categoryCounts = Object.values(categoryData);
    const totalClients = filteredData.length;
    categoryCounts.forEach(cat => cat.percentage = Math.round((cat.count / totalClients) * 100));
    
    // Weekly performance
    const dateCounts = filteredData.reduce((acc, client) => {
      acc[client.date] = (acc[client.date] || 0) + 1;
      return acc;
    }, {});
    
    const chartData = Object.keys(dateCounts)
      .map(date => ({
        date,
        day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        count: dateCounts[date]
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-7);
    
    // Today's stats
    const todayStats = {
      count: todayClients.length,
      complete: todayClients.filter(c => c.status === 'complete').length,
      pending: todayClients.filter(c => c.status === 'pending').length,
      categories: todayClients.reduce((acc, client) => {
        acc[client.category] = (acc[client.category] || 0) + 1;
        return acc;
      }, {})
    };
    
    // Last 7 days history
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: '2-digit', 
        year: 'numeric' 
      });
    }).reverse();
    
    const dailyHistory = last7Days.map(date => {
      const dayClients = filteredData.filter(client => client.date === date);
      return {
        date,
        day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        total: dayClients.length,
        complete: dayClients.filter(c => c.status === 'complete').length,
        pending: dayClients.filter(c => c.status === 'pending').length
      };
    });
    
    // User statistics
    const userStats = {
      total: userData.length,
      moderators: userData.filter(u => u.role === 'Moderator').length,
      admins: userData.filter(u => u.role === 'Admin').length,
      regularUsers: userData.filter(u => u.role === 'User').length,
      activeToday: userData.filter(u => {
        const lastActive = new Date(u.lastActive || 0);
        return lastActive.toDateString() === new Date().toDateString();
      }).length
    };

    return {
      todayClients,
      pendingClients,
      completeClients,
      categoryCounts,
      chartData,
      todayStats,
      totalClients,
      filteredData,
      dailyHistory,
      userStats
    };
  };

  const processedData = processData(clientData);

  // Chart colors and configurations
  const COLORS = ['#6366F1', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];
  const RADIAL_COLORS = ['#8B5CF6', '#EC4899', '#F59E0B'];

  // Custom components
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700"
        >
          <p className="font-medium">{label}</p>
          <p className="text-sm">
            <span className="text-gray-500 dark:text-gray-400">Count: </span>
            <span className="font-medium">{payload[0].value}</span>
          </p>
        </motion.div>
      );
    }
    return null;
  };

  const RadialProgress = ({ value, color, label }) => (
    <div className="relative w-20 h-20">
      <RadialBarChart 
        width={80} 
        height={80} 
        innerRadius={60} 
        outerRadius={80} 
        data={[{ value }]}
        startAngle={90}
        endAngle={-270}
      >
        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
        <RadialBar
          background
          dataKey="value"
          cornerRadius={10}
          fill={color}
          animationDuration={1500}
        />
      </RadialBarChart>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="text-lg font-bold" style={{ color }}>{value}%</span>
        <span className="text-xs text-gray-500">{label}</span>
      </div>
    </div>
  );



  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      {/* Header with animated greeting */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex items-center space-x-2">
            <span>
              Good{" "}
              {(() => {
                const bangladeshHour = (new Date().getUTCHours() + 6) % 24;

                if (bangladeshHour >= 4 && bangladeshHour < 6) {
                  return "Early Morning ";
                } else if (bangladeshHour >= 6 && bangladeshHour < 12) {
                  return "Morning ";
                } else if (bangladeshHour >= 12 && bangladeshHour < 15) {
                  return "Noon ";
                } else if (bangladeshHour >= 15 && bangladeshHour < 17) {
                  return "Late Afternoon ";
                } else if (bangladeshHour >= 17 && bangladeshHour < 19) {
                  return "Evening ";
                } else if (bangladeshHour >= 19 && bangladeshHour < 22) {
                  return "Night 🌙";
                } else {
                  return "Late Night ";
                }
              })()}
              ,
            </span>
            <span className="text-indigo-600 dark:text-indigo-400 flex items-center space-x-1">
              <span className="font-semibold">
                {user?.displayName?.split(" ")[0] || "Admin"}
              </span>
            </span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Admin Dashboard Overview</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm flex items-center">
            <FiCalendar className="mr-2 text-indigo-500" />
            <span>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'clients'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Clients
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'users'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'analytics'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Analytics
          </button>
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Overview with animated cards */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          >
            {/* Total Clients */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-900/40 rounded-xl shadow-sm p-4 relative overflow-hidden"
            >
              <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-indigo-200 dark:bg-indigo-800/30 opacity-20"></div>
              <div className="flex justify-between relative z-10">
                <div>
                  <p className="text-sm text-indigo-700 dark:text-indigo-300">Total Clients</p>
                  <h3 className="text-2xl font-bold text-indigo-900 dark:text-white mt-1">
                    {processedData.totalClients}
                  </h3>
                  <div className="flex items-center mt-2 text-sm">
                    {processedData.todayStats.count > 0 ? (
                      <>
                        <FiTrendingUp className="text-green-500 mr-1" />
                        <span className="text-green-600 dark:text-green-400">
                          {processedData.todayStats.count} today
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-500">No clients today</span>
                    )}
                  </div>
                </div>
                <div className="bg-white/50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 p-3 rounded-lg self-center">
                  <FiUsers size={20} />
                </div>
              </div>
            </motion.div>

            {/* Completion Rate */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/40 rounded-xl shadow-sm p-4 relative overflow-hidden"
            >
              <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-purple-200 dark:bg-purple-800/30 opacity-20"></div>
              <div className="flex justify-between relative z-10">
                <div>
                  <p className="text-sm text-purple-700 dark:text-purple-300">Completion Rate</p>
                  <h3 className="text-2xl font-bold text-purple-900 dark:text-white mt-1">
                    {processedData.completeClients.length}
                  </h3>
                  <div className="mt-2">
                    <div className="w-full bg-white/50 dark:bg-purple-900/30 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full" 
                        style={{ 
                          width: `${Math.min(
                            (processedData.completeClients.length / processedData.totalClients) * 100, 
                            100
                          )}%` 
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-purple-600 dark:text-purple-300 mt-1">
                      {Math.round((processedData.completeClients.length / processedData.totalClients) * 100)}% success rate
                    </p>
                  </div>
                </div>
                <div className="bg-white/50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 p-3 rounded-lg self-center">
                  <FiCheckCircle size={20} />
                </div>
              </div>
            </motion.div>

            {/* Total Users */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/40 rounded-xl shadow-sm p-4 relative overflow-hidden"
            >
              <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-green-200 dark:bg-green-800/30 opacity-20"></div>
              <div className="flex justify-between relative z-10">
                <div>
                  <p className="text-sm text-green-700 dark:text-green-300">Total Users</p>
                  <h3 className="text-2xl font-bold text-green-900 dark:text-white mt-1">
                    {processedData.userStats.total}
                  </h3>
                  <div className="flex items-center mt-2 text-sm">
                    <span className="text-green-600 dark:text-green-400">
                      {processedData.userStats.activeToday} active today
                    </span>
                  </div>
                </div>
                <div className="bg-white/50 dark:bg-green-900/30 text-green-600 dark:text-green-300 p-3 rounded-lg self-center">
                  <FiUserCheck size={20} />
                </div>
              </div>
            </motion.div>

            {/* Pending Actions */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/40 rounded-xl shadow-sm p-4 relative overflow-hidden"
            >
              <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-amber-200 dark:bg-amber-800/30 opacity-20"></div>
              <div className="flex justify-between relative z-10">
                <div>
                  <p className="text-sm text-amber-700 dark:text-amber-300">Pending Actions</p>
                  <h3 className="text-2xl font-bold text-amber-900 dark:text-white mt-1">
                    {processedData.pendingClients.length}
                  </h3>
                  <div className="flex items-center mt-2 text-sm">
                    {processedData.pendingClients.length > 0 ? (
                      <span className="text-amber-600 dark:text-amber-400">Requires follow up</span>
                    ) : (
                      <span className="text-green-600 dark:text-green-400">All clear!</span>
                    )}
                  </div>
                </div>
                <div className="bg-white/50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 p-3 rounded-lg self-center">
                  <FiActivity size={20} />
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Performance Visualization */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Weekly Performance</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Client acquisition over the last 7 days
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800 transition flex items-center">
                    <FiRefreshCw size={14} className="mr-1" />
                    Refresh
                  </button>
                  <select 
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="all">All Clients</option>
                    <option value="complete">complete</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={processedData.chartData}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" strokeOpacity={0.5} />
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6B7280' }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6B7280' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#6366F1" 
                      fill="url(#colorCount)" 
                      fillOpacity={0.2}
                      strokeWidth={2}
                      activeDot={{ r: 6, stroke: '#6366F1', strokeWidth: 2, fill: '#FFFFFF' }}
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              {/* Mini stats */}
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Weekly High</p>
                  {/* <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    {Math.max(...processedData.chartData.map(d => d.count), 0}
                  </p> */}
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Weekly Avg</p>
                  <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    {Math.round(processedData.chartData.reduce((a, b) => a + b.count, 0) / processedData.chartData.length) || 0}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Week</p>
                  <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    {processedData.chartData.reduce((a, b) => a + b.count, 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Today's Analytics */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Today's Analytics</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 px-2 py-1 rounded-full">
                  Live
                </span>
              </div>
              
              {/* Radial progress charts */}
              <div className="flex justify-around mb-6">
                <RadialProgress 
                  value={processedData.todayStats.count > 0 ? 
                    Math.round((processedData.todayStats.complete / processedData.todayStats.count) * 100) : 0} 
                  color="#6366F1" 
                  label="complete" 
                />
                <RadialProgress 
                  value={processedData.todayStats.count > 0 ? 
                    Math.round((processedData.todayStats.pending / processedData.todayStats.count) * 100) : 0} 
                  color="#EC4899" 
                  label="Pending" 
                />
              </div>
              
              {/* Category distribution */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">By Category</h3>
                <div className="h-40">
                  {processedData.todayStats.count > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={Object.entries(processedData.todayStats.categories).map(([name, value]) => ({
                            name,
                            value
                          }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => 
                            `${name.split('-')[0]}: ${(percent * 100).toFixed(0)}%`
                          }
                          animationDuration={1500}
                        >
                          {Object.entries(processedData.todayStats.categories).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          content={<CustomTooltip />}
                          formatter={(value) => [`${value} clients`, 'Count']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                      No client data for today
                    </div>
                  )}
                </div>
              </div>
              
              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Today</p>
                  <p className="text-lg font-bold text-gray-800 dark:text-white">
                    {processedData.todayStats.count}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Estimated Revenue</p>
                  <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    ${processedData.todayStats.count * 150}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* User Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Moderators */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Moderators</p>
                  <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                    {processedData.userStats.moderators}
                  </h3>
                </div>
                <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 p-3 rounded-lg">
                  <FiAward size={20} />
                </div>
              </div>
            </div>

            {/* Admins */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Admins</p>
                  <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                    {processedData.userStats.admins}
                  </h3>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 p-3 rounded-lg">
                  <FiUserCheck size={20} />
                </div>
              </div>
            </div>

            {/* Regular Users */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Regular Users</p>
                  <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                    {processedData.userStats.regularUsers}
                  </h3>
                </div>
                <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300 p-3 rounded-lg">
                  <FiUser size={20} />
                </div>
              </div>
            </div>

            {/* Active Today */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active Today</p>
                  <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                    {processedData.userStats.activeToday}
                  </h3>
                </div>
                <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 p-3 rounded-lg">
                  <FiActivity size={20} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Clients Tab */}
      {activeTab === 'clients' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Client Management</h2>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-48">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search clients..."
                  className="pl-10 pr-4 py-2 w-full bg-gray-100 dark:bg-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select 
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="complete">complete</option>
                <option value="pending">Pending</option>
              </select>
              <button className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm flex items-center transition">
                <FiPlus size={14} className="mr-1" />
                Add Client
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Client</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contact</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Source</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {processedData.filteredData.map((client) => (
                  <motion.tr 
                    key={client._id} 
                    whileHover={{ scale: 1.01 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                          {client.name.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{client.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{client.region}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white flex items-center">
                        <FiPhone className="mr-1" size={14} /> {client.phone}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <FiMessageSquare className="mr-1" size={14} /> {client.whatsapp}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white capitalize">{client.category}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{client.date}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{client.time}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        client.status === 'pending' ? 
                        'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mr-3">
                        Edit
                      </button>
                      <button className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
                        Delete
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
              <span className="font-medium">{processedData.filteredData.length}</span> results
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm">
                Previous
              </button>
              <button className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm">
                1
              </button>
              <button className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm">
                2
              </button>
              <button className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm">
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">User Management</h2>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-48">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="pl-10 pr-4 py-2 w-full bg-gray-100 dark:bg-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm flex items-center transition">
                <FiPlus size={14} className="mr-1" />
                Add User
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Clients</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {userData.map((user) => (
                  <motion.tr 
                    key={user._id} 
                    whileHover={{ scale: 1.01 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                          {user.photoURL ? (
                            <img className="h-10 w-10 rounded-full" src={user.photoURL} alt="" />
                          ) : (
                            <span className="text-indigo-600 dark:text-indigo-400">
                              {user.displayName?.charAt(0) || 'U'}
                            </span>
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{user.displayName}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{user.provider}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{user.email}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'Admin' ? 
                        'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                        user.role === 'Moderator' ?
                        'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === 'Active' ? 
                        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {user.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mr-2">
                          <div 
                            className="bg-indigo-600 h-2.5 rounded-full" 
                            style={{ 
                              width: `${Math.min(
                                (user.completeCount / (user.completeCount + user.pendingCount + user.rejectedCount)) * 100, 
                                100
                              )}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          {user.completeCount || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mr-3">
                        Edit
                      </button>
                      <button className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
                        Delete
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
              <span className="font-medium">{userData.length}</span> results
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm">
                Previous
              </button>
              <button className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm">
                1
              </button>
              <button className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm">
                2
              </button>
              <button className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm">
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* User Analytics */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">User Analytics</h2>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800 transition flex items-center">
                  <FiRefreshCw size={14} className="mr-1" />
                  Refresh
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">User Roles Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Admins', value: processedData.userStats.admins },
                          { name: 'Moderators', value: processedData.userStats.moderators },
                          { name: 'Users', value: processedData.userStats.regularUsers }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => 
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        animationDuration={1500}
                      >
                        <Cell fill="#6366F1" />
                        <Cell fill="#8B5CF6" />
                        <Cell fill="#EC4899" />
                      </Pie>
                      <Tooltip 
                        content={<CustomTooltip />}
                        formatter={(value) => [`${value} users`, 'Count']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">User Activity</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Admins', active: 12, total: processedData.userStats.admins },
                        { name: 'Moderators', active: 8, total: processedData.userStats.moderators },
                        { name: 'Users', active: processedData.userStats.activeToday - 12 - 8, total: processedData.userStats.regularUsers }
                      ]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" strokeOpacity={0.5} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="active" fill="#10B981" name="Active Today" />
                      <Bar dataKey="total" fill="#3B82F6" name="Total Users" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
          
          {/* Client Analytics */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Client Analytics</h2>
              <div className="flex space-x-2">
                <select 
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All Clients</option>
                  <option value="complete">complete</option>
                  <option value="pending">Pending</option>
                </select>
                <button className="px-3 py-1 text-sm bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800 transition flex items-center">
                  <FiRefreshCw size={14} className="mr-1" />
                  Refresh
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Client Status</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'complete', value: processedData.completeClients.length },
                          { name: 'Pending', value: processedData.pendingClients.length }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => 
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        animationDuration={1500}
                      >
                        <Cell fill="#10B981" />
                        <Cell fill="#F59E0B" />
                      </Pie>
                      <Tooltip 
                        content={<CustomTooltip />}
                        formatter={(value) => [`${value} clients`, 'Count']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Client Sources</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={processedData.categoryCounts}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" strokeOpacity={0.5} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" fill="#6366F1" name="Clients" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
          
          {/* Performance Over Time */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Performance Over Time</h2>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800 transition flex items-center">
                  Last 30 Days
                  <FiChevronDown className="ml-1" size={14} />
                </button>
              </div>
            </div>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={processedData.dailyHistory}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" strokeOpacity={0.5} />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="complete" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="complete"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pending" 
                    stroke="#F59E0B" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Pending"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;