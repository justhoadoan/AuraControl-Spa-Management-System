import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../Components/common/Toast';

const CustomerManagement = () => {
    const toast = useToast();

    // --- STATE ---
    const [customers, setCustomers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    
    // Search State
    const [keyword, setKeyword] = useState('');

    // Modal State
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);

    // --- API CALLS ---

    // 1. Fetch Customers List
    const fetchCustomers = async (page = 0, search = '') => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            // Construct URL with query params
            let url = `http://localhost:8081/api/admin/customers?page=${page}&size=${pageSize}`;
            if (search) {
                url += `&keyword=${encodeURIComponent(search)}`;
            }

            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = response.data;
            setCustomers(data.content || []);
            setTotalPages(data.totalPages || 0);
            setTotalElements(data.totalElements || 0);
            setCurrentPage(data.number || 0);
        } catch (error) {
            console.error("Error fetching customers:", error);
            toast.error("Failed to load customers.");
        } finally {
            setIsLoading(false);
        }
    };

    // 2. Fetch Customer Detail (Booking History)
    const fetchCustomerDetail = async (userId) => {
        setIsLoadingDetail(true);
        setIsDetailModalOpen(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:8081/api/admin/customers/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedCustomer(response.data);
        } catch (error) {
            console.error("Error fetching customer details:", error);
            toast.error("Failed to load customer details.");
            setIsDetailModalOpen(false); // Close if error
        } finally {
            setIsLoadingDetail(false);
        }
    };

    // --- EFFECTS ---
    
    // Initial Load & Search Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCustomers(0, keyword);
        }, 500); // Debounce search for 500ms

        return () => clearTimeout(timer);
    }, [keyword, pageSize]); // Run when keyword or pageSize changes

    // --- HANDLERS ---

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            fetchCustomers(newPage, keyword);
        }
    };

    const handleSearchChange = (e) => {
        setKeyword(e.target.value);
    };

    const handleCloseModal = () => {
        setIsDetailModalOpen(false);
        setSelectedCustomer(null);
    };

    return (
        <>
            {/* --- PAGE HEADER --- */}
            <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                
                {/* --- SEARCH BAR --- */}
                <div className="mb-6">
                    <label className="flex flex-col min-w-40 h-12 w-full max-w-md">
                        <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                            <div className="text-gray-500 dark:text-gray-400 flex bg-gray-50 dark:bg-gray-900 items-center justify-center pl-4 rounded-l-lg border border-gray-200 dark:border-gray-700 border-r-0">
                                <span className="material-symbols-outlined">search</span>
                            </div>
                            <input 
                                className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 h-full placeholder:text-gray-400 px-4 pl-2 text-base font-normal leading-normal" 
                                placeholder="Search by name or email..." 
                                value={keyword}
                                onChange={handleSearchChange}
                            />
                        </div>
                    </label>
                </div>

                {/* --- TABLE --- */}
                <div className="w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Customer Name</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Email</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white text-center">Total Bookings</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-[#1e1e1e]">
                            {isLoading ? (
                                <tr><td colSpan="4" className="text-center py-8 text-gray-500">Loading customers...</td></tr>
                            ) : customers.length === 0 ? (
                                <tr><td colSpan="4" className="text-center py-8 text-gray-500">No customers found.</td></tr>
                            ) : (
                                customers.map((customer) => (
                                    <tr key={customer.userId} className="hover:bg-primary/5 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {customer.name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {customer.email}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                {customer.totalAppointments}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-right">
                                            <button 
                                                onClick={() => fetchCustomerDetail(customer.userId)}
                                                className="text-primary hover:text-primary/80 hover:underline transition-colors"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* --- PAGINATION --- */}
                {!isLoading && customers.length > 0 && (
                    <div className="flex items-center justify-between pt-6">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Showing {(currentPage || 0) * pageSize + 1} to {Math.min(((currentPage || 0) + 1) * pageSize, totalElements || 0)} of {totalElements || 0} results
                        </p>
                        <div className="flex items-center justify-center gap-2">
                            <button 
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 0}
                                className="flex size-10 items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg">chevron_left</span>
                            </button>
                            
                            {/* Simple Page Indicator */}
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Page {currentPage + 1} of {totalPages}
                            </span>

                            <button 
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages - 1}
                                className="flex size-10 items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg">chevron_right</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* --- CUSTOMER DETAIL MODAL --- */}
            {isDetailModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={handleCloseModal}></div>
                    <div className="relative w-full max-w-2xl bg-white dark:bg-[#1e1e1e] rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Customer Details</h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto">
                            {isLoadingDetail ? (
                                <div className="text-center py-10">Loading details...</div>
                            ) : selectedCustomer ? (
                                <div className="space-y-6">
                                    {/* Profile Info */}
                                    <div className="flex items-center gap-4 pb-6 border-b border-gray-100 dark:border-gray-700">
                                        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                                            {selectedCustomer.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-gray-900 dark:text-white">{selectedCustomer.name}</h4>
                                            <p className="text-gray-500 text-sm">{selectedCustomer.email}</p>
                                            <p className="text-gray-400 text-xs mt-1">User ID: #{selectedCustomer.userId}</p>
                                        </div>
                                    </div>

                                    {/* Appointment History */}
                                    <div>
                                        <h5 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary">history</span>
                                            Booking History
                                        </h5>
                                        
                                        {selectedCustomer.appointmentHistory && selectedCustomer.appointmentHistory.length > 0 ? (
                                            <div className="space-y-3">
                                                {selectedCustomer.appointmentHistory.map((appt) => (
                                                    <div key={appt.appointmentId} className="p-4 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:border-primary/30 transition-colors">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <span className="font-semibold text-gray-900 dark:text-white">{appt.serviceName}</span>
                                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                                                appt.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                                appt.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                                                'bg-blue-100 text-blue-700'
                                                            }`}>
                                                                {appt.status}
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                            <div className="flex items-center gap-1">
                                                                <span className="material-symbols-outlined text-xs">calendar_today</span>
                                                                {new Date(appt.startTime).toLocaleDateString()}
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <span className="material-symbols-outlined text-xs">schedule</span>
                                                                {new Date(appt.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <span className="material-symbols-outlined text-xs">person</span>
                                                                {appt.technicianName}
                                                            </div>
                                                            <div className="flex items-center gap-1 font-medium text-gray-900 dark:text-gray-200">
                                                                <span className="material-symbols-outlined text-xs">payments</span>
                                                                ${appt.price}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                                                No booking history found.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-red-500">Failed to load data.</div>
                            )}
                        </div>
                        
                        {/* Modal Footer */}
                        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                            <button 
                                onClick={handleCloseModal}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CustomerManagement;