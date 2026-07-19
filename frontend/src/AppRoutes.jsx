import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Login from './Login';
import Register from './Register';
import DashboardLayout from './DashboardLayout';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return children;
};

export default function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={user ? <Navigate to="/" /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={user ? <Navigate to="/" /> : <Register />} 
      />
      
      <Route 
        path="/*" 
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
