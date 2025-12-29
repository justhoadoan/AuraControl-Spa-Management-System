import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AccountLayout from '../../Components/layout/AccountLayout';

/**
 * AppointmentHistory Component
 *
 * This component fetches and displays appointment history from the backend.
 * Backend DTO structure:
 * {
 *   id: Long,
 *   serviceName: String,
 *   startTime: LocalDateTime,
 *   duration: Integer,
 *   technicianName: String,
 *   status: String (COMPLETED, CANCELLED, etc.)
 * }
 */

const AppointmentHistory = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/booking/history', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setAppointments(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching appointments:', err);
            setError('Failed to load appointment history. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleBookAgain = (appointmentId) => {
        console.log('Book Again clicked for appointment ID:', appointmentId);
        // TODO: Navigate to booking page or open modal
        // Example: navigate(`/booking?fromAppointment=${appointmentId}`);
    };

    const getStatusBadgeClass = (status) => {
        switch(status?.toUpperCase()) {
            case 'COMPLETED':
                return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
            case 'CANCELLED':
                return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
            case 'NO_SHOW':
                return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400';
            default:
                return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400';
        }
    };

    const formatDateTime = (dateTimeString) => {
        const date = new Date(dateTimeString);
        return date.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatStatus = (status) => {
        if (!status) return '';
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    };

    return (
        <AccountLayout>
            <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-8">Appointment History</h1>

            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="text-slate-600 dark:text-slate-400">Loading appointments...</div>
                </div>
            ) : error ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                    <p className="text-red-700 dark:text-red-400">{error}</p>
                    <button
                        onClick={fetchAppointments}
                        className="mt-4 text-sm text-primary hover:text-primary/80 font-medium"
                    >
                        Try Again
                    </button>
                </div>
            ) : appointments.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 p-12 rounded-lg shadow-sm text-center">
                    <span className="material-icons-outlined text-slate-400 text-6xl mb-4">event_busy</span>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                        No Appointment History
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                        You haven't completed any appointments yet.
                    </p>
                </div>
            ) : (
                <div id="appointmentsList" className="space-y-6">
                    {appointments.map((appointment) => (
                        <div
                            key={appointment.id}
                            className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm"
                            data-appointment-id={appointment.id}
                        >
                            <div className="md:flex justify-between">
                                <div className="mb-4 md:mb-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                                            {appointment.serviceName}
                                        </h3>
                                        <span
                                            className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(appointment.status)}`}
                                            data-status={appointment.status}
                                        >
                                            {formatStatus(appointment.status)}
                                        </span>
                                    </div>
                                    <div className="space-y-2 text-slate-600 dark:text-slate-400 text-sm">
                                        <p className="flex items-center">
                                            <span className="material-icons-outlined mr-2 text-base">event</span>
                                            {formatDateTime(appointment.startTime)}
                                        </p>
                                        <p className="flex items-center">
                                            <span className="material-icons-outlined mr-2 text-base">schedule</span>
                                            {appointment.duration} minutes
                                        </p>
                                        <p className="flex items-center">
                                            <span className="material-icons-outlined mr-2 text-base">person</span>
                                            With {appointment.technicianName}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <button
                                        onClick={() => handleBookAgain(appointment.id)}
                                        className="btn-book-again text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                                        data-appointment-id={appointment.id}
                                    >
                                        Book Again
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AccountLayout>
    );
};

export default AppointmentHistory;

