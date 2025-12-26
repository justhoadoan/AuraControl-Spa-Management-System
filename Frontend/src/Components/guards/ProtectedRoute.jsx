import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

/**
 * ProtectedRoute - Bảo vệ route chỉ cho user đã đăng nhập
 * Không kiểm tra role, chỉ kiểm tra authentication
 */
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useContext(AuthContext);
    const location = useLocation();

    // Wait for auth state to be loaded from localStorage
    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        // Chuyển hướng về login, lưu location hiện tại để redirect lại sau
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
