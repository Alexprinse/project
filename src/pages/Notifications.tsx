import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Bell, Eye, CheckCircle, AlertCircle } from 'lucide-react';
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

  const newNotifications = notifications.filter(notification => !notification.read);
  const readNotifications = notifications.filter(notification => notification.read);

  return (
    <div className="min-h-screen p-6 bg-gray-900">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gray-800/50 rounded-2xl border border-gray-700/50">
          <div>
            <h1 className="text-3xl font-bold text-white">Notifications</h1>
            <p className="text-gray-400 mt-1">Manage your notifications and updates</p>
          </div>
          <Bell className="h-12 w-12 text-blue-400" />
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 p-1 bg-gray-800/50 rounded-xl w-fit">
          <button
            className={`flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 ${
              activeTab === 'new'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
            onClick={() => handleTabClick('new')}
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            New {newNotifications.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-white/20 rounded-full">
                {newNotifications.length}
              </span>
            )}
          </button>
          <button
            className={`flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 ${
              activeTab === 'read'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
            onClick={() => handleTabClick('read')}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Read
          </button>
        </div>

        {/* Notifications Content */}
        {loading ? (
          <Loading />
        ) : (
          <div className="space-y-4">
            {activeTab === 'new' ? (
              newNotifications.length === 0 ? (
                <div className="text-center py-12 bg-gray-800/50 rounded-2xl border border-gray-700/50">
                  <Bell className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                  <p className="text-gray-400">No new notifications</p>
                </div>
              ) : (
                newNotifications.map(notification => (
                  <div
                    key={notification.id}
                    className="group p-6 bg-gray-800/50 rounded-2xl border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300"
                  >
                    <p className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                      {notification.message}
                    </p>
                    <button
                      onClick={() => handleNotificationClick(notification.id)}
                      className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </button>
                    {notification.read && (
                      <div className="mt-4 p-4 bg-gray-900/50 rounded-lg">
                        <p className="text-gray-300">{notification.details}</p>
                      </div>
                    )}
                  </div>
                ))
              )
            ) : (
              readNotifications.length === 0 ? (
                <div className="text-center py-12 bg-gray-800/50 rounded-2xl border border-gray-700/50">
                  <CheckCircle className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                  <p className="text-gray-400">No read notifications</p>
                </div>
              ) : (
                readNotifications.map(notification => (
                  <div
                    key={notification.id}
                    className="p-6 bg-gray-800/50 rounded-2xl border border-gray-700/50"
                  >
                    <p className="text-lg font-semibold text-white mb-4">{notification.message}</p>
                    <div className="p-4 bg-gray-900/50 rounded-lg">
                      <p className="text-gray-300">{notification.details}</p>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;