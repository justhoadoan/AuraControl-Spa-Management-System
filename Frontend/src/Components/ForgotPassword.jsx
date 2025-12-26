import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            await axios.post('http://localhost:8081/api/auth/forgot-password', { email });
            setIsError(false);
            setMessage("If the email exists, a password reset instruction has been sent.");
        } catch (error) {
            setIsError(true);
            const errorMsg = error.response?.data || 'An error occurred. Please try again.';
            setMessage(typeof errorMsg === 'string' ? errorMsg : errorMsg.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <h2 className="text-2xl font-bold text-slate-800 mb-2 text-center">Reset Password</h2>
            
            <p className="text-sm text-slate-500 mb-6 text-center">
                Enter your email address and we will send you a link to reset your password.
            </p>

            {/* Thông báo */}
            {message && (
                <div className={`px-4 py-3 rounded-lg text-sm text-center mb-4 ${isError ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                    <input 
                        type="email" 
                        required 
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg transition-all shadow-lg disabled:opacity-50"
                >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
            </form>

            {/* Back to Login */}
            <div className="mt-6 text-center">
                <button 
                    onClick={() => navigate('/login')} 
                    className="text-sm text-pink-600 font-bold hover:underline"
                >
                    ← Back to Login
                </button>
            </div>
        </>
    );
};

export default ForgotPassword;