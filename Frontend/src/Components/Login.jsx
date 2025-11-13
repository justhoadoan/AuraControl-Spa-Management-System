import './Login.css';
import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setError] = useState({});
    const {login} = useContext(AuthContext);

    //Validate email format
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    const validateForm = () => {
        const newErrors = {};
        // Email validation
        if(!email.trim()) {
            newErrors.email = 'Email is required';
        }else if(!validateEmail(email)){
            newErrors.email = 'Invalid email format';
        }
        // Password validation
        if(!password){
            newErrors.password = 'Password is required';
        }else if(password.length < 8){
            newErrors.password = 'Password must be at least 8 characters';
        }
        setError(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        // Validate form
        if(!validateForm()){
            return;
        }

        // Call backend API to authenticate
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email, password})
            });

            // Handle non-200 responses
            if(!response.ok){
                throw new Error('Login failed');
            }

            // Assuming response contains JSON with token and role
            const data = await response.json();
            const token = data.token;
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log('Decoded JWT payload:', payload);
            const role = payload.role;
            login(token, role);

            // Clear form
            setEmail('');
            setPassword('');
            setErrors({});

        } catch (error){
            console.error('Error during login:', error);
            setErrors({general: error.message || 'Login failed'});  
        }
    }

    // Handle email input change
    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        if(error.email){
            setError((prev) => ({...prev, email: ''}));
        }
    }

    // Handle password input change
    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        if(error.password){
            setError((prev) => ({...prev, password: ''}));
        }
    }

    return (
        <div className="container">
            <div className="header">
                <div className="text">Log In</div>
            </div>
            <div className="inputs">
                <div className="input">
                    <input 
                        type="email" 
                        placeholder="email" 
                        value={email}
                        onChange={handleEmailChange}
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
                        onChange={handlePasswordChange} />
                </div>
                {errors.password && (
                        <span className="error-message">{errors.password}</span>
                    )}
            </div>
            <div className="login-button">
                <button type="submit" onClick={handleLogin}>Log In</button>
            </div>
        </div>
    );
}

export default Login;