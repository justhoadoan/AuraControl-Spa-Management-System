import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Login from './Components/auth/Login.jsx';
import SignUp from './Components/auth/SignUp.jsx';
import ProtectedRoute from './Components/guards/ProtectedRoute.jsx';
import RoleBasedRoute from './Components/guards/RoleBasedRoute.jsx';
import Home from './pages/Home.jsx';
import AccountDashboard from './pages/customer/AccountDashboard.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import StaffDashboard from './pages/technician/StaffDashboard.jsx';
import Unauthorized from './pages/Unauthorized.jsx';
import VerifyAccount from './Components/common/VerifyAccount.jsx';
import ResetPassword from './Components/ResetPassword.jsx';
import ForgotPassword from './Components/ForgotPassword.jsx';
import Profile from './pages/customer/Profile.jsx';
import ServiceManagement from './pages/admin/ServiceManagement.jsx';
import SpaServices from './pages/customer/SpaServices.jsx';
import AuthLayout from './Components/layout/AuthLayout.jsx';
import './App.css';

function App() {
  const { isAuthenticated, userRole } = useContext(AuthContext);

  // Hàm xác định trang mặc định theo role
  const getDefaultRoute = () => {
    // Nếu userRole chưa sẵn sàng, trả về null để không redirect
    if (!userRole) return null;
    
    switch (userRole) {
      case 'ADMIN':
        return '/admin';
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
        <Route path="/" element={<Home />} />

        <Route element={<AuthLayout />}>
          <Route 
          path="/login" 
          element={isAuthenticated && defaultRoute ? <Navigate to={defaultRoute} replace /> : <Login />} 
          />
          <Route 
            path="/signup" 
            element={isAuthenticated && defaultRoute ? <Navigate to={defaultRoute} replace /> : <SignUp />} 
          />
          <Route 
            path="/verify-account" 
            element={<VerifyAccount />} 
          />

          <Route 
            path="/forgot-password" 
           element={<ForgotPassword />} />

          <Route 
            path="/reset-password" 
            element={<ResetPassword />} />
       </Route>

        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Routes - Chỉ cần đăng nhập */}
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

        {/* Role-Based Routes - ADMIN only */}
        <Route 
          path="/admin" 
          element={
            <RoleBasedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </RoleBasedRoute>
          } 
        />

        <Route 
          path="/admin/services" 
          element={
            <RoleBasedRoute allowedRoles={['ADMIN']}>
              <ServiceManagement />
            </RoleBasedRoute>
          } 
        />

        {/* Role-Based Routes - TECHNICIAN only */}
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



