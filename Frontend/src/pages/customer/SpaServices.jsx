import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext'; // Đảm bảo đường dẫn đúng
import { useToast } from '../../Components/common/Toast'; // Đảm bảo đường dẫn đúng

/**
 * SpaServices Page - Đã tích hợp Logic Booking
 */
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
                // Gọi API lấy danh sách dịch vụ (Public endpoint)
                // Backend trả về Page<ServiceBookingResponse>, danh sách nằm trong .content
                const response = await axios.get('http://localhost:8081/api/services/active', {
                    params: { page: 0, size: 100 } // Lấy nhiều để hiển thị hết
                });
                setServices(response.data.content);
            } catch (error) {
                console.error("Error fetching services:", error);
                // Nếu lỗi thì để mảng rỗng hoặc xử lý tùy ý
            } finally {
                setIsLoading(false);
            }
        };
        fetchServices();
    }, []);

    // --- 2. XỬ LÝ KHI BẤM "BOOK NOW" ---
    const handleBookClick = (service) => {
        if (!isAuthenticated) {
            navigate('/login'); // Chưa đăng nhập thì đá về login
            return;
        }
        setSelectedService(service);
        // Reset form
        setBookingDate('');
        setAvailableSlots([]);
        setSelectedSlot('');
        setAvailableTechs([]);
        setSelectedTech('');
        setIsBookingModalOpen(true);
    };

    // --- 3. LOGIC MODAL (Get Slots, Techs, Submit) ---
    // (Giống hệt logic bài trước, chỉ ẩn đi để gọn code view)
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
                setAvailableSlots(response.data.availableSlots);
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

    // Filter tìm kiếm
    const filteredServices = services.filter(service => 
        service.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            {/* Header (Giữ nguyên code cũ của bạn) */}
            <header className="bg-surface-light dark:bg-surface-dark shadow-sm">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Link className="text-2xl font-bold text-primary" to="/">AuraControl</Link>
                    <nav className="flex items-center space-x-6">
                        <Link className="text-subtle-light dark:text-subtle-dark hover:text-primary transition-colors" to="/">Home</Link>
                        <Link className="text-primary font-medium" to="/services">Services</Link>
                        <Link className="text-subtle-light dark:text-subtle-dark hover:text-primary transition-colors" to="/dashboard">Account</Link>
                        <Link className="text-subtle-light dark:text-subtle-dark hover:text-primary transition-colors" to="/profile">Profile</Link>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-text-light dark:text-text-dark">
                        Explore Our Services
                    </h1>
                    <p className="mt-4 text-lg text-subtle-light dark:text-subtle-dark">
                        Find the perfect treatment to rejuvenate your mind and body.
                    </p>
                </div>

                {/* Search & Filter Bar (Giữ nguyên UI) */}
                <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-lg shadow-sm mb-10 flex flex-col md:flex-row items-center gap-4">
                    <div className="relative w-full md:flex-grow">
                        <input 
                            className="w-full pl-10 pr-4 py-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary" 
                            placeholder="Search for a service..." 
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
                        <select className="w-full sm:w-48 rounded-md border border-gray-300 dark:border-gray-600 bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary py-2.5 px-3">
                            <option>All Categories</option>
                            <option>Massage</option>
                            <option>Facial</option>
                        </select>
                        <select className="w-full sm:w-48 rounded-md border border-gray-300 dark:border-gray-600 bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary py-2.5 px-3">
                            <option>Sort by Price</option>
                            <option>Low to High</option>
                            <option>High to Low</option>
                        </select>
                    </div>
                </div>

                {/* Services Grid - Dynamic Data nhưng giữ nguyên Style cũ */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {isLoading ? (
                        <p className="col-span-full text-center py-10">Loading...</p>
                    ) : filteredServices.length === 0 ? (
                        <p className="col-span-full text-center py-10">No services found.</p>
                    ) : (
                        filteredServices.map(service => (
                            <div key={service.serviceId} className="bg-surface-light dark:bg-surface-dark rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col">
                                {/* Ảnh Placeholder (Vì API chưa có ảnh) */}
                                <img 
                                    alt={service.name} 
                                    className="w-full h-56 object-cover" 
                                    src="https://images.unsplash.com/photo-1519823551278-64ac927accc9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                                />
                                <div className="p-6 flex flex-col flex-grow">
                                    <h3 className="text-xl font-semibold text-text-light dark:text-text-dark">{service.name}</h3>
                                    <p className="text-subtle-light dark:text-subtle-dark mt-2 text-sm flex-grow">
                                        {service.description || "No description available."}
                                    </p>
                                    <p className="text-2xl font-bold text-primary mt-4">${service.price}</p>
                                    
                                    <div className="mt-6 flex flex-col sm:flex-row gap-3">
                                        <button className="w-full px-4 py-2 text-sm font-medium rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition-colors">
                                            View Details
                                        </button>
                                        <button 
                                            onClick={() => handleBookClick(service)}
                                            className="w-full px-4 py-2 text-sm font-medium rounded-full bg-primary text-white hover:opacity-90 transition-opacity"
                                        >
                                            Book Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination Placeholder (Giữ nguyên) */}
                <div className="flex items-center justify-center mt-12">
                    <p className="text-subtle-light dark:text-subtle-dark">
                        More services coming soon...
                    </p>
                </div>
            </main>

            {/* Footer (Giữ nguyên) */}
            <footer className="bg-surface-light dark:bg-surface-dark border-t border-gray-200 dark:border-gray-700 mt-12">
                <div className="container mx-auto px-6 py-8 text-center text-sm text-subtle-light dark:text-subtle-dark">
                    © 2024 AuraControl. All Rights Reserved.
                </div>
            </footer>

            {/* --- BOOKING MODAL (Ẩn hiện theo state) --- */}
            {isBookingModalOpen && selectedService && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
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
                                <label className="block text-sm font-medium mb-2">Select Date</label>
                                <input 
                                    type="date" 
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-background-light dark:bg-black/20"
                                    min={new Date().toISOString().split('T')[0]}
                                    value={bookingDate}
                                    onChange={(e) => { setBookingDate(e.target.value); setSelectedSlot(''); }}
                                />
                            </div>
                            {bookingDate && (
                                <div>
                                    <label className="block text-sm font-medium mb-2">Available Slots</label>
                                    {isCheckingSlots ? <div className="text-sm text-gray-500">Checking...</div> : 
                                     availableSlots.length > 0 ? (
                                        <div className="grid grid-cols-4 gap-2">
                                            {availableSlots.map(slot => (
                                                <button key={slot} onClick={() => setSelectedSlot(slot)} className={`py-2 px-1 text-sm rounded-md border ${selectedSlot === slot ? 'bg-primary text-white' : 'hover:border-primary'}`}>{slot}</button>
                                            ))}
                                        </div>
                                     ) : <p className="text-sm text-red-500">No slots available.</p>
                                    }
                                </div>
                            )}
                            {selectedSlot && (
                                <div>
                                    <label className="block text-sm font-medium mb-2">Technician</label>
                                    <select className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-background-light dark:bg-black/20" value={selectedTech} onChange={(e) => setSelectedTech(e.target.value)}>
                                        <option value="">Auto-assign (Best Expert)</option>
                                        {availableTechs.map(tech => (
                                            <option key={tech.technicianId} value={tech.technicianId}>{tech.fullName}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                            <button onClick={() => setIsBookingModalOpen(false)} className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100">Cancel</button>
                            <button onClick={handleConfirmBooking} disabled={!selectedSlot || isSubmitting} className="px-6 py-2 rounded-lg bg-primary text-white font-bold hover:opacity-90 disabled:opacity-50">
                                {isSubmitting ? 'Booking...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpaServices;