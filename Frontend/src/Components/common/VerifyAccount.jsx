import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const VerifyAccount = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // 1. Dùng useRef để đánh dấu xem API đã được gọi hay chưa
    // Biến này sẽ không bị reset khi component render lại
    const isCalled = useRef(false);

    // Các trạng thái của trang
    const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
    const [message, setMessage] = useState('Đang xác thực tài khoản, vui lòng đợi...');

    useEffect(() => {
        const token = searchParams.get('token');

        // Nếu không có token trên URL thì báo lỗi ngay
        if (!token) {
            setStatus('error');
            setMessage('Link kích hoạt không hợp lệ hoặc bị thiếu token.');
            return;
        }

        // 2. CHẶN GỌI LẠI (QUAN TRỌNG)
        // Nếu isCalled.current là true nghĩa là đã gọi rồi -> Dừng lại ngay
        if (isCalled.current) return;
        
        // Đánh dấu là đã gọi để các lần render sau không gọi nữa
        isCalled.current = true; 

        // 3. Gọi API xuống Backend
        // Lưu ý: Đảm bảo port 8081 đúng với server của bạn
        axios.get(`http://localhost:8081/api/auth/verify-account?token=${token}`)
            .then((response) => {
                // Backend trả về thành công
                setStatus('success');
                // Nếu backend trả về string text thì lấy luôn, nếu là object thì lấy field message
                const successMsg = typeof response.data === 'string' ? response.data : "Tài khoản kích hoạt thành công!";
                setMessage(successMsg);
            })
            .catch((error) => {
                setStatus('error');
                // Xử lý lỗi trả về từ Backend
                if (error.response && error.response.data) {
                    const errorData = error.response.data;
                    // Kiểm tra xem lỗi trả về là String hay Object JSON
                    setMessage(typeof errorData === 'string' ? errorData : (errorData.message || 'Kích hoạt thất bại.'));
                } else {
                    setMessage('Đã xảy ra lỗi kết nối đến máy chủ.');
                }
            });
            
    }, [searchParams]);

    // Điều hướng
    const handleLoginRedirect = () => {
        navigate('/login'); // Đổi đường dẫn tới trang login của bạn nếu khác
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                {/* TRẠNG THÁI: ĐANG XỬ LÝ */}
                {status === 'verifying' && (
                    <>
                        <div style={styles.spinner}></div>
                        <h2 style={{ color: '#3498db' }}>Đang kích hoạt...</h2>
                        <p>{message}</p>
                    </>
                )}

                {/* TRẠNG THÁI: THÀNH CÔNG */}
                {status === 'success' && (
                    <>
                        <div style={styles.iconSuccess}>✓</div>
                        <h2 style={{ color: '#27ae60' }}>Thành công!</h2>
                        <p style={styles.text}>{message}</p>
                        <button style={styles.buttonSuccess} onClick={handleLoginRedirect}>
                            Đến trang Đăng nhập
                        </button>
                    </>
                )}

                {/* TRẠNG THÁI: LỖI */}
                {status === 'error' && (
                    <>
                        <div style={styles.iconError}>✕</div>
                        <h2 style={{ color: '#e74c3c' }}>Kích hoạt thất bại</h2>
                        <p style={styles.textError}>{message}</p>
                        <button style={styles.buttonError} onClick={() => navigate('/')}>
                            Về trang chủ
                        </button>
                    </>
                )}
            </div>
            
            {/* Thêm style cho keyframes animation */}
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
        </div>
    );
};

// CSS Styles (Inline)
const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    card: {
        backgroundColor: '#fff',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '400px',
        width: '90%',
    },
    spinner: {
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #3498db',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 20px',
    },
    iconSuccess: {
        fontSize: '50px',
        color: '#27ae60',
        marginBottom: '10px',
    },
    iconError: {
        fontSize: '50px',
        color: '#e74c3c',
        marginBottom: '10px',
    },
    text: {
        color: '#555',
        marginBottom: '20px',
        lineHeight: '1.5',
    },
    textError: {
        color: '#e74c3c',
        marginBottom: '20px',
    },
    buttonSuccess: {
        backgroundColor: '#27ae60',
        color: '#fff',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '600',
        transition: 'background 0.3s',
    },
    buttonError: {
        backgroundColor: '#95a5a6',
        color: '#fff',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '600',
    }
};

export default VerifyAccount;