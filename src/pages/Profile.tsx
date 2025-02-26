import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebaseConfig';
import { getFirestore, doc, getDoc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { Camera, Edit } from 'lucide-react'; // Removed Trophy and ChevronLeft icons
import Loading from '../components/Loading';

const db = getFirestore();

const Profile = () => {
  const [user] = useAuthState(auth);
  const [profileData, setProfileData] = useState<any>(null);
  const [upcomingEventsCount, setUpcomingEventsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfileData(docSnap.data());
        }
      }
      setLoading(false);
    };
    fetchProfileData();
  }, [user]);

  useEffect(() => {
    if (user) {
      const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        const data = doc.data();
        if (data) {
          setProfileData(data);
          setUpcomingEventsCount(data.upcomingEvents);
        }
      });

      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    const fetchRegisteredEventsCount = async () => {
      if (user) {
        const eventsQuery = query(collection(db, 'events'), where('attendees', 'array-contains', user.uid));
        const eventsSnapshot = await getDocs(eventsQuery);
        const registeredEventsCount = eventsSnapshot.size;
        setProfileData((prevData: any) => ({
          ...prevData,
          eventsRegistered: registeredEventsCount,
        }));
      }
    };
    fetchRegisteredEventsCount();
  }, [user]);

  if (loading) {
    return <Loading />;
  }

  if (!profileData) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg text-white">
      {/* Header Section */}
      <div className="relative pb-20 mb-6">
        {/* Profile Avatar */}
        <div className="relative w-32 h-32 mx-auto mt-12">
          <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-400 to-purple-500 p-1">
            <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
              {profileData?.photoURL ? (
                <img src={profileData.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">
                    {profileData?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
          {/* Camera Button */}
          <button className="absolute bottom-0 right-0 p-2 rounded-full bg-gray-800 border border-gray-700 text-gray-300 hover:text-white">
            <Camera className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Profile Details Section */}
      <div className="px-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Profile Details</h2>
          <button className="p-2 rounded-lg hover:bg-gray-800/50">
            <Edit className="h-5 w-5 text-gray-300" />
          </button>
        </div>

        {/* Profile Information */}
        <div className="space-y-6">
          {/* Personal Details */}
          <div className="space-y-4">
            <ProfileField label="Name" value={profileData.name} />
            <ProfileField label="Email" value={profileData.email} />
            <ProfileField label="ID No" value={profileData.idNo} />
            <ProfileField label="Branch" value={profileData.branch} />
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <StatCard label="Events Registered" value={profileData.eventsRegistered} />
            <StatCard label="Upcoming Events" value={upcomingEventsCount} />
            <StatCard label="Completed Events" value={profileData.completedEvents} />
            {(profileData.role === 'organizer' || profileData.role === 'admin') && (
              <div className="col-span-2">
                <Link 
                  to="/manage-events" 
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-center font-medium block transition-all duration-200"
                >
                  Manage Events
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const ProfileField = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-700/50">
    <span className="text-gray-400">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

const StatCard = ({ label, value }: { label: string; value: number }) => (
  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/30">
    <div className="text-2xl font-bold">{value}</div>
    <div className="text-sm text-gray-400">{label}</div>
  </div>
);

export default Profile;