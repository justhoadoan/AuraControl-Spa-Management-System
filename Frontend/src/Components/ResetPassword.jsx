import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token'); 
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Kiểm tra token ngay khi component render
    if (!token) {
        return (
            <div className="text-center">
                <div className="text-red-500 text-lg font-bold mb-4">Invalid Link</div>
                <p className="text-slate-500 mb-4">The password reset link is missing or invalid.</p>
                <button onClick={() => navigate('/login')} className="text-pink-600 hover:underline">Back to Login</button>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (password !== confirmPassword) {
            setIsError(true);
            setMessage("Passwords do not match.");
            return;
        }

        setIsLoading(true);
        try {
            await axios.post('http://localhost:8081/api/auth/reset-password', {
                token: token,
                newPassword: password
            });

            setIsError(false);
            setMessage('Password changed successfully! Redirecting to login...');
            
            setTimeout(() => navigate('/login'), 2000);

        } catch (error) {
            setIsError(true);
            setMessage(error.response?.data || 'Link has expired or is invalid.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Set New Password</h2>
            
            {message && (
                <div className={`px-4 py-3 rounded-lg text-sm text-center mb-4 ${isError ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'}`}>
                    {message}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        placeholder="••••••••"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                    <input 
                        type="password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        required 
                        placeholder="••••••••"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg transition-all shadow-lg disabled:opacity-50"
                >
                    {isLoading ? 'Updating...' : 'Reset Password'}
                </button>
            </form>
        </>
    );
};

export default ResetPassword;