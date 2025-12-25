import './Login.css';
import { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from '../../context/AuthContext.jsx';
import { validateForm } from '../../utils/Validation.jsx';
import FlowersImg from '../../assets/Flowers.png';

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
            const response = await fetch('http://localhost:8081/api/auth/login', {
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
    <>
        {/* Hình ảnh Flowers */}
        <img 
            id="flowers" 
            className="flowers-img" 
            src={FlowersImg} 
            alt="Flowers" 
        />

        <div className="card" role="main" aria-label="Login form">
            <h2>Login</h2>

            {/* Lỗi tổng quát */}
            {errors.general && (
                <div style={{ 
                    color: '#e74c3c', 
                    marginBottom: '15px',
                    padding: '10px',
                    backgroundColor: '#ffe6e6',
                    borderRadius: '5px',
                    textAlign: 'center'
                }}>
                    {errors.general}
                </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                {/* Email */}
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input 
                        type="email" 
                        id="email" 
                        name="email"
                        value={email}
                        onChange={handleEmailChange}
                        disabled={isLoading}
                        required 
                    />
                    {errors.email && (
                        <span style={{ color: 'red', fontSize: '12px' }}>
                            {errors.email}
                        </span>
                    )}
                </div>

                {/* Password */}
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input 
                        type="password" 
                        id="password" 
                        name="password"
                        value={password}
                        onChange={handlePasswordChange}
                        disabled={isLoading}
                        required 
                    />
                    {errors.password && (
                        <span style={{ color: 'red', fontSize: '12px' }}>
                            {errors.password}
                        </span>
                    )}
                </div>

                {/* Submit Button */}
                <button 
                    type="submit" 
                    className="btn-submit"
                    disabled={isLoading}
                >
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
            </form>

            {/* Forgot Password */}
            <div className="signup-login-text">
                Forgot Password?{' '}
                <button 
                    type="button" 
                    className="btn-text-link"
                    onClick={() => navigate('/forgot-password')}
                >
                    Reset Password
                </button>
            </div>
        </div>
    </>
);
}

export default Login;