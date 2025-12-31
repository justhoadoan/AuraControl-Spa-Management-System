import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import { useToast } from '../../Components/common/Toast';

const MyAbsenceRequests = () => {
    const toast = useToast();

    // --- STATE ---
    const [absenceRequests, setAbsenceRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState('ALL');

    // ===========================
    // 1. API CALLS
    // ===========================

    const fetchAbsenceRequests = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/technician/absence-requests');
            setAbsenceRequests(response.data);
        } catch (error) {
            console.error("Error fetching absence requests:", error);
            toast.error("Failed to load absence requests.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAbsenceRequests();
    }, []);

    // ===========================
    // 2. HELPERS
    // ===========================

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'APPROVED':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'REJECTED':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            default: // PENDING
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'APPROVED':
                return 'check_circle';
            case 'REJECTED':
                return 'cancel';
            default:
                return 'schedule';
        }
    };

    // Filter requests based on selected status
    const filteredRequests = filterStatus === 'ALL' 
        ? absenceRequests 
        : absenceRequests.filter(req => req.status === filterStatus);

    // Count by status
    const countByStatus = {
        ALL: absenceRequests.length,
        PENDING: absenceRequests.filter(r => r.status === 'PENDING').length,
        APPROVED: absenceRequests.filter(r => r.status === 'APPROVED').length,
        REJECTED: absenceRequests.filter(r => r.status === 'REJECTED').length,
    };

    // ===========================
    // 3. RENDER
    // ===========================

    return (
        <div className="flex flex-col gap-6">
            
            {/* Header */}
            <header className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-xl">event_busy</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-black leading-tight tracking-[-0.03em] text-gray-900 dark:text-white">
                            My Absence Requests
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            View and track your time-off requests.
                        </p>
                    </div>
                </div>
            </header>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
                {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`pb-3 px-4 text-sm font-medium transition-colors relative ${
                            filterStatus === status
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                    >
                        {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                            status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                            status === 'APPROVED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                            status === 'REJECTED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                            'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                            {countByStatus[status]}
                        </span>
                    </button>
                ))}
            </div>

            {/* Requests List */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1e1e] overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="flex items-center gap-3 text-gray-500">
                            <span className="material-symbols-outlined animate-spin">autorenew</span>
                            <span>Loading requests...</span>
                        </div>
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                        <span className="material-symbols-outlined text-5xl mb-3 text-gray-300">inbox</span>
                        <p className="text-lg font-medium">No requests found</p>
                        <p className="text-sm">
                            {filterStatus === 'ALL' 
                                ? "You haven't submitted any absence requests yet."
                                : `No ${filterStatus.toLowerCase()} requests.`
                            }
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {filteredRequests.map((request) => (
                            <div 
                                key={request.requestId} 
                                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    {/* Left Section: Info */}
                                    <div className="flex items-start gap-4">
                                        {/* Status Icon */}
                                        <div className={`size-10 rounded-full flex items-center justify-center shrink-0 ${
                                            request.status === 'APPROVED' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                                            request.status === 'REJECTED' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                                            'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                                        }`}>
                                            <span className="material-symbols-outlined text-xl">
                                                {getStatusIcon(request.status)}
                                            </span>
                                        </div>

                                        {/* Details */}
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-gray-900 dark:text-white">
                                                    {formatDate(request.startDate)} - {formatDate(request.endDate)}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(request.status)}`}>
                                                    {request.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                <span className="font-medium">Reason:</span> {request.reason}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right Section: Days Count */}
                                    <div className="text-right shrink-0">
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {(() => {
                                                const start = new Date(request.startDate);
                                                const end = new Date(request.endDate);
                                                const diffTime = Math.abs(end - start);
                                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                                                return diffDays;
                                            })()}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {(() => {
                                                const start = new Date(request.startDate);
                                                const end = new Date(request.endDate);
                                                const diffTime = Math.abs(end - start);
                                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                                                return diffDays === 1 ? 'day' : 'days';
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Summary Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1e1e] p-4">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400">schedule</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{countByStatus.PENDING}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1e1e] p-4">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-green-600 dark:text-green-400">check_circle</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{countByStatus.APPROVED}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Approved</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1e1e] p-4">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-red-600 dark:text-red-400">cancel</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{countByStatus.REJECTED}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Rejected</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyAbsenceRequests;
