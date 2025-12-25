import { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Thêm Link để chuyển trang mượt hơn
import { AuthContext } from '../context/AuthContext';

/**
 * Home Page - Trang chủ Spa (Giao diện mới + Logic cũ)
 */
const Home = () => {
    const { isAuthenticated, user, userRole, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="font-display bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark antialiased">
            {/* --- HEADER --- */}
            <header className="sticky top-0 z-50 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md shadow-sm">
                <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                    {/* Logo */}
                    <Link className="text-2xl font-bold text-primary" to="/">blyss</Link>
                    
                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link className="text-text-light dark:text-text-dark hover:text-primary dark:hover:text-primary transition-colors" to="/">Home</Link>
                        <a className="text-subtle-light dark:text-subtle-dark hover:text-primary dark:hover:text-primary transition-colors" href="#services">Services</a>
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

                                {/* My Appointments */}
                                <button 
                                    onClick={() => navigate('/my-appointments')} 
                                    className="text-subtle-light hover:text-primary transition-colors text-sm font-medium"
                                >
                                    My Appointments
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
                                onClick={() => isAuthenticated ? navigate('/my-appointments') : navigate('/login')}
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
                        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-text-light dark:text-text-dark">Featured Services</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Service 1 */}
                            <div className="bg-background-light dark:bg-background-dark rounded-lg overflow-hidden shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
                                <img alt="Swedish Massage" className="w-full h-56 object-cover" src="https://images.unsplash.com/photo-1519823551278-64ac927accc9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" />
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold mb-2 text-text-light dark:text-text-dark">Swedish Massage</h3>
                                    <p className="text-subtle-light dark:text-subtle-dark mb-4 text-sm">A gentle, full-body massage perfect for relaxation and stress relief.</p>
                                    <Link to="/login" className="inline-block bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                                        Book This
                                    </Link>
                                </div>
                            </div>
                            {/* Service 2 */}
                            <div className="bg-background-light dark:bg-background-dark rounded-lg overflow-hidden shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
                                <img alt="Hydrating Facial" className="w-full h-56 object-cover" src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" />
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold mb-2 text-text-light dark:text-text-dark">Hydrating Facial</h3>
                                    <p className="text-subtle-light dark:text-subtle-dark mb-4 text-sm">Deeply cleanse, exfoliate, and nourish your skin for a radiant glow.</p>
                                    <Link to="/login" className="inline-block bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                                        Book This
                                    </Link>
                                </div>
                            </div>
                            {/* Service 3 */}
                            <div className="bg-background-light dark:bg-background-dark rounded-lg overflow-hidden shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
                                <img alt="Luxury Manicure" className="w-full h-56 object-cover" src="https://images.unsplash.com/photo-1632345031435-8727f6897d53?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" />
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold mb-2 text-text-light dark:text-text-dark">Luxury Manicure</h3>
                                    <p className="text-subtle-light dark:text-subtle-dark mb-4 text-sm">Indulge in a premium nail treatment, including shaping, cuticle care, and polish.</p>
                                    <Link to="/login" className="inline-block bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                                        Book This
                                    </Link>
                                </div>
                            </div>
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
                            <Link className="inline-block text-2xl font-bold text-primary mb-4" to="/">blyss</Link>
                            <p className="text-sm text-subtle-light dark:text-subtle-dark max-w-xs mx-auto md:mx-0">Bringing the best in-home massage, beauty, and wellness services to you.</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-text-light dark:text-text-dark mb-4">Contact Us</h4>
                            <ul className="space-y-2 text-sm text-subtle-light dark:text-subtle-dark">
                                <li><a className="hover:text-primary transition-colors" href="mailto:hello@blyss.com">hello@blyss.com</a></li>
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
                        © 2024 blyss. All Rights Reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;