import { useContext, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import { AuthContext } from '../context/AuthContext';
import api from '../config/api';

/**
 * Home Page - Trang chủ Spa (Giao diện mới + Logic cũ)
 */
const Home = () => {
    const { isAuthenticated, user, userRole, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    // Featured Services State
    const [featuredServices, setFeaturedServices] = useState([]);
    const [isLoadingServices, setIsLoadingServices] = useState(true);

    // Fetch featured services on mount
    useEffect(() => {
        const fetchFeaturedServices = async () => {
            try {
                const response = await api.get('/services/active', {
                    params: { page: 0, size: 6 }
                });
                setFeaturedServices(response.data.content || []);
            } catch (error) {
                console.error("Error fetching services:", error);
            } finally {
                setIsLoadingServices(false);
            }
        };
        fetchFeaturedServices();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleBookService = (serviceId) => {
        if (isAuthenticated) {
            navigate(`/services?bookService=${serviceId}`);
        } else {
            navigate('/login');
        }
    };

    return (
        <div className="font-display bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark antialiased">
            {/* --- HEADER --- */}
            <header className="sticky top-0 z-50 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md shadow-sm">
                <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                    {/* Logo */}
                    <Link className="text-2xl font-bold text-primary" to="/">AuraControl</Link>
                    
                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link className="text-text-light dark:text-text-dark hover:text-primary dark:hover:text-primary transition-colors" to="/">Home</Link>
                        <button 
                            onClick={() => isAuthenticated ? navigate('/services') : navigate('/login')}
                            className="text-subtle-light dark:text-subtle-dark hover:text-primary dark:hover:text-primary transition-colors"
                        >
                            Services
                        </button>
                    </div>

                    {/* Auth Buttons (Logic ghép vào đây) */}
                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                {/* Hiển thị tên user */}
                                <span className="text-subtle-light dark:text-subtle-dark text-sm hidden sm:inline font-medium">
                                    Hello, {user?.email?.split('@')[0]}
                                </span>

                                {/* Nút Admin/Staff Dashboard */}
                                {userRole === 'ADMIN' && (
                                    <button 
                                        onClick={() => navigate('/admin')} 
                                        className="text-subtle-light hover:text-primary transition-colors text-sm font-medium"
                                    >
                                        Admin
                                    </button>
                                )}
                                {userRole === 'TECHNICIAN' && (
                                    <button 
                                        onClick={() => navigate('/staff')} 
                                        className="text-subtle-light hover:text-primary transition-colors text-sm font-medium"
                                    >
                                        Staff
                                    </button>
                                )}

                                {/* Account Dashboard */}
                                <button 
                                    onClick={() => navigate('/dashboard')} 
                                    className="text-subtle-light hover:text-primary transition-colors text-sm font-medium"
                                >
                                    My Account
                                </button>

                                {/* Logout Button */}
                                <button 
                                    onClick={handleLogout} 
                                    className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                {/* Chưa đăng nhập */}
                                <Link 
                                    to="/login"
                                    className="text-subtle-light dark:text-subtle-dark hover:text-primary dark:hover:text-primary transition-colors text-sm font-medium"
                                >
                                    Log in
                                </Link>
                                <Link 
                                    to="/signup"
                                    className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </nav>
            </header>

            <main>
                {/* --- HERO SECTION --- */}
                <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center text-center text-white">
                    <div className="absolute inset-0 bg-black/50 z-10"></div>
                    {/* Đã thay link ảnh mẫu đẹp hơn */}
                    <img 
                        alt="Two women in bathrobes enjoying a spa day at home" 
                        className="absolute inset-0 w-full h-full object-cover" 
                        src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
                    />
                    <div className="relative z-20 px-6 max-w-3xl">
                        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4">Wellness That Comes to You</h1>
                        <p className="text-lg md:text-xl mb-8 text-gray-200">Book professional massage & beauty therapists in your home, hotel, or office.</p>
                        
                        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
                            {/* Nút Book Now có Logic check login */}
                            <button 
                                onClick={() => isAuthenticated ? navigate('/dashboard') : navigate('/login')}
                                className="w-full sm:w-auto bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                            >
                                Book Now
                            </button>
                            <a 
                                className="w-full sm:w-auto bg-white/20 backdrop-blur-sm text-white px-8 py-3 rounded-lg font-semibold border border-white/30 hover:bg-white/30 transition-colors" 
                                href="#services"
                            >
                                Explore Services
                            </a>
                        </div>
                    </div>
                </section>

                {/* --- INTRO SECTION --- */}
                <section className="py-16 sm:py-24">
                    <div className="container mx-auto px-6 text-center max-w-3xl">
                        <h2 className="text-3xl sm:text-4xl font-bold text-text-light dark:text-text-dark mb-4">Self-Care, Simplified.</h2>
                        <p className="text-lg text-subtle-light dark:text-subtle-dark">
                            We believe wellness should be effortless. That's why we bring certified, vetted professionals directly to your door. Enjoy a five-star spa experience without leaving the comfort of your home. Relax, rejuvenate, and find your bliss on your own schedule.
                        </p>
                    </div>
                </section>

                {/* --- SERVICES SECTION --- */}
                <section id="services" className="py-16 sm:py-24 bg-surface-light dark:bg-surface-dark">
                    <div className="container mx-auto px-6">
                        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-text-light dark:text-text-dark">Our Services</h2>
                        <p className="text-center text-subtle-light dark:text-subtle-dark mb-12 max-w-2xl mx-auto">
                            Discover our range of professional spa and wellness treatments
                        </p>
                        
                        {isLoadingServices ? (
                            <div className="text-center py-12">
                                <p className="text-subtle-light dark:text-subtle-dark">Loading services...</p>
                            </div>
                        ) : featuredServices.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-subtle-light dark:text-subtle-dark">No services available at the moment.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {featuredServices.map(service => (
                                    <div 
                                        key={service.serviceId} 
                                        className="bg-background-light dark:bg-background-dark rounded-lg overflow-hidden shadow-lg transform hover:-translate-y-2 transition-transform duration-300"
                                    >
                                        <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-6xl text-primary/50">spa</span>
                                        </div>
                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-xl font-semibold text-text-light dark:text-text-dark">{service.name}</h3>
                                                <span className="text-lg font-bold text-primary">${service.price}</span>
                                            </div>
                                            <p className="text-subtle-light dark:text-subtle-dark mb-2 text-sm line-clamp-2">
                                                {service.description || "Experience our professional treatment."}
                                            </p>
                                            <p className="text-xs text-subtle-light dark:text-subtle-dark mb-4 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">schedule</span>
                                                {service.durationMinutes} minutes
                                            </p>
                                            <button 
                                                onClick={() => handleBookService(service.serviceId)}
                                                className="w-full bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                                            >
                                                Book Now
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {/* View All Services Button */}
                        <div className="text-center mt-10">
                            <button 
                                onClick={() => navigate('/services')}
                                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary rounded-lg font-medium hover:bg-primary hover:text-white transition-colors"
                            >
                                View All Services
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* --- TESTIMONIALS --- */}
                <section className="py-16 sm:py-24">
                    <div className="container mx-auto px-6">
                        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-text-light dark:text-text-dark">What Our Clients Say</h2>
                        <div className="relative max-w-3xl mx-auto">
                            <div className="bg-surface-light dark:bg-surface-dark p-8 rounded-lg shadow-lg text-center">
                                <img 
                                    alt="Happy customer" 
                                    className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-primary/50" 
                                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80" 
                                />
                                <p className="text-lg italic text-subtle-light dark:text-subtle-dark mb-4">"The most relaxing massage I've ever had, and I didn't even have to leave my house! The therapist was professional and created a wonderfully serene atmosphere. I'll definitely be booking again."</p>
                                <p className="font-semibold text-text-light dark:text-text-dark">- Jessica L.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* --- FOOTER --- */}
            <footer className="bg-surface-light dark:bg-surface-dark border-t border-gray-200 dark:border-gray-700">
                <div className="container mx-auto px-6 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                        <div>
                            <Link className="inline-block text-2xl font-bold text-primary mb-4" to="/">AuraControl</Link>
                            <p className="text-sm text-subtle-light dark:text-subtle-dark max-w-xs mx-auto md:mx-0">Bringing the best in-home massage, beauty, and wellness services to you.</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-text-light dark:text-text-dark mb-4">Contact Us</h4>
                            <ul className="space-y-2 text-sm text-subtle-light dark:text-subtle-dark">
                                <li><a className="hover:text-primary transition-colors" href="mailto:hello@auracontrol.com">hello@auracontrol.com</a></li>
                                <li><a className="hover:text-primary transition-colors" href="tel:1800123456">1-800-123-456</a></li>
                                <li>Help Center</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-text-light dark:text-text-dark mb-4">Follow Us</h4>
                            <div className="flex justify-center md:justify-start space-x-4">
                                <a className="text-subtle-light dark:text-subtle-dark hover:text-primary transition-colors" href="#">Facebook</a>
                                <a className="text-subtle-light dark:text-subtle-dark hover:text-primary transition-colors" href="#">Instagram</a>
                                <a className="text-subtle-light dark:text-subtle-dark hover:text-primary transition-colors" href="#">Twitter</a>
                            </div>
                        </div>
                    </div>
                    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-subtle-light dark:text-subtle-dark">
                        © 2024 AuraControl. All Rights Reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;