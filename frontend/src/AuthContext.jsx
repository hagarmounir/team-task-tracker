import { createContext, useState, useEffect, useContext } from 'react';
import api from './api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('jwtToken');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);

    // Listen for the custom auth-expired event from api.js
    const handleAuthExpired = () => {
      setUser(null);
    };
    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/users/login', { email, password });
    const { token, role, email: userEmail } = response.data;
    
    localStorage.setItem('jwtToken', token);
    const userData = { email: userEmail, role };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) return null; // Or a spinner

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
