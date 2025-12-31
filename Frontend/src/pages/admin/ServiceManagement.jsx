import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import { useToast } from '../../Components/common/Toast';

const ServiceManagement = () => {
    // --- TOAST NOTIFICATION ---
    const toast = useToast();
    
    // --- DATA STATE ---
    const [services, setServices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    // [THÊM MỚI] State lưu danh sách loại resource lấy từ API
    const [resourceTypes, setResourceTypes] = useState([]);
    
    // --- MODAL & FORM STATE ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        durationMinutes: '',
        isActive: true,
        resources: []
    });

    // --- 1. FETCH SERVICES (GET) ---
    const fetchServices = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await api.get('/admin/services');
            setServices(response.data);
        } catch (error) {
            console.error("Error fetching services:", error);
            toast.error("Failed to fetch services list.");
        } finally {
            setIsLoading(false);
        }
    };

    // [THÊM MỚI] Hàm lấy danh sách Resource Types
    const fetchResourceTypes = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await api.get('/admin/resources/types');
            
            // Chuyển đổi dữ liệu từ ["massage_room"] -> [{value: "massage_room", label: "Massage Room"}]
            const formattedTypes = response.data.map(type => ({
                value: type,
                label: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            }));
            
            setResourceTypes(formattedTypes);
        } catch (error) {
            console.error("Error fetching resource types:", error);
        }
    };

    useEffect(() => {
        fetchServices();
        fetchResourceTypes(); // [THÊM DÒNG NÀY] Gọi API khi trang vừa load
    }, []);

    // --- 2. HANDLE INPUT CHANGE ---
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // --- XỬ LÝ RESOURCE TRONG FORM ---

    // Thêm dòng resource mới
    const addResourceRow = () => {
        // [SỬA LẠI] Lấy loại đầu tiên trong danh sách dynamic làm mặc định
        const firstType = resourceTypes.length > 0 ? resourceTypes[0].value : '';
        
        setFormData(prev => ({
            ...prev,
            resources: [...prev.resources, { resourceType: firstType, quantity: 1 }]
        }));
    };

    // Xóa dòng resource
    const removeResourceRow = (index) => {
        setFormData(prev => ({
            ...prev,
            resources: prev.resources.filter((_, i) => i !== index)
        }));
    };

    // Cập nhật giá trị resource (Type hoặc Quantity)
    const handleResourceChange = (index, field, value) => {
        const updatedResources = [...formData.resources];
        updatedResources[index][field] = value;
        setFormData(prev => ({ ...prev, resources: updatedResources }));
    };

    // --- 3. OPEN MODAL (ADD OR EDIT) ---
    const openModal = (service = null) => {
        if (service) {
            setIsEditing(true);
            setCurrentId(service.serviceId);
            setFormData({
                name: service.name,
                description: service.description,
                // Use strings for controlled inputs so the input shows decimals correctly
                price: service.price != null ? String(service.price) : '',
                durationMinutes: service.durationMinutes != null ? String(service.durationMinutes) : '',
                isActive: service.isActive,
                // Map dữ liệu cũ nếu có (Backend cần trả về list này trong API get services)
                resources: service.resourceRequirements ? service.resourceRequirements.map(req => ({
                    resourceType: req.resourceType,
                    quantity: req.quantity
                })) : []
            });
        } else {
            setIsEditing(false);
            setCurrentId(null);
            setFormData({
                name: '', description: '', price: '', durationMinutes: '', isActive: true, 
                resources: [] 
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
            // Convert numeric fields to numbers (price as decimal)
            const payload = {
                ...formData,
                price: formData.price === '' ? null : parseFloat(formData.price),
                durationMinutes: formData.durationMinutes === '' ? null : parseInt(formData.durationMinutes, 10),
                resources: formData.resources ? formData.resources.map(r => ({ ...r, quantity: Number(r.quantity) })) : []
            };

            if (isEditing) {
                // UPDATE
                await api.put(`/admin/services/${currentId}`, payload);
                toast.success("Service updated successfully!");
            } else {
                // CREATE
                await api.post('/admin/services', payload);
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
                await api.delete(`/admin/services/${id}`);
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
                                            <span className="text-sm font-medium text-gray-900 dark:text-gray-200">${Number(service.price).toFixed(2)}</span>
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

                    {/* Modal Container: Sử dụng Flex Column và Max Height */}
                    <div className="relative w-full max-w-lg bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
                        
                        {/* 1. HEADER (Fixed at top) */}
                        <div className="flex-none px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50 rounded-t-2xl">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {isEditing ? 'Edit Service' : 'Add New Service'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700">
                                <span className="material-symbols-outlined block">close</span>
                            </button>
                        </div>

                        {/* 2. BODY (Scrollable content) */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <form id="serviceForm" onSubmit={handleSubmit} className="space-y-5">
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
                                                type="number" name="price" required min="0" step="0.01"
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

                                {/* Resource Section */}
                                <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="block text-sm font-bold text-gray-900 dark:text-white">
                                            Required Resources
                                        </label>
                                        <button 
                                            type="button" 
                                            onClick={addResourceRow}
                                            className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 font-semibold"
                                        >
                                            + Add Requirement
                                        </button>
                                    </div>

                                    {formData.resources.length === 0 ? (
                                        <div className="text-center py-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                                            <p className="text-xs text-gray-400 italic">No resources required for this service.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {formData.resources.map((res, index) => {
                                                // Determine if there is at least one resource type not yet used in other rows
                                                const hasAvailableTypes = resourceTypes.some(
                                                    (t) =>
                                                        !formData.resources.some(
                                                            (r, i) => i !== index && r.resourceType === t.value
                                                        )
                                                );

                                                return (
                                                    <div key={index} className="flex gap-3 items-end bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                                        <div className="flex-1">
                                                            <label className="text-[11px] text-gray-500 mb-1 block uppercase font-bold">Resource Type</label>
                                                            <select
                                                                value={res.resourceType}
                                                                onChange={(e) => handleResourceChange(index, 'resourceType', e.target.value)}
                                                                className="w-full text-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 py-1.5"
                                                                disabled={!hasAvailableTypes && resourceTypes.length > 0}
                                                            >
                                                                {resourceTypes.length > 0 ? (
                                                                    hasAvailableTypes ? (
                                                                        resourceTypes.map(t => (
                                                                            <option 
                                                                                key={t.value} 
                                                                                value={t.value} 
                                                                                // Disable nếu loại này đã được chọn ở dòng khác
                                                                                disabled={formData.resources.some((r, i) => i !== index && r.resourceType === t.value)}
                                                                            >
                                                                                {t.label}
                                                                            </option>
                                                                        ))
                                                                    ) : (
                                                                        <option value="" disabled>
                                                                            No available resource types
                                                                        </option>
                                                                    )
                                                                ) : (
                                                                    <option value="" disabled>Loading types...</option>
                                                                )}
                                                            </select>
                                                        </div>
                                                        <div className="w-24">
                                                            <label className="text-[11px] text-gray-500 mb-1 block uppercase font-bold">Quantity</label>
                                                            <input
                                                                type="number" min="1"
                                                                value={res.quantity}
                                                                onChange={(e) => handleResourceChange(index, 'quantity', parseInt(e.target.value))}
                                                                className="w-full text-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 py-1.5"
                                                            />
                                                        </div>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => removeResourceRow(index)}
                                                            className="text-red-500 hover:bg-red-50 p-2 rounded-md mb-[1px] transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">delete</span>
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* 3. FOOTER (Fixed at bottom) */}
                        <div className="flex-none p-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900 rounded-b-2xl">
                            <button 
                                type="button" onClick={closeModal}
                                className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:bg-transparent dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" form="serviceForm" // Liên kết nút Submit với Form ở trên
                                className="px-5 py-2.5 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary/90 shadow-md shadow-primary/30 transition-all active:scale-95 flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">save</span>
                                <span>{isEditing ? 'Save Changes' : 'Create Service'}</span>
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
};

export default ServiceManagement;