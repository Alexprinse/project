import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth } from '../firebaseConfig';
import Loading from '../components/Loading';  // Import the Loading component

interface Notification {
  id: string;
  message: string;
  details: string;
  read: boolean;
}

const Notifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'new' | 'read'>('new');
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [authUser] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!authUser) return;

      const q = query(collection(db, 'notifications'), where('userId', '==', authUser.uid));
      const querySnapshot = await getDocs(q);
      const notificationsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Notification[];

      setNotifications(notificationsData);
      setLoading(false);
    };

    fetchNotifications();
  }, [authUser]);

  const handleTabClick = (tab: 'new' | 'read') => {
    setActiveTab(tab);
    navigate(`#${tab}`);
  };

  const handleNotificationClick = async (id: string) => {
    const notificationRef = doc(db, 'notifications', id);
    await updateDoc(notificationRef, { read: true });

    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const handleNotificationClose = async (id: string) => {
    const notificationRef = doc(db, 'notifications', id);
    await updateDoc(notificationRef, { read: true });

    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  if (loading) {
    return <Loading />;
  }

  const newNotifications = notifications.filter(notification => !notification.read);
  const readNotifications = notifications.filter(notification => notification.read);

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
            {newNotifications.length === 0 ? (
              <p className="text-center">No new notifications</p>
            ) : (
              newNotifications.map(notification => (
                <div key={notification.id} className="bg-gray-800 p-4 mb-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                  <p className="text-lg font-semibold">{notification.message}</p>
                  <button
                    onClick={() => handleNotificationClick(notification.id)}
                    className="mt-2 w-full py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    View Details
                  </button>
                  {notification.read && (
                    <div className="mt-4">
                      <p>{notification.details}</p>
                      <button
                        onClick={() => handleNotificationClose(notification.id)}
                        className="mt-2 w-full py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white"
                      >
                        Close
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
        {activeTab === 'read' && (
          <div id="read" className="w-full">
            <h2 className="text-2xl font-bold mb-4 text-center">Read Notifications</h2>
            {readNotifications.length === 0 ? (
              <p className="text-center">No read notifications</p>
            ) : (
              readNotifications.map(notification => (
                <div key={notification.id} className="bg-gray-800 p-4 mb-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                  <p className="text-lg font-semibold">{notification.message}</p>
                  <div className="mt-4">
                    <p>{notification.details}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;