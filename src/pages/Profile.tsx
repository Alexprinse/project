import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebaseConfig';
import { getFirestore, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import './Profile.css'; // Import the CSS file
import Loading from '../components/Loading';  // Import the Loading component

const db = getFirestore();

function Profile() {
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

  if (loading) {
    return <Loading />;
  }

  if (!profileData) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="p-6 bg-gray-900 rounded-lg shadow-lg text-white">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text animate-pulse">
        Profile
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="profile-card">
          <h2 className="text-xl font-semibold">Name</h2>
          <p className="text-lg">{profileData.name}</p>
        </div>
        <div className="profile-card">
          <h2 className="text-xl font-semibold">Branch</h2>
          <p className="text-lg">{profileData.branch}</p>
        </div>
        <div className="profile-card">
          <h2 className="text-xl font-semibold">Email</h2>
          <p className="text-lg">{profileData.email}</p>
        </div>
        <div className="profile-card">
          <h2 className="text-xl font-semibold">ID No</h2>
          <p className="text-lg">{profileData.idNo}</p>
        </div>
        <div className="profile-card">
          <h2 className="text-xl font-semibold">Events Registered</h2>
          <p className="text-lg">{profileData.eventsRegistered}</p>
        </div>
        <div className="profile-card">
          <h2 className="text-xl font-semibold">Upcoming Events</h2>
          <p className="text-lg">{upcomingEventsCount}</p>
        </div>
        <div className="profile-card">
          <h2 className="text-xl font-semibold">Completed Events</h2>
          <p className="text-lg">{profileData.completedEvents}</p>
        </div>
        {(profileData.role === 'organizer' || profileData.role === 'admin') && (
          <div className="profile-card">
            <h2 className="text-xl font-semibold">Role</h2>
            <p className="text-lg">{profileData.role}</p>
            <Link to="/manage-events" className="mt-2 w-full py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-center block">
              Manage Events
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;