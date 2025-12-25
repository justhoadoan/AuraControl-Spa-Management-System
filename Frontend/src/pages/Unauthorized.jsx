import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Unauthorized Page - Hiển thị khi user không có quyền truy cập
 */
const Unauthorized = () => {
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleGoHome = () => {
        navigate('/');
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100vh',
            textAlign: 'center',
            padding: '20px'
        }}>
            <h1 style={{ fontSize: '72px', margin: '0', color: '#e74c3c' }}>403</h1>
            <h2 style={{ fontSize: '32px', margin: '10px 0' }}>Access Denied</h2>
            <p style={{ fontSize: '18px', color: '#666', maxWidth: '500px' }}>
                You don't have permission to access this page. 
                Please contact your administrator if you believe this is a mistake.
            </p>
            <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
                <button 
                    onClick={handleGoBack}
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        backgroundColor: '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px'
                    }}
                >
                    Go Back
                </button>
                <button 
                    onClick={handleGoHome}
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        backgroundColor: '#2ecc71',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px'
                    }}
                >
                    Go Home
                </button>
                <button 
                    onClick={handleLogout}
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px'
                    }}
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Unauthorized;
