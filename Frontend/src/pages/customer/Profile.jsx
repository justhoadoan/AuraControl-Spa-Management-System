import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext'; 

const Profile = () => {
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext) || {}; 

    // State for user data
    const [profile, setProfile] = useState({
        fullName: '',
        email: ''
    });
    
    // State to store original data (for Cancel functionality)
    const [originalProfile, setOriginalProfile] = useState({ fullName: '' });

    // UI States
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', content: '' }); // type: 'success' | 'error'

    // 1. Fetch data on load (GET /api/users/me)
    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await axios.get('http://localhost:8081/api/users/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                const data = response.data;
                setProfile({ fullName: data.fullName, email: data.email });
                setOriginalProfile({ fullName: data.fullName });
            } catch (error) {
                console.error("Error fetching profile:", error);
                setMessage({ type: 'error', content: 'Failed to load personal information.' });
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    // 2. Handle Input Change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    // 3. Handle Save (PUT /api/users/me)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ type: '', content: '' });

        const token = localStorage.getItem('token');
        try {
            const response = await axios.put(
                'http://localhost:8081/api/users/me',
                { fullName: profile.fullName },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Success message
            setMessage({ 
                type: 'success', 
                content: response.data.message || 'Profile updated successfully!' 
            });
            setOriginalProfile({ fullName: profile.fullName }); // Update original state
        } catch (error) {
            console.error("Error updating profile:", error);
            setMessage({ 
                type: 'error', 
                content: 'Update failed. Please try again later.' 
            });
        } finally {
            setIsSaving(false);
        }
    };

    // 4. Handle Cancel (Reset to original data)
    const handleCancel = () => {
        setProfile(prev => ({ ...prev, fullName: originalProfile.fullName }));
        setMessage({ type: '', content: '' });
    };

    const handleLogout = () => {
        if (logout) logout();
        navigate('/login');
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Loading profile...</div>;
    }

    return (
        <div className="bg-background-light dark:bg-background-dark font-body antialiased min-h-screen transition-colors duration-200">
            
            {/* --- HEADER --- */}
            <header className="bg-card-light dark:bg-card-dark shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <div className="flex-shrink-0 flex items-center">
                            <a href="/" className="font-display text-3xl font-bold text-primary">AuraControl</a>
                        </div>
                        <nav className="hidden md:flex space-x-8">
                            {['In-Home', 'Features', 'Pricing & Plans', 'Locations', 'Help & Supports'].map((item) => (
                                <a key={item} href="#" className="text-text-muted-light dark:text-text-muted-dark hover:text-primary dark:hover:text-primary transition font-medium">
                                    {item}
                                </a>
                            ))}
                        </nav>
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2 cursor-pointer">
                                <div className="relative">
                                    <img alt="User Avatar" className="h-10 w-10 rounded-full object-cover border-2 border-primary/20" src={`https://ui-avatars.com/api/?name=${profile.fullName || 'User'}&background=DE4F7A&color=fff`} />
                                    <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white dark:ring-gray-800"></span>
                                </div>
                                <div className="hidden md:flex items-center text-text-main-light dark:text-text-main-dark font-medium">
                                    <span>{profile.fullName || 'User'}</span>
                                    <span className="material-icons text-lg ml-1 text-text-muted-light">expand_more</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- MAIN CONTENT --- */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                    
                    {/* SIDEBAR */}
                    <aside className="lg:col-span-3 mb-8 lg:mb-0">
                        <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-sm p-6">
                            <h2 className="text-xl font-bold text-text-main-light dark:text-text-main-dark mb-6 font-display">My Account</h2>
                            <nav className="space-y-1">
                                <a href="#" className="group flex items-center px-4 py-3 text-sm font-medium rounded-lg text-text-muted-light dark:text-text-muted-dark hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary dark:hover:text-white transition-colors">
                                    <span className="material-icons mr-3 text-xl text-gray-400 group-hover:text-primary dark:group-hover:text-white">event</span>
                                    Upcoming Appointments
                                </a>
                                <a href="#" className="group flex items-center px-4 py-3 text-sm font-medium rounded-lg text-text-muted-light dark:text-text-muted-dark hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary dark:hover:text-white transition-colors">
                                    <span className="material-icons mr-3 text-xl text-gray-400 group-hover:text-primary dark:group-hover:text-white">history</span>
                                    Appointment History
                                </a>
                                <a href="#" className="group flex items-center px-4 py-3 text-sm font-medium rounded-lg bg-primary/10 dark:bg-primary/20 text-primary">
                                    <span className="material-icons mr-3 text-xl text-primary">person</span>
                                    Personal Information
                                </a>
                                <button onClick={handleLogout} className="w-full group flex items-center px-4 py-3 text-sm font-medium rounded-lg text-text-muted-light dark:text-text-muted-dark hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary dark:hover:text-white transition-colors mt-8">
                                    <span className="material-icons mr-3 text-xl text-gray-400 group-hover:text-primary dark:group-hover:text-white">logout</span>
                                    Logout
                                </button>
                            </nav>
                        </div>
                    </aside>

                    {/* FORM AREA */}
                    <div className="lg:col-span-9">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-3xl font-display font-bold text-text-main-light dark:text-text-main-dark">Personal Information</h1>
                        </div>

                        {/* Status Message */}
                        {message.content && (
                            <div className={`mb-4 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {message.content}
                            </div>
                        )}

                        <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-sm p-8">
                            <form onSubmit={handleSubmit}>
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                        
                                        {/* Name Input (Editable) */}
                                        <div className="sm:col-span-4">
                                            <label htmlFor="fullName" className="block text-sm font-medium text-text-main-light dark:text-text-main-dark">
                                                Full Name
                                            </label>
                                            <div className="mt-1">
                                                <input
                                                    type="text"
                                                    id="fullName"
                                                    name="fullName"
                                                    value={profile.fullName}
                                                    onChange={handleInputChange}
                                                    className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md p-2.5 border"
                                                />
                                            </div>
                                        </div>

                                        {/* Email Input (Read-only) */}
                                        <div className="sm:col-span-4">
                                            <label htmlFor="email" className="block text-sm font-medium text-text-main-light dark:text-text-main-dark">
                                                Email Address
                                            </label>
                                            <div className="mt-1">
                                                <input
                                                    type="email"
                                                    id="email"
                                                    value={profile.email}
                                                    disabled
                                                    className="shadow-sm block w-full sm:text-sm border-gray-300 bg-gray-100 text-gray-500 rounded-md p-2.5 border cursor-not-allowed"
                                                />
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                <div className="pt-8">
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            className="bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-text-main-light dark:text-text-main-dark hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary mr-3"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className={`ml-3 inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors ${isSaving ? 'opacity-70 cursor-wait' : ''}`}
                                        >
                                            {isSaving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            {/* --- FOOTER --- */}
            <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <a href="#" className="font-display text-4xl font-bold text-primary mb-4 inline-block">AuraControl</a>
                        <p className="text-text-muted-light dark:text-text-muted-dark mt-2 max-w-xl mx-auto text-sm">
                            Australia's #1 platform for in-home massage, beauty and wellness. Bringing professional services directly to your door.
                        </p>
                    </div>
                    {/* Social Icons Placeholder */}
                    <div className="flex justify-center space-x-6">
                        {/* You can re-add your SVG icons here */}
                    </div>
                    <div className="mt-8 md:mt-10 md:order-1">
                        <p className="text-center text-sm text-text-muted-light dark:text-text-muted-dark">
                            © 2024 AuraControl. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Profile;