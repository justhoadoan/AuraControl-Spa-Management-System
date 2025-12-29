import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useToast } from '../../Components/common/Toast';

const ResourceManagement = () => {
    const toast = useToast();

    // --- 1. STATE QUẢN LÝ DỮ LIỆU & PHÂN TRANG ---
    const [resources, setResources] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // --- 2. STATE TÌM KIẾM & LỌC ---
    const [keyword, setKeyword] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [distinctTypes, setDistinctTypes] = useState([]); // List loại resource cho dropdown
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);
    // --- 3. STATE MODAL & FORM ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        type: 'ROOM',
    });

    // --- 4. CÁC HÀM API ---

    // 4.1. Lấy danh sách Type để đổ vào Dropdown
    const fetchDistinctTypes = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/admin/resources/types', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDistinctTypes(response.data || []);
        } catch (error) {
            console.error("Error fetching types:", error);
        }
    };

    // 4.2. Lấy danh sách Resource (Tìm kiếm + Phân trang)
    const fetchResources = useCallback(async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            
            const params = {
                page: currentPage,
                size: pageSize,
                keyword: keyword,
                type: typeFilter
            };

            const response = await axios.get('/api/admin/resources', {
                headers: { Authorization: `Bearer ${token}` },
                params: params
            });

            const data = response.data;

            // Lấy list resource
            setResources(data.content || []);

            // Lấy thông tin phân trang (Xử lý trường hợp nằm trong data.page)
            if (data.page) {
                setTotalPages(data.page.totalPages || 0);
                setTotalElements(data.page.totalElements || 0);
            } else {
                setTotalPages(data.totalPages || 0);
                setTotalElements(data.totalElements || 0);
            }

        } catch (error) {
            console.error("Error fetching resources:", error);
            // toast.error("Failed to load resources."); // Có thể bật lại nếu cần
            setResources([]);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize, keyword, typeFilter]);

    // --- 5. USE EFFECT ---
    useEffect(() => {
        fetchDistinctTypes(); // Lấy loại resource 1 lần đầu
        fetchResources();     // Lấy danh sách resource
    }, []); 

    // Khi dependency của fetchResources thay đổi (keyword, page...) nó sẽ tự gọi lại nhờ useCallback ở trên
    useEffect(() => {
        fetchResources();
    }, [fetchResources]);

    // --- 6. HANDLERS ---

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleSearchChange = (e) => {
        setKeyword(e.target.value);
        setCurrentPage(0); // Reset về trang 1 khi tìm kiếm
    };

    const handleTypeFilterChange = (e) => {
        setTypeFilter(e.target.value);
        setCurrentPage(0); // Reset về trang 1 khi lọc
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const openModal = (resource = null) => {
        if (resource) {
            setIsEditing(true);
            setCurrentId(resource.resourceId);
            setFormData({
                name: resource.name,
                type: resource.type
            });
        } else {
            setIsEditing(false);
            setCurrentId(null);
            setFormData({
                name: '',
                type: '' // Default type
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        try {
            if (isEditing) {
                await axios.put(`/api/admin/resources/${currentId}`, formData, { headers });
                toast.success("Resource updated successfully!");
            } else {
                await axios.post('/api/admin/resources', formData, { headers });
                toast.success("Resource created successfully!");
            }
            fetchResources();
            fetchDistinctTypes(); // Load lại types phòng trường hợp có type mới được tạo
            closeModal();
        } catch (error) {
            console.error("Error saving resource:", error);
            const msg = error.response?.data?.message || "Operation failed.";
            toast.error(msg);
        }
    };

    const handleDelete = async (id) => {
        
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`/api/admin/resources/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success("Deleted successfully.");
                fetchResources();
            } catch (error) {
                toast.error("Failed to delete.");
            }
        
    };

    // --- 7. RENDER ---
    return (
        <>
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white">
                    Resource Management
                </h1>
                <button 
                    onClick={() => openModal()}
                    className="flex items-center justify-center rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors shadow-md"
                >
                    <span className="material-symbols-outlined mr-2 text-base">add</span>
                    <span>Add New Resource</span>
                </button>
            </div>

            {/* SEARCH & FILTER BAR */}
            <div className="flex flex-wrap gap-4 mb-6 p-4 bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                
                {/* Search Input */}
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">SEARCH BY NAME</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-lg">search</span>
                        <input 
                            type="text" 
                            placeholder="Type resource name..." 
                            value={keyword}
                            onChange={handleSearchChange}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Filter Dropdown */}
                <div className="w-full md:w-[200px]">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">FILTER BY TYPE</label>
                    <div className="relative">
                        <select 
                            value={typeFilter}
                            onChange={handleTypeFilterChange}
                            className="w-full pl-3 pr-8 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all appearance-none uppercase cursor-pointer"
                        >
                            <option value="">ALL TYPES</option>
                            {distinctTypes.map((t, index) => (
                                <option key={index} value={t}>
                                    {t.replace(/_/g, ' ')}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <span className="material-symbols-outlined text-gray-500 text-sm">expand_more</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* TABLE CONTAINER */}
            <div className="w-full overflow-hidden rounded-xl border border-primary/20 bg-white dark:bg-[#1e1e1e] shadow-sm">
                <table className="min-w-full text-left">
                    <thead className="bg-primary/10">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-800 dark:text-gray-200">Name</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-800 dark:text-gray-200">Type</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-800 dark:text-gray-200">Status</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-800 dark:text-gray-200 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/20">
                        {isLoading ? (
                            <tr><td colSpan="4" className="text-center py-10 text-gray-500">Loading resources...</td></tr>
                        ) : resources.length === 0 ? (
                            <tr><td colSpan="4" className="text-center py-10 text-gray-500">No resources found matching your criteria.</td></tr>
                        ) : (
                            resources.map((res) => (
                                <tr key={res.resourceId} className="hover:bg-primary/5 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{res.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-bold uppercase tracking-wide">
                                            {res.type?.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {!res.deleted ? (
                                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">Active</span>
                                        ) : (
                                            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">Deleted</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openModal(res)} className="p-1 text-gray-400 hover:text-primary transition-colors" title="Edit">
                                                <span className="material-symbols-outlined text-xl">edit</span>
                                            </button>
                                            <button onClick={() => handleDelete(res.resourceId)} className="p-1 text-gray-400 hover:text-red-600 transition-colors" title="Delete">
                                                <span className="material-symbols-outlined text-xl">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* PAGINATION CONTROLS */}
                {!isLoading && resources.length > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-primary/20 bg-gray-50 dark:bg-white/5">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                            Page <span className="font-bold">{currentPage + 1}</span> of <span className="font-bold">{totalPages}</span>
                            <span className="ml-2 text-xs text-gray-500">({totalElements} items total)</span>
                        </span>
                        
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 0}
                                className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-gray-700 shadow-sm transition-all"
                            >
                                Previous
                            </button>
                            
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= totalPages - 1}
                                className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-gray-700 shadow-sm transition-all"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL FORM */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal}></div>
                    <div className="relative w-full max-w-md bg-white dark:bg-[#1e1e1e] rounded-xl shadow-2xl p-6">
                        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
                            {isEditing ? 'Edit Resource' : 'Add New Resource'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Resource Name</label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    required 
                                    value={formData.name} 
                                    onChange={handleInputChange} 
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                                    placeholder="e.g. VIP Room 01"
                                />
                            </div>
                            {/* --- BẮT ĐẦU ĐOẠN CODE MỚI --- */}
                            {/* --- RESOURCE TYPE (CUSTOM COMBOBOX XỊN) --- */}
                            <div className="relative">
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Resource Type</label>
                                
                                {/* 1. Ô Input chính */}
                                <div className="relative">
                                    <input 
                                        type="text"
                                        name="type"
                                        value={formData.type}
                                        onChange={(e) => {
                                            handleInputChange(e);
                                            setShowTypeDropdown(true); // Gõ chữ là hiện menu
                                        }}
                                        onFocus={() => setShowTypeDropdown(true)} // Click vào là hiện menu
                                        // Delay tắt menu để kịp nhận sự kiện click vào item
                                        onBlur={() => setTimeout(() => setShowTypeDropdown(false), 200)} 
                                        required
                                        autoComplete="off"
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 pr-10 text-sm uppercase focus:ring-2 focus:ring-primary/50 outline-none transition-shadow"
                                        placeholder="SELECT OR TYPE NEW..."
                                    />
                                    
                                    {/* Icon mũi tên xoay khi mở menu */}
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200"
                                         style={{ transform: showTypeDropdown ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%) rotate(0deg)' }}>
                                        <span className="material-symbols-outlined text-gray-400 text-sm">expand_more</span>
                                    </div>
                                </div>

                                {/* 2. Menu xổ xuống (Custom Dropdown) */}
                                {showTypeDropdown && (
                                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#252525] border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl max-h-48 overflow-y-auto overflow-x-hidden animate-in fade-in zoom-in-95 duration-100">
                                        {/* Lọc danh sách theo từ khóa đang nhập */}
                                        {distinctTypes.filter(t => t.toUpperCase().includes(formData.type.toUpperCase())).length > 0 ? (
                                            distinctTypes
                                                .filter(t => t.toUpperCase().includes(formData.type.toUpperCase()))
                                                .map((t, index) => (
                                                    <div 
                                                        key={index}
                                                        onClick={() => {
                                                            setFormData(prev => ({ ...prev, type: t }));
                                                            setShowTypeDropdown(false);
                                                        }}
                                                        className="px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors border-b border-gray-50 dark:border-gray-700/50 last:border-0"
                                                    >
                                                        {t}
                                                    </div>
                                                ))
                                        ) : (
                                            /* Hiển thị khi gõ một từ mới tinh chưa có trong list */
                                            <div className="px-4 py-3 text-sm text-gray-500 italic bg-gray-50 dark:bg-gray-800/50">
                                                Press Save to create new type: <span className="font-bold text-primary">"{formData.type}"</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <p className="text-xs text-gray-500 mt-1.5 italic">
                                    {isEditing 
                                        ? "Select existing or type new to switch." 
                                        : "Tip: Select a type above or just type a new name to create it."}
                                </p>
                            </div>
                            {/* --- KẾT THÚC ĐOẠN CODE MỚI --- */}
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold">
                                    {isEditing ? 'Update Resource' : 'Create Resource'}
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