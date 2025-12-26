import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'; // Sửa lại đường dẫn nếu cần

const AccountLayout = ({ children }) => {
    const { user, logout } = useContext(AuthContext) || {};
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
            <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40 shadow-sm">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Link to="/" className="font-display text-2xl font-bold text-primary">AuraControl</Link>
                    
                    <nav className="hidden md:flex items-center space-x-8">
                        {['In-Home', 'Features', 'Pricing & Plans', 'Locations', 'Help & Supports'].map((item) => (
                            <Link key={item} to="#" className="text-sm text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">
                                {item}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center space-x-3">
                        <button className="flex items-center space-x-2 p-2 rounded-full">
                            <img alt="Avatar" className="w-8 h-8 rounded-full border-2 border-primary object-cover" 
                                 src={`https://ui-avatars.com/api/?name=${user?.fullName || 'User'}&background=DE4F7A&color=fff`} />
                            <span className="hidden sm:inline text-sm font-medium text-slate-700 dark:text-slate-300">
                                {user?.fullName || 'My Account'}
                            </span>
                        </button>
                    </div>
                </div>
            </header>

            {/* --- MAIN CONTENT WRAPPER --- */}
            <main className="flex-grow container mx-auto px-6 py-12">
                <div className="md:grid md:grid-cols-12 md:gap-12">
                    
                    {/* --- SIDEBAR CHUNG --- */}
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

                    {/* --- NỘI DUNG RIÊNG CỦA TỪNG TRANG (CHILDREN) --- */}
                    <div className="md:col-span-9">
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