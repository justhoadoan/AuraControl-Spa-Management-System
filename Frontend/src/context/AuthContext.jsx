import {createContext, useState, useEffect} from 'react';
import {jwtDecode} from 'jwt-decode';

export const AuthContext = createContext();

const AuthProvider = ({children}) => {
    // State for authentication management
    const [token, setToken] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const storedToken = localStorage.getItem('token');

        if(storedToken) {
            try {
                // Decode token to get user info
                const decoded = jwtDecode(storedToken);
                
                // Check if token is expired
                const currentTime = Date.now() / 1000;
                if(decoded.exp && decoded.exp < currentTime) {
                    // Token expired, logout
                    logout();
                    return;
                }
                
                // Token is valid, restore state
                setToken(storedToken);
                setUserRole(decoded.role || decoded.authorities?.[0] || null);
                setUser({
                    id: decoded.sub || decoded.userId,
                    email: decoded.email,
                    ...decoded
                });
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Invalid token:', error);
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = (authToken) =>{
        try {
            // Decode token to extract user info
            const decoded = jwtDecode(authToken);
            
            // Check if token is expired
            const currentTime = Date.now() / 1000;
            if(decoded.exp && decoded.exp < currentTime) {
                throw new Error('Token is expired');
            }
            
            const role = decoded.role || decoded.authorities?.[0] || null;
            const userInfo = {
                id: decoded.sub || decoded.userId,
                email: decoded.email,
                ...decoded
            };
            
            // Save to state
            setToken(authToken);
            setUserRole(role);
            setUser(userInfo);
            setIsAuthenticated(true);
            
            // Save to localStorage
            localStorage.setItem('token', authToken);
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const logout = () => {
        setToken(null);
        setUserRole(null);
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
    };
    
    return (
        <AuthContext.Provider
            value={{ 
                token, 
                userRole, 
                isAuthenticated,
                user,
                loading,
                login, 
                logout 
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider;