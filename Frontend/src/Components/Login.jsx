import './Login.css';
import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { validateLoginForm } from '../utils/validation.jsx';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const {login} = useContext(AuthContext);

    const handleLogin = async () => {
        // Validate form
        const validationErrors = validateForm(email, password);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        // Call backend API to authenticate
        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email, password})
            });

            // Handle non-200 responses
            if(!response.ok){
                throw new Error('Login failed');
            }

            // Get token from response and let AuthContext decode it
            const data = await response.json();
            const token = data.token;
            login(token);

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