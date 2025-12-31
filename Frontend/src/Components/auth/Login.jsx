import { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from '../../context/AuthContext.jsx';
import { validateForm } from '../../utils/Validation.jsx';
import { getBaseURL } from '../../config/api';

// Không cần import Login.css hay FlowersImg nữa vì AuthLayout lo rồi

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || null;

    // --- GIỮ NGUYÊN LOGIC CŨ CỦA BẠN ---
    const handleLogin = async () => {
        const validationErrors = validateForm(email, password);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch(`${getBaseURL()}/auth/login`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email, password})
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                if (response.status === 401) throw new Error(errorData.message || 'Incorrect email or password');
                else if (response.status === 403) throw new Error(errorData.message || 'Account access denied');
                else if (response.status === 400) throw new Error(errorData.message || 'Invalid login request');
                else throw new Error(errorData.message || 'Login failed. Please try again later.');
            }

            const data = await response.json();
            const token = data.token;
            const decoded = jwtDecode(token);
            const role = decoded.role || decoded.authorities?.[0] || 'CUSTOMER';

            login(token);
            setEmail('');
            setPassword('');
            setErrors({});

            if (from) {
                navigate(from, { replace: true });
            } else {
                switch (role) {
                    case 'ADMIN': navigate('/admin', { replace: true }); break;
                    case 'TECHNICIAN': navigate('/staff', { replace: true }); break;
                    case 'CUSTOMER': default: navigate('/', { replace: true }); break;
                }
            }
        } catch (error) {
            console.error('Error during login:', error);
            setErrors({ general: error.message || 'Login failed. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    }

    // --- GIAO DIỆN MỚI (TAILWIND) ---
    return (
        <>
            <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Login</h2>

            {/* Hiển thị lỗi General đẹp hơn */}
            {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm text-center mb-4">
                    {errors.general}
                </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
                {/* Email Input */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); if(errors.email) setErrors({...errors, email: ''}) }}
                        disabled={isLoading}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
                        placeholder="name@example.com"
                    />
                    {errors.email && <span className="text-xs text-red-500 mt-1 block">{errors.email}</span>}
                </div>

                {/* Password Input */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); if(errors.password) setErrors({...errors, password: ''}) }}
                        disabled={isLoading}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
                        placeholder="••••••••"
                    />
                    {errors.password && <span className="text-xs text-red-500 mt-1 block">{errors.password}</span>}
                </div>

                {/* Submit Button */}
                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg transition-all shadow-lg mt-2 disabled:opacity-50"
                >
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
            </form>

            {/* Footer Links */}
            <div className="mt-6 flex flex-col items-center space-y-2 text-sm text-slate-600">
                <button 
                    type="button" 
                    className="text-pink-600 font-medium hover:underline"
                    onClick={() => navigate('/forgot-password')}
                >
                    Forgot Password?
                </button>
                
                <div>
                    Don't have an account?{' '}
                    <button 
                        type="button" 
                        className="text-pink-600 font-bold hover:underline"
                        onClick={() => navigate('/signup')}
                    >
                        Create free account
                    </button>
                </div>
            </div>
        </>
    );
}

export default Login;