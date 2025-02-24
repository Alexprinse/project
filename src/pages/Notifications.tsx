import React from 'react';

const Notifications: React.FC = () => {
  return (
    <div className="p-6 bg-gray-900 rounded-lg shadow-lg text-white">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text animate-pulse">
        Notifications
      </h1>
      <p className="text-lg">You have no new notifications.</p>
    </div>
  );
};

export default Notifications;