import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../Components/common/Toast';
import AccountLayout from '../../Components/layout/AccountLayout';

const SpaServices = () => {
    const { isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();
    const toast = useToast();

    // --- LOGIC STATE ---
    const [services, setServices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [bookingDate, setBookingDate] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [availableTechs, setAvailableTechs] = useState([]);
    const [selectedTech, setSelectedTech] = useState('');
    const [isCheckingSlots, setIsCheckingSlots] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- 1. GET SERVICES ---
    useEffect(() => {
        const fetchServices = async () => {
            try {
                // Gọi API lấy danh sách dịch vụ active
                const response = await axios.get('http://localhost:8081/api/services/active?size=100'); 
                setServices(response.data.content);
            } catch (error) {
                console.error("Error fetching services:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchServices();
    }, []);

    // --- 2. HANDLE BOOK CLICK ---
    const handleBookClick = (service) => {
        if (!isAuthenticated) {
            navigate('/login'); 
            return;
        }
        setSelectedService(service);
        setBookingDate('');
        setAvailableSlots([]);
        setSelectedSlot('');
        setAvailableTechs([]);
        setSelectedTech('');
        setIsBookingModalOpen(true);
    };

    // --- 3. LOGIC MODAL (Ẩn chi tiết API call để gọn code) ---
    useEffect(() => {
        if (!selectedService || !bookingDate) return;
        const fetchSlots = async () => {
            setIsCheckingSlots(true);
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:8081/api/booking/available-slots`, {
                    params: { serviceId: selectedService.serviceId, date: bookingDate },
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                // Filter slots on Frontend:
                // 1. Only multiples of 15 minutes (00, 15, 30, 45)
                // 2. Exclude lunch break (12:00 - 14:00)
                const filteredSlots = response.data.availableSlots.filter(slot => {
                    const [hour, minute] = slot.split(':').map(Number);
                    
                    // Check 15-minute interval
                    if (minute % 15 !== 0) return false;

                    // Check lunch break (12:00 <= time < 14:00)
                    if (hour >= 12 && hour < 14) return false;

                    return true;
                });

                setAvailableSlots(filteredSlots);
            } catch (error) { console.error(error); } finally { setIsCheckingSlots(false); }
        };
        fetchSlots();
    }, [bookingDate, selectedService]);

    useEffect(() => {
        if (!selectedService || !bookingDate || !selectedSlot) return;
        const fetchTechs = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:8081/api/booking/available-technicians`, {
                    params: { serviceId: selectedService.serviceId, startTime: `${bookingDate}T${selectedSlot}:00` },
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAvailableTechs(response.data);
            } catch (error) { console.error(error); }
        };
        fetchTechs();
    }, [selectedSlot, bookingDate, selectedService]);

    const handleConfirmBooking = async () => {
        if (!bookingDate || !selectedSlot) return toast.error("Please select date and time.");
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const payload = {
                serviceId: selectedService.serviceId,
                technicianId: selectedTech ? parseInt(selectedTech) : null,
                startTime: `${bookingDate}T${selectedSlot}:00`
            };
            await axios.post('http://localhost:8081/api/booking', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Booking successful!");
            setIsBookingModalOpen(false);
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || "Booking failed.");
        } finally { setIsSubmitting(false); }
    };

    const filteredServices = services.filter(service => 
        service.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AccountLayout showSidebar={false}>
            <div className="font-display">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-text-light dark:text-text-dark">
                        Explore Our Services
                    </h1>
                    <p className="mt-4 text-lg text-subtle-light dark:text-subtle-dark">
                        Find the perfect treatment to rejuvenate your mind and body.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-lg shadow-sm mb-10 flex flex-col md:flex-row items-center gap-4">
                    <div className="relative w-full md:flex-grow">
                        <input 
                            className="w-full pl-4 pr-4 py-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary text-text-light dark:text-text-dark" 
                            placeholder="Search for a service..." 
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Services Grid (No Images) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading ? (
                        <p className="col-span-full text-center py-10">Loading services...</p>
                    ) : filteredServices.length === 0 ? (
                        <p className="col-span-full text-center py-10 text-gray-500">No services found.</p>
                    ) : (
                        filteredServices.map(service => (
                            <div key={service.serviceId} className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm hover:shadow-md transition-shadow border border-border-light dark:border-border-dark flex flex-col h-full p-6">
                                
                                {/* Header: Name & Duration */}
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-xl font-bold text-text-light dark:text-text-dark">{service.name}</h3>
                                    <div className="flex items-center text-xs font-medium text-subtle-light dark:text-subtle-dark bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full whitespace-nowrap ml-2">
                                        <span className="material-symbols-outlined text-sm mr-1">schedule</span>
                                        {service.durationMinutes}m
                                    </div>
                                </div>
                                
                                {/* Description */}
                                <p className="text-subtle-light dark:text-subtle-dark text-sm flex-grow mb-6 line-clamp-3">
                                    {service.description || "No description available."}
                                </p>
                                
                                {/* Price & Button */}
                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Price</p>
                                        <p className="text-2xl font-bold text-primary">${service.price}</p>
                                    </div>
                                    <button 
                                        onClick={() => handleBookClick(service)}
                                        className="px-5 py-2.5 text-sm font-bold rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2"
                                    >
                                        <span>Book Now</span>
                                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* --- BOOKING MODAL --- */}
            {isBookingModalOpen && selectedService && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-surface-light dark:bg-[#1e1e1e] w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-primary/5">
                            <div>
                                <h3 className="text-lg font-bold text-text-light dark:text-text-dark">Book Appointment</h3>
                                <p className="text-sm text-primary font-medium">{selectedService.name}</p>
                            </div>
                            <button onClick={() => setIsBookingModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Select Date</label>
                                <input 
                                    type="date" 
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-transparent dark:text-white"
                                    min={new Date().toISOString().split('T')[0]}
                                    value={bookingDate}
                                    onChange={(e) => { setBookingDate(e.target.value); setSelectedSlot(''); }}
                                />
                            </div>
                            {bookingDate && (
                                <div>
                                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">Available Slots</label>
                                    {isCheckingSlots ? <div className="text-sm text-gray-500">Checking...</div> : 
                                     availableSlots.length > 0 ? (
                                        <div className="grid grid-cols-4 gap-2">
                                            {availableSlots.map(slot => (
                                                <button key={slot} onClick={() => setSelectedSlot(slot)} className={`py-2 px-1 text-sm rounded-md border transition-colors ${selectedSlot === slot ? 'bg-primary text-white border-primary' : 'hover:border-primary dark:border-gray-600 dark:text-gray-300'}`}>{slot}</button>
                                            ))}
                                        </div>
                                     ) : <p className="text-sm text-red-500 bg-red-50 p-2 rounded">No slots available.</p>
                                    }
                                </div>
                            )}
                            {selectedSlot && (
                                <div>
                                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">Technician</label>
                                    <select className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-transparent dark:text-white" value={selectedTech} onChange={(e) => setSelectedTech(e.target.value)}>
                                        <option value="">Auto-assign (Best Expert)</option>
                                        {availableTechs.map(tech => (
                                            <option key={tech.technicianId} value={tech.technicianId}>{tech.technicianName}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800">
                            <button onClick={() => setIsBookingModalOpen(false)} className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">Cancel</button>
                            <button onClick={handleConfirmBooking} disabled={!selectedSlot || isSubmitting} className="px-6 py-2 rounded-lg bg-primary text-white font-bold hover:opacity-90 disabled:opacity-50 transition-opacity">
                                {isSubmitting ? 'Booking...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AccountLayout>
    );
};

export default SpaServices;