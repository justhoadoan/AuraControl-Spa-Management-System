import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

/**
 * AdminDashboard Page - Chỉ dành cho ADMIN
 */
const AdminDashboard = () => {
    const { user } = useContext(AuthContext);

    return (
        <div style={{ padding: '20px' }}>
            <h1>Admin Dashboard</h1>
            <p>Welcome, Admin {user?.email}!</p>
            <p>You have full access to manage the system.</p>
            {/* Thêm admin features ở đây */}
        </div>
    );
};

export default AdminDashboard;
