import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom'; // Quan trọng
import axios from 'axios';

const ResetPassword = () => {
    // 1. Lấy token từ URL (?token=...)
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token'); 

    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    // Nếu vừa vào trang mà không thấy token trên URL -> Báo lỗi ngay
    if (!token) {
        return <div style={{textAlign: 'center', marginTop: '50px', color: 'red'}}>Lỗi: Link không hợp lệ (Thiếu token).</div>;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            // 2. Gửi Token + Password mới xuống Backend
            // URL Backend: localhost:8080 (hoặc port bạn cấu hình)
            await axios.post('http://localhost:8081/api/auth/reset-password', {
                token: token,       // Token lấy từ URL
                newPassword: password // Password người dùng nhập
            });

            setIsError(false);
            setMessage('Đổi mật khẩu thành công! Đang chuyển hướng...');
            
            // Chuyển về trang login sau 2 giây
            setTimeout(() => navigate('/login'), 2000);

        } catch (error) {
            setIsError(true);
            setMessage(error.response?.data || 'Link đã hết hạn hoặc không hợp lệ.');
        }
    };

    return (
        <div className="card">
            <h2>Reset Password</h2>
            {message && <p style={{ color: isError ? 'red' : 'green' }}>{message}</p>}
            
            <form onSubmit={handleSubmit}>
                <label>New Password</label>
                <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                />
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default ResetPassword;