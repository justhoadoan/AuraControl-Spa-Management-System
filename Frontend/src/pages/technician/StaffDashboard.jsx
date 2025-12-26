import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

/**
 * StaffDashboard Page - Chỉ dành cho TECHNICIAN
 */
const StaffDashboard = () => {
    const { user } = useContext(AuthContext);

    return (
        <div style={{ padding: '20px' }}>
            <h1>Staff Dashboard</h1>
            <p>Welcome, Technician {user?.email}!</p>
            <p>Manage your appointments and services here.</p>
            {/* Thêm staff features ở đây */}
        </div>
    );
};

export default StaffDashboard;
