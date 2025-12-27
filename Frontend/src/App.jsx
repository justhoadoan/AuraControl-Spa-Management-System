import { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Context
import { AuthContext } from './context/AuthContext';

// Layouts & Guards
import AuthLayout from './Components/layout/AuthLayout.jsx';
import AdminSidebarLayout from './Components/layout/AdminSidebarLayout.jsx';
import ProtectedRoute from './Components/guards/ProtectedRoute.jsx';
import RoleBasedRoute from './Components/guards/RoleBasedRoute.jsx';

// Auth Components
import Login from './Components/auth/Login.jsx';
import SignUp from './Components/auth/SignUp.jsx';
import ForgotPassword from './Components/ForgotPassword.jsx';
import ResetPassword from './Components/ResetPassword.jsx';
import VerifyAccount from './Components/common/VerifyAccount.jsx';

// Pages - Public & Common
import Home from './pages/Home.jsx';
import Unauthorized from './pages/Unauthorized.jsx';

// Pages - Customer
import AccountDashboard from './pages/customer/AccountDashboard.jsx';
import Profile from './pages/customer/Profile.jsx';
import SpaServices from './pages/customer/SpaServices.jsx';

// Pages - Admin
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ServiceManagement from './pages/admin/ServiceManagement.jsx';
import CustomerManagement from './pages/admin/CustomerManagement.jsx';
import TechnicianManagement from './pages/admin/TechnicianManagement.jsx';

// Pages - Technician
import StaffDashboard from './pages/technician/StaffDashboard.jsx';

// Styles
import './App.css';

function App() {
  const { isAuthenticated, userRole } = useContext(AuthContext);

  // Hàm xác định trang mặc định theo role
  const getDefaultRoute = () => {
    // Nếu userRole chưa sẵn sàng, trả về null để không redirect
    if (!userRole) return null;
    
    switch (userRole) {
      case 'ADMIN':
        return '/admin/services';
      case 'TECHNICIAN':
        return '/staff';
      case 'CUSTOMER':
      default:
        return '/';
    }
  };
  
  const defaultRoute = getDefaultRoute();

  return (
    <div className="w-full min-h-screen">
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/" 
            element={userRole === 'ADMIN' ? <Navigate to="/admin" replace /> : <Home />} 
          />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route
              path="/login"
              element={isAuthenticated && defaultRoute ? <Navigate to={defaultRoute} replace /> : <Login />}
            />
            <Route
              path="/signup"
              element={isAuthenticated && defaultRoute ? <Navigate to={defaultRoute} replace /> : <SignUp />}
            />
            <Route path="/verify-account" element={<VerifyAccount />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          {/* Protected Routes - Customer */}
          <Route
            path="/services"
            element={
              <ProtectedRoute>
                <SpaServices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AccountDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Role-Based Routes - ADMIN */}
          <Route
            element={
              <RoleBasedRoute allowedRoles={['ADMIN']}>
                <AdminSidebarLayout />
              </RoleBasedRoute>
            }
          >
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/services" element={<ServiceManagement />} />
            <Route path="/admin/customers" element={<CustomerManagement />} />
            <Route path="/admin/technicians" element={<TechnicianManagement />} />
          </Route>

          {/* Role-Based Routes - TECHNICIAN */}
          <Route
            path="/staff"
            element={
              <RoleBasedRoute allowedRoles={['TECHNICIAN']}>
                <StaffDashboard />
              </RoleBasedRoute>
            }
          />

          {/* 404 Not Found */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;



