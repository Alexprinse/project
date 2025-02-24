import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Calendar, Users, Bell, LogOut, Menu, X } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import CreateEvent from './pages/CreateEvent';

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gray-900 flex flex-col md:flex-row">
        {/* Mobile Menu Button */}
        <button
          className="md:hidden fixed top-4 right-4 z-50 p-2 bg-gray-800 rounded-lg text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Sidebar */}
        <aside className={`
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          fixed md:static
          inset-y-0 left-0
          w-64 bg-gray-800 text-white p-6
          transform transition-transform duration-200 ease-in-out
          z-40 md:z-auto
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
            <Link
              to="/notifications"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Bell className="h-5 w-5 text-blue-400" />
              <span>Notifications</span>
            </Link>
          </nav>

          <div className="absolute bottom-0 left-0 w-64 p-6">
            <button className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors w-full">
              <LogOut className="h-5 w-5 text-blue-400" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Overlay for mobile menu */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 pt-16 md:pt-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/events" element={<Events />} />
            <Route path="/create-event" element={<CreateEvent />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;