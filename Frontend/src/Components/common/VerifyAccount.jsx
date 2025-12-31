import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../config/api';

const VerifyAccount = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Dùng useRef để chặn React Strict Mode gọi API 2 lần
    const isCalled = useRef(false);

    const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
    const [message, setMessage] = useState('Verifying your account, please wait...');

    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            setStatus('error');
            setMessage('Invalid activation link or missing token.');
            return;
        }

        if (isCalled.current) return;
        isCalled.current = true; 

        // Gọi API xác thực
        api.get(`/auth/verify-account?token=${token}`)
            .then((response) => {
                setStatus('success');
                const successMsg = typeof response.data === 'string' ? response.data : "Account activated successfully!";
                setMessage(successMsg);
            })
            .catch((error) => {
                setStatus('error');
                if (error.response && error.response.data) {
                    const errorData = error.response.data;
                    setMessage(typeof errorData === 'string' ? errorData : (errorData.message || 'Activation failed.'));
                } else {
                    setMessage('Unable to connect to the server.');
                }
            });
            
    }, [searchParams]);

    return (
        <div className="text-center">
            {/* TRẠNG THÁI: ĐANG XỬ LÝ */}
            {status === 'verifying' && (
                <div className="flex flex-col items-center py-8">
                    {/* Spinner Tailwind */}
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mb-4"></div>
                    <h2 className="text-xl font-bold text-slate-700 mb-2">Activating Account...</h2>
                    <p className="text-slate-500 text-sm">{message}</p>
                </div>
            )}

            {/* TRẠNG THÁI: THÀNH CÔNG */}
            {status === 'success' && (
                <div className="py-6">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                        <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Success!</h2>
                    <p className="text-slate-600 mb-8">{message}</p>
                    
                    <button 
                        onClick={() => navigate('/login')}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg transition-all shadow-lg"
                    >
                        Go to Login
                    </button>
                </div>
            )}

            {/* TRẠNG THÁI: LỖI */}
            {status === 'error' && (
                <div className="py-6">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                        <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Activation Failed</h2>
                    <p className="text-red-500 mb-8 bg-red-50 p-3 rounded-lg text-sm border border-red-100">
                        {message}
                    </p>
                    
                    <div className="space-y-3">
                        <button 
                            onClick={() => navigate('/login')}
                            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-lg transition-all shadow-md"
                        >
                            Back to Login
                        </button>
                        <button 
                            onClick={() => navigate('/')}
                            className="block w-full text-sm text-slate-500 hover:text-slate-700 font-medium"
                        >
                            Go to Homepage
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VerifyAccount;