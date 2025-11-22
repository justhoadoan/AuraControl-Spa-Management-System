import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * Home Page - Trang chủ
 */
const Home = () => {
    const { isAuthenticated, user, userRole, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1>Welcome to AuraControl Spa Management System</h1>
            
            {isAuthenticated ? (
                <div style={{ marginTop: '20px' }}>
                    <p><strong>Email:</strong> {user?.email}</p>
                    <p><strong>Role:</strong> {userRole}</p>
                    <p><strong>User ID:</strong> {user?.id}</p>
                    
                    <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button onClick={() => navigate('/my-appointments')} style={buttonStyle}>
                            My Appointments
                        </button>
                        
                        {userRole === 'ADMIN' && (
                            <button onClick={() => navigate('/admin')} style={buttonStyle}>
                                Admin Dashboard
                            </button>
                        )}
                        
                        {userRole === 'TECHNICIAN' && (
                            <button onClick={() => navigate('/staff')} style={buttonStyle}>
                                Staff Dashboard
                            </button>
                        )}
                        
                        <button onClick={handleLogout} style={{ ...buttonStyle, backgroundColor: '#e74c3c' }}>
                            Logout
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ marginTop: '20px' }}>
                    <p>Please login to access the system.</p>
                    <button onClick={() => navigate('/login')} style={buttonStyle}>
                        Login
                    </button>
                    <button onClick={() => navigate('/signup')} style={{ ...buttonStyle, marginLeft: '10px' }}>
                        Sign Up
                    </button>
                </div>
            )}
        </div>
    );
};

const buttonStyle = {
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '5px'
};

export default Home;
