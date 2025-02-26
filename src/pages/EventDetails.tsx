import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFirestore, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { db, auth } from '../firebaseConfig';
import emailjs from 'emailjs-com';
import Loading from '../components/Loading';  // Import the Loading component

const EventDetails: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user] = useAuthState(auth);
  const [isRegistered, setIsRegistered] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      setError('');
      try {
        console.log(`Fetching event with ID: ${eventId}`);
        
        const docRef = doc(db, 'events', eventId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const eventData = docSnap.data();
          setEvent(eventData);

          console.log("Event data fetched:", eventData);

          if (user && eventData.attendees && eventData.attendees.includes(user.uid)) {
            setIsRegistered(true);
            console.log("User is already registered.");
          }
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
  }, [eventId, user]);

  const handleRegister = async () => {
    if (user && event) {
      try {
        console.log("Registering user:", user.uid);
        
        const eventRef = doc(db, 'events', eventId);

        await updateDoc(eventRef, {
          attendees: arrayUnion(user.uid)
        });

        console.log("Registration successful");
        setIsRegistered(true);
        alert('You have successfully registered for the event.');

        // Send confirmation email using EmailJS
        const templateParams = {
          user_name: user.displayName || 'Participant',
          user_email: user.email,
          event_title: event.title,
          event_date: format(event.dateTime.toDate(), 'MMMM d, yyyy h:mm aa'),
          event_location: event.location,
        };

        emailjs.send('service_ix7pdyd', 'template_v4knz7b', templateParams, 'W3NTTHqXUaDSrUjZo')
          .then((response) => {
            console.log('Email sent successfully:', response.status, response.text);
          })
          .catch((error) => {
            console.error('Error sending email:', error);
          });

      } catch (err) {
        console.error('Error registering for event:', err);
        alert('Failed to register for the event. Please try again.');
      }
    } else {
      alert('You need to be logged in to register for the event.');
      navigate('/login');
    }
  };

  if (loading) {
    return <Loading />;
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
          <span>{event.attendees?.length || 0} attendees</span>
        </div>
      </div>
      <div className="mt-6">
        <h2 className="text-2xl font-bold mb-2">Description</h2>
        <p className="text-gray-400">{event.description}</p>
      </div>
      <button
        onClick={handleRegister}
        disabled={isRegistered}
        className={`mt-6 w-full py-2 rounded-lg transition-colors ${isRegistered ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
      >
        {isRegistered ? 'Registered' : 'Register'}
      </button>
    </div>
  );
};

export default EventDetails;
