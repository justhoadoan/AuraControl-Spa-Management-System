import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * AccountDashboard Page - User's account dashboard (Login required)
 */
const AccountDashboard = () => {
    const { user } = useContext(AuthContext);

    return (
        <div style={{ padding: '20px' }}>
            <h1>Account Dashboard</h1>
            <p>Welcome, {user?.email}!</p>
            <p>This page shows your account information and appointments.</p>
            {/* Add account features here */}
        </div>
    );
};

export default AccountDashboard;
