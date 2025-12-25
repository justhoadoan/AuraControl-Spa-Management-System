import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * MyAppointments Page - Trang lịch hẹn của user (Chỉ cần đăng nhập)
 */
const MyAppointments = () => {
    const { user } = useContext(AuthContext);

    return (
        <div style={{ padding: '20px' }}>
            <h1>My Appointments</h1>
            <p>Welcome, {user?.email}!</p>
            <p>This page shows your appointments.</p>
            {/* Thêm logic hiển thị appointments ở đây */}
        </div>
    );
};

export default MyAppointments;
