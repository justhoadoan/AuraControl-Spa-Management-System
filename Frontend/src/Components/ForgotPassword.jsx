import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// import '../../css/common.css'; // Bỏ comment nếu bạn cần import css
// import '../../css/login.css'; 

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            // Gọi API Backend: POST /api/auth/forgot-password
            // Body: { email: "user@example.com" }
            const response = await axios.post('http://localhost:8081/api/auth/forgot-password', {
                email: email
            });

            // Thành công
            setIsError(false);
            setMessage(response.data); // "If the email exists, a password reset instruction has been sent."
            
        } catch (error) {
            setIsError(true);
            // Lấy thông báo lỗi từ backend (ResourceNotFoundException) hoặc lỗi mạng
            const errorMsg = error.response?.data || 'Có lỗi xảy ra, vui lòng thử lại sau.';
            
            // Xử lý trường hợp backend trả về object lỗi thay vì string
            setMessage(typeof errorMsg === 'string' ? errorMsg : errorMsg.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Giữ nguyên ảnh nền giống trang ResetPassword */}
            <img 
                id="flowers" 
                className="flowers-img" 
                src="/src/assets/Flowers.png" 
                alt="Flowers" 
                style={{ position: 'absolute', top: 0, left: 0 }} 
            />

            <div className="card" role="main" aria-label="Forgot password form">
                <h2>Forgot Password</h2>
                
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px', textAlign: 'center' }}>
                    Enter your email address and we will send you a link to reset your password.
                </p>

                {/* Khu vực hiển thị thông báo */}
                {message && (
                    <div style={{ 
                        color: isError ? '#e74c3c' : '#27ae60', 
                        backgroundColor: isError ? '#fce4e4' : '#eafaf1',
                        padding: '10px',
                        borderRadius: '5px',
                        marginBottom: '15px', 
                        textAlign: 'center',
                        fontSize: '14px'
                    }}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            required 
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn-submit" 
                        disabled={isLoading}
                        style={{ opacity: isLoading ? 0.7 : 1 }}
                    >
                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>

                    {/* Nút quay lại trang đăng nhập */}
                    <div style={{ marginTop: '15px', textAlign: 'center' }}>
                        <span 
                            onClick={() => navigate('/login')} 
                            style={{ 
                                color: '#007bff', 
                                cursor: 'pointer', 
                                fontSize: '14px', 
                                textDecoration: 'none' 
                            }}
                            onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                            onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                        >
                            Back to Login
                        </span>
                    </div>
                </form>
            </div>
        </>
    );
};

export default ForgotPassword;