import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebaseConfig';
import { LogOut, User, Calendar } from 'lucide-react';

const Navbar: React.FC = () => {
  const [user] = useAuthState(auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    auth.signOut();
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-gray-800 p-4 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <Calendar className="text-blue-400 w-6 h-6" />
        <Link to="/" className="text-white text-xl font-bold">CampusEvents</Link>
      </div>
      <div className="flex items-center space-x-4 relative">
        {user && (
          <>
            <span className="text-white">Hi, {user.displayName || 'User'}</span>
            <div className="relative">
              <div
                className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center cursor-pointer border-2 border-blue-400"
                onClick={toggleMenu}
              >
                <User className="text-blue-400 w-6 h-6" />
              </div>
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-50">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 flex items-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;