import './Login.css';
import { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from '../context/AuthContext.jsx';
import { validateForm } from '../utils/validation.jsx';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    // Lấy trang trước đó từ state, mặc định là null (sẽ điều hướng theo role)
    const from = location.state?.from?.pathname || null;

    const handleLogin = async () => {
        // Validate form
        const validationErrors = validateForm(email, password);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsLoading(true);

        // Call backend API to authenticate
        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email, password})
            });

            // Handle HTTP error responses
            if (!response.ok) {
                // Try to get error message from backend
                const errorData = await response.json().catch(() => ({}));
                
                if (response.status === 401) {
                    // Unauthorized - Wrong credentials
                    throw new Error(errorData.message || 'Incorrect email or password');
                } else if (response.status === 403) {
                    // Forbidden - Account disabled/locked
                    throw new Error(errorData.message || 'Account access denied');
                } else if (response.status === 400) {
                    // Bad request - Invalid input
                    throw new Error(errorData.message || 'Invalid login request');
                } else {
                    throw new Error(errorData.message || 'Login failed. Please try again later.');
                }
            }

            // Get token from response
            const data = await response.json();
            const token = data.token;
            
            // Decode token to get role for navigation
            const decoded = jwtDecode(token);
            const role = decoded.role || decoded.authorities?.[0] || 'CUSTOMER';

            // Save to AuthContext
            login(token);

            // Clear form
            setEmail('');
            setPassword('');
            setErrors({});

            // Logic Điều hướng dựa trên Role
            if (from) {
                // Nếu có trang trước đó, redirect về đó
                navigate(from, { replace: true });
            } else {
                // Điều hướng theo role
                switch (role) {
                    case 'ADMIN':
                        navigate('/admin', { replace: true });
                        break;
                    case 'TECHNICIAN':
                        navigate('/staff', { replace: true });
                        break;
                    case 'CUSTOMER':
                    default:
                        navigate('/', { replace: true });
                        break;
                }
            }

        } catch (error) {
            console.error('Error during login:', error);
            setErrors({ general: error.message || 'Login failed. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    }

    // Handle email input change
    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        if(errors.email){
            setErrors((prev) => ({...prev, email: ''}));
        }
    }

    // Handle password input change
    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        if(errors.password){
            setErrors((prev) => ({...prev, password: ''}));
        }
    }

    return (
        <div className="container">
            <div className="header">
                <div className="text">Log In</div>
            </div>

            {/* General Error Message */}
            {errors.general && (
                <div className="error-message general-error" style={{ 
                    color: '#e74c3c', 
                    textAlign: 'center', 
                    marginBottom: '15px',
                    padding: '10px',
                    backgroundColor: '#ffe6e6',
                    borderRadius: '5px'
                }}>
                    {errors.general}
                </div>
            )}

            <div className="inputs">
                <div className="input">
                    <input 
                        type="email" 
                        placeholder="email" 
                        value={email}
                        onChange={handleEmailChange}
                        disabled={isLoading}
                    />
                </div>
                {errors.email && (
                    <span className="error-message">{errors.email}</span>
                )}
                <div className="input">
                    <input 
                        type="password" 
                        placeholder="password"
                        value={password}
                        onChange={handlePasswordChange}
                        disabled={isLoading}
                    />
                </div>
                {errors.password && (
                    <span className="error-message">{errors.password}</span>
                )}
            </div>
            <div className="login-button">
                <button 
                    type="submit" 
                    onClick={handleLogin}
                    disabled={isLoading}
                    style={{
                        opacity: isLoading ? 0.6 : 1,
                        cursor: isLoading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {isLoading ? 'Logging in...' : 'Log In'}
                </button>
            </div>
        </div>
    );
}

export default Login;