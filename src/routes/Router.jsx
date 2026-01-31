import { createBrowserRouter } from "react-router-dom";
import Dashboard from "../layouts/DashBoard";
import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";

// Public Components
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import Page404 from "../components/NotFound";

// Dashboard Components
import Profile from "../components/Profile";
import UserManagement from "../pages/Admin/UserManagement";
import AddColor from "../pages/Admin/AddColor";
import EditProduct from "../pages/Admin/EditProduct";
import AddProduct from "../pages/Admin/AddProduct";
import AllProducts from "../pages/Admin/AllProducts";
import BrandManagement from "../pages/Admin/BrandManagement";
import CategoryManagement from "../pages/Admin/CategoryManagement";
import ProductFitManagement from "../pages/Admin/ProductFitManagement";
import SizeManagement from "../pages/Admin/SizeManagement";
import SustainabilityManagement from "../pages/Admin/SustainabilityManagement";
import SubCategoryManagement from "../pages/Admin/SubCategoryManagement";
import CertificationManagement from "../pages/Admin/Certification";
import DashboardHome from "../pages/Admin/DashboardHome";
import AddBlog from "../pages/Admin/AddBlog";
import AllBlogs from "../pages/Admin/AllBlog";
import EditBlog from "../pages/Admin/EditBlog";
import AllOrders from "../pages/Admin/ AllOrder";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PrivateRoute>
        <Dashboard/>
      </PrivateRoute>
    ),
    errorElement: <Page404 />,
    children: [
      // Common routes for all authenticated users
      { 
        path: "profile", 
        element: <Profile /> 
      },
       { 
  index: true, 
  element: <DashboardHome/> 
},
      
      // Product Management Routes
      { 
        path: "dashboard/products", 
        element: (
          <AdminRoute>
            <AllProducts />
          </AdminRoute>
        ) 
      },
        { 
        path: "dashboard/add-products", 
        element: (
          <AdminRoute>
            <AddProduct/>
          </AdminRoute>
        ) 
      },
      { 
        path: "dashboard/add-product", 
        element: (
          <AdminRoute>
            <AddProduct />
          </AdminRoute>
        ) 
      },
    { 
        path: "dashboard/add-color", 
        element: (
          <AdminRoute>
            <AddColor/>
          </AdminRoute>
        ) 
      },
    { 
        path: "dashboard/add-brand", 
        element: (
          <AdminRoute>
            <BrandManagement/>
          </AdminRoute>
        ) 
      },  { 
        path: "dashboard/add-category", 
        element: (
          <AdminRoute>
            <CategoryManagement/>
          </AdminRoute>
        ) 
      },
        { 
        path: "dashboard/add-category", 
        element: (
          <AdminRoute>
            <CategoryManagement/>
          </AdminRoute>
        ) 
      },
            { 
        path: "dashboard/add-fit", 
        element: (
          <AdminRoute>
            <ProductFitManagement/>
          </AdminRoute>
        ) 
      },
                { 
        path: "dashboard/add-size", 
        element: (
          <AdminRoute>
            <SizeManagement/>
          </AdminRoute>
        ) 
      },
           { 
        path: "dashboard/add-sub-category", 
        element: (
          <AdminRoute>
            <SubCategoryManagement/>
          </AdminRoute>
        ) 
      },
    { 
        path: "dashboard/add-blog", 
        element: (
          <AdminRoute>
            <AddBlog/>
          </AdminRoute>
        ) 
      },
          { 
        path: "dashboard/all-order", 
        element: (
          <AdminRoute>
            <AllOrders/>
          </AdminRoute>
        ) 
      },
          { 
        path: "dashboard/all-blogs", 
        element: (
          <AdminRoute>
            <AllBlogs/>
          </AdminRoute>
        ) 
      },
            { 
        path: "dashboard/edit-blog/:id", 
        element: (
          <AdminRoute>
            <EditBlog/>
          </AdminRoute>
        ) 
      },
      {
        path:"dashboard/certification",
        element:<CertificationManagement/>
      },

   { 
        path: "dashboard/add-sustainability", 
        element: (
          <AdminRoute>
            <SustainabilityManagement/>
          </AdminRoute>
        ) 
      },
      
      {
        path: "dashboard/edit-product/:id",
        element: (
          <AdminRoute>
            <EditProduct />
          </AdminRoute>
        ),
      },

      // Admin-only routes
      {
        path: "admin/users",
        element: (
          <AdminRoute>
            <UserManagement/>
          </AdminRoute>
        )
      },
      {
        path: "admin/color",
        element: (
          <AdminRoute>
            <AddColor/>
          </AdminRoute>
        )
      },
      
      // Dashboard home redirect to products
      { 
        path: "dashboard", 
        element: (
          <AdminRoute>
            <AllProducts />
          </AdminRoute>
        ) 
      },
    ],
  },

  // Public routes (no authentication required)
  { 
    path: "/login", 
    element: <Login /> 
  },
  { 
    path: "/forgot-password", 
    element: <ForgotPassword /> 
  },
  { 
    path: "*", 
    element: <Page404 /> 
  },
]);