import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

/**
 * RoleBasedRoute - Bảo vệ route dựa trên role của user
 * @param {string[]} allowedRoles - Danh sách các role được phép truy cập
 * @param {JSX.Element} children - Component con được bảo vệ
 */
const RoleBasedRoute = ({ children, allowedRoles = [] }) => {
    const { isAuthenticated, userRole, loading } = useContext(AuthContext);
    const location = useLocation();

    // Wait for auth state to be loaded from localStorage
    if (loading) {
        return <div>Loading...</div>;
    }

    // Chưa đăng nhập -> Chuyển về login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Đã đăng nhập nhưng role không đủ quyền -> Chuyển về 403
    if (!allowedRoles.includes(userRole)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default RoleBasedRoute;
