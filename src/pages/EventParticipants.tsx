import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { useAuthState } from 'react-firebase-hooks/auth';

const EventParticipants: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [user] = useAuthState(auth);
  const [event, setEvent] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!user || !eventId) return;

      try {
        const eventDocRef = doc(db, 'events', eventId);
        const eventDocSnap = await getDoc(eventDocRef);

        if (!eventDocSnap.exists()) {
          setError('Event not found');
          setLoading(false);
          return;
        }

        const eventData = eventDocSnap.data();
        setEvent(eventData);

        // Ensure attendees exist and fetch their details
        if (eventData.attendees && Array.isArray(eventData.attendees)) {
          const participantsList = await Promise.all(
            eventData.attendees.map(async (attendeeId: string) => {
              try {
                const userDocRef = doc(db, 'users', attendeeId);
                const userDocSnap = await getDoc(userDocRef);
                return userDocSnap.exists() ? { id: attendeeId, ...userDocSnap.data() } : null;
              } catch (err) {
                console.error(`Error fetching user ${attendeeId}:`, err);
                return null;
              }
            })
          );
          setParticipants(participantsList.filter(p => p !== null));
        }
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError('Failed to fetch event details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [user, eventId]);

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (!event) {
    return <div className="text-white">Event not found</div>;
  }

  return (
    <div className="p-6 bg-gray-900 rounded-lg shadow-lg text-white">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text animate-pulse">
        Event Details
      </h1>
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">{event.title}</h2>
        <p className="text-lg">{event.description}</p>
        <p className="text-lg">{new Date(event.dateTime.seconds * 1000).toLocaleString()}</p>
        <p className="text-lg">{event.location}</p>
      </div>
      <h2 className="text-2xl font-semibold mb-4">Participants</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {participants.length > 0 ? (
          participants.map(participant => (
            <div key={participant.id} className="p-4 bg-gray-800 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold">{participant.name}</h3>
              <p className="text-lg">ID No: {participant.idNo}</p>
              <p className="text-lg">Branch: {participant.branch}</p>
            </div>
          ))
        ) : (
          <p className="text-lg text-gray-400">No participants have registered yet.</p>
        )}
      </div>
    </div>
  );
};

export default EventParticipants;
