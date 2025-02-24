import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebaseConfig';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import './Profile.css'; // Import the CSS file

const db = getFirestore();

function Profile() {
  const [user] = useAuthState(auth);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfileData(docSnap.data());
        }
      }
    };
    fetchProfileData();
  }, [user]);

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
          <p className="text-lg">{profileData.upcomingEvents}</p>
        </div>
        <div className="profile-card">
          <h2 className="text-xl font-semibold">Completed Events</h2>
          <p className="text-lg">{profileData.completedEvents}</p>
        </div>
        {(profileData.role === 'organizer' || profileData.role === 'admin') && (
          <div className="profile-card">
            <h2 className="text-xl font-semibold">Role</h2>
            <p className="text-lg">{profileData.role}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;