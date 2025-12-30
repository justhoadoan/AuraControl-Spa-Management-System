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
    const fetchAppointments = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                // Gọi API lấy danh sách cuộc hẹn sắp tới
                const response = await axios.get('http://localhost:8081/api/booking/upcoming-appointments', {
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

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

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
    const handleCancel = async (id) => {
        try {
            const token = localStorage.getItem('token');
            
            // Gọi API PUT Cancel
            // Lưu ý: Kiểm tra kỹ đường dẫn '/api/booking' có khớp với Controller của bạn không
            await axios.put(
                `http://localhost:8081/api/booking/cancel/${id}`, 
                {}, // Body rỗng vì PUT cần body, dù không gửi data gì
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Thông báo thành công
            alert("Appointment cancelled successfully.");
            
            // Tải lại danh sách để cập nhật trạng thái mới (Mất dòng vừa cancel hoặc chuyển status thành CANCELLED)
            fetchAppointments(); 

        } catch (error) {
            console.error("Cancel failed:", error);
            // Lấy message lỗi từ Backend trả về (ví dụ: Quá hạn 30 phút)
            const backendMessage = error.response?.data?.message || "Failed to cancel appointment.";
            alert(backendMessage);
        }
    };

    return (
        <AccountLayout>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-white">Upcoming Appointments</h1>
                <button 
                    onClick={() => navigate('/services')}
                    className="bg-primary text-white px-5 py-2.5 rounded-md font-semibold text-sm hover:bg-opacity-90 transition-colors shadow-sm flex items-center"
                >
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
                        <div key={appt.appointmentId} className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm transition hover:shadow-md">
                            <div className="md:flex justify-between">
                                <div className="mb-4 md:mb-0">
                                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                                        {appt.serviceName}
                                    </h3>
                                    
                                    <div className="space-y-2 text-slate-600 dark:text-slate-400 text-sm">
                                        <p className="flex items-center">
                                            <span className="material-icons-outlined mr-2 text-base">event</span> 
                                            {formatDate(appt.startTime)}
                                        </p>
                                        <p className="flex items-center">
                                            <span className="material-icons-outlined mr-2 text-base">schedule</span> 
                                            {appt.durationMinutes} minutes
                                        </p>
                                        <p className="flex items-center">
                                            <span className="material-icons-outlined mr-2 text-base">person</span> 
                                            With {appt.technicianName}
                                        </p>
                                        <p className="flex items-center mt-2">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                                appt.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                                appt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                appt.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                                {appt.status}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-start gap-4">
                                    {/* Chỉ hiện nút Cancel/Reschedule nếu chưa bị hủy và chưa hoàn thành */}
                                    {appt.status !== 'CANCELLED' && appt.status !== 'COMPLETED' && (
                                        <>
                                            <button 
                                                onClick={() => alert("Open Reschedule Modal Logic")} 
                                                className="text-sm text-blue-600 hover:text-blue-800 dark:hover:text-blue-400 font-medium transition-colors"
                                            >
                                                Reschedule
                                            </button>

                                            <button 
                                                onClick={() => handleCancel(appt.appointmentId)} // Gọi hàm cancel mới
                                                className="text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400 font-medium transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    )}
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