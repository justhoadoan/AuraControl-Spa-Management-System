import React, { useState, useEffect } from 'react';
import api from '../../config/api';

const AdminAppointments = () => {
    // --- State Management ---
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Pagination State
    const [page, setPage] = useState(0);
    const [pageSize] = useState(20);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // Filter State
    const [keyword, setKeyword] = useState(''); // Input value
    const [searchKeyword, setSearchKeyword] = useState(''); // Value trigger API
    const [statusFilter, setStatusFilter] = useState('');

    // Modal State
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // --- Helpers ---
    const statusColors = {
        'PENDING': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        'CONFIRMED': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        'COMPLETED': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        'CANCELLED': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
        };
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    // --- API Call ---
    useEffect(() => {
        fetchAppointments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, searchKeyword, statusFilter]);

const fetchAppointments = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token'); 
            
            const params = {
                page: page,
                size: pageSize,
                keyword: searchKeyword,
                status: statusFilter || null 
            };

            const response = await api.get('/admin/appointments', {
                params: params
            });

            const data = response.data;

            // 1. Lấy danh sách Appointment
            setAppointments(data.content || []);

            // 2. Lấy thông tin Phân trang (SỬA Ở ĐÂY)
            if (data.page) {
                // Nếu JSON có dạng: { content: [...], page: { totalElements: ... } }
                setTotalPages(data.page.totalPages);
                setTotalElements(data.page.totalElements);
            } else {
                // Fallback cho trường hợp cũ: { content: [...], totalElements: ... }
                setTotalPages(data.totalPages || 0);
                setTotalElements(data.totalElements || 0);
            }

        } catch (error) {
            console.error("Error fetching appointments:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- Handlers ---
    const handleSearch = () => {
        setPage(0); // Reset về trang 1 khi search
        setSearchKeyword(keyword);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setPage(newPage);
        }
    };

    const openModal = (appointment) => {
        setSelectedAppointment(appointment);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedAppointment(null);
    };

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen text-text-primary-light dark:text-text-primary-dark font-display p-8">
            <div className="w-full max-w-7xl mx-auto">
                {/* Page Heading */}
                <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                    <h1 className="text-4xl font-black tracking-tighter">Appointments Management</h1>
                </div>

                <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 shadow-sm border border-border-light dark:border-border-dark">
                    
                    {/* Search and Filter Bar */}
                    <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between items-end md:items-center">
                        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto flex-1">
                            {/* Search Input */}
                            <label className="flex flex-col min-w-40 h-12 w-full max-w-md relative">
                                <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                                    <div className="text-text-secondary-light dark:text-text-secondary-dark flex bg-background-light dark:bg-background-dark items-center justify-center pl-4 rounded-l-lg border border-border-light dark:border-border-dark border-r-0">
                                        <span className="material-symbols-outlined">search</span>
                                    </div>
                                    <input 
                                        className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-text-primary-light dark:text-text-primary-dark focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark h-full placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark px-4 pl-2 text-base font-normal leading-normal" 
                                        placeholder="Search by customer, technician, or service..." 
                                        value={keyword}
                                        onChange={(e) => setKeyword(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                    />
                                </div>
                            </label>

                            {/* Status Filter Dropdown */}
                            <div className="h-12 w-full md:w-48">
                                <select 
                                    className="w-full h-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark px-4 focus:ring-2 focus:ring-primary/50"
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value);
                                        setPage(0); // Reset page
                                    }}
                                >
                                    <option value="">All Statuses</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="CONFIRMED">Confirmed</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>
                            </div>

                            <button 
                                onClick={handleSearch}
                                className="h-12 px-6 bg-primary text-white rounded-lg font-bold hover:bg-opacity-90 transition-colors"
                            >
                                Search
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="w-full overflow-hidden">
                        <div className="overflow-x-auto rounded-lg border border-border-light dark:border-border-dark">
                            <table className="w-full text-left">
                                <thead className="bg-background-light dark:bg-background-dark">
                                    <tr>
                                        <th className="px-4 py-3 text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">ID</th>
                                        <th className="px-4 py-3 text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">Customer</th>
                                        <th className="px-4 py-3 text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">Service</th>
                                        <th className="px-4 py-3 text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">Technician</th>
                                        <th className="px-4 py-3 text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">Date & Time</th>
                                        <th className="px-4 py-3 text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">Duration</th>
                                        <th className="px-4 py-3 text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">Price</th>
                                        <th className="px-4 py-3 text-sm font-semibold text-text-primary-light dark:text-text-primary-dark text-center">Status</th>
                                        <th className="px-4 py-3 text-sm font-semibold text-text-primary-light dark:text-text-primary-dark text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="9" className="text-center py-10 text-gray-500">Loading appointments...</td>
                                        </tr>
                                    ) : appointments.length === 0 ? (
                                        <tr>
                                            <td colSpan="9" className="text-center py-10 text-gray-500">No appointments found.</td>
                                        </tr>
                                    ) : (
                                        appointments.map((appt) => {
                                            const { date, time } = formatDateTime(appt.startTime);
                                            return (
                                                <tr key={appt.appointmentId} className="border-t border-border-light dark:border-border-dark hover:bg-primary/5 transition-colors">
                                                    <td className="h-[72px] px-4 py-2 text-sm font-medium">#{appt.appointmentId}</td>
                                                    <td className="h-[72px] px-4 py-2 text-sm font-medium">{appt.customerName}</td>
                                                    <td className="h-[72px] px-4 py-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">{appt.serviceName}</td>
                                                    <td className="h-[72px] px-4 py-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">{appt.technicianName}</td>
                                                    <td className="h-[72px] px-4 py-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                                        <div>{date}</div>
                                                        <div className="text-xs opacity-70">{time}</div>
                                                    </td>
                                                    <td className="h-[72px] px-4 py-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">{appt.duration} min</td>
                                                    <td className="h-[72px] px-4 py-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">{formatCurrency(appt.price)}</td>
                                                    <td className="h-[72px] px-4 py-2 text-sm text-center">
                                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${statusColors[appt.status] || 'bg-gray-100 text-gray-800'}`}>
                                                            {appt.status.charAt(0) + appt.status.slice(1).toLowerCase()}
                                                        </span>
                                                    </td>
                                                    <td className="h-[72px] px-4 py-2 text-sm font-bold text-right">
                                                        <button 
                                                            onClick={() => openModal(appt)}
                                                            className="text-primary hover:underline"
                                                        >
                                                            View Details
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination Controls */}

                    {/* Pagination */}
                    {!loading && totalElements > 0 && (
                        <div className="flex items-center justify-between pt-6">
                            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                Showing <span className="font-bold">{page * pageSize + 1}</span> to <span className="font-bold">{Math.min((page + 1) * pageSize, totalElements)}</span> of <span className="font-bold">{totalElements}</span> results
                            </p>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 0}
                                    className="flex size-10 items-center justify-center rounded-lg border border-border-light dark:border-border-dark text-text-secondary-light hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="material-symbols-outlined text-lg">chevron_left</span>
                                </button>
                                
                                <span className="text-sm font-medium px-2">Page {page + 1} of {totalPages}</span>

                                <button 
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page >= totalPages - 1}
                                    className="flex size-10 items-center justify-center rounded-lg border border-border-light dark:border-border-dark text-text-secondary-light hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="material-symbols-outlined text-lg">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- Appointment Details Modal --- */}
            {isModalOpen && selectedAppointment && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
                    <div 
                        className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()} // Prevent close on clicking content
                    >
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark p-6 flex justify-between items-center z-10">
                            <h2 className="text-2xl font-bold">Appointment Details</h2>
                            <button onClick={closeModal} className="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors">
                                <span className="material-symbols-outlined text-3xl">close</span>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6">
                            {/* ID & Status */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <label className="block text-sm font-semibold text-text-secondary-light dark:text-text-secondary-dark mb-1">Appointment ID</label>
                                    <p className="text-lg font-medium">#{selectedAppointment.appointmentId}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-text-secondary-light dark:text-text-secondary-dark mb-1 text-right">Status</label>
                                    <div className={`inline-flex px-3 py-1.5 rounded-full text-sm font-semibold ${statusColors[selectedAppointment.status]}`}>
                                        {selectedAppointment.status}
                                    </div>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="bg-background-light dark:bg-background-dark rounded-lg p-4">
                                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">person</span>
                                    Customer Information
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-text-secondary-light dark:text-text-secondary-dark">Name:</span>
                                        <span className="font-medium">{selectedAppointment.customerName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-text-secondary-light dark:text-text-secondary-dark">Email:</span>
                                        <span className="font-medium">{selectedAppointment.customerEmail || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Service Info */}
                            <div className="bg-background-light dark:bg-background-dark rounded-lg p-4">
                                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">spa</span>
                                    Service Information
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-text-secondary-light dark:text-text-secondary-dark">Service:</span>
                                        <span className="font-medium">{selectedAppointment.serviceName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-text-secondary-light dark:text-text-secondary-dark">Duration:</span>
                                        <span className="font-medium">{selectedAppointment.duration} minutes</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-text-secondary-light dark:text-text-secondary-dark">Price:</span>
                                        <span className="font-medium text-primary text-lg">{formatCurrency(selectedAppointment.price)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Technician & Time Info (Grid) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-background-light dark:bg-background-dark rounded-lg p-4">
                                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">badge</span>
                                        Technician
                                    </h3>
                                    <p className="font-medium">{selectedAppointment.technicianName}</p>
                                </div>

                                <div className="bg-background-light dark:bg-background-dark rounded-lg p-4">
                                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">schedule</span>
                                        Time
                                    </h3>
                                    <div className="space-y-1">
                                        <p className="text-sm"><span className="text-text-secondary-light">Start:</span> {formatDateTime(selectedAppointment.startTime).date} at {formatDateTime(selectedAppointment.startTime).time}</p>
                                        <p className="text-sm"><span className="text-text-secondary-light">End:</span> {formatDateTime(selectedAppointment.endTime).time}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-semibold text-text-secondary-light dark:text-text-secondary-dark mb-2">Notes</label>
                                <p className="text-sm bg-background-light dark:bg-background-dark rounded-lg p-4 min-h-[60px]">
                                    {selectedAppointment.note || 'No additional notes.'}
                                </p>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-surface-light dark:bg-surface-dark border-t border-border-light dark:border-border-dark p-6">
                            <button onClick={closeModal} className="w-full bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAppointments;