import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AccountLayout from '../../Components/layout/AccountLayout';

const AccountDashboard = () => {
    const navigate = useNavigate();

    // State lưu danh sách cuộc hẹn
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- 1. FETCH API LẤY DANH SÁCH ---
    useEffect(() => {
        const fetchAppointments = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                // Lưu ý: Kiểm tra lại Controller của bạn xem @RequestMapping là gì.
                // Mình giả định là /api/appointments dựa trên các bài trước.
                // Nếu Controller của bạn là @RequestMapping("/api/users"), hãy sửa lại đường dẫn bên dưới.
                const response = await axios.get('http://localhost:8081/api/appointments/upcoming-appointments', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAppointments(response.data);
            } catch (err) {
                console.error("Error fetching appointments:", err);
                setError("Không thể tải danh sách cuộc hẹn.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAppointments();
    }, [navigate]);

    // --- 2. HÀM FORMAT NGÀY GIỜ ---
    // Input: 2024-08-20T14:00:00 -> Output: Tuesday, August 20, 2024 at 2:00 PM
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });
    };

    // --- 3. XỬ LÝ CANCEL (Giả lập) ---
    const handleCancel = (id) => {
        if(window.confirm("Are you sure you want to cancel this appointment?")) {
            // Gọi API cancel ở đây (nếu có)
            alert(`Implement Cancel logic for ID: ${id}`);
        }
    };

    return (
        <AccountLayout>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-white">Upcoming Appointments</h1>
                <button className="bg-primary text-white px-5 py-2.5 rounded-md font-semibold text-sm hover:bg-opacity-90 transition-colors shadow-sm flex items-center">
                    <span className="material-icons-outlined mr-2 text-base">add</span>
                    Book New
                </button>
            </div>

                        {/* APPOINTMENT LIST */}
                        <div className="space-y-6">
                            {isLoading ? (
                                <div className="text-center py-10">Loading appointments...</div>
                            ) : error ? (
                                <div className="text-center py-10 text-red-500">{error}</div>
                            ) : appointments.length === 0 ? (
                                <div className="bg-white dark:bg-slate-900 p-10 rounded-lg shadow-sm text-center">
                                    <span className="material-icons-outlined text-4xl text-slate-300 mb-4">event_busy</span>
                                    <p className="text-slate-500">You have no upcoming appointments.</p>
                                </div>
                            ) : (
                                appointments.map((appt) => (
                                    <div key={appt.id} className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm transition hover:shadow-md">
                                        <div className="md:flex justify-between">
                                            <div className="mb-4 md:mb-0">
                                                {/* Service Name */}
                                                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                                                    {appt.serviceName}
                                                </h3>
                                                
                                                <div className="space-y-2 text-slate-600 dark:text-slate-400 text-sm">
                                                    {/* Start Time */}
                                                    <p className="flex items-center">
                                                        <span className="material-icons-outlined mr-2 text-base">event</span> 
                                                        {formatDate(appt.startTime)}
                                                    </p>
                                                    {/* Duration */}
                                                    <p className="flex items-center">
                                                        <span className="material-icons-outlined mr-2 text-base">schedule</span> 
                                                        {appt.duration} minutes
                                                    </p>
                                                    {/* Technician */}
                                                    <p className="flex items-center">
                                                        <span className="material-icons-outlined mr-2 text-base">person</span> 
                                                        With {appt.technicianName}
                                                    </p>
                                                    {/* Status Badge */}
                                                    <p className="flex items-center mt-2">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                                            appt.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                                            appt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-gray-100 text-gray-700'
                                                        }`}>
                                                            {appt.status}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-start">
                                                <button 
                                                    onClick={() => handleCancel(appt.id)}
                                                    className="text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400 font-medium transition-colors"
                                                >
                                                    Cancel Appointment
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
        </AccountLayout>
    );
};

export default AccountDashboard;