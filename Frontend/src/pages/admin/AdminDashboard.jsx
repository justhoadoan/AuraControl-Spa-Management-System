import React, { useState, useEffect, useRef } from 'react';
import api from '../../config/api';

const AdminDashboard = () => {
   // --- STATE ---
    const [appointments, setAppointments] = useState([]);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(10); // Dashboard thường chỉ hiện 5-10 dòng
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [stats, setStats] = useState({
        todayRevenue: 0,
        todayAppointments: 0,
        newCustomers: 0,
        pendingRequests: 0
    }); // - State for Stats
    const isInitialMount = useRef(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isRevenueLoading, setIsRevenueLoading] = useState(true);
    const [chartRange, setChartRange] = useState('week'); // 'week', 'month', 'year'
    const [revenueData, setRevenueData] = useState({ labels: [], values: [] });

    // --- CHART DATA (Static for now, moved from HTML script) ---
    const chartDatasets = {
        week: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            values: [180, 220, 150, 260, 310, 280, 190]
        },
        month: {
            labels: ['W1', 'W2', 'W3', 'W4'],
            values: [3200, 2800, 3500, 3900]
        },
        year: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            values: [12000, 11500, 14000, 15500, 16200, 17000, 18000, 17500, 16000, 15800, 14900, 16500]
        }
    };

    // --- API CALLS ---
    // 1. Fetch Dashboard Stats (Chỉ chạy 1 lần khi mount)
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };
                const statsRes = await api.get('/admin/dashboard/stats');
                setStats(statsRes.data);
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        };
        fetchStats();
    }, []);

    // 2. Fetch Appointments (Chạy khi currentPage thay đổi)
    useEffect(() => {
        const fetchAppointments = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };
                
                // Gọi API với tham số phân trang
                const response = await api.get('/admin/dashboard/upcoming-appointments', { 
                    params: { 
                        page: currentPage, 
                        size: pageSize 
                    } 
                });

                const data = response.data;

                // --- XỬ LÝ DỮ LIỆU TRẢ VỀ (QUAN TRỌNG) ---
                // Case 1: Backend trả về Page object chuẩn (Spring Data cũ hoặc tự custom DTO)
                if (data.content && Array.isArray(data.content)) {
                    setAppointments(data.content);
                    
                    // Kiểm tra cấu trúc phân trang (fix lỗi NaN)
                    if (data.page) {
                        // Cấu trúc Spring Boot 3 + VIA_DTO
                        setTotalPages(data.page.totalPages);
                        setTotalElements(data.page.totalElements);
                    } else {
                        // Cấu trúc Spring cũ
                        setTotalPages(data.totalPages || 0);
                        setTotalElements(data.totalElements || 0);
                    }
                } 
                // Case 2: Backend trả về List thuần túy (Chưa hỗ trợ phân trang server)
                else if (Array.isArray(data)) {
                    // Client-side pagination (Fallback)
                    setTotalElements(data.length);
                    setTotalPages(Math.ceil(data.length / pageSize));
                    const start = currentPage * pageSize;
                    const end = start + pageSize;
                    setAppointments(data.slice(start, end));
                }

            } catch (error) {
                console.error("Error fetching appointments:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAppointments();
    }, [currentPage, pageSize]); // Dependency: currentPage

    // 3. Fetch Revenue (Giữ nguyên)
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        const fetchRevenue = async () => {
            setIsRevenueLoading(true);
            try {
                const token = localStorage.getItem('token');
                const response = await api.get('/admin/dashboard/revenue-chart', {
                    params: { period: chartRange.toUpperCase() }
                });
                const labels = response.data.map(item => item.label);
                const values = response.data.map(item => item.value);
                setRevenueData({ labels, values });
            } catch (error) {
                console.error(error);
            } finally {
                setIsRevenueLoading(false);
            }
        };
        fetchRevenue();
    }, [chartRange]);

    // --- HELPERS ---
    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'CONFIRMED': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
            case 'PENDING': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'COMPLETED': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
            case 'CANCELLED': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
        }
    };

    const maxChartValue = Math.max(...(revenueData.values || [0]), 1);

    // --- HANDLERS ---
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <>
            {/* Page Heading & Stats Cards (Giữ nguyên code cũ) */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                <div className="flex flex-col">
                    <h1 className="text-text-primary-light dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">Dashboard</h1>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark text-base font-normal leading-normal mt-1">Welcome back, Admin. Here's a look at your business today.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Card 1 */}
                <div className="flex flex-col gap-2 rounded-xl p-6 border bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark shadow-sm">
                    <p className="text-text-primary-light dark:text-white text-base font-medium leading-normal">Today's Revenue</p>
                    <p className="text-text-primary-light dark:text-white tracking-light text-2xl font-bold leading-tight truncate" title={`$${stats.todayRevenue}`}>${stats.todayRevenue ? stats.todayRevenue.toLocaleString() : '0'}</p>
                </div>
                {/* Card 2 */}
                <div className="flex flex-col gap-2 rounded-xl p-6 border bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark shadow-sm">
                    <p className="text-text-primary-light dark:text-white text-base font-medium leading-normal">Today's Appointments</p>
                    <p className="text-text-primary-light dark:text-white tracking-light text-2xl font-bold leading-tight">{stats.todayAppointments}</p>
                </div>
                {/* Card 3 */}
                <div className="flex flex-col gap-2 rounded-xl p-6 border bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark shadow-sm">
                    <p className="text-text-primary-light dark:text-white text-base font-medium leading-normal">New Customers</p>
                    <p className="text-text-primary-light dark:text-white tracking-light text-2xl font-bold leading-tight">{stats.newCustomers}</p>
                </div>
                {/* Card 4 */}
                <div className="flex flex-col gap-2 rounded-xl p-6 border bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark shadow-sm">
                    <p className="text-text-primary-light dark:text-white text-base font-medium leading-normal">Pending Requests</p>
                    <p className="text-text-primary-light dark:text-white tracking-light text-2xl font-bold leading-tight">{stats.pendingRequests || '-'}</p>
                </div>
            </div>

            {/* Revenue Chart (Giữ nguyên code cũ) */}
            <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-6 mb-8 shadow-sm">
                <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                    <h2 className="text-text-primary-light dark:text-white text-lg font-bold leading-tight">Revenue Overview</h2>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-text-secondary-light dark:text-text-secondary-dark">Range:</span>
                        <div className="inline-flex rounded-full border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-0.5">
                            {['week', 'month', 'year'].map((range) => (
                                <button key={range} type="button" onClick={() => setChartRange(range)} className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${chartRange === range ? 'bg-primary text-white' : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-200 dark:hover:bg-gray-700'}`}>{range}</button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex items-end justify-start gap-3 h-64 px-4 pb-4 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark overflow-x-auto">
                    {isRevenueLoading ? <div className="w-full h-full flex items-center justify-center"><p className="text-text-secondary-light dark:text-text-secondary-dark">Loading...</p></div> : 
                     revenueData.labels.length === 0 ? <div className="w-full h-full flex items-center justify-center"><p className="text-text-secondary-light dark:text-text-secondary-dark">No data.</p></div> : 
                     revenueData.labels.map((label, index) => {
                        const value = revenueData.values[index];
                        const heightPercent = (value / maxChartValue) * 100;
                        return (
                            <div key={index} className="flex flex-1 flex-col items-center justify-end gap-2 min-w-[2rem] h-full group">
                                <div className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark opacity-0 group-hover:opacity-100 transition-opacity">${value.toLocaleString()}</div>
                                <div className="w-6 h-full flex items-end justify-center overflow-hidden rounded-t-full bg-primary/10 dark:bg-primary/20 relative">
                                    <div className="w-full bg-primary dark:bg-primary rounded-t-full transition-all duration-500 ease-out" style={{ height: `${heightPercent}%` }}></div>
                                </div>
                                <div className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark">{label}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* --- UPCOMING APPOINTMENTS TABLE (CÓ PHÂN TRANG) --- */}
            <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-text-primary-light dark:text-white text-lg font-bold leading-tight">Upcoming Appointments</h2>
                </div>
                
                <div className="overflow-x-auto rounded-lg border border-border-light dark:border-border-dark mb-4">
                    <table className="w-full text-left">
                        <thead className="bg-background-light dark:bg-background-dark">
                            <tr className="border-b border-border-light dark:border-border-dark">
                                <th className="p-3 text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">Time</th>
                                <th className="p-3 text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">Customer</th>
                                <th className="p-3 text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">Service</th>
                                <th className="p-3 text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">Technician</th>
                                <th className="p-3 text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-light dark:divide-border-dark">
                            {isLoading ? (
                                <tr><td colSpan="5" className="p-6 text-center text-text-secondary-light dark:text-text-secondary-dark">Loading appointments...</td></tr>
                            ) : appointments.length === 0 ? (
                                <tr><td colSpan="5" className="p-6 text-center text-text-secondary-light dark:text-text-secondary-dark">No upcoming appointments found.</td></tr>
                            ) : (
                                appointments.map((appt) => (
                                    <tr key={appt.appointmentId || appt.id} className="hover:bg-primary/5 transition-colors">
                                        <td className="p-3 text-sm text-text-primary-light dark:text-text-primary-dark">{formatTime(appt.startTime)}</td>
                                        <td className="p-3 text-sm font-medium text-text-primary-light dark:text-text-primary-dark">{appt.customerName}</td>
                                        <td className="p-3 text-sm text-text-secondary-light dark:text-text-secondary-dark">{appt.serviceName}</td>
                                        <td className="p-3 text-sm text-text-secondary-light dark:text-text-secondary-dark">{appt.technicianName}</td>
                                        <td className="p-3 text-sm">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appt.status)}`}>{appt.status}</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* --- THANH PHÂN TRANG (Pagination Controls) --- */}
                {!isLoading && totalElements > 0 && (
                    <div className="flex items-center justify-between border-t border-border-light dark:border-border-dark pt-4">
                        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                            Showing <span className="font-bold text-text-primary-light dark:text-white">{currentPage * pageSize + 1}</span> to <span className="font-bold text-text-primary-light dark:text-white">{Math.min((currentPage + 1) * pageSize, totalElements)}</span> of <span className="font-bold text-text-primary-light dark:text-white">{totalElements}</span> results
                        </p>
                        
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 0}
                                className="p-2 rounded-lg border border-border-light dark:border-border-dark text-text-secondary-light hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg">chevron_left</span>
                            </button>
                            
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => {
                                    // Logic hiển thị trang đơn giản (1, 2, 3...)
                                    let pageNum = idx;
                                    // Nếu tổng trang > 5, dịch chuyển số trang khi currentPage tăng
                                    if (totalPages > 5 && currentPage > 2) {
                                        pageNum = currentPage - 2 + idx;
                                        // Giới hạn không vượt quá totalPages
                                        if (pageNum >= totalPages) return null;
                                    }
                                    
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`size-8 text-sm font-medium rounded-lg flex items-center justify-center transition-colors ${
                                                currentPage === pageNum 
                                                ? 'bg-primary text-white' 
                                                : 'text-text-secondary-light hover:bg-gray-100 dark:hover:bg-gray-800'
                                            }`}
                                        >
                                            {pageNum + 1}
                                        </button>
                                    );
                                })}
                            </div>

                            <button 
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= totalPages - 1}
                                className="p-2 rounded-lg border border-border-light dark:border-border-dark text-text-secondary-light hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg">chevron_right</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default AdminDashboard;