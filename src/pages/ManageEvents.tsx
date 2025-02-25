import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebaseConfig';
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';  // Import the Loading component

const ManageEvents: React.FC = () => {
  const [user] = useAuthState(auth);
  const [events, setEvents] = useState<any[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setRole(userDocSnap.data().role);
        }
      }
    };

    fetchUserRole();
  }, [user]);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      if (user && role) {
        const eventsRef = collection(db, 'events');
        let q;
        if (role === 'admin') {
          q = query(eventsRef);
        } else {
          q = query(eventsRef, where('organizerId', '==', user.uid));
        }
        const querySnapshot = await getDocs(q);
        const eventsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEvents(eventsList);
      }
      setLoading(false);
    };

    fetchEvents();
  }, [user, role]);

  const handleDelete = async (eventId: string) => {
    if (user) {
      try {
        await deleteDoc(doc(db, 'events', eventId));
        setEvents(events.filter(event => event.id !== eventId));
        alert('Event deleted successfully.');
      } catch (err) {
        console.error('Error deleting event:', err);
        alert('Failed to delete the event. Please try again.');
      }
    }
  };

  const handleDetails = (eventId: string) => {
    navigate(`/event-participants/${eventId}`);
  };

  if (!user || role === null || loading) {
    return <Loading />;
  }

  return (
    <div className="p-6 bg-gray-900 rounded-lg shadow-lg text-white">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text animate-pulse">
        Manage Events
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map(event => (
          <div key={event.id} className="profile-card">
            <h2 className="text-xl font-semibold">{event.title}</h2>
            <p className="text-lg">{event.description}</p>
            <button
              onClick={() => handleDelete(event.id)}
              className="mt-2 w-full py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white"
            >
              Delete Event
            </button>
            <button
              onClick={() => handleDetails(event.id)}
              className="mt-2 w-full py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white"
            >
              Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageEvents;