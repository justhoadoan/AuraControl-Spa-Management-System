import './SignUp.css';
import {useState, useEffect, useContext} from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { validateForm } from '../utils/validation.jsx';

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSignUp = async () => {
        // Validate form
        const validationErrors = validateForm(email, password);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        // Call backend API to register
        try {
            const response = await fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email, password})
            });
            if(!response.ok){
                const errorData = await response.json();   
                if(response.status === 409 || 
                   errorData.message?.toLowerCase().includes('email') ||
                   errorData.message?.toLowerCase().includes('already exists')){
                    setErrors({email: 'Email đã được sử dụng. Vui lòng chọn email khác.'});
                } else {
                    setErrors({general: errorData.message || 'Đăng ký thất bại'});
                }
                return;
            }  
            
            // Get token from response and let AuthContext decode it
            const data = await response.json();
            const token = data.token;
            login(token);

            // Clear form
            setEmail('');
            setPassword('');
            setErrors({});

            // Redirect về home sau khi đăng ký thành công
            navigate('/', { replace: true });
            
        } catch (error) {
            console.error('Error during sign up:', error);
            setErrors({ general: 'Cannot sign up. Please try again later.' });
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

    return (
        <div className="container">
            <div className="header">
                <div className="text">Sign Up</div>
            </div>

            {errors.general && (
                <div className="error-message general-error">{errors.general}</div>
            )}

            <div className="inputs">
                <div className="input">
                    <input 
                        type="email" 
                        placeholder="Email"
                        value={email}
                        onChange={handleEmailChange}
                    />
                    {errors.email && (
                        <span className="error-message">{errors.email}</span>
                    )}
                </div>

                <div className="input">
                    <input 
                        type="password" 
                        placeholder="Password"
                        value={password}
                        onChange={handlePasswordChange}
                    />
                    {errors.password && (
                        <span className="error-message">{errors.password}</span>
                    )}
                </div>
            </div>

            <div className="forgot-password">Forgot Password? Click here!</div>

            <div className="login-button">
                <button type="submit" onClick={handleSignUp}>Sign Up</button>
            </div>
        </div>
    );
}

export default SignUp;