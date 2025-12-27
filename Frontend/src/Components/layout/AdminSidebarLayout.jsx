import React, { useContext } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const AdminSidebarLayout = () => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Hàm để xử lý style cho Link (Active vs Inactive)
    const getNavLinkClass = ({ isActive }) => {
        const baseClass = "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors";
        const activeClass = "bg-primary/10 text-primary font-semibold";
        const inactiveClass = "text-gray-500 dark:text-gray-400 hover:bg-primary/20 hover:text-primary dark:hover:text-primary";
        
        return `${baseClass} ${isActive ? activeClass : inactiveClass}`;
    };

    return (
        <div className="relative flex min-h-screen w-full font-display bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark">
            
            {/* --- SIDEBAR --- */}
            <aside className="flex h-screen w-64 flex-col border-r border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark sticky top-0">
                <div className="flex flex-col gap-4 p-4 h-full">
                    
                    {/* Logo Section */}
                    <div className="flex items-center gap-3 px-2">
                        <span className="material-symbols-outlined text-primary text-3xl">spa</span>
                        <div className="flex flex-col">
                            <h1 className="text-base font-bold">Serenity Spa</h1>
                            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Admin Panel</p>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex flex-col gap-2 mt-4 flex-grow">
                        <NavLink to="/admin" end className={getNavLinkClass}>
                            <span className="material-symbols-outlined">dashboard</span>
                            <p className="text-sm font-medium">Dashboard</p>
                        </NavLink>

                        <NavLink to="/admin/appointments" className={getNavLinkClass}>
                            <span className="material-symbols-outlined">calendar_month</span>
                            <p className="text-sm font-medium">Appointments</p>
                        </NavLink>

                        <NavLink to="/admin/customers" className={getNavLinkClass}>
                            <span className="material-symbols-outlined fill">group</span>
                            <p className="text-sm font-medium">Customers</p>
                        </NavLink>

                        <NavLink to="/admin/services" className={getNavLinkClass}>
                            <span className="material-symbols-outlined">spa</span>
                            <p className="text-sm font-medium">Services</p>
                        </NavLink>

                        <NavLink to="/admin/technicians" className={getNavLinkClass}>
                            <span className="material-symbols-outlined">badge</span>
                            <p className="text-sm font-medium">Technicians</p>
                        </NavLink>

                        <NavLink to="/admin/resources" className={getNavLinkClass}>
                            <span className="material-symbols-outlined">bed</span>
                            <p className="text-sm font-medium">Resources</p>
                        </NavLink>
                    </nav>

                    {/* Bottom Links (Đã bỏ Settings) */}
                    <div className="flex flex-col gap-1">
                        <button 
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-primary/20 hover:text-primary dark:hover:text-primary transition-colors text-left"
                        >
                            <span className="material-symbols-outlined">logout</span>
                            <p className="text-sm font-medium">Logout</p>
                        </button>
                    </div>
                </div>
            </aside>

            {/* --- MAIN CONTENT AREA --- */}
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="w-full max-w-7xl mx-auto">
                    {/* Outlet sẽ hiển thị nội dung của các trang con (Dashboard, Services, Customers...) */}
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminSidebarLayout;