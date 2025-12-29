import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../Components/common/Toast';

const ServiceManagement = () => {
    // --- TOAST NOTIFICATION ---
    const toast = useToast();
    
    // --- DATA STATE ---
    const [services, setServices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // --- MODAL & FORM STATE ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        durationMinutes: '',
        isActive: true
    });

    // --- 1. FETCH SERVICES (GET) ---
    const fetchServices = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/admin/services', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setServices(response.data);
            console.log("API response:", response.data);
        } catch (error) {
            console.error("Error fetching services:", error);
            toast.error("Failed to fetch services list.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    // --- 2. HANDLE INPUT CHANGE ---
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // --- 3. OPEN MODAL (ADD OR EDIT) ---
    const openModal = (service = null) => {
        if (service) {
            // Edit Mode
            setIsEditing(true);
            setCurrentId(service.serviceId); // Ensure your backend returns 'serviceId' or change to 'id'
            setFormData({
                name: service.name,
                description: service.description,
                price: service.price,
                durationMinutes: service.durationMinutes,
                isActive: service.isActive
            });
        } else {
            // Add New Mode
            setIsEditing(false);
            setCurrentId(null);
            setFormData({
                name: '', description: '', price: '', durationMinutes: '', isActive: true
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    // --- 4. SUBMIT FORM (POST / PUT) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        try {
            if (isEditing) {
                // UPDATE
                await axios.put(`/api/admin/services/${currentId}`, formData, { headers });
                toast.success("Service updated successfully!");
            } else {
                // CREATE
                await axios.post('/api/admin/services', formData, { headers });
                toast.success("Service created successfully!");
            }
            fetchServices(); // Reload list
            closeModal();
        } catch (error) {
            console.error("Error saving service:", error);
            toast.error("An error occurred while saving the service.");
        }
    };

    // --- 5. DELETE SERVICE ---
    const handleDelete = async (id) => {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`/api/admin/services/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success("Service deleted successfully.");
                fetchServices();
            } catch (error) {
                console.error("Error deleting service:", error);
                toast.error("Failed to delete this service.");
            }
    };

    return (
        // NO OUTER WRAPPER needed because Layout handles the container
        <> 
            {/* Page Heading & Main Action */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                <div>
                    <h1 className="text-gray-900 dark:text-white text-3xl font-bold tracking-tight">Services</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage your spa treatments and prices.</p>
                </div>
                
                <button 
                    onClick={() => openModal()}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg shadow-md shadow-primary/20 transition-all active:scale-95"
                >
                    <span className="text-sm font-semibold">Add Service</span>
                </button>
            </div>

            {/* Table Container */}
            <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Service Name</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {isLoading ? (
                                <tr><td colSpan="5" className="text-center py-8 text-gray-500">Loading data...</td></tr>
                            ) : services.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-8 text-gray-500">No services found. Start by adding one.</td></tr>
                            ) : (
                                services.map((service) => (
                                    <tr key={service.serviceId} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{service.name}</span>
                                                <span className="text-xs text-gray-500 truncate max-w-[200px]">{service.description}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-gray-900 dark:text-gray-200">${service.price}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                <span className="material-symbols-outlined text-[16px]">schedule</span>
                                                <span className="text-sm">{service.durationMinutes}m</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {service.isActive ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                    Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* EDIT BUTTON */}
                                                <button 
                                                    onClick={() => openModal(service)}
                                                    className="p-2 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 transition-colors"
                                                    title="Edit Service"
                                                >
                                                    <span className="material-symbols-outlined text-[18px] block">edit</span>
                                                </button>
                                                
                                                {/* DELETE BUTTON */}
                                                <button 
                                                    onClick={() => handleDelete(service.serviceId)}
                                                    className="p-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors"
                                                    title="Delete Service"
                                                >
                                                    <span className="material-symbols-outlined text-[18px] block">delete</span>
                                                </button>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
                        onClick={closeModal}
                    ></div>

                    {/* Modal Content */}
                    <div className="relative bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {isEditing ? 'Edit Service' : 'Add New Service'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700">
                                <span className="material-symbols-outlined block">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Input Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Service Name</label>
                                <input 
                                    type="text" name="name" required
                                    value={formData.name} onChange={handleInputChange}
                                    className="w-full px-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow text-sm"
                                    placeholder="e.g. Aromatherapy Massage"
                                />
                            </div>

                            {/* Input Description */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                                <textarea 
                                    name="description" rows="3"
                                    value={formData.description} onChange={handleInputChange}
                                    className="w-full px-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow text-sm resize-none"
                                    placeholder="Brief details about the service..."
                                ></textarea>
                            </div>

                            {/* Price & Duration Grid */}
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Price ($)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                        <input 
                                            type="number" name="price" required min="0"
                                            value={formData.price} onChange={handleInputChange}
                                            className="w-full pl-7 pr-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Duration (Min)</label>
                                    <input 
                                        type="number" name="durationMinutes" required min="5" step="5"
                                        value={formData.durationMinutes} onChange={handleInputChange}
                                        className="w-full px-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow text-sm"
                                    />
                                </div>
                            </div>

                            {/* Active Toggle */}
                            <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Visible to customers</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" name="isActive" 
                                        checked={formData.isActive} onChange={handleInputChange}
                                        className="sr-only peer" 
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 dark:peer-focus:ring-primary/80 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>

                            {/* Footer Buttons */}
                            <div className="flex justify-end gap-3 mt-8 pt-2">
                                <button 
                                    type="button" onClick={closeModal}
                                    className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-transparent dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-5 py-2.5 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary/90 shadow-md shadow-primary/30 transition-all active:scale-95"
                                >
                                    {isEditing ? 'Save Changes' : 'Create Service'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default ServiceManagement;