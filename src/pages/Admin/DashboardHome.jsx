import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  FaShoppingCart, 
  FaUsers, 
  FaDollarSign, 
  FaChartLine, 
  FaBox, 
  FaEye,
  FaArrowUp,
  FaArrowDown,
  FaSpinner,
  FaFilter,
  FaDownload,

  FaCalendar,
  FaSearch,
  FaCog,
  FaShoppingBag,
  FaStar,
  FaRegChartBar,
  FaMobile,
  FaDesktop,
  FaTablet,
  FaCheckCircle,
  FaClock,
  FaShippingFast,
  FaExclamationCircle,
  FaMapMarkerAlt,
  FaGlobeAmericas,
  FaShoppingBasket,
  FaTags,
  FaUserPlus,
  FaRetweet
} from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale,
  TimeScale,
} from 'chart.js';
import { Line, Bar, Doughnut, Pie, Radar, PolarArea, Scatter, Bubble } from 'react-chartjs-2';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale,
  TimeScale
);

const DashboardHome = () => {
  const axiosSecure = useAxiosSecure();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalRevenue: 0,
    totalOrders: 0,
    monthlyGrowth: 0,
    activeUsers: 0,
    conversionRate: 0,
    averageOrderValue: 0,
    customerSatisfaction: 0,
    inventoryValue: 0
  });
  const [recentProducts, setRecentProducts] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('monthly');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: new Date()
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [chartType, setChartType] = useState('line');

  // Enhanced statistics with real-time data
  const [realTimeStats, setRealTimeStats] = useState({
    visitors: 0,
    liveUsers: 0,
    salesToday: 0,
    revenueToday: 0,
    cartAbandonment: 0,
    bounceRate: 0
  });

  // Advanced analytics state
  const [analytics, setAnalytics] = useState({
    topProducts: [],
    userDemographics: {},
    salesForecast: [],
    performanceMetrics: {},
    geographicData: {},
    customerLifetimeValue: {}
  });

  // Fetch dashboard data with enhanced analytics
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel for better performance
        const [productsRes, usersRes, categoriesRes, brandsRes] = await Promise.all([
          axiosSecure.get('/products?limit=1000'),
          axiosSecure.get('/users'),
          axiosSecure.get('/categories'),
          axiosSecure.get('/brands')
        ]);

        const products = productsRes.data.data?.products || productsRes.data.data || [];
        const users = usersRes.data.data || usersRes.data || [];
        const categories = categoriesRes.data.data || [];
        const brands = brandsRes.data.data || [];

        // Calculate advanced statistics
        const totalProducts = products.length;
        const totalUsers = users.length;
        const totalRevenue = products.reduce((sum, product) => sum + (product.price || 0) * (product.quantity || 1), 0);
        const totalOrders = Math.floor(totalProducts * 0.8);
        const monthlyGrowth = 15.5;
        const activeUsers = users.filter(user => user.isActive || user.status === 'active').length;
        const conversionRate = 3.2;
        const averageOrderValue = totalRevenue / (totalOrders || 1);
        const customerSatisfaction = 4.5;
        const inventoryValue = products.reduce((sum, product) => sum + (product.price || 0) * (product.quantity || 100), 0);

        setStats({
          totalProducts,
          totalUsers,
          totalRevenue,
          totalOrders,
          monthlyGrowth,
          activeUsers,
          conversionRate,
          averageOrderValue,
          customerSatisfaction,
          inventoryValue
        });

        // Get recent products with enhanced data
        const recent = products
          .sort((a, b) => new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt))
          .slice(0, 6)
          .map(product => ({
            ...product,
            views: Math.floor(Math.random() * 1000),
            conversion: (Math.random() * 10).toFixed(1),
            rating: (Math.random() * 2 + 3).toFixed(1)
          }));

        setRecentProducts(recent);

        // Get recent users
        const recentUsersData = users
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        setRecentUsers(recentUsersData);

        // Generate enhanced mock orders with better data
        const mockOrders = [
          {
            id: 'ORD1001',
            product: 'Premium Wireless Headphones',
            customer: 'John Smith',
            amount: 149.99,
            status: 'completed',
            date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            items: 1,
            payment: 'credit_card'
          },
          {
            id: 'ORD1002',
            product: 'Smart Fitness Watch',
            customer: 'Sarah Johnson',
            amount: 199.99,
            status: 'processing',
            date: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
            items: 2,
            payment: 'paypal'
          },
          {
            id: 'ORD1003',
            product: 'Gaming Keyboard RGB',
            customer: 'Mike Davis',
            amount: 89.99,
            status: 'shipped',
            date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            items: 1,
            payment: 'credit_card'
          },
          {
            id: 'ORD1004',
            product: 'Bluetooth Speaker',
            customer: 'Emily Wilson',
            amount: 59.99,
            status: 'pending',
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            items: 3,
            payment: 'bank_transfer'
          },
          {
            id: 'ORD1005',
            product: 'USB-C Charging Cable',
            customer: 'Alex Thompson',
            amount: 19.99,
            status: 'completed',
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            items: 5,
            payment: 'credit_card'
          }
        ];
        setRecentOrders(mockOrders);

        // Generate enhanced chart data
        generateAdvancedChartData(products, users, categories, timeRange);

        // Generate advanced analytics
        generateAdvancedAnalytics(products, users);

        // Simulate real-time data
        simulateRealTimeData();

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [axiosSecure, timeRange, refreshKey]);

  // Simulate real-time data updates
  const simulateRealTimeData = () => {
    const interval = setInterval(() => {
      setRealTimeStats(prev => ({
        visitors: prev.visitors + Math.floor(Math.random() * 5),
        liveUsers: Math.floor(Math.random() * 50) + 10,
        salesToday: prev.salesToday + Math.floor(Math.random() * 3),
        revenueToday: prev.revenueToday + (Math.random() * 100),
        cartAbandonment: Math.floor(Math.random() * 10) + 15,
        bounceRate: (Math.random() * 10 + 30).toFixed(1)
      }));
    }, 5000);

    return () => clearInterval(interval);
  };

  // Generate advanced analytics
  const generateAdvancedAnalytics = (products, users) => {
    // Top performing products
    const topProducts = products
      .slice(0, 5)
      .map(product => ({
        name: product.title,
        sales: Math.floor(Math.random() * 1000) + 100,
        revenue: (product.price || 0) * (Math.random() * 100 + 50),
        growth: (Math.random() * 20 - 5).toFixed(1)
      }));

    // User demographics
    const userDemographics = {
      ageGroups: {
        '18-24': Math.floor(Math.random() * 30) + 20,
        '25-34': Math.floor(Math.random() * 40) + 30,
        '35-44': Math.floor(Math.random() * 25) + 15,
        '45-54': Math.floor(Math.random() * 20) + 10,
        '55+': Math.floor(Math.random() * 15) + 5
      },
      devices: {
        mobile: 45,
        desktop: 35,
        tablet: 20
      }
    };

    // Sales forecast
    const salesForecast = Array.from({ length: 6 }, (_, i) => ({
      month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i],
      predicted: Math.floor(Math.random() * 50000) + 50000,
      actual: Math.floor(Math.random() * 45000) + 45000
    }));

    // Geographic data
    const geographicData = {
      labels: ['North America', 'Europe', 'Asia', 'South America', 'Africa', 'Australia'],
      data: [45, 25, 15, 8, 5, 2]
    };

    // Customer lifetime value
    const customerLifetimeValue = {
      labels: ['New', 'Regular', 'VIP', 'Premium'],
      data: [50, 120, 300, 500]
    };

    setAnalytics({
      topProducts,
      userDemographics,
      salesForecast,
      geographicData,
      customerLifetimeValue,
      performanceMetrics: {
        pageLoadTime: '1.2s',
        serverResponse: '0.8s',
        uptime: '99.9%',
        errorRate: '0.02%'
      }
    });
  };

  // Generate advanced chart data with multiple datasets
  const generateAdvancedChartData = (products, users, categories, range) => {
    const now = new Date();
    let labels = [];
    let revenueData = [];
    let productData = [];
    let userGrowthData = [];
    let conversionData = [];
    let profitData = [];
    let customerData = [];
    let seasonalData = [];
    let forecastData = [];

    switch (range) {
      case 'weekly':
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        revenueData = [3200, 4500, 3800, 5200, 4800, 6100, 5500];
        productData = [45, 62, 58, 78, 65, 92, 85];
        userGrowthData = [12, 18, 15, 22, 19, 28, 25];
        conversionData = [2.8, 3.2, 2.9, 3.5, 3.1, 3.8, 3.6];
        profitData = [2800, 3900, 3200, 4500, 4100, 5200, 4800];
        customerData = [120, 150, 140, 180, 160, 220, 200];
        seasonalData = [65, 72, 68, 75, 70, 82, 78];
        forecastData = [68, 74, 70, 77, 72, 85, 80];
        break;
      case 'monthly':
        labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        revenueData = [12500, 15800, 14200, 18900];
        productData = [156, 198, 175, 234];
        userGrowthData = [85, 112, 98, 145];
        conversionData = [3.1, 3.4, 3.2, 3.7];
        profitData = [11000, 13800, 12500, 16500];
        customerData = [450, 520, 480, 610];
        seasonalData = [320, 380, 350, 420];
        forecastData = [340, 390, 360, 430];
        break;
      case 'yearly':
        labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        revenueData = [45000, 52000, 48000, 61000, 68000, 75000, 82000, 89000, 95000, 102000, 115000, 128000];
        productData = [345, 412, 388, 512, 578, 645, 712, 789, 845, 912, 1045, 1189];
        userGrowthData = [245, 312, 278, 389, 445, 512, 578, 645, 712, 789, 867, 945];
        conversionData = [2.9, 3.1, 3.0, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 4.0, 4.2];
        profitData = [38000, 44000, 41000, 52000, 58000, 64000, 70000, 76000, 81000, 87000, 98000, 109000];
        customerData = [1200, 1450, 1350, 1650, 1850, 2050, 2250, 2450, 2650, 2850, 3150, 3450];
        seasonalData = [2800, 3200, 3000, 3500, 3800, 4200, 4500, 4800, 5100, 5400, 5800, 6200];
        forecastData = [3000, 3400, 3200, 3700, 4000, 4400, 4700, 5000, 5300, 5600, 6000, 6400];
        break;
      default:
        labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        revenueData = [12500, 15800, 14200, 18900];
        productData = [156, 198, 175, 234];
        userGrowthData = [85, 112, 98, 145];
        conversionData = [3.1, 3.4, 3.2, 3.7];
        profitData = [11000, 13800, 12500, 16500];
        customerData = [450, 520, 480, 610];
        seasonalData = [320, 380, 350, 420];
        forecastData = [340, 390, 360, 430];
    }

    // Category distribution based on actual products
    const categoryDistribution = categories.map(category => {
      const categoryProducts = products.filter(p => p.category === category._id || p.category === category.value);
      return categoryProducts.length;
    });

    // Price distribution scatter data
    const priceDistribution = products.slice(0, 50).map(product => ({
      x: product.price || Math.random() * 500,
      y: Math.random() * 1000,
      r: (product.quantity || 1) * 2
    }));

    setChartData({
      // Multi-axis line chart
      sales: {
        labels,
        datasets: [
          {
            label: 'Revenue ($)',
            data: revenueData,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true,
            yAxisID: 'y',
          },
          {
            label: 'Conversion Rate (%)',
            data: conversionData,
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: true,
            yAxisID: 'y1',
            borderDash: [5, 5],
          }
        ],
      },
      
      // Stacked bar chart
      products: {
        labels,
        datasets: [
          {
            label: 'Products Sold',
            data: productData,
            backgroundColor: 'rgba(16, 185, 129, 0.8)',
            borderColor: 'rgb(16, 185, 129)',
            borderWidth: 2,
            borderRadius: 4,
          },
          {
            label: 'New Users',
            data: userGrowthData,
            backgroundColor: 'rgba(139, 92, 246, 0.8)',
            borderColor: 'rgb(139, 92, 246)',
            borderWidth: 2,
            borderRadius: 4,
          }
        ],
      },

      // Seasonal trends with forecast
      seasonal: {
        labels,
        datasets: [
          {
            label: 'Actual Sales',
            data: seasonalData,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true,
          },
          {
            label: 'Forecast',
            data: forecastData,
            borderColor: 'rgb(245, 158, 11)',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            borderDash: [5, 5],
            tension: 0.4,
            fill: false,
          }
        ],
      },

      // Categories distribution
      categories: {
        labels: categories.map(cat => cat.value || cat.name).slice(0, 5),
        datasets: [
          {
            data: categoryDistribution.slice(0, 5),
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(139, 92, 246, 0.8)',
              'rgba(239, 68, 68, 0.8)',
            ],
            borderColor: [
              'rgb(59, 130, 246)',
              'rgb(16, 185, 129)',
              'rgb(245, 158, 11)',
              'rgb(139, 92, 246)',
              'rgb(239, 68, 68)',
            ],
            borderWidth: 2,
            hoverOffset: 15,
          },
        ],
      },

      // Performance metrics
      performance: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Website Traffic',
            data: [12000, 19000, 15000, 21000, 18000, 25000],
            borderColor: 'rgb(99, 102, 241)',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            fill: true,
          },
          {
            label: 'Mobile Traffic',
            data: [8000, 12000, 10000, 15000, 13000, 18000],
            borderColor: 'rgb(14, 165, 233)',
            backgroundColor: 'rgba(14, 165, 233, 0.1)',
            fill: true,
          }
        ]
      },

      // Radar chart for performance
      radar: {
        labels: ['Sales', 'Users', 'Revenue', 'Profit', 'Satisfaction', 'Growth'],
        datasets: [
          {
            label: 'Current Month',
            data: [85, 75, 90, 80, 70, 65],
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderColor: 'rgb(59, 130, 246)',
            pointBackgroundColor: 'rgb(59, 130, 246)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(59, 130, 246)'
          },
          {
            label: 'Previous Month',
            data: [70, 65, 75, 70, 60, 55],
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            borderColor: 'rgb(16, 185, 129)',
            pointBackgroundColor: 'rgb(16, 185, 129)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(16, 185, 129)'
          }
        ]
      },

      // Polar area for devices
      devices: {
        labels: ['Mobile', 'Desktop', 'Tablet'],
        datasets: [
          {
            data: [45, 35, 20],
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(245, 158, 11, 0.8)'
            ],
            borderColor: [
              'rgb(59, 130, 246)',
              'rgb(16, 185, 129)',
              'rgb(245, 158, 11)'
            ],
            borderWidth: 2
          }
        ]
      },

      // Price distribution scatter plot
      priceDistribution: {
        datasets: [
          {
            label: 'Price vs Sales',
            data: priceDistribution,
            backgroundColor: 'rgba(139, 92, 246, 0.6)',
            borderColor: 'rgb(139, 92, 246)',
            pointRadius: 5,
          }
        ]
      },

      // Geographic distribution
      geographic: {
        labels: analytics.geographicData?.labels || ['North America', 'Europe', 'Asia', 'South America', 'Africa', 'Australia'],
        datasets: [
          {
            label: 'Sales by Region',
            data: analytics.geographicData?.data || [45, 25, 15, 8, 5, 2],
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(139, 92, 246, 0.8)',
              'rgba(239, 68, 68, 0.8)',
              'rgba(99, 102, 241, 0.8)'
            ],
            borderColor: [
              'rgb(59, 130, 246)',
              'rgb(16, 185, 129)',
              'rgb(245, 158, 11)',
              'rgb(139, 92, 246)',
              'rgb(239, 68, 68)',
              'rgb(99, 102, 241)'
            ],
            borderWidth: 2
          }
        ]
      },

      // Customer lifetime value
      customerValue: {
        labels: analytics.customerLifetimeValue?.labels || ['New', 'Regular', 'VIP', 'Premium'],
        datasets: [
          {
            label: 'Customer Lifetime Value ($)',
            data: analytics.customerLifetimeValue?.data || [50, 120, 300, 500],
            backgroundColor: 'rgba(16, 185, 129, 0.8)',
            borderColor: 'rgb(16, 185, 129)',
            borderWidth: 2,
            borderRadius: 4,
          }
        ]
      },

      // Sales funnel
      salesFunnel: {
        labels: ['Visitors', 'Add to Cart', 'Checkout', 'Purchase'],
        datasets: [
          {
            label: 'Conversion Funnel',
            data: [1000, 350, 120, 85],
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(139, 92, 246, 0.8)'
            ],
            borderColor: [
              'rgb(59, 130, 246)',
              'rgb(16, 185, 129)',
              'rgb(245, 158, 11)',
              'rgb(139, 92, 246)'
            ],
            borderWidth: 2
          }
        ]
      }
    });
  };

  // Enhanced chart options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
    cutout: '60%',
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      r: {
        angleLines: {
          display: true
        },
        suggestedMin: 0,
        suggestedMax: 100
      }
    }
  };

  const polarAreaOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  const scatterOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Product Price ($)'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Units Sold'
        }
      }
    }
  };

  // Enhanced stats cards data
  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: FaBox,
      color: 'blue',
      change: '+12%',
      trend: 'up',
      description: 'Active products in catalog'
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: FaUsers,
      color: 'green',
      change: '+8%',
      trend: 'up',
      description: 'Registered users'
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: FaDollarSign,
      color: 'purple',
      change: '+15.5%',
      trend: 'up',
      description: 'Lifetime revenue'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: FaShoppingCart,
      color: 'orange',
      change: '+5%',
      trend: 'up',
      description: 'Completed orders'
    },
    {
      title: 'Conversion Rate',
      value: `${stats.conversionRate}%`,
      icon: FaChartLine,
      color: 'indigo',
      change: '+0.8%',
      trend: 'up',
      description: 'Overall conversion rate'
    },
    {
      title: 'Avg Order Value',
      value: `$${stats.averageOrderValue.toFixed(2)}`,
      icon: FaDollarSign,
      color: 'pink',
      change: '+2.3%',
      trend: 'up',
      description: 'Average order value'
    },
    {
      title: 'Customer Satisfaction',
      value: `${stats.customerSatisfaction}/5`,
      icon: FaStar,
      color: 'yellow',
      change: '+0.2',
      trend: 'up',
      description: 'Average rating'
    },
    {
      title: 'Inventory Value',
      value: `$${(stats.inventoryValue / 1000).toFixed(1)}K`,
      icon: FaShoppingBag,
      color: 'teal',
      change: '+3.1%',
      trend: 'up',
      description: 'Total inventory worth'
    }
  ];

  // Additional specialized stat cards
  const specializedStats = [
    {
      title: 'Return Rate',
      value: '2.3%',
      icon: FaRetweet,
      color: 'blue',
      change: '-0.5%',
      trend: 'down',
      description: 'Product return rate'
    },
    {
      title: 'New Customers',
      value: '156',
      icon: FaUserPlus,
      color: 'green',
      change: '+12%',
      trend: 'up',
      description: 'This month'
    },
    {
      title: 'Avg. Delivery Time',
      value: '2.8 days',
      icon: FaShippingFast,
      color: 'purple',
      change: '-0.3',
      trend: 'down',
      description: 'Shipping performance'
    },
    {
      title: 'Cart Abandonment',
      value: `${realTimeStats.cartAbandonment}%`,
      icon: FaShoppingBasket,
      color: 'red',
      change: '-2.1%',
      trend: 'down',
      description: 'Abandoned carts'
    }
  ];

  // Real-time stats cards
  const realTimeStatCards = [
    {
      title: 'Live Visitors',
      value: realTimeStats.visitors,
      icon: FaEye,
      color: 'blue',
      change: '+5',
      trend: 'up',
      description: 'Active right now'
    },
    {
      title: 'Live Users',
      value: realTimeStats.liveUsers,
      icon: FaUsers,
      color: 'green',
      change: '+2',
      trend: 'up',
      description: 'Currently browsing'
    },
    {
      title: 'Sales Today',
      value: realTimeStats.salesToday,
      icon: FaShoppingCart,
      color: 'purple',
      change: '+3',
      trend: 'up',
      description: 'Orders today'
    },
    {
      title: 'Revenue Today',
      value: `$${realTimeStats.revenueToday.toFixed(2)}`,
      icon: FaDollarSign,
      color: 'orange',
      change: '+$45',
      trend: 'up',
      description: 'Revenue today'
    },
    {
      title: 'Cart Abandonment',
      value: `${realTimeStats.cartAbandonment}%`,
      icon: FaShoppingCart,
      color: 'red',
      change: '-2%',
      trend: 'down',
      description: 'Abandoned carts'
    },
    {
      title: 'Bounce Rate',
      value: `${realTimeStats.bounceRate}%`,
      icon: FaChartLine,
      color: 'gray',
      change: '-1.2%',
      trend: 'down',
      description: 'Visitor bounce rate'
    }
  ];

  // Filter products based on search
  const filteredProducts = useMemo(() => {
    return recentProducts.filter(product =>
      product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.productCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [recentProducts, searchTerm]);

  // Refresh dashboard data
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Export data function
  const handleExport = () => {
    // In a real application, this would generate and download a CSV/Excel file
    alert('Export functionality would be implemented here');
  };

  // Get status color and icon
  const getStatusInfo = (status) => {
    switch (status) {
      case 'completed':
        return {
          color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
          icon: FaCheckCircle,
          text: 'Completed'
        };
      case 'processing':
        return {
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
          icon: FaClock,
          text: 'Processing'
        };
      case 'shipped':
        return {
          color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
          icon: FaShippingFast,
          text: 'Shipped'
        };
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
          icon: FaExclamationCircle,
          text: 'Pending'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
          icon: FaClock,
          text: 'Unknown'
        };
    }
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format time ago
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInHours = Math.floor((now - new Date(date)) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return formatDate(date);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-8xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Advanced Analytics Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 flex items-center">
                <span>Comprehensive e-commerce analytics and insights</span>
                <span className="ml-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              </p>
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <button
                onClick={handleRefresh}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                title="Refresh Data"
              >
             
              </button>
              
              <button
                onClick={handleExport}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                title="Export Data"
              >
                <FaDownload className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-2">
          <div className="flex space-x-1">
            {['overview', 'analytics', 'performance', 'reports', 'geographic'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Real-time Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          {realTimeStatCards.map((card, index) => {
            const IconComponent = card.icon;
            const colorClasses = {
              blue: 'from-blue-500 to-blue-600',
              green: 'from-green-500 to-green-600',
              purple: 'from-purple-500 to-purple-600',
              orange: 'from-orange-500 to-orange-600',
              indigo: 'from-indigo-500 to-indigo-600',
              pink: 'from-pink-500 to-pink-600',
              yellow: 'from-yellow-500 to-yellow-600',
              teal: 'from-teal-500 to-teal-600',
              red: 'from-red-500 to-red-600',
              gray: 'from-gray-500 to-gray-600'
            };

            return (
              <div
                key={index}
                className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-600 p-4 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      {card.title}
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                      {card.value}
                    </p>
                    <div className="flex items-center mt-1">
                      <div className={`flex items-center text-xs ${
                        card.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {card.trend === 'up' ? (
                          <FaArrowUp className="w-2 h-2 mr-1" />
                        ) : (
                          <FaArrowDown className="w-2 h-2 mr-1" />
                        )}
                        <span className="font-medium">{card.change}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${colorClasses[card.color]} shadow-lg`}>
                    <IconComponent className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => {
            const IconComponent = card.icon;
            const colorClasses = {
              blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
              green: 'text-green-600 bg-green-50 dark:bg-green-900/20',
              purple: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
              orange: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
              indigo: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20',
              pink: 'text-pink-600 bg-pink-50 dark:bg-pink-900/20',
              yellow: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
              teal: 'text-teal-600 bg-teal-50 dark:bg-teal-900/20'
            };

            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {card.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                      {card.value}
                    </p>
                    <div className={`flex items-center mt-2 text-sm ${
                      card.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {card.trend === 'up' ? (
                        <FaArrowUp className="w-3 h-3 mr-1" />
                      ) : (
                        <FaArrowDown className="w-3 h-3 mr-1" />
                      )}
                      <span className="font-medium">{card.change}</span>
                      <span className="text-gray-500 dark:text-gray-400 ml-2 text-xs">
                        {card.description}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl ${colorClasses[card.color]}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Specialized Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {specializedStats.map((card, index) => {
            const IconComponent = card.icon;
            const colorClasses = {
              blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
              green: 'text-green-600 bg-green-50 dark:bg-green-900/20',
              purple: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
              orange: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
              red: 'text-red-600 bg-red-50 dark:bg-red-900/20'
            };

            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {card.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                      {card.value}
                    </p>
                    <div className={`flex items-center mt-2 text-sm ${
                      card.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {card.trend === 'up' ? (
                        <FaArrowUp className="w-3 h-3 mr-1" />
                      ) : (
                        <FaArrowDown className="w-3 h-3 mr-1" />
                      )}
                      <span className="font-medium">{card.change}</span>
                      <span className="text-gray-500 dark:text-gray-400 ml-2 text-xs">
                        {card.description}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl ${colorClasses[card.color]}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Enhanced Charts Grid - Multiple Chart Types */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Revenue & Conversion Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Revenue & Conversion Trends
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Revenue growth and conversion rate performance
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <select 
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value)}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="line">Line Chart</option>
                  <option value="bar">Bar Chart</option>
                </select>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-gray-600 dark:text-gray-400">Revenue</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2 border-2 border-white dark:border-gray-800"></div>
                    <span className="text-gray-600 dark:text-gray-400">Conversion Rate</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-80">
              {chartData.sales && chartType === 'line' && (
                <Line data={chartData.sales} options={lineChartOptions} />
              )}
              {chartData.sales && chartType === 'bar' && (
                <Bar data={chartData.sales} options={barChartOptions} />
              )}
            </div>
          </div>

          {/* Seasonal Trends with Forecast */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Seasonal Trends & Forecast
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Actual sales vs forecasted trends
                </p>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-gray-600 dark:text-gray-400">Actual</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2 border-2 border-white dark:border-gray-800"></div>
                  <span className="text-gray-600 dark:text-gray-400">Forecast</span>
                </div>
              </div>
            </div>
            <div className="h-80">
              {chartData.seasonal && (
                <Line data={chartData.seasonal} options={lineChartOptions} />
              )}
            </div>
          </div>
        </div>

        {/* Additional Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {/* Categories Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Categories Distribution
            </h3>
            <div className="h-64">
              {chartData.categories && (
                <Doughnut data={chartData.categories} options={doughnutOptions} />
              )}
            </div>
          </div>

          {/* Geographic Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Geographic Distribution
            </h3>
            <div className="h-64">
              {chartData.geographic && (
                <Pie data={chartData.geographic} options={doughnutOptions} />
              )}
            </div>
          </div>

          {/* Sales Funnel */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Sales Funnel
            </h3>
            <div className="h-64">
              {chartData.salesFunnel && (
                <Bar data={chartData.salesFunnel} options={barChartOptions} />
              )}
            </div>
          </div>
        </div>

        {/* Advanced Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Radar Chart - Performance Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Performance Radar
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Multi-dimensional performance analysis
                </p>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-gray-600 dark:text-gray-400">Current</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-gray-600 dark:text-gray-400">Previous</span>
                </div>
              </div>
            </div>
            <div className="h-80">
              {chartData.radar && (
                <Radar data={chartData.radar} options={radarOptions} />
              )}
            </div>
          </div>

          {/* Price Distribution Scatter Plot */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Price vs Sales Analysis
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Product pricing and sales performance correlation
                </p>
              </div>
            </div>
            <div className="h-80">
              {chartData.priceDistribution && (
                <Scatter data={chartData.priceDistribution} options={scatterOptions} />
              )}
            </div>
          </div>
        </div>

        {/* Customer Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Customer Lifetime Value */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Customer Lifetime Value
            </h3>
            <div className="h-64">
              {chartData.customerValue && (
                <Bar data={chartData.customerValue} options={barChartOptions} />
              )}
            </div>
          </div>

          {/* Device Usage */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Device Usage
            </h3>
            <div className="h-64">
              {chartData.devices && (
                <PolarArea data={chartData.devices} options={polarAreaOptions} />
              )}
            </div>
          </div>
        </div>

        {/* Bottom Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
          {/* Recent Products */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Products
              </h3>
              <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                {filteredProducts.length} items
              </span>
            </div>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {filteredProducts.map((product, index) => (
                <div
                  key={product._id || index}
                  className="flex items-center space-x-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                >
                  <img
                    src={product.mainImage || '/api/placeholder/48/48'}
                    alt={product.title}
                    className="w-12 h-12 rounded-lg object-cover shadow-sm group-hover:shadow-md transition-shadow"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {product.title}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ${product.price || 0}
                      </p>
                      <span className="text-xs text-gray-500">•</span>
                      <div className="flex items-center text-xs text-yellow-600">
                        <FaStar className="w-3 h-3 mr-1" />
                        {product.rating}
                      </div>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    (product.productStatus || 'active') === 'active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {product.productStatus || 'active'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Orders
              </h3>
              <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                {recentOrders.length} orders
              </span>
            </div>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {recentOrders.map((order, index) => {
                const statusInfo = getStatusInfo(order.status);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <div
                    key={order.id}
                    className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                          #{order.id.slice(-3)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {order.id}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTimeAgo(order.date)}
                          </p>
                        </div>
                      </div>
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        <span>{statusInfo.text}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Product:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[120px]">
                          {order.product}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Customer:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {order.customer}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Items:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {order.items} item{order.items > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-600">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Total:</span>
                        <span className="text-lg font-bold text-green-600 dark:text-green-400">
                          ${order.amount}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Performing Products */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Top Products
            </h3>
            <div className="space-y-4">
              {analytics.topProducts.map((product, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {product.sales} sales
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      ${product.revenue.toLocaleString()}
                    </p>
                    <p className={`text-xs ${parseFloat(product.growth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.growth}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            System Performance
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <FaDesktop className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">98.2%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Uptime</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <FaRegChartBar className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">1.2s</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Response</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <FaChartLine className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">99.9%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <FaMobile className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">0.03%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Error Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;