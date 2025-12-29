import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../Components/common/Toast';

const StaffDashboard = () => {
    const { user } = useContext(AuthContext);
    const toast = useToast();

    // --- STATE ---
    const [scheduleEvents, setScheduleEvents] = useState([]); // Chứa cả Appointment và Absence
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('month'); // Mặc định view tháng
    const [isLoading, setIsLoading] = useState(false);
    
    // Modal State
    const [isTimeOffModalOpen, setIsTimeOffModalOpen] = useState(false);
    const [timeOffData, setTimeOffData] = useState({ startDate: '', endDate: '', reason: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ===========================
    // 1. API CALLS
    // ===========================

    // Fetch Schedule (Appointments + Absences)
    const fetchSchedule = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            
            // Tính toán khoảng thời gian cần lấy (Lấy trọn tháng hiện tại + dư 1 chút)
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            
            // Lấy từ ngày đầu tháng đến ngày cuối tháng
            const start = new Date(year, month, 1, 0, 0, 0).toISOString().slice(0, 19);
            const end = new Date(year, month + 1, 0, 23, 59, 59).toISOString().slice(0, 19);

            // Gọi API
            const response = await axios.get('http://localhost:8081/api/staff/schedule', {
                params: { start, end },
                headers: { Authorization: `Bearer ${token}` }
            });

            setScheduleEvents(response.data);
        } catch (error) {
            console.error("Error fetching schedule:", error);
            toast.error("Failed to load schedule.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedule();
    }, [currentDate]); // Gọi lại khi đổi tháng

    // ===========================
    // 2. HANDLERS
    // ===========================

    // Submit Time Off Request
    const handleTimeOffSubmit = async (e) => {
        e.preventDefault();
        if (!timeOffData.startDate || !timeOffData.endDate || !timeOffData.reason) {
            toast.error("Please fill in all fields.");
            return;
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const payload = {
                startDate: `${timeOffData.startDate}T00:00:00`,
                endDate: `${timeOffData.endDate}T23:59:59`,
                reason: timeOffData.reason
            };

            await axios.post('http://localhost:8081/api/staff/absence-requests', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success("Request submitted successfully.");
            setIsTimeOffModalOpen(false);
            setTimeOffData({ startDate: '', endDate: '', reason: '' });
            fetchSchedule(); // Reload lại lịch để hiện đơn nghỉ (nếu có)
        } catch (error) {
            console.error("Error submitting request:", error);
            const msg = error.response?.data?.message || "Failed to submit request.";
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Calendar Navigation
    const handlePrev = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() - 1);
        setCurrentDate(newDate);
    };

    const handleNext = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + 1);
        setCurrentDate(newDate);
    };

    const formatMonthYear = (date) => {
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    // ===========================
    // 3. UI HELPERS
    // ===========================

    // Hàm lấy màu sắc dựa trên loại sự kiện và trạng thái
    const getEventStyle = (event) => {
        if (event.type === 'ABSENCE') {
            if (event.status === 'APPROVED') return "bg-green-100 border-green-200 text-green-800";
            return "bg-yellow-100 border-yellow-200 text-yellow-800"; // PENDING
        }
        
        // APPOINTMENT
        switch (event.status) {
            case 'CONFIRMED': return "bg-blue-100 border-blue-200 text-blue-800";
            case 'COMPLETED': return "bg-purple-100 border-purple-200 text-purple-800";
            case 'CANCELLED': return "bg-red-50 border-red-200 text-red-400 line-through decoration-red-400";
            default: return "bg-primary/10 border-primary/20 text-primary"; // PENDING
        }
    };

    // Hàm so sánh xem event có thuộc ngày đang render không
    const isSameDay = (date1, date2) => {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    };

    // ===========================
    // 4. RENDER
    // ===========================

    return (
        <div className="flex flex-col gap-6">
            
            {/* Header Controls */}
            <header className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-xl">calendar_month</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-black leading-tight tracking-[-0.03em] text-gray-900 dark:text-white">Schedule Dashboard</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Manage your appointments and time-off.</p>
                    </div>
                </div>
            </header>

            {/* Calendar Toolbar */}
            <section className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button onClick={() => setCurrentDate(new Date())} className="px-4 h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1e1e] font-bold text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        Today
                    </button>
                    <div className="flex items-center">
                        <button onClick={handlePrev} className="size-10 flex items-center justify-center rounded-l-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1e1e] hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <span className="material-symbols-outlined text-xl">chevron_left</span>
                        </button>
                        <button onClick={handleNext} className="size-10 flex items-center justify-center rounded-r-lg border-y border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1e1e] hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <span className="material-symbols-outlined text-xl">chevron_right</span>
                        </button>
                    </div>
                    <span className="text-lg font-bold ml-2 text-gray-800 dark:text-white">{formatMonthYear(currentDate)}</span>
                </div>

                <button 
                    onClick={() => setIsTimeOffModalOpen(true)}
                    className="flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm"
                >
                    <span className="material-symbols-outlined text-sm">event_busy</span>
                    <span>Request Time Off</span>
                </button>
            </section>

            {/* Calendar Grid */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1e1e] overflow-hidden">
                {/* Weekday Header */}
                <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                        <div key={day} className="h-10 flex items-center justify-center text-xs font-bold text-gray-500">{day}</div>
                    ))}
                </div>
                
                {/* Days Grid Logic */}
                <div className="grid grid-cols-7 text-sm">
                    {(() => {
                        // Logic tạo lịch
                        const year = currentDate.getFullYear();
                        const month = currentDate.getMonth();
                        const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) -> 6 (Sat)
                        const daysInMonth = new Date(year, month + 1, 0).getDate();
                        
                        // Tạo mảng các ô lịch (bao gồm padding ngày trống đầu tháng)
                        const totalSlots = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;
                        
                        return Array.from({ length: totalSlots }).map((_, index) => {
                            const dayNum = index - firstDayOfMonth + 1;
                            const isCurrentMonth = dayNum > 0 && dayNum <= daysInMonth;
                            
                            // Tạo đối tượng Date cho ô này để so sánh
                            const cellDate = new Date(year, month, dayNum);

                            // Lọc các sự kiện diễn ra trong ngày này
                            const daysEvents = isCurrentMonth 
                                ? scheduleEvents.filter(e => isSameDay(new Date(e.start), cellDate))
                                : [];

                            return (
                                <div key={index} className={`min-h-[120px] border-r border-b border-gray-200 dark:border-gray-700 p-2 relative ${!isCurrentMonth ? 'bg-gray-50/50 dark:bg-black/20 text-gray-400' : ''}`}>
                                    <span className={`font-semibold ${isCurrentMonth ? 'text-gray-900 dark:text-gray-100' : ''}`}>
                                        {dayNum > 0 && dayNum <= daysInMonth ? dayNum : ''}
                                    </span>
                                    
                                    {/* Render Events */}
                                    <div className="flex flex-col gap-1 mt-1">
                                        {daysEvents.map((event) => (
                                            <div 
                                                key={event.id}
                                                title={`${event.title} - ${event.status}`}
                                                className={`p-1.5 rounded border text-[10px] sm:text-xs cursor-pointer hover:opacity-80 transition-opacity ${getEventStyle(event)}`}
                                            >
                                                {event.type === 'APPOINTMENT' ? (
                                                    <>
                                                        <p className="font-bold truncate">{event.startTime?.substring(11, 16)} {event.description}</p>
                                                        <p className="truncate opacity-80">{event.title.replace('Customer: ', '')}</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p className="font-bold truncate">Absence</p>
                                                        <p className="truncate opacity-80">{event.description}</p>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        });
                    })()}
                </div>
            </div>

            {/* Time Off Modal (Giữ nguyên như cũ) */}
            {isTimeOffModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white dark:bg-[#1e1e1e] rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Request Time Off</h3>
                            <button onClick={() => setIsTimeOffModalOpen(false)} className="text-gray-500 hover:text-gray-700"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        
                        <form onSubmit={handleTimeOffSubmit} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                                <input 
                                    type="date" 
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                    value={timeOffData.startDate}
                                    onChange={(e) => setTimeOffData({...timeOffData, startDate: e.target.value})}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-black/20 text-sm"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                                <input 
                                    type="date" 
                                    required
                                    min={timeOffData.startDate || new Date().toISOString().split('T')[0]}
                                    value={timeOffData.endDate}
                                    onChange={(e) => setTimeOffData({...timeOffData, endDate: e.target.value})}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-black/20 text-sm"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Reason</label>
                                <textarea 
                                    rows="3"
                                    required
                                    placeholder="Briefly describe why you need time off..."
                                    value={timeOffData.reason}
                                    onChange={(e) => setTimeOffData({...timeOffData, reason: e.target.value})}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-black/20 text-sm resize-none"
                                ></textarea>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700 mt-2">
                                <button type="button" onClick={() => setIsTimeOffModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200">Cancel</button>
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-primary hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Sending...' : 'Submit Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffDashboard;