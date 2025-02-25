import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';  // Import the Loading component

const Notifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'new' | 'read'>('new');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate a loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleTabClick = (tab: 'new' | 'read') => {
    setActiveTab(tab);
    navigate(`#${tab}`);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="p-6 bg-gray-900 rounded-lg shadow-lg text-white">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text animate-pulse">
        Notifications
      </h1>
      <div className="flex justify-center mb-8">
        <button
          className={`flex-1 p-4 mx-2 rounded-lg ${activeTab === 'new' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-400'} hover:bg-blue-600 transition-colors duration-300`}
          onClick={() => handleTabClick('new')}
        >
          New
        </button>
        <button
          className={`flex-1 p-4 mx-2 rounded-lg ${activeTab === 'read' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-400'} hover:bg-blue-600 transition-colors duration-300`}
          onClick={() => handleTabClick('read')}
        >
          Read
        </button>
      </div>
      <div className="flex justify-center">
        {activeTab === 'new' && (
          <div id="new" className="w-full">
            <h2 className="text-2xl font-bold mb-4 text-center">New Notifications</h2>
            {/* Add your new notifications content here */}
            <p className="text-left">No new notifications</p>
          </div>
        )}
        {activeTab === 'read' && (
          <div id="read" className="w-full">
            <h2 className="text-2xl font-bold mb-4 text-center">Read Notifications</h2>
            {/* Add your read notifications content here */}
            <p className="text-left">No read notifications</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;