import React, { useContext } from 'react';
import { Outlet, NavLink, useNavigate} from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const TechnicianLayout = () => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Hàm style cho Link (Active: nền hồng chữ đậm / Inactive: chữ xám)
    const getNavLinkClass = ({ isActive }) => {
        const baseClass = "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200";
        // Style khi đang chọn (Active) - Dựa theo ảnh mẫu
        const activeClass = "bg-primary/10 text-primary font-bold shadow-sm"; 
        // Style khi không chọn (Inactive)
        const inactiveClass = "text-gray-500 dark:text-gray-400 hover:bg-primary/5 hover:text-primary dark:hover:text-primary font-medium";
        
        return `${baseClass} ${isActive ? activeClass : inactiveClass}`;
    };

    return (
        <div className="flex min-h-screen w-full font-display bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
            
            {/* --- SIDEBAR --- */}
            <aside className="fixed inset-y-0 left-0 z-10 w-64 flex flex-col border-r border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-sm transition-transform duration-300 transform md:translate-x-0 translate-x-0">
                <div className="flex flex-col gap-4 p-6 h-full">
                    
                    {/* Logo Section */}
                    <div className="flex items-center gap-3 px-2 mb-2">
                        <span className="material-symbols-outlined text-primary text-3xl">spa</span>
                        <div className="flex flex-col">
                            <h1 className="text-lg font-bold tracking-tight">Serenity Spa</h1>
                            <p className="text-xs text-subtext-light dark:text-subtext-dark font-medium uppercase tracking-wider">Technician Portal</p>
                        </div>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="flex flex-col gap-2 mt-4 flex-grow">
                        {/* 1. Dashboard */}
                        <NavLink to="/staff" end className={getNavLinkClass}>
                            <span className="material-symbols-outlined">dashboard</span>
                            <p className="text-sm">Dashboard</p>
                        </NavLink>
                    </nav>

                    {/* Footer Actions (Logout) */}
                    <div className="flex flex-col gap-1 border-t border-border-light dark:border-border-dark pt-4">
                        <button 
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-colors text-left"
                        >
                            <span className="material-symbols-outlined">logout</span>
                            <p className="text-sm font-medium">Logout</p>
                        </button>
                    </div>
                </div>
            </aside>

            {/* --- MAIN CONTENT AREA --- */}
            {/* margin-left-64 để nội dung không bị sidebar che mất */}
            <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen bg-background-light dark:bg-background-dark">
                <div className="w-full max-w-5xl mx-auto animate-in fade-in zoom-in-95 duration-300">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default TechnicianLayout;