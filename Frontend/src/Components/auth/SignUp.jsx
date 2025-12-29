import {useState, useContext} from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import { validateForm } from '../../utils/Validation.jsx';
import { useToast } from '../common/Toast';
// Bỏ import FlowersImg và CSS

const SignUp = () => {
    const toast = useToast();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    // --- GIỮ NGUYÊN LOGIC CŨ ---
    const handleSignUp = async () => {
        const validationErrors = {};
        if (!name.trim()) validationErrors.name = 'Name is required';
        const formErrors = validateForm(email, password, true);
        Object.assign(validationErrors, formErrors);
        if (password !== confirmPassword) validationErrors.confirmPassword = 'Passwords do not match';
        
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({name, email, password})
            });

            if(!response.ok){
                const errorText = await response.text();
                let errorMessage = errorText;
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.message || errorText;
                } catch (e) {}

                if(response.status === 409 || errorMessage.toLowerCase().includes('email') || errorMessage.toLowerCase().includes('exists')){
                    setErrors({email: 'Email is already in use.'});
                } else {
                    setErrors({general: errorMessage || 'Registration failed.'});
                }
                return; 
            }  
            
            setName(''); setEmail(''); setPassword(''); setConfirmPassword(''); setErrors({});
            toast.success("Registration successful! Please check your email.", 6000);
            navigate('/login');
            
        } catch (error) {
            console.error('Error during sign up:', error);
            setErrors({ general: 'Unable to connect to the server.' });
        } finally {
            setIsLoading(false);
        }
    }

    // --- GIAO DIỆN MỚI ---
    return (
        <>
            <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Create Account</h2>

            {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm text-center mb-4">
                    {errors.general}
                </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleSignUp(); }} className="space-y-4">
                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                    <input type="text" value={name} onChange={(e) => {setName(e.target.value); if(errors.name) setErrors({...errors, name:''})}} disabled={isLoading}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
                    />
                    {errors.name && <span className="text-xs text-red-500 mt-1 block">{errors.name}</span>}
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input type="email" value={email} onChange={(e) => {setEmail(e.target.value); if(errors.email) setErrors({...errors, email:''})}} disabled={isLoading}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
                    />
                    {errors.email && <span className="text-xs text-red-500 mt-1 block">{errors.email}</span>}
                </div>

                {/* Password */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <input type="password" value={password} onChange={(e) => {setPassword(e.target.value); if(errors.password) setErrors({...errors, password:''})}} disabled={isLoading}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
                    />
                    {errors.password && <span className="text-xs text-red-500 mt-1 block">{errors.password}</span>}
                </div>

                {/* Confirm Password */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                    <input type="password" value={confirmPassword} onChange={(e) => {setConfirmPassword(e.target.value); if(errors.confirmPassword) setErrors({...errors, confirmPassword:''})}} disabled={isLoading}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
                    />
                    {errors.confirmPassword && <span className="text-xs text-red-500 mt-1 block">{errors.confirmPassword}</span>}
                </div>

                <button type="submit" disabled={isLoading}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-lg transition-all shadow-md shadow-pink-500/30 mt-2 disabled:opacity-50"
                >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-600">
                Already have an account?{' '}
                <button type="button" className="text-pink-600 font-bold hover:underline" onClick={() => navigate('/login')}>
                    Log in
                </button>
            </div>
            
            <div className="mt-4 text-xs text-center text-slate-400">
                By registering you agree to our <a href="#" className="underline">Terms</a> & <a href="#" className="underline">Privacy</a>.
            </div>
        </>
    );
}

export default SignUp;