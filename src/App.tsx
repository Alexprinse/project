import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Calendar, Users, Bell, LogOut, Menu, X, User, PlusCircle, ClipboardList } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import CreateEventWithForm from './pages/CreateEventWithForm';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import Notifications from './pages/Notifications';
import Admin from './pages/Admin';
import EventDetails from './pages/EventDetails';
import PrivateRoute from './components/PrivateRoute';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebaseConfig';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import ManageEvents from './pages/ManageEvents'; // Import the ManageEvents component
import EventParticipants from './pages/EventParticipants'; // Import the EventParticipants component
import ProfileNav from './components/ProfileNav';
import Footer from './components/Footer';
import RequireEmailVerification from './components/RequireEmailVerification';

const db = getFirestore();

const AppContent: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, loading] = useAuthState(auth);
  const [role, setRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setRole(docSnap.data().role);
        }
      }
    };
    fetchUserRole();
  }, [user]);

  useEffect(() => {
    if (!loading) {
      // If user is not logged in and trying to access root path
      if (!user && location.pathname === '/') {
        navigate('/events');
      }
    }
  }, [user, loading, navigate, location]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col md:flex-row">
      {/* Mobile Menu Button */}
      <button
        className={`
          md:hidden fixed top-5 z-50 p-2 bg-gray-800 rounded-lg text-white transition-all duration-200
          ${isMobileMenuOpen ? 'opacity-0' : 'left-6'} // Shifts X mark when menu is open
        `}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <aside className={`
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
        fixed md:sticky
        inset-y-0 left-0
        md:top-0 md:h-screen
        w-64 bg-gray-800 text-white p-6
        transform transition-transform duration-200 ease-in-out
        z-40 md:z-auto
        overflow-y-auto
      `}>
        <div className="flex items-center space-x-2 mb-8">
          <Calendar className="h-6 w-6 text-blue-400" />
          <span className="text-xl font-bold">CampusEvents</span>
        </div>
        
        <nav className="space-y-2">
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Calendar className="h-5 w-5 text-blue-400" />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/events"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Users className="h-5 w-5 text-blue-400" />
            <span>Events</span>
          </Link>
          {user && user.emailVerified && (
            <>
              <Link
                to="/notifications"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Bell className="h-5 w-5 text-blue-400" />
                <span>Notifications</span>
              </Link>
              {role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <ClipboardList className="h-5 w-5 text-blue-400" />
                  <span>Requests</span>
                </Link>
              )}
            </>
          )}
          {(user && (role === 'organizer' || role === 'admin')) && (
            <Link
              to="/create-event"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <PlusCircle className="h-5 w-5 text-blue-400" />
              <span>Create Event</span>
            </Link>
          )}
          {!user && (
            <Link
              to="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <PlusCircle className="h-5 w-5 text-blue-400" />
              <span>Login</span>
            </Link>
          )}
        </nav>

      </aside>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 md:pt-4 flex flex-col">
        {/* Updated ProfileNav wrapper */}
        <div className="sticky top-0 z-10 mb-4">
          <ProfileNav />
        </div>
        
        <div className="flex-grow p-4 md:p-8">
          <Routes>
            {/* Public Routes */}
            <Route path="/events" element={<Events />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected Routes - Redirect to events if not logged in */}
            <Route 
              path="/" 
              element={
                user ? <Dashboard /> : <Navigate to="/events" replace />
              } 
            />
            <Route path="/event-details/:eventId" element={<EventDetails />} /> {/* Updated route */}
            <Route path="/event/:eventId" element={
              <RequireEmailVerification>
                <EventDetails />
              </RequireEmailVerification>
            } />
            <Route path="/create-event" element={
              <PrivateRoute>
                <RequireEmailVerification>
                  <CreateEventWithForm />
                </RequireEmailVerification>
              </PrivateRoute>
            } />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
            <Route path="/manage-events" element={<PrivateRoute><ManageEvents /></PrivateRoute>} />
            <Route path="/event-participants/:eventId" element={<PrivateRoute><EventParticipants /></PrivateRoute>} />
          </Routes>
        </div>
        <Footer />
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;