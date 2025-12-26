import React from 'react';
import { Link } from 'react-router-dom';

/**
 * SpaServices Page - Customer view for browsing all spa services
 */
const SpaServices = () => {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            {/* Header */}
            <header className="bg-surface-light dark:bg-surface-dark shadow-sm">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Link className="text-2xl font-bold text-primary" to="/">AuraControl</Link>
                    <nav className="flex items-center space-x-6">
                        <Link className="text-subtle-light dark:text-subtle-dark hover:text-primary transition-colors" to="/">Home</Link>
                        <Link className="text-primary font-medium" to="/services">Services</Link>
                        <Link className="text-subtle-light dark:text-subtle-dark hover:text-primary transition-colors" to="/account">Account</Link>
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

                {/* Search & Filter Bar */}
                <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-lg shadow-sm mb-10 flex flex-col md:flex-row items-center gap-4">
                    <div className="relative w-full md:flex-grow">
                        <input 
                            className="w-full pl-10 pr-4 py-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary" 
                            placeholder="Search for a service..." 
                            type="text"
                        />
                    </div>
                    <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
                        <select className="w-full sm:w-48 rounded-md border border-gray-300 dark:border-gray-600 bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary py-2.5 px-3">
                            <option>All Categories</option>
                            <option>Massage</option>
                            <option>Facial</option>
                            <option>Body Treatment</option>
                        </select>
                        <select className="w-full sm:w-48 rounded-md border border-gray-300 dark:border-gray-600 bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary py-2.5 px-3">
                            <option>Sort by Price</option>
                            <option>Low to High</option>
                            <option>High to Low</option>
                        </select>
                    </div>
                </div>

                {/* Services Grid - Placeholder */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Service Card 1 */}
                    <div className="bg-surface-light dark:bg-surface-dark rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col">
                        <img 
                            alt="Swedish Massage" 
                            className="w-full h-56 object-cover" 
                            src="https://images.unsplash.com/photo-1519823551278-64ac927accc9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                        />
                        <div className="p-6 flex flex-col flex-grow">
                            <h3 className="text-xl font-semibold text-text-light dark:text-text-dark">Swedish Massage</h3>
                            <p className="text-subtle-light dark:text-subtle-dark mt-2 text-sm flex-grow">
                                A gentle, full-body massage perfect for relaxation and relieving muscle tension.
                            </p>
                            <p className="text-2xl font-bold text-primary mt-4">$120</p>
                            <div className="mt-6 flex flex-col sm:flex-row gap-3">
                                <button className="w-full px-4 py-2 text-sm font-medium rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition-colors">
                                    View Details
                                </button>
                                <button className="w-full px-4 py-2 text-sm font-medium rounded-full bg-primary text-white hover:opacity-90 transition-opacity">
                                    Book Now
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Service Card 2 */}
                    <div className="bg-surface-light dark:bg-surface-dark rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col">
                        <img 
                            alt="Hydrating Facial" 
                            className="w-full h-56 object-cover" 
                            src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                        />
                        <div className="p-6 flex flex-col flex-grow">
                            <h3 className="text-xl font-semibold text-text-light dark:text-text-dark">Hydrating Facial</h3>
                            <p className="text-subtle-light dark:text-subtle-dark mt-2 text-sm flex-grow">
                                Deeply moisturizes and revitalizes dry, dull skin for a radiant glow.
                            </p>
                            <p className="text-2xl font-bold text-primary mt-4">$95</p>
                            <div className="mt-6 flex flex-col sm:flex-row gap-3">
                                <button className="w-full px-4 py-2 text-sm font-medium rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition-colors">
                                    View Details
                                </button>
                                <button className="w-full px-4 py-2 text-sm font-medium rounded-full bg-primary text-white hover:opacity-90 transition-opacity">
                                    Book Now
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Service Card 3 */}
                    <div className="bg-surface-light dark:bg-surface-dark rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col">
                        <img 
                            alt="Hot Stone Therapy" 
                            className="w-full h-56 object-cover" 
                            src="https://images.unsplash.com/photo-1600334129128-685c5582fd35?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                        />
                        <div className="p-6 flex flex-col flex-grow">
                            <h3 className="text-xl font-semibold text-text-light dark:text-text-dark">Hot Stone Therapy</h3>
                            <p className="text-subtle-light dark:text-subtle-dark mt-2 text-sm flex-grow">
                                Heated stones are used to melt away tension and ease muscle stiffness.
                            </p>
                            <p className="text-2xl font-bold text-primary mt-4">$150</p>
                            <div className="mt-6 flex flex-col sm:flex-row gap-3">
                                <button className="w-full px-4 py-2 text-sm font-medium rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition-colors">
                                    View Details
                                </button>
                                <button className="w-full px-4 py-2 text-sm font-medium rounded-full bg-primary text-white hover:opacity-90 transition-opacity">
                                    Book Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pagination Placeholder */}
                <div className="flex items-center justify-center mt-12">
                    <p className="text-subtle-light dark:text-subtle-dark">
                        More services coming soon...
                    </p>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-surface-light dark:bg-surface-dark border-t border-gray-200 dark:border-gray-700 mt-12">
                <div className="container mx-auto px-6 py-8 text-center text-sm text-subtle-light dark:text-subtle-dark">
                    © 2024 AuraControl. All Rights Reserved.
                </div>
            </footer>
        </div>
    );
};

export default SpaServices;
