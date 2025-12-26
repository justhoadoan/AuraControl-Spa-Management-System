import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const AuthLayout = () => {
    return (
        // 1. LỚP NỀN (Background): Full màn hình, căn giữa
        <div className="min-h-screen w-full flex items-center justify-center bg-background-light dark:bg-background-dark p-4 font-display">
            
            {/* 2. CÁI HỘP (Card): Màu trắng, bo góc, đổ bóng */}
            <div className="bg-white dark:bg-surface-dark p-8 rounded-2xl shadow-xl w-full max-w-md animate-slideIn">
                
                {/* (Tuỳ chọn) Logo hoặc nút về trang chủ ở đây nếu thích */}
                <div className="mb-6 text-center">
                    <Link to="/" className="text-2xl font-bold text-primary font-display">AuraControl</Link>
                </div>

                {/* 3. NỘI DUNG THAY ĐỔI (Outlet): Form Login/Signup sẽ hiện ở đây */}
                <Outlet />
                
            </div>
        </div>
    );
};

export default AuthLayout;