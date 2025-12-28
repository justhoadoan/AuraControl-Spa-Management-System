import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'; // Sửa lại đường dẫn nếu cần

const AccountLayout = ({ children, showSidebar = true }) => {
    const { user, userRole, isAuthenticated, logout } = useContext(AuthContext) || {};
    const navigate = useNavigate();
    const location = useLocation(); // Dùng để kiểm tra đang ở trang nào

    const handleLogout = () => {
        if (logout) logout();
        navigate('/login');
    };

    // Hàm kiểm tra link đang active để tô màu hồng
    const isActive = (path) => location.pathname === path;

    // Class cho link active và link thường
    const activeClass = "flex items-center px-4 py-3 bg-primary/10 text-primary dark:bg-primary/20 rounded-md font-semibold transition-colors";
    const inactiveClass = "flex items-center px-4 py-3 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors";

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 min-h-screen flex flex-col font-sans transition-colors duration-200">
            
            {/* --- HEADER CHUNG --- */}
            <header className="sticky top-0 z-50 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md shadow-sm">
                <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                    {/* Logo */}
                    <Link className="text-2xl font-bold text-primary" to="/">AuraControl</Link>
                    
                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link className="text-text-light dark:text-text-dark hover:text-primary dark:hover:text-primary transition-colors" to="/">Home</Link>
                        <button 
                            onClick={() => isAuthenticated ? navigate('/services') : navigate('/login')}
                            className="text-subtle-light dark:text-subtle-dark hover:text-primary dark:hover:text-primary transition-colors"
                        >
                            Services
                        </button>
                    </div>

                    {/* Auth Buttons */}
                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                {/* Hiển thị tên user */}
                                <span className="text-subtle-light dark:text-subtle-dark text-sm hidden sm:inline font-medium">
                                    Hello, {user?.email?.split('@')[0]}
                                </span>

                                {/* Nút Admin/Staff Dashboard */}
                                {userRole === 'ADMIN' && (
                                    <button 
                                        onClick={() => navigate('/admin')} 
                                        className="text-subtle-light hover:text-primary transition-colors text-sm font-medium"
                                    >
                                        Admin
                                    </button>
                                )}
                                {userRole === 'TECHNICIAN' && (
                                    <button 
                                        onClick={() => navigate('/staff')} 
                                        className="text-subtle-light hover:text-primary transition-colors text-sm font-medium"
                                    >
                                        Staff
                                    </button>
                                )}

                                {/* Account Dashboard */}
                                <button 
                                    onClick={() => navigate('/dashboard')} 
                                    className="text-subtle-light hover:text-primary transition-colors text-sm font-medium"
                                >
                                    My Account
                                </button>

                                {/* Logout Button */}
                                <button 
                                    onClick={handleLogout} 
                                    className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                {/* Chưa đăng nhập */}
                                <Link 
                                    to="/login"
                                    className="text-subtle-light dark:text-subtle-dark hover:text-primary dark:hover:text-primary transition-colors text-sm font-medium"
                                >
                                    Log in
                                </Link>
                                <Link 
                                    to="/signup"
                                    className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </nav>
            </header>

            {/* --- MAIN CONTENT WRAPPER --- */}
            <main className="flex-grow container mx-auto px-6 py-12">
                <div className={showSidebar ? "md:grid md:grid-cols-12 md:gap-12" : ""}>
                    
                    {/* --- SIDEBAR CHUNG --- */}
                    {showSidebar && (
                        <aside className="md:col-span-3 mb-12 md:mb-0">
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 font-display">My Account</h2>
                                <nav className="space-y-2">
                                    <Link to="/dashboard" className={isActive('/dashboard') ? activeClass : inactiveClass}>
                                        <span className="material-icons-outlined mr-3">calendar_today</span>
                                        Upcoming Appointments
                                    </Link>
                                    
                                    <Link to="/history" className={isActive('/history') ? activeClass : inactiveClass}>
                                        <span className="material-icons-outlined mr-3">history</span>
                                        Appointment History
                                    </Link>
                                    
                                    <Link to="/profile" className={isActive('/profile') ? activeClass : inactiveClass}>
                                        <span className="material-icons-outlined mr-3">person_outline</span>
                                        Personal Information
                                    </Link>
                                    
                                    <button onClick={handleLogout} className="w-full text-left flex items-center px-4 py-3 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
                                        <span className="material-icons-outlined mr-3">logout</span>
                                        Logout
                                    </button>
                                </nav>
                            </div>
                        </aside>
                    )}

                    {/* --- NỘI DUNG RIÊNG CỦA TỪNG TRANG (CHILDREN) --- */}
                    <div className={showSidebar ? "md:col-span-9" : ""}>
                        {children}
                    </div>

                </div>
            </main>

            {/* --- FOOTER CHUNG --- */}
            <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-auto">
                <div className="container mx-auto px-6 py-8 text-center">
                    <Link to="/" className="font-display text-2xl font-bold text-primary">AuraControl</Link>
                    <p className="mt-4 text-slate-500 text-sm">© 2024 AuraControl. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default AccountLayout;