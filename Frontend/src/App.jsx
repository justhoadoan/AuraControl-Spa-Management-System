import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Login from './components/Login.jsx';
import SignUp from './components/SignUp.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import RoleBasedRoute from './components/RoleBasedRoute.jsx';
import Home from './pages/Home.jsx';
import MyAppointments from './pages/MyAppointments.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import StaffDashboard from './pages/StaffDashboard.jsx';
import Unauthorized from './pages/Unauthorized.jsx';
import './App.css';

function App() {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} 
        />
        <Route 
          path="/signup" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <SignUp />} 
        />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Routes - Chỉ cần đăng nhập */}
        <Route 
          path="/my-appointments" 
          element={
            <ProtectedRoute>
              <MyAppointments />
            </ProtectedRoute>
          } 
        />

        {/* Role-Based Routes - ADMIN only */}
        <Route 
          path="/admin/*" 
          element={
            <RoleBasedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </RoleBasedRoute>
          } 
        />

        {/* Role-Based Routes - TECHNICIAN only */}
        <Route 
          path="/staff/*" 
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
  );
}

export default App;
