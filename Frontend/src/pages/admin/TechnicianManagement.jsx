import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../Components/common/Toast';

const TechnicianManagement = () => {
    const toast = useToast();

    // --- TABS STATE ---
    const [activeTab, setActiveTab] = useState('list'); // 'list' | 'absences'

    // --- TECHNICIAN STATE ---
    const [technicians, setTechnicians] = useState([]);
    const [services, setServices] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);

    // --- ABSENCE REQUESTS STATE ---
    const [absenceRequests, setAbsenceRequests] = useState([]);
    const [isLoadingAbsences, setIsLoadingAbsences] = useState(false);
    const [processingRequestIds, setProcessingRequestIds] = useState([]);

    // --- MODAL & FORM STATE ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        serviceIds: [] 
    });

    // ===========================
    // 1. API CALLS
    // ===========================

    // Fetch Technicians
    const fetchTechnicians = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8081/api/admin/technicians?size=100', {
                headers: { Authorization: `Bearer ${token}` }
            });
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
            const response = await axios.get('http://localhost:8081/api/admin/services', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setServices(response.data);
        } catch (error) {
            console.error("Error fetching services:", error);
        }
    };

    // Fetch Absence Requests (NEW)
    const fetchAbsenceRequests = async () => {
        setIsLoadingAbsences(true);
        try {
            const token = localStorage.getItem('token');
            // Mặc định lấy tất cả hoặc lọc theo status nếu cần
            const response = await axios.get('http://localhost:8081/api/admin/absence-requests', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAbsenceRequests(response.data);
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
        fetchAbsenceRequests(); // Load sẵn dữ liệu nghỉ phép
    }, []);

    // ===========================
    // 2. ABSENCE HANDLERS (NEW)
    // ===========================

    const handleReviewRequest = async (id, action) => {
        // Mark this request as processing
        setProcessingRequestIds(prev => [...prev, id]);
        
        // Store original status for potential rollback
        const originalRequest = absenceRequests.find(req => req.requestId === id);
        const originalStatus = originalRequest?.status;
        
        // Optimistically update the UI
        const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';
        setAbsenceRequests(prev => 
            prev.map(req => 
                req.requestId === id 
                    ? { ...req, status: newStatus }
                    : req
            )
        );
        
        try {
            const token = localStorage.getItem('token');
            // action: 'approve' or 'reject'
            await axios.put(`http://localhost:8081/api/admin/absence-requests/${id}/${action}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            toast.success(`Request ${action}d successfully.`);
        } catch (error) {
            console.error(`Error ${action}ing request:`, error);
            const msg = error.response?.data?.message || "Operation failed.";
            toast.error(msg);
            
            // Revert to original status on error
            if (originalStatus) {
                setAbsenceRequests(prev => 
                    prev.map(req => 
                        req.requestId === id 
                            ? { ...req, status: originalStatus }
                            : req
                    )
                );
            }
        } finally {
            // Remove from processing array
            setProcessingRequestIds(prev => prev.filter(reqId => reqId !== id));
        }
    };

    // Helper format date
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-GB');
    };

    // Helper status badge color
    const getStatusBadge = (status) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'REJECTED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
        }
    };

    // ===========================
    // 3. TECHNICIAN HANDLERS
    // ===========================

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleServiceChange = (e) => {
        const selectedId = parseInt(e.target.value);
        const isChecked = e.target.checked;
        setFormData(prev => {
            const currentIds = prev.serviceIds || [];
            if (isChecked) {
                if (currentIds.includes(selectedId)) return prev;
                return { ...prev, serviceIds: [...currentIds, selectedId] };
            } else {
                return { ...prev, serviceIds: currentIds.filter(id => id !== selectedId) };
            }
        });
    };

    const openModal = (tech = null) => {
        if (tech) {
            setIsEditing(true);
            setCurrentId(tech.technicianId);
            setFormData({
                fullName: tech.fullName,
                email: tech.email,
                password: '',
                serviceIds: tech.serviceIds || []
            });
        } else {
            setIsEditing(false);
            setCurrentId(null);
            setFormData({ fullName: '', email: '', password: '', serviceIds: [] });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8081/api/admin/technicians/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Technician deleted successfully!");
            fetchTechnicians();
        } catch (error) {
            console.error("Failed to delete technician:", error);
            toast.error("Failed to delete technician.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        try {
            if (isEditing) {
                await axios.put(`http://localhost:8081/api/admin/technicians/${currentId}`, formData, { headers });
                toast.success("Technician updated successfully!");
            } else {
                await axios.post('http://localhost:8081/api/admin/technicians', formData, { headers });
                toast.success("Technician created successfully!");
            }
            fetchTechnicians();
            closeModal();
        } catch (error) {
            toast.error(error.response?.data?.message || "Operation failed.");
        }
    };

    return (
        <>
            {/* --- PAGE HEADER --- */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                <h1 className="text-[#1b0d12] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                    Technician Management
                </h1>
                
                {/* Only show Add button in List Tab */}
                {activeTab === 'list' && (
                    <button 
                        onClick={() => openModal()}
                        className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-6 bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors"
                    >
                        <span className="material-symbols-outlined mr-2">add</span>
                        <span className="truncate">Add New Technician</span>
                    </button>
                )}
            </div>

            {/* --- TABS --- */}
            <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 mb-6">
                <button
                    className={`pb-2 px-1 text-sm font-medium transition-colors ${
                        activeTab === 'list' 
                        ? 'border-b-2 border-primary text-primary' 
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                    onClick={() => setActiveTab('list')}
                >
                    Technician List
                </button>
                <button
                    className={`pb-2 px-1 text-sm font-medium transition-colors ${
                        activeTab === 'absences' 
                        ? 'border-b-2 border-primary text-primary' 
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                    onClick={() => setActiveTab('absences')}
                >
                    Absence Requests
                    {absenceRequests.filter(r => r.status === 'PENDING').length > 0 && (
                        <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                            {absenceRequests.filter(r => r.status === 'PENDING').length}
                        </span>
                    )}
                </button>
            </div>

            {/* --- CONTENT AREA --- */}
            <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                
                {/* 1. TECHNICIAN LIST TAB */}
                {activeTab === 'list' && (
                    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-4 py-3 text-sm font-semibold text-left text-gray-900 dark:text-gray-100">Name</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-left text-gray-900 dark:text-gray-100">Email</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-left text-gray-900 dark:text-gray-100">Specialization</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-right text-gray-900 dark:text-gray-100">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {isLoading ? (
                                    <tr><td colSpan="4" className="text-center py-8 text-gray-500">Loading...</td></tr>
                                ) : technicians.map((tech) => (
                                    <tr key={tech.technicianId} className="hover:bg-primary/5 transition-colors">
                                        <td className="px-4 py-4 text-sm font-bold text-gray-900 dark:text-gray-100">
                                            {tech.fullName}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {tech.email}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                {tech.serviceNames?.map((s, i) => (
                                                    <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded dark:bg-blue-900/30 dark:text-blue-300">{s}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => openModal(tech)} className="text-primary hover:bg-primary/10 p-1 rounded"><span className="material-symbols-outlined text-lg">edit</span></button>
                                                <button onClick={() => handleDelete(tech.technicianId)} className="text-red-500 hover:bg-red-50 p-1 rounded"><span className="material-symbols-outlined text-lg">delete</span></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* 2. ABSENCE REQUESTS TAB */}
                {activeTab === 'absences' && (
                    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-4 py-3 text-sm font-semibold text-left text-gray-900 dark:text-gray-100">Technician</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-left text-gray-900 dark:text-gray-100">Reason</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-left text-gray-900 dark:text-gray-100">Duration</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-center text-gray-900 dark:text-gray-100">Status</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-right text-gray-900 dark:text-gray-100">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {isLoadingAbsences ? (
                                    <tr><td colSpan="5" className="text-center py-8 text-gray-500">Loading requests...</td></tr>
                                ) : absenceRequests.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center py-8 text-gray-500">No absence requests found.</td></tr>
                                ) : absenceRequests.map((req) => (
                                    <tr key={req.requestId} className="hover:bg-primary/5 transition-colors">
                                        <td className="px-4 py-4 text-sm font-bold text-gray-900 dark:text-gray-100">
                                            {req.technicianName}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate" title={req.reason}>
                                            {req.reason}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {formatDate(req.startDate)} - {formatDate(req.endDate)}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(req.status)}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            {req.status === 'PENDING' && (
                                                <div className="flex justify-end gap-2">
                                                    <button 
                                                        onClick={() => handleReviewRequest(req.requestId, 'approve')}
                                                        disabled={processingRequestIds.includes(req.requestId)}
                                                        className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {processingRequestIds.includes(req.requestId) ? 'Processing...' : 'Approve'}
                                                    </button>
                                                    <button 
                                                        onClick={() => handleReviewRequest(req.requestId, 'reject')}
                                                        disabled={processingRequestIds.includes(req.requestId)}
                                                        className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {processingRequestIds.includes(req.requestId) ? 'Processing...' : 'Reject'}
                                                    </button>
                                                </div>
                                            )}
                                            {req.status !== 'PENDING' && (
                                                <span className="text-xs text-gray-400 italic">Reviewed</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* --- MODAL ADD/EDIT TECHNICIAN (Only visible when open) --- */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    onClick={closeModal}
                >
                    <div
                        className="relative w-full max-w-2xl bg-white dark:bg-[#1e1e1e] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {isEditing ? 'Edit Technician' : 'Add New Technician'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-500 hover:text-primary"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Form fields giữ nguyên như cũ... */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Full Name</label>
                                        <input type="text" name="fullName" required value={formData.fullName} onChange={handleInputChange} className="w-full rounded-lg border-gray-300 dark:bg-gray-900" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            disabled={isEditing}
                                            className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label htmlFor="password" className="block text-sm font-medium mb-1 dark:text-gray-300">{isEditing ? 'New Password' : 'Password'}</label>
                                        <input
                                            id="password"
                                            type="password"
                                            name="password"
                                            required={!isEditing}
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                    </div>
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
                                    <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg border hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">Cancel</button>
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