import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AccountLayout from '../../Components/layout/AccountLayout';
import { useToast } from '../../Components/common/Toast';

const AccountDashboard = () => {
    const navigate = useNavigate();
    const toast = useToast();

    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- RESCHEDULE STATE ---
    const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
    const [selectedAppt, setSelectedAppt] = useState(null);
    const [rescheduleDate, setRescheduleDate] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [isCheckingSlots, setIsCheckingSlots] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Helper: Lấy ngày hôm nay theo format YYYY-MM-DD (Local time) để set min date
    const getTodayString = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // --- 1. FETCH APPOINTMENTS ---
    const fetchAppointments = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        try {
            const response = await axios.get('http://localhost:8081/api/booking/upcoming-appointments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAppointments(response.data);
        } catch (err) {
            console.error(err);
            setError("Cannot load appointments.");
        } finally {
            setIsLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    // --- 2. FETCH SLOTS ---
    useEffect(() => {
        if (!selectedAppt || !rescheduleDate) return;

        const fetchSlots = async () => {
            setIsCheckingSlots(true);
            try {
                const token = localStorage.getItem('token');
                // Lưu ý: Đảm bảo selectedAppt có serviceId. Nếu API list chưa trả về, cần backend bổ sung.
                const serviceId = selectedAppt.serviceId || selectedAppt.service?.serviceId; 
                
                if (!serviceId) {
                    // Fallback nếu không tìm thấy ID (hiếm gặp nếu backend chuẩn)
                    console.warn("No serviceId found for slot checking");
                    setAvailableSlots([]);
                    return;
                }

                const response = await axios.get(`http://localhost:8081/api/booking/available-slots`, {
                    params: { serviceId: serviceId, date: rescheduleDate },
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAvailableSlots(response.data.availableSlots);
            } catch (error) {
                console.error(error);
                toast.error("Failed to check availability.");
            } finally {
                setIsCheckingSlots(false);
            }
        };
        fetchSlots();
    }, [rescheduleDate, selectedAppt, toast]);

    // --- 3. SUBMIT RESCHEDULE ---
    const handleConfirmReschedule = async () => {
        if (!rescheduleDate || !selectedSlot) {
            return toast.error("Please select a new date and time.");
        }

        // Client-side check: Không cho chọn lại giờ cũ (Backend cũng check, nhưng chặn ở đây cho nhanh)
        const originalDateTime = new Date(selectedAppt.startTime);
        const newDateTimeStr = `${rescheduleDate}T${selectedSlot}:00`;
        const newDateTime = new Date(newDateTimeStr);

        if (originalDateTime.getTime() === newDateTime.getTime()) {
            return toast.info("You selected the same time. No changes made.");
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            // Gọi API
            await axios.put(
                `http://localhost:8081/api/booking/${selectedAppt.appointmentId || selectedAppt.id}/reschedule`,
                { newStartTime: newDateTimeStr },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success("Rescheduled successfully!");
            setIsRescheduleModalOpen(false);
            fetchAppointments(); // Reload data
        } catch (error) {
            console.error("Reschedule failed:", error);
            // Hiển thị lỗi từ Backend (Business Rule: 30 mins, past time, busy tech...)
            const msg = error.response?.data?.message || "Unable to reschedule. Please try another slot.";
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const openRescheduleModal = (appt) => {
        setSelectedAppt(appt);
        // Mặc định fill ngày hiện tại của cuộc hẹn vào input để user tiện sửa giờ
        // Cắt lấy YYYY-MM-DD
        const currentApptDate = appt.startTime.split('T')[0];
        setRescheduleDate(currentApptDate);
        
        setSelectedSlot('');
        setAvailableSlots([]);
        setIsRescheduleModalOpen(true);
    };

    const handleCancel = async (id) => {
        if (!window.confirm("Are you sure you want to cancel?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8081/api/booking/cancel/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Cancelled successfully.");
            fetchAppointments();
        } catch (error) {
            const msg = error.response?.data?.message || "Failed to cancel.";
            toast.error(msg);
        }
    };

    // Helper formatter
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            hour: 'numeric', minute: 'numeric', hour12: true
        });
    };

    return (
        <AccountLayout>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-white">Upcoming Appointments</h1>
                <button onClick={() => navigate('/services')} className="bg-primary text-white px-5 py-2.5 rounded-md font-semibold text-sm hover:opacity-90 transition-colors flex items-center">
                    <span className="material-icons-outlined mr-2 text-base">add</span> Book New
                </button>
            </div>

            <div className="space-y-6">
                {isLoading ? <div className="text-center py-10">Loading...</div> : 
                 error ? <div className="text-center py-10 text-red-500">{error}</div> : 
                 appointments.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 p-10 rounded-lg shadow-sm text-center">
                        <p className="text-slate-500">No upcoming appointments.</p>
                    </div>
                ) : (
                    appointments.map((appt) => (
                        <div key={appt.appointmentId || appt.id} className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm transition hover:shadow-md">
                            <div className="md:flex justify-between">
                                <div className="mb-4 md:mb-0">
                                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{appt.serviceName}</h3>
                                    <div className="space-y-2 text-slate-600 dark:text-slate-400 text-sm">
                                        <p className="flex items-center"><span className="material-icons-outlined mr-2">event</span> {formatDate(appt.startTime)}</p>
                                        <p className="flex items-center"><span className="material-icons-outlined mr-2">schedule</span> {appt.duration} minutes</p>
                                        <p className="flex items-center"><span className="material-icons-outlined mr-2">person</span> With {appt.technicianName}</p>
                                        <p className="mt-2"><span className={`px-2 py-0.5 rounded text-xs font-bold ${appt.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : appt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{appt.status}</span></p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    {/* Chỉ cho phép Reschedule/Cancel khi trạng thái hợp lệ */}
                                    {['PENDING', 'CONFIRMED'].includes(appt.status) && (
                                        <>
                                            <button onClick={() => openRescheduleModal(appt)} className="text-sm text-blue-600 hover:text-blue-800 dark:hover:text-blue-400 font-medium">Reschedule</button>
                                            <button onClick={() => handleCancel(appt.appointmentId || appt.id)} className="text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400 font-medium">Cancel</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* --- MODAL --- */}
            {isRescheduleModalOpen && selectedAppt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1e1e1e] w-full max-w-md rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-blue-50 dark:bg-blue-900/20">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Reschedule</h3>
                                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">{selectedAppt.serviceName}</p>
                            </div>
                            <button onClick={() => setIsRescheduleModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400"><span className="material-icons-outlined">close</span></button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Select Date</label>
                                <input 
                                    type="date" 
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-black/20 text-sm"
                                    min={getTodayString()} // Fix lỗi time-zone: dùng hàm getTodayString
                                    value={rescheduleDate}
                                    onChange={(e) => { setRescheduleDate(e.target.value); setSelectedSlot(''); }}
                                />
                            </div>
                            
                            {rescheduleDate && (
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Available Slots</label>
                                    {isCheckingSlots ? <div className="text-sm text-gray-500">Checking availability...</div> : 
                                     availableSlots.length > 0 ? (
                                        <div className="grid grid-cols-4 gap-2">
                                            {availableSlots.map(slot => (
                                                <button 
                                                    key={slot} 
                                                    onClick={() => setSelectedSlot(slot)} 
                                                    // Highlight slot đang chọn
                                                    className={`py-2 text-sm rounded border transition-colors ${
                                                        selectedSlot === slot 
                                                        ? 'bg-blue-600 text-white border-blue-600' 
                                                        : 'hover:border-blue-500 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                                                    }`}
                                                >
                                                    {slot}
                                                </button>
                                            ))}
                                        </div>
                                     ) : <p className="text-sm text-red-500">No slots available for this date.</p>
                                    }
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                            <button onClick={() => setIsRescheduleModalOpen(false)} className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">Cancel</button>
                            <button 
                                onClick={handleConfirmReschedule} 
                                disabled={!selectedSlot || isSubmitting} 
                                className="px-6 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Saving...' : 'Confirm Change'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AccountLayout>
    );
};

export default AccountDashboard;