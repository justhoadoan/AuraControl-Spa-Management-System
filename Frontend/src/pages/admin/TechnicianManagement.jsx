import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../Components/common/Toast';

const TechnicianManagement = () => {
    const toast = useToast();

    // --- STATE ---
    const [technicians, setTechnicians] = useState([]);
    const [services, setServices] = useState([]); // List of available services for dropdown
    const [isLoading, setIsLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        serviceIds: [] // Array of Integer IDs
    });

    // --- API CALLS ---

    // 1. Fetch Technicians
    const fetchTechnicians = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8081/api/admin/technicians?size=100', { // Fetching more for simplicity
                headers: { Authorization: `Bearer ${token}` }
            });
            // Backend returns Page<TechnicianResponse>, so we access .content
            setTechnicians(response.data.content);
        } catch (error) {
            console.error("Error fetching technicians:", error);
            toast.error("Failed to load technicians.");
        } finally {
            setIsLoading(false);
        }
    };

    // 2. Fetch Services (for the Specialization dropdown)
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

    useEffect(() => {
        fetchTechnicians();
        fetchServices();
    }, []);

    // --- HANDLERS ---

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle multi-select for Services
    const handleServiceChange = (e) => {
        const selectedId = parseInt(e.target.value);
        const isChecked = e.target.checked;

        setFormData(prev => {
            if (isChecked) {
                return { ...prev, serviceIds: [...prev.serviceIds, selectedId] };
            } else {
                return { ...prev, serviceIds: prev.serviceIds.filter(id => id !== selectedId) };
            }
        });
    };

    // Open Modal (Create or Edit)
    const openModal = (tech = null) => {
        if (tech) {
            setIsEditing(true);
            setCurrentId(tech.technicianId);
            setFormData({
                fullName: tech.fullName,
                email: tech.email,
                password: '', // Leave blank if not changing
                serviceIds: tech.serviceIds || []
            });
        } else {
            setIsEditing(false);
            setCurrentId(null);
            setFormData({
                fullName: '',
                email: '',
                password: '',
                serviceIds: []
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    // Submit Form
    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        try {
            if (isEditing) {
                // UPDATE
                await axios.put(`http://localhost:8081/api/admin/technicians/${currentId}`, formData, { headers });
                toast.success("Technician updated successfully!");
            } else {
                // CREATE
                await axios.post('http://localhost:8081/api/admin/technicians', formData, { headers });
                toast.success("Technician created successfully!");
            }
            fetchTechnicians();
            closeModal();
        } catch (error) {
            console.error("Error saving technician:", error);
            const msg = error.response?.data?.message || "Operation failed.";
            toast.error(msg);
        }
    };

    return (
        <>
            {/* --- PAGE HEADER --- */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                <h1 className="text-[#1b0d12] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                    Technician Management
                </h1>
                <button 
                    onClick={() => openModal()}
                    className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-6 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors"
                >
                    <span className="material-symbols-outlined mr-2">add</span>
                    <span className="truncate">Add New Technician</span>
                </button>
            </div>

            {/* --- TABLE CONTAINER --- */}
            <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1e1e]">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100 text-left">Technician Name</th>
                                <th className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100 text-left">Email</th>
                                <th className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100 text-left">Specialization</th>
                                <th className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {isLoading ? (
                                <tr><td colSpan="4" className="text-center py-8 text-gray-500">Loading technicians...</td></tr>
                            ) : technicians.length === 0 ? (
                                <tr><td colSpan="4" className="text-center py-8 text-gray-500">No technicians found.</td></tr>
                            ) : (
                                technicians.map((tech) => (
                                    <tr key={tech.technicianId} className="hover:bg-primary/5 transition-colors">
                                        <td className="px-4 py-4 text-sm font-bold text-gray-900 dark:text-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-primary/10 rounded-full size-10 flex items-center justify-center text-primary font-bold">
                                                    {tech.fullName.charAt(0)}
                                                </div>
                                                <span>{tech.fullName}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {tech.email}
                                        </td>
                                        <td className="px-4 py-4 align-middle">
                                            <div className="flex flex-wrap gap-2">
                                                {tech.serviceNames && tech.serviceNames.length > 0 ? (
                                                    tech.serviceNames.map((serviceName, index) => (
                                                        <span key={index} className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/30 dark:text-blue-300">
                                                            {serviceName}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">No skills assigned</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 align-middle text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => openModal(tech)}
                                                    className="flex items-center justify-center size-8 rounded-lg text-primary hover:bg-primary/10 hover:text-primary transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-lg">edit</span>
                                                </button>
                                                {/* Delete button can be added here similar to ServiceManagement */}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={closeModal}></div>
                    
                    <div className="relative w-full max-w-2xl bg-white dark:bg-[#1e1e1e] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {isEditing ? 'Edit Technician' : 'Add New Technician'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-500 hover:text-primary transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Modal Form - Scrollable Content */}
                        <div className="p-6 overflow-y-auto">
                            <form id="technicianForm" onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                        <input 
                                            type="text" name="fullName" required
                                            value={formData.fullName} onChange={handleInputChange}
                                            className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
                                            placeholder="e.g., Olivia Chen"
                                        />
                                    </div>
                                    
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email (Account)</label>
                                        <input 
                                            type="email" name="email" required
                                            value={formData.email} onChange={handleInputChange}
                                            disabled={isEditing} // Often email is immutable or needs special handling
                                            className={`block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:border-primary focus:ring-primary ${isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                                            placeholder="e.g., olivia.c@serenespa.com"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            {isEditing ? 'New Password (leave blank to keep current)' : 'Password'}
                                        </label>
                                        <input 
                                            type="password" name="password" 
                                            required={!isEditing} // Required only for new tech
                                            value={formData.password} onChange={handleInputChange}
                                            className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
                                            placeholder={isEditing ? "********" : "Temporary password"}
                                        />
                                    </div>

                                    {/* Services Multi-Select */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Specializations (Services)</label>
                                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                            {services.map((service) => (
                                                <div key={service.id} className="flex items-center">
                                                    <input 
                                                        type="checkbox" 
                                                        id={`service-${service.id}`} 
                                                        value={service.id}
                                                        checked={formData.serviceIds.includes(service.id)}
                                                        onChange={handleServiceChange}
                                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                    />
                                                    <label htmlFor={`service-${service.id}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                                                        {service.name}
                                                    </label>
                                                </div>
                                            ))}
                                            {services.length === 0 && <p className="text-xs text-gray-500 col-span-2">No services available. Create services first.</p>}
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500">Select the services this technician can perform.</p>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800">
                            <button 
                                onClick={closeModal}
                                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-transparent text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSubmit} // Trigger form submit from outside
                                className="px-4 py-2 rounded-lg bg-primary text-sm font-bold text-white hover:bg-primary/90 transition-colors flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-sm">save</span>
                                <span>{isEditing ? 'Save Changes' : 'Create Technician'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TechnicianManagement;