import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
   // --- STATE ---
    const [appointments, setAppointments] = useState([]);
    const [stats, setStats] = useState({
        todayRevenue: 0,
        todayAppointments: 0,
        newCustomers: 0
    }); // - State for Stats
    
    const [isLoading, setIsLoading] = useState(true);
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
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                // 1. Fetch Upcoming Appointments (Existing logic)
                const appointmentsRes = await axios.get('http://localhost:8081/api/admin/dashboard/upcoming-appointments', { headers });
                setAppointments(appointmentsRes.data);

                // 2. Fetch Dashboard Stats (NEW LOGIC)
                const statsRes = await axios.get('http://localhost:8081/api/admin/dashboard/stats', { headers });
                setStats(statsRes.data);

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

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

    // Logic to calculate bar height
    const currentChartData = chartDatasets[chartRange];
    const maxChartValue = Math.max(...currentChartData.values) || 1;

    return (
        <>
            {/* --- PAGE HEADING --- */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                <div className="flex flex-col">
                    <h1 className="text-text-primary-light dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                        Dashboard
                    </h1>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark text-base font-normal leading-normal mt-1">
                        Welcome back, Admin. Here's a look at your business today.
                    </p>
                </div>
            </div>

            {/* --- STATS CARDS (Static placeholders - Connect API here if needed) --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Card 1: Today's Revenue */}
                <div className="flex flex-col gap-2 rounded-xl p-6 border bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark shadow-sm">
                    <p className="text-text-primary-light dark:text-white text-base font-medium leading-normal">Today's Revenue</p>
                    <p className="text-text-primary-light dark:text-white tracking-light text-3xl font-bold leading-tight">
                        ${stats.todayRevenue ? stats.todayRevenue.toLocaleString() : '0'}
                    </p>
                </div>

                {/* Card 2: New Appointments (Today's Appointments) */}
                <div className="flex flex-col gap-2 rounded-xl p-6 border bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark shadow-sm">
                    <p className="text-text-primary-light dark:text-white text-base font-medium leading-normal">Today's Appointments</p>
                    <p className="text-text-primary-light dark:text-white tracking-light text-3xl font-bold leading-tight">
                        {stats.todayAppointments}
                    </p>
                </div>

                {/* Card 3: New Customers */}
                <div className="flex flex-col gap-2 rounded-xl p-6 border bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark shadow-sm">
                    <p className="text-text-primary-light dark:text-white text-base font-medium leading-normal">New Customers</p>
                    <p className="text-text-primary-light dark:text-white tracking-light text-3xl font-bold leading-tight">
                        {stats.newCustomers}
                    </p>
                </div>

                {/* Card 4: Pending Requests (Static or Need another API) */}
                <div className="flex flex-col gap-2 rounded-xl p-6 border bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark shadow-sm">
                    <p className="text-text-primary-light dark:text-white text-base font-medium leading-normal">Pending Requests</p>
                    <p className="text-text-primary-light dark:text-white tracking-light text-3xl font-bold leading-tight">
                        - 
                    </p>
                </div>
            </div>

            {/* --- REVENUE CHART --- */}
            <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-6 mb-8 shadow-sm">
                <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                    <h2 className="text-text-primary-light dark:text-white text-lg font-bold leading-tight">Revenue Overview</h2>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-text-secondary-light dark:text-text-secondary-dark">Range:</span>
                        <div className="inline-flex rounded-full border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-0.5">
                            {['week', 'month', 'year'].map((range) => (
                                <button
                                    key={range}
                                    type="button"
                                    onClick={() => setChartRange(range)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                                        chartRange === range 
                                        ? 'bg-primary text-white' 
                                        : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                
                {/* Chart Bars */}
                <div className="flex items-end justify-between gap-3 h-64 px-4 pb-4 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark">
                    {currentChartData.labels.map((label, index) => {
                        const value = currentChartData.values[index];
                        const heightPercent = (value / maxChartValue) * 100;
                        
                        return (
                            <div key={index} className="flex flex-1 flex-col items-center justify-end gap-2 min-w-[2rem] h-full group">
                                {/* Tooltip Value */}
                                <div className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark opacity-0 group-hover:opacity-100 transition-opacity">
                                    ${value.toLocaleString()}
                                </div>
                                {/* Bar Track */}
                                <div className="w-6 h-full flex items-end justify-center overflow-hidden rounded-t-full bg-primary/10 dark:bg-primary/20 relative">
                                    {/* Bar Fill */}
                                    <div 
                                        className="w-full bg-primary dark:bg-primary rounded-t-full transition-all duration-500 ease-out"
                                        style={{ height: `${heightPercent}%` }}
                                    ></div>
                                </div>
                                {/* Label */}
                                <div className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
                                    {label}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* --- UPCOMING APPOINTMENTS TABLE --- */}
            <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-6 shadow-sm">
                <h2 className="text-text-primary-light dark:text-white text-lg font-bold leading-tight mb-4">Upcoming Appointments</h2>
                <div className="overflow-x-auto rounded-lg border border-border-light dark:border-border-dark">
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
                                <tr>
                                    <td colSpan="5" className="p-6 text-center text-text-secondary-light dark:text-text-secondary-dark">Loading appointments...</td>
                                </tr>
                            ) : appointments.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-6 text-center text-text-secondary-light dark:text-text-secondary-dark">No upcoming appointments found.</td>
                                </tr>
                            ) : (
                                appointments.map((appt) => (
                                    <tr key={appt.appointmentId} className="hover:bg-primary/5 transition-colors">
                                        <td className="p-3 text-sm text-text-primary-light dark:text-text-primary-dark">
                                            {formatTime(appt.startTime)}
                                        </td>
                                        <td className="p-3 text-sm text-text-primary-light dark:text-text-primary-dark font-medium">
                                            {appt.customerName}
                                        </td>
                                        <td className="p-3 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                            {appt.serviceName}
                                        </td>
                                        <td className="p-3 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                            {appt.technicianName}
                                        </td>
                                        <td className="p-3 text-sm">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appt.status)}`}>
                                                {appt.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default AdminDashboard;