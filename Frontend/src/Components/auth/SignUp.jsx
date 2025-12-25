import '../auth/Login.css';
import {useState, useContext} from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import { validateForm } from '../../utils/Validation.jsx';
import FlowersImg from '../../assets/Flowers.png';

const SignUp = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSignUp = async () => {
        // --- 1. VALIDATE FORM ---
        const validationErrors = {};
        
        if (!name.trim()) {
            validationErrors.name = 'Name is required';
        }
        
        const formErrors = validateForm(email, password);
        Object.assign(validationErrors, formErrors);
        
        if (password !== confirmPassword) {
            validationErrors.confirmPassword = 'Passwords do not match';
        }
        
        // Stop if there are validation errors
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsLoading(true);

        // --- 2. CALL BACKEND API ---
        try {
            const response = await fetch('http://localhost:8081/api/auth/register', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({name, email, password})
            });

            // --- 3. HANDLE ERRORS ---
            if(!response.ok){
                // Read response as text first to avoid JSON parse errors
                const errorText = await response.text();
                let errorMessage = errorText;

                // Try parsing JSON (Spring Boot usually returns JSON errors)
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.message || errorText;
                } catch (e) {
                    // If not JSON, use the plain text
                }

                // Check status code or message content to set specific field errors
                if(response.status === 409 || errorMessage.toLowerCase().includes('email') || errorMessage.toLowerCase().includes('exists')){
                    setErrors({email: 'Email is already in use.'});
                } else {
                    setErrors({general: errorMessage || 'Registration failed. Please try again.'});
                }
                return; 
            }  
            
            // --- 4. HANDLE SUCCESS ---
            
            // Clear the form
            setName('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setErrors({});

            // Notify user to check email
            alert("Registration successful! Please check your email to activate your account before logging in.");

            // Redirect to Login page
            navigate('/login');
            
        } catch (error) {
            // Network error or server unreachable
            console.error('Error during sign up:', error);
            setErrors({ general: 'Unable to connect to the server. Please check your network connection.' });
        } finally {
            setIsLoading(false);
        }
    }

    const handleNameChange = (e) => {
        setName(e.target.value);
        if(errors.name){
            setErrors((prev) => ({...prev, name: ''}));
        }
    }

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        if(errors.email){
            setErrors((prev) => ({...prev, email: ''}));
        }
    }

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        if(errors.password){
            setErrors((prev) => ({...prev, password: ''}));
        }
    }

    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
        if(errors.confirmPassword){
            setErrors((prev) => ({...prev, confirmPassword: ''}));
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

            <div className="card" role="main" aria-label="Sign up form">
                <h2>Create an account</h2>

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

                <form onSubmit={(e) => { e.preventDefault(); handleSignUp(); }}>
                    {/* Name */}
                    <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input 
                            type="text" 
                            id="name" 
                            name="name"
                            value={name}
                            onChange={handleNameChange}
                            disabled={isLoading}
                            required 
                        />
                        {errors.name && (
                            <span style={{ color: 'red', fontSize: '12px' }}>
                                {errors.name}
                            </span>
                        )}
                    </div>

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

                    {/* Confirm Password */}
                    <div className="form-group">
                        <label htmlFor="confirm-password">Confirm Password</label>
                        <input 
                            type="password" 
                            id="confirm-password" 
                            name="confirm-password"
                            value={confirmPassword}
                            onChange={handleConfirmPasswordChange}
                            disabled={isLoading}
                            required 
                        />
                        {errors.confirmPassword && (
                            <span style={{ color: 'red', fontSize: '12px' }}>
                                {errors.confirmPassword}
                            </span>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        className="btn-submit"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                {/* Login link */}
                <div className="signup-login-text">
                    Already have an account?{' '}
                    <button 
                        type="button" 
                        className="btn-text-link"
                        onClick={() => navigate('/login')}
                    >
                        Log in
                    </button>
                </div>
            </div>

            <div className="footer-legal">
                By Register you agree with <a href="#">terms and conditions</a> and <a href="#">privacy policy</a>
            </div>
        </>
    );
}

export default SignUp;