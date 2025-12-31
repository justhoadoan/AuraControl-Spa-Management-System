import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import { useToast } from '../../Components/common/Toast';

const TechnicianManagement = () => {
    const toast = useToast();

    // --- TABS STATE ---
    const [activeTab, setActiveTab] = useState('list');

    // --- TECHNICIAN STATE ---
    const [technicians, setTechnicians] = useState([]);
    const [services, setServices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // --- ABSENCE REQUESTS STATE ---
    const [absenceRequests, setAbsenceRequests] = useState([]);
    const [isLoadingAbsences, setIsLoadingAbsences] = useState(false);
    const [processingRequestIds, setProcessingRequestIds] = useState([]);

    // --- PAGINATION & FILTER STATE (NEW) ---
    // 1. Mặc định lọc PENDING khi mới vào
    const [filterStatus, setFilterStatus] = useState('PENDING'); 
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // --- MODAL & FORM STATE ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({ fullName: '', email: '', password: '', serviceIds: [] });

    // ===========================
    // 1. API CALLS
    // ===========================

    // Fetch Technicians
    const fetchTechnicians = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await api.get('/admin/technicians?size=100');
            setTechnicians(response.data.content);
        } catch (error) {
            console.error("Error fetching technicians:", error);
            toast.error("Failed to load technicians.");
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch Services
    const fetchServices = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await api.get('/admin/services');
            setServices(response.data);
        } catch (error) {
            console.error("Error fetching services:", error);
        }
    };

    // Fetch Absence Requests (UPDATED)
    const fetchAbsenceRequests = async (page = 0, status = 'PENDING') => {
        setIsLoadingAbsences(true);
        try {
            const token = localStorage.getItem('token');
            
            // Chuẩn bị params
            const params = {
                page: page,
                size: 20, // Kích thước trang mặc định cho production
            };
            // Nếu status khác 'ALL' thì mới gửi param status
            if (status && status !== 'ALL') {
                params.status = status;
            }

            const response = await api.get('/admin/absence-requests', {
                params: params 
            });

            // --- QUAN TRỌNG: Sửa lại cách lấy dữ liệu theo JSON của bạn ---
            // JSON: { content: [...], page: { totalElements: 50, ... } }
            
            setAbsenceRequests(response.data.content || []);
            
            // Lấy thông tin phân trang từ object "page"
            if (response.data.page) {
                setTotalPages(response.data.page.totalPages);
                setTotalElements(response.data.page.totalElements);
            } else {
                // Fallback nếu API thay đổi cấu trúc
                setTotalPages(0);
                setTotalElements(0);
            }

        } catch (error) {
            console.error("Error fetching absences:", error);
            toast.error("Failed to load absence requests.");
        } finally {
            setIsLoadingAbsences(false);
        }
    };

    // Initial Load
    useEffect(() => {
        fetchTechnicians();
        fetchServices();
        // Không gọi fetchAbsenceRequests ở đây nữa vì useEffect dưới sẽ lo
    }, []);

    // Effect: Tự động gọi API khi đổi Tab, đổi Trang, hoặc đổi Filter
    useEffect(() => {
        if (activeTab === 'absences') {
            fetchAbsenceRequests(currentPage, filterStatus);
        }
    }, [currentPage, filterStatus, activeTab]);

    // ===========================
    // 2. HANDLERS
    // ===========================

    const handleFilterChange = (e) => {
        setFilterStatus(e.target.value);
        setCurrentPage(0); // Reset về trang 1 khi đổi bộ lọc
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleReviewRequest = async (id, action) => {
        setProcessingRequestIds(prev => [...prev, id]);
        
        // Optimistic UI Update (Cập nhật giao diện ngay lập tức)
        const originalRequest = absenceRequests.find(req => req.requestId === id);
        const originalStatus = originalRequest?.status;
        const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';

        setAbsenceRequests(prev => prev.map(req => req.requestId === id ? { ...req, status: newStatus } : req));
        
        try {
            const token = localStorage.getItem('token');
            await api.put(`/admin/absence-requests/${id}/${action}`, {});
            toast.success(`Request ${action}d successfully.`);
            
            // Reload lại dữ liệu để cập nhật danh sách chuẩn từ server
            fetchAbsenceRequests(currentPage, filterStatus);

        } catch (error) {
            console.error(`Error ${action}ing request:`, error);
            const msg = error.response?.data?.message || "Operation failed.";
            toast.error(msg);
            
            // Revert nếu lỗi
            if (originalStatus) {
                setAbsenceRequests(prev => prev.map(req => req.requestId === id ? { ...req, status: originalStatus } : req));
            }
        } finally {
            setProcessingRequestIds(prev => prev.filter(reqId => reqId !== id));
        }
    };

    // Helper functions
    const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-GB') : '';
    const getStatusBadge = (status) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'REJECTED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
        }
    };

    // Technician Form Handlers
    const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleServiceChange = (e) => {
        const val = parseInt(e.target.value);
        setFormData(prev => ({
            ...prev,
            serviceIds: e.target.checked ? [...prev.serviceIds, val] : prev.serviceIds.filter(id => id !== val)
        }));
    };
    const openModal = (tech = null) => {
        setIsEditing(!!tech);
        setCurrentId(tech?.technicianId || null);
        setFormData(tech ? { fullName: tech.fullName, email: tech.email, password: '', serviceIds: tech.serviceIds || [] } 
                         : { fullName: '', email: '', password: '', serviceIds: [] });
        setIsModalOpen(true);
    };
    const closeModal = () => setIsModalOpen(false);
    const handleDelete = async (id) => {
        if(!window.confirm("Are you sure?")) return;
        try {
            const token = localStorage.getItem('token');
            await api.delete(`/admin/technicians/${id}`);
            toast.success("Technician deleted successfully!");
            fetchTechnicians();
        } catch (error) { toast.error("Failed to delete technician."); }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            if (isEditing) {
                await api.put(`/admin/technicians/${currentId}`, formData);
            } else {
                await api.post('/admin/technicians', formData);
            }
            toast.success(isEditing ? "Updated!" : "Created!");
            fetchTechnicians();
            closeModal();
        } catch (err) { toast.error(err.response?.data?.message || "Operation failed."); }
    };

    return (
        <>
            {/* --- PAGE HEADER --- */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                <h1 className="text-[#1b0d12] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                    Technician Management
                </h1>
                {activeTab === 'list' && (
                    <button onClick={() => openModal()} className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-6 bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors">
                        <span className="material-symbols-outlined mr-2">add</span><span className="truncate">Add New Technician</span>
                    </button>
                )}
            </div>

            {/* --- TABS --- */}
            <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 mb-6">
                <button
                    className={`pb-2 px-1 text-sm font-medium transition-colors ${activeTab === 'list' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                    onClick={() => setActiveTab('list')}
                >
                    Technician List
                </button>
                <button
                    className={`pb-2 px-1 text-sm font-medium transition-colors ${activeTab === 'absences' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                    onClick={() => setActiveTab('absences')}
                >
                    Absence Requests
                    {/* Badge hiển thị số lượng theo bộ lọc hiện tại (PENDING/APPROVED/...) */}
                    {totalElements > 0 && (
                        <span className={`ml-2 text-xs font-bold px-2 py-0.5 rounded-full ${
                            filterStatus === 'PENDING' ? 'bg-red-100 text-red-600' :
                            filterStatus === 'APPROVED' ? 'bg-green-100 text-green-600' :
                            filterStatus === 'REJECTED' ? 'bg-gray-100 text-gray-600' :
                            'bg-blue-100 text-blue-600'
                        }`}>
                            {totalElements}
                        </span>
                    )}
                </button>
            </div>

            {/* --- CONTENT AREA --- */}
            <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                
                {/* 1. TECHNICIAN LIST */}
                {activeTab === 'list' && (
                    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-4 py-3 text-sm font-semibold text-left dark:text-white">Name</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-left dark:text-white">Email</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-left dark:text-white">Specialization</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-right dark:text-white">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {isLoading ? (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-4 py-4 text-sm text-center text-gray-500 dark:text-gray-400"
                                        >
                                            Loading...
                                        </td>
                                    </tr>
                                ) : (
                                    technicians.map((tech) => (
                                        <tr key={tech.technicianId} className="hover:bg-primary/5">
                                            <td className="px-4 py-4 text-sm font-bold dark:text-gray-100">{tech.fullName}</td>
                                            <td className="px-4 py-4 text-sm dark:text-gray-400">{tech.email}</td>
                                            <td className="px-4 py-4">
                                                <div className="flex gap-2">
                                                    {tech.serviceNames?.map((s, i) => (
                                                        <span
                                                            key={i}
                                                            className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded"
                                                        >
                                                            {s}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => openModal(tech)}
                                                        className="text-primary"
                                                    >
                                                        <span className="material-symbols-outlined">edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(tech.technicianId)}
                                                        className="text-red-500"
                                                    >
                                                        <span className="material-symbols-outlined">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* 2. ABSENCE REQUESTS LIST (WITH FILTER & PAGINATION) */}
                {activeTab === 'absences' && (
                    <div>
                        {/* Filter Bar */}
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm text-gray-500">
                                Found <b>{totalElements}</b> request(s) for <b>{filterStatus || 'ALL'}</b>
                            </span>
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium dark:text-gray-300">Filter Status:</label>
                                <select 
                                    value={filterStatus}
                                    onChange={handleFilterChange}
                                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="PENDING">Pending</option>
                                    <option value="APPROVED">Approved</option>
                                    <option value="REJECTED">Rejected</option>
                                    <option value="ALL">All Requests</option>
                                </select>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-4 py-3 text-sm font-semibold text-left dark:text-white">Technician</th>
                                        <th className="px-4 py-3 text-sm font-semibold text-left dark:text-white">Reason</th>
                                        <th className="px-4 py-3 text-sm font-semibold text-left dark:text-white">Duration</th>
                                        <th className="px-4 py-3 text-sm font-semibold text-center dark:text-white">Status</th>
                                        <th className="px-4 py-3 text-sm font-semibold text-right dark:text-white">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {isLoadingAbsences ? (
                                        <tr><td colSpan="5" className="text-center py-8">Loading requests...</td></tr>
                                    ) : absenceRequests.length === 0 ? (
                                        <tr><td colSpan="5" className="text-center py-8">No absence requests found.</td></tr>
                                    ) : absenceRequests.map((req) => (
                                        <tr key={req.requestId} className="hover:bg-primary/5 transition-colors">
                                            <td className="px-4 py-4 text-sm font-bold dark:text-gray-100">{req.technicianName}</td>
                                            <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs" title={req.reason}>{req.reason}</td>
                                            <td className="px-4 py-4 text-sm dark:text-gray-400">{formatDate(req.startDate)} - {formatDate(req.endDate)}</td>
                                            <td className="px-4 py-4 text-center"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(req.status)}`}>{req.status}</span></td>
                                            <td className="px-4 py-4 text-right">
                                                {req.status === 'PENDING' && (
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => handleReviewRequest(req.requestId, 'approve')} disabled={processingRequestIds.includes(req.requestId)} className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded text-xs font-bold transition-colors disabled:opacity-50">Approve</button>
                                                        <button onClick={() => handleReviewRequest(req.requestId, 'reject')} disabled={processingRequestIds.includes(req.requestId)} className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded text-xs font-bold transition-colors disabled:opacity-50">Reject</button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        {totalElements > 0 && (
                            <div className="flex items-center justify-between mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Page <span className="font-medium text-gray-900 dark:text-white">{currentPage + 1}</span> of <span className="font-medium text-gray-900 dark:text-white">{totalPages || 1}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 0}
                                        className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage >= totalPages - 1}
                                        className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal Add/Edit (Same as before) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closeModal}>
                    <div className="relative w-full max-w-2xl bg-white dark:bg-[#1e1e1e] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{isEditing ? 'Edit Technician' : 'Add New Technician'}</h3>
                            <button onClick={closeModal} className="text-gray-500 hover:text-primary"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Form fields ... (Giữ nguyên form như cũ) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2"><label className="block text-sm font-medium mb-1 dark:text-gray-300">Full Name</label><input type="text" name="fullName" required value={formData.fullName} onChange={handleInputChange} className="w-full rounded-lg border-gray-300 dark:bg-gray-900" /></div>
                                    <div className="md:col-span-2"><label className="block text-sm font-medium mb-1 dark:text-gray-300">Email</label><input type="email" name="email" required value={formData.email} onChange={handleInputChange} disabled={isEditing} className={`w-full rounded-lg border border-gray-300 px-3 py-2 ${isEditing ? 'opacity-50' : ''}`} /></div>
                                    <div className="md:col-span-2"><label className="block text-sm font-medium mb-1 dark:text-gray-300">Password</label><input type="password" name="password" required={!isEditing} value={formData.password} onChange={handleInputChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:bg-gray-900" /></div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-2 dark:text-gray-300">Specializations</label>
                                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 border rounded-lg bg-gray-50 dark:bg-gray-900">
                                            {services.map(s => (
                                                <div key={s.serviceId} className="flex items-center">
                                                    <input type="checkbox" value={s.serviceId} checked={formData.serviceIds.includes(s.serviceId)} onChange={handleServiceChange} className="text-primary rounded" />
                                                    <label className="ml-2 text-sm dark:text-gray-300">{s.name}</label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg border hover:bg-gray-100">Cancel</button>
                                    <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TechnicianManagement;