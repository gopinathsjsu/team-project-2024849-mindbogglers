// src/App.js
import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import RestaurantDetails from './pages/RestaurantDetails';
import Booking from './pages/Booking';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import { AuthProvider, AuthContext } from './AuthContext';
import './App.css'
const PrivateRoute = ({ children, roles }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/restaurant/:id" element={<RestaurantDetails />} />
          <Route path="/booking" element={<PrivateRoute roles={['Customer']}>{<Booking />}</PrivateRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<PrivateRoute roles={['Admin']}>{<Dashboard />}</PrivateRoute>} />
          <Route path="/manager" element={<PrivateRoute roles={['RestaurantManager']}>{<ManagerDashboard />}</PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
