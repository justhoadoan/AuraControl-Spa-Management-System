import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

/**
 * ProtectedRoute - Bảo vệ route chỉ cho user đã đăng nhập
 * Không kiểm tra role, chỉ kiểm tra authentication
 */
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useContext(AuthContext);
    const location = useLocation();

    if (!isAuthenticated) {
        // Chuyển hướng về login, lưu location hiện tại để redirect lại sau
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
