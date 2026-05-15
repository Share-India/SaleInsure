import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import ManagerDashboard from './pages/ManagerDashboard';
import SalesDashboard from './pages/SalesDashboard';

const PrivateRoute = ({ children, roles }) => {
    const { user } = useContext(AuthContext);

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (roles && roles.length > 0) {
        const hasRole = roles.some(role => user.roles.includes(role));
        if (!hasRole) {
            return <Navigate to="/" />; // Or unauthorized page
        }
    }

    return children;
};

const DefaultRoute = () => {
    const { user } = useContext(AuthContext);
    if (!user) return <Navigate to="/login" />;
    if (user.roles.includes('ROLE_MANAGER')) return <Navigate to="/manager" />;
    return <Navigate to="/sales" />;
};

function App() {
  return (
    <AuthProvider>
        <Router>
            <div className="min-h-screen bg-brand-bg font-sans text-slate-800">
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route 
                        path="/manager/*" 
                        element={
                            <PrivateRoute roles={['ROLE_MANAGER']}>
                                <ManagerDashboard />
                            </PrivateRoute>
                        } 
                    />
                    <Route 
                        path="/sales/*" 
                        element={
                            <PrivateRoute roles={['ROLE_SALESPERSON']}>
                                <SalesDashboard />
                            </PrivateRoute>
                        } 
                    />
                    <Route path="/" element={<DefaultRoute />} />
                </Routes>
            </div>
        </Router>
    </AuthProvider>
  )
}

export default App;
