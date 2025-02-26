import React, { useState, useRef, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebaseConfig';
import { LogIn, LogOut, User, LayoutGrid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';

const ProfileNav: React.FC = () => {
  const [user] = useAuthState(auth);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserName(userDoc.data().name);
          setUserRole(userDoc.data().role);
        }
      }
    };
    fetchUserData();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="bg-gray-800/75 backdrop-blur-sm w-[calc(100%-2rem)] mx-4 mt-2 md:mt-0 rounded-lg border border-gray-700/30">
      <div className="max-w-8xl mx-auto px-4 py-1">
        <div className="flex justify-end pr-2">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center space-x-3 hover:bg-gray-700/50 p-2.5 rounded-lg transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 p-[2px]">
                <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center">
                  {userName ? (
                    <span className="text-xl font-bold text-white">
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <User className="h-6 w-6 text-gray-100" />
                  )}
                </div>
              </div>
              <span className="text-gray-100 font-medium">
                Hi, {userName || 'Guest'}
              </span>
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-1 z-50 border border-gray-700/30">
                {user ? (
                  <>
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setIsOpen(false);
                      }}
                      className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-gray-700/50 w-full text-left"
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </button>

                    {(userRole === 'admin' || userRole === 'organizer') && (
                      <button
                        onClick={() => {
                          navigate('/manage-events');
                          setIsOpen(false);
                        }}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-gray-700/50 w-full text-left"
                      >
                        <LayoutGrid className="h-4 w-4" />
                        <span>Manage Events</span>
                      </button>
                    )}

                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-gray-700/50 w-full text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      navigate('/login');
                      setIsOpen(false);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-gray-700/50 w-full text-left"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Login</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileNav;