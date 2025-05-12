import React, { useContext } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
  useNavigate
} from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import RestaurantDetails from './pages/RestaurantDetails';
import BookingReview from './components/BookingReview'; // ✅ actual reservation happens here
import BookingConfirmation from './components/BookingConfirmation';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import UserReservations from './pages/UserReservations';
import AdminDashboard from './pages/AdminDashboard';
import ReserveConfirmation from './components/ReserveConfirmation';
import EditRestaurant from './pages/EditRestaurant';
import AddRestaurant from './pages/AddRestaurant';
import ReviewsPage from './pages/ReviewsPage';

import { AuthProvider, AuthContext } from './AuthContext';
import './App.css';

// ✅ Role-protected wrapper
const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
};

// ✅ Wrapper to pass booking object from navigation state
const BookingConfirmationWrapper = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <BookingConfirmation
      booking={location.state?.booking}
      onCancel={() => navigate('/')}
    />
  );
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
          <Route path="/reviews/:id" element={<ReviewsPage />} />

          {/* Booking flow */}
          <Route path="/booking-review" element={
            <PrivateRoute roles={['Customer']}>
              <BookingReview />
            </PrivateRoute>
          } />
          <Route path="/booking-confirmation" element={
            <PrivateRoute roles={['Customer']}>
              <BookingConfirmationWrapper />
            </PrivateRoute>
          } />
          <Route path="/reserve-confirmation" element={<ReserveConfirmation />} />

          {/* Customer route */}
          <Route path="/my-reservations" element={
            <PrivateRoute roles={['Customer']}>
              <UserReservations />
            </PrivateRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin" element={
            <PrivateRoute roles={['Admin']}>
              <AdminDashboard />
            </PrivateRoute>
          } />

          {/* Manager routes */}
          <Route path="/manager" element={
            <PrivateRoute roles={['RestaurantManager']}>
              <ManagerDashboard />
            </PrivateRoute>
          } />
          <Route path="/manager/edit/:id" element={
            <PrivateRoute roles={['RestaurantManager']}>
              <EditRestaurant />
            </PrivateRoute>
          } />
          <Route path="/manager/add" element={
            <PrivateRoute roles={['RestaurantManager']}>
              <AddRestaurant />
            </PrivateRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
