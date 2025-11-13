import {createContext, useState, useEffect} from 'react';
export const AuthContext = createContext();
const AuthProvider = ({children}) => {
    // State for authentication management
    const [token, setToken] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
        
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedRole = localStorage.getItem('userRole');

        if(storedToken && storedRole) {
            setToken(storedToken);
            setUserRole(storedRole);
            setIsAuthenticated(true);
        }
    }, []);

    const login = (authToken, role) =>{
        // Save to state
        setToken(authToken);
        setUserRole(role)  ;
        setIsAuthenticated(true);
        // Save to localStorage
        localStorage.setItem('token', authToken);
        localStorage.setItem('userRole', role);
    };

    const logout = () => {
        setToken(null);
        setUserRole(null);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
    };
    
    return (
        <AuthContext.Provider
            value={{ 
                token, 
                userRole, 
                isAuthenticated, 
                login, 
                logout 
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider;