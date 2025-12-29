import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useToast } from '../../Components/common/Toast';

const ResourceManagement = () => {
    const toast = useToast();

    // --- STATE ---
    const [resources, setResources] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        type: 'massage_room', // Default value
    });

    // --- API CALLS ---

    // 1. Fetch Resources
    const fetchResources = useCallback(async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8081/api/admin/resources', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResources(response.data);
        } catch (error) {
            console.error("Error fetching resources:", error);
            toast.error("Failed to load resources.");
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchResources();
    }, [fetchResources]);

    // --- HANDLERS ---

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const openModal = (resource = null) => {
        if (resource) {
            // Edit Mode
            setIsEditing(true);
            setCurrentId(resource.resourceId); // Make sure backend returns 'resourceId' or adjust to 'id'
            setFormData({
                name: resource.name,
                type: resource.type
            });
        } else {
            // Add Mode
            setIsEditing(false);
            setCurrentId(null);
            setFormData({
                name: '',
                type: 'massage_room'
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    // 2. Submit Form (Create / Update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        try {
            if (isEditing) {
                // UPDATE
                await axios.put(`http://localhost:8081/api/admin/resources/${currentId}`, formData, { headers });
                toast.success("Resource updated successfully!");
            } else {
                // CREATE
                await axios.post('http://localhost:8081/api/admin/resources', formData, { headers });
                toast.success("Resource created successfully!");
            }
            fetchResources();
            closeModal();
        } catch (error) {
            console.error("Error saving resource:", error);
            const msg = error.response?.data?.message || "Operation failed.";
            toast.error(msg);
        }
    };

    // 3. Delete Resource
    const handleDelete = async (id) => {
        
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:8081/api/admin/resources/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success("Resource deleted successfully.");
                fetchResources();
            } catch (error) {
                console.error("Error deleting resource:", error);
                toast.error("Failed to delete resource.");
            }
        
    };

    // Helper for Status Badge (Assuming backend doesn't send 'status' field in DTO yet, using placeholder logic)
    // You might want to update your backend DTO to include 'status' if needed.
    // For now, I'll assume all resources fetched are 'Active' unless you have a specific field.
    const getStatusBadge = (isDeleted) => {
        if (isDeleted) {
             return <span className="inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/50 px-3 py-1 text-xs font-medium text-red-800 dark:text-red-300">Deleted</span>;
        }
        return <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/50 px-3 py-1 text-xs font-medium text-green-800 dark:text-green-300">Active</span>;
    };

    return (
        <>
            {/* --- PAGE HEADER --- */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] text-gray-900 dark:text-white">
                    Resource Management
                </h1>
                <button 
                    onClick={() => openModal()}
                    className="flex min-w-[84px] items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors"
                >
                    <span className="material-symbols-outlined mr-2 text-base">add</span>
                    <span className="truncate">Add New Resource</span>
                </button>
            </div>

            {/* --- TABLE CONTAINER --- */}
            <div className="w-full overflow-hidden rounded-xl border border-primary/20 dark:border-primary/30 bg-white dark:bg-[#1e1e1e] shadow-sm">
                <table className="min-w-full text-left">
                    <thead className="bg-primary/10 dark:bg-primary/20">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-800 dark:text-gray-200">Resource Name</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-800 dark:text-gray-200">Type</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-800 dark:text-gray-200">Status</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-800 dark:text-gray-200">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/20 dark:divide-primary/30">
                        {isLoading ? (
                            <tr><td colSpan="4" className="text-center py-8 text-gray-500">Loading resources...</td></tr>
                        ) : resources.length === 0 ? (
                            <tr><td colSpan="4" className="text-center py-8 text-gray-500">No resources found.</td></tr>
                        ) : (
                            resources.map((res) => (
                                <tr key={res.resourceId} className="hover:bg-primary/5 transition-colors">
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                                        {res.name}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400 capitalize">
                                        {res.type.replace('_', ' ')}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        {getStatusBadge(res.deleted)}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                        <div className="flex items-center gap-4">
                                            <button 
                                                onClick={() => openModal(res)}
                                                className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
                                                title="Edit"
                                            >
                                                <span className="material-symbols-outlined text-xl">edit</span>
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(res.resourceId)}
                                                className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500 transition-colors"
                                                title="Delete"
                                            >
                                                <span className="material-symbols-outlined text-xl">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={closeModal}></div>
                    
                    <div className="relative w-full max-w-md bg-white dark:bg-[#1e1e1e] rounded-xl shadow-2xl p-6 transform transition-all scale-100">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {isEditing ? 'Edit Resource' : 'Add New Resource'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-500 hover:text-primary dark:text-gray-400 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Resource Name</label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:border-primary focus:ring-primary shadow-sm"
                                    placeholder="e.g., Massage Room 03"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Resource Type</label>
                                <select 
                                    name="type" 
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:border-primary focus:ring-primary shadow-sm"
                                >
                                    <option value="massage_room">Massage Room</option>
                                    <option value="manicure_station">Manicure Station</option>
                                    <option value="amenity">Amenity</option>
                                    <option value="pedicure_chair">Pedicure Chair</option>
                                </select>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex justify-end gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <button 
                                    type="button" 
                                    onClick={closeModal}
                                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-transparent text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="flex items-center gap-1 px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors shadow-md"
                                >
                                    <span className="material-symbols-outlined text-sm">save</span>
                                    <span>{isEditing ? 'Save Changes' : 'Save Resource'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default ResourceManagement;