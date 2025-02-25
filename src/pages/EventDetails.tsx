import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { db } from '../firebaseConfig';

const EventDetails: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      setError('');
      try {
        const docRef = doc(db, 'events', eventId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setEvent(docSnap.data());
        } else {
          setError('Event not found');
        }
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to fetch event. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  if (loading) {
    return <p className="text-white text-center">Loading event details...</p>;
  }

  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;
  }

  if (!event) {
    return null;
  }

  return (
    <div className="p-6 bg-gray-900 rounded-lg shadow-lg text-white">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">{event.title}</h1>
      {event.eventImage && (
        <img
          src={event.eventImage}
          alt={event.title}
          className="w-full h-64 object-cover rounded-lg mb-4"
        />
      )}
      <div className="space-y-4 text-gray-400">
        <div className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          <span>{format(event.dateTime.toDate(), 'MMMM d, yyyy h:mm aa')}</span>
        </div>
        <div className="flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          <span>{format(event.dateTime.toDate(), 'h:mm a')}</span>
        </div>
        <div className="flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          <span>{event.location}</span>
        </div>
        <div className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          <span>{event.attendees || 0} attendees</span>
        </div>
      </div>
      <div className="mt-6">
        <h2 className="text-2xl font-bold mb-2">Description</h2>
        <p className="text-gray-400">{event.description}</p>
      </div>
    </div>
  );
};

export default EventDetails;