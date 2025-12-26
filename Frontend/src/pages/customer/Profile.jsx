import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AccountLayout from '../../Components/layout/AccountLayout';

const Profile = () => {
    const navigate = useNavigate();

    // State
    const [profile, setProfile] = useState({ fullName: '', email: '' });
    const [originalProfile, setOriginalProfile] = useState({ fullName: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', content: '' }); 

    // 1. Fetch data
    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login'); return;
            }
            try {
                // Sửa port nếu cần (8080 hoặc 8081)
                const response = await axios.get('http://localhost:8081/api/users/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = response.data;
                setProfile({ fullName: data.fullName, email: data.email });
                setOriginalProfile({ fullName: data.fullName });
            } catch (error) {
                console.error(error);
                setMessage({ type: 'error', content: 'Failed to load profile.' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [navigate]);

    // Handle inputs & submit
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ type: '', content: '' });
        const token = localStorage.getItem('token');
        try {
            const response = await axios.put('http://localhost:8081/api/users/me',
                { fullName: profile.fullName },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage({ type: 'success', content: response.data.message || 'Updated successfully!' });
            setOriginalProfile({ fullName: profile.fullName }); 
        } catch (error) {
            setMessage({ type: 'error', content: 'Update failed.' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AccountLayout>
            {isLoading ? (
                <div className="p-10 text-center text-slate-500">Loading...</div>
            ) : (
                <>
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-white">Personal Information</h1>
                    </div>

                    {message.content && (
                        <div className={`mb-6 p-4 rounded-md border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                            {message.content}
                        </div>
                    )}

                    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-8">
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 gap-y-6 gap-x-4">
                                    <div className="max-w-lg">
                                        <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                                        <input type="text" id="fullName" name="fullName" value={profile.fullName} onChange={handleInputChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white py-2.5"/>
                                    </div>
                                    <div className="max-w-lg">
                                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                                        <input type="email" id="email" value={profile.email} disabled className="w-full rounded-md border-gray-300 bg-slate-100 text-slate-500 shadow-sm cursor-not-allowed dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 py-2.5"/>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                                <button type="button" onClick={() => setProfile({ ...profile, fullName: originalProfile.fullName })} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
                                <button type="submit" disabled={isSaving} className={`px-6 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-opacity-90 transition-colors shadow-sm ${isSaving ? 'opacity-70 cursor-wait' : ''}`}>{isSaving ? 'Saving...' : 'Save Changes'}</button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </AccountLayout>
    );
};

export default Profile;