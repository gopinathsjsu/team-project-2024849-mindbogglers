import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import RestaurantDetails from './pages/RestaurantDetails';
import Booking from './pages/Booking';
import BookingConfirmation from './components/BookingConfirmation'; // Import the new component
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import UserReservations from './pages/UserReservations'; 
import { AuthProvider, AuthContext } from './AuthContext';
import './App.css';

// Protected route component
const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useContext(AuthContext);
  
  // Show loading indicator while checking auth
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Check role permissions
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/restaurant/:id" element={<RestaurantDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Customer routes */}
          <Route 
            path="/booking" 
            element={
              <PrivateRoute roles={['Customer']}>
                <Booking />
              </PrivateRoute>
            } 
          />
          {/* Add a dedicated route for booking confirmation */}
          <Route 
            path="/booking/confirmation/:id" 
            element={
              <PrivateRoute roles={['Customer']}>
                <BookingConfirmation />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/my-reservations" 
            element={
              <PrivateRoute roles={['Customer']}>
                <UserReservations />
              </PrivateRoute>
            } 
          />
          
          {/* Admin routes */}
          <Route 
            path="/admin" 
            element={
              <PrivateRoute roles={['Admin']}>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          
          {/* Restaurant Manager routes */}
          <Route 
            path="/manager" 
            element={
              <PrivateRoute roles={['RestaurantManager']}>
                <ManagerDashboard />
              </PrivateRoute>
            } 
          />
          
          {/* Catch-all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;