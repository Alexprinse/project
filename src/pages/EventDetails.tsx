import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { getFirestore, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { db, auth } from '../firebaseConfig';
import emailjs from 'emailjs-com';
import Loading from '../components/Loading';  // Import the Loading component
import TeamRegistrationModal from '../components/TeamRegistrationModal';
import RequireEmailVerification from '../components/RequireEmailVerification';

const categoryImages = {
  Technology: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
  Career: "https://images.unsplash.com/photo-1521737711867-e3b97375f902",
  Health: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528",
  Education: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1",
  Entertainment: "https://images.unsplash.com/photo-1603190287605-e6ade32fa852",
  default: "https://images.unsplash.com/photo-1523580494863-6f3031224c94"
};

const EventDetails: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  interface Event {
    title: string;
    eventImage?: string;
    category: keyof typeof categoryImages;
    dateTime: { seconds: number };
    location: string;
    attendees?: string[];
    isTeamEvent: boolean;
    registrationType: string;
    googleFormLink?: string;
    teamConfig: {
      minMembers: number;
      maxMembers: number;
    };
    organizationType: string;
    organizer: string;
    description: string;
  }

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user] = useAuthState(auth);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      setError('');
      try {
        console.log(`Fetching event with ID: ${eventId}`);
        
        if (!eventId) {
          setError('Invalid event ID');
          setLoading(false);
          return;
        }
        const docRef = doc(db, 'events', eventId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const eventData = docSnap.data();
          setEvent(eventData as Event);

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
    if (!user) {
      alert('You need to be logged in to register for the event.');
      navigate('/login');
      return;
    }

    // Check if it's a Google Form registration type
    if (event && event.registrationType === 'googleForm') {
      window.open(event.googleFormLink, '_blank', 'noopener,noreferrer');
      return;
    }

    // Handle one-click registration for both team and solo events
    if (event && event.isTeamEvent) {
      setIsTeamModalOpen(true);
    } else {
      try {
        await registerSingleUser();
      } catch (err) {
        console.error('Error registering for event:', err);
        alert('Failed to register for the event. Please try again.');
      }
    }
  };

  const registerSingleUser = async () => {
    try {
      if (user) {
        console.log("Registering user:", user.uid);
      } else {
        console.error("User is not logged in.");
        return;
      }
      
      if (!eventId) {
        throw new Error('Event ID is undefined');
      }
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
        event_title: event?.title || '',
        event_date: event ? format(new Date(event.dateTime.seconds * 1000), 'MMMM d, yyyy h:mm aa') : '',
        event_location: event?.location || '',
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
  };

  interface TeamMember {
    name: string;
    email: string;
    idNumber: string;
    branch: string;
  }

  const handleTeamRegistration = async (teamMembers: TeamMember[]) => {
    try {
      const eventRef = doc(db, 'events', eventId!);
      const teamData = {
        leader: {
          uid: user!.uid,
          name: teamMembers[0].name,
          email: teamMembers[0].email,
          idNumber: teamMembers[0].idNumber,
          branch: teamMembers[0].branch,
        },
        members: teamMembers.slice(1).map(member => ({
          name: member.name,
          email: member.email,
          idNumber: member.idNumber,
          branch: member.branch,
        })),
        registeredAt: new Date(),
      };

      await updateDoc(eventRef, {
        teams: arrayUnion(teamData),
        attendees: arrayUnion(user!.uid),
      });

      setIsRegistered(true);
      setIsTeamModalOpen(false);
      alert('Team registered successfully!');

      // Send confirmation emails to all team members
      teamMembers.forEach(member => {
        const templateParams = {
          user_name: member.name,
          user_email: member.email,
          event_title: event!.title,
          event_date: format(event!.dateTime.seconds * 1000, 'MMMM d, yyyy h:mm aa'),
          event_location: event!.location,
          team_leader: teamMembers[0].name,
        };

        emailjs.send('service_ix7pdyd', 'template_v4knz7b', templateParams, 'W3NTTHqXUaDSrUjZo')
          .catch((error) => console.error('Error sending email:', error));
      });
    } catch (err) {
      console.error('Error registering team:', err);
      alert('Failed to register team. Please try again.');
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
      
      {/* Image Section with Fallback */}
      <img
        src={event.eventImage || categoryImages[event.category] || categoryImages.default}
        alt={event.title}
        className="w-full h-64 object-cover rounded-lg mb-6"
        onError={(e) => {
          e.currentTarget.src = categoryImages.default;
          e.currentTarget.onerror = null;
        }}
      />

      {/* Event Type Badge */}
      <div className="flex items-center gap-4 mb-6">
        <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
          event.isTeamEvent ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
        }`}>
          {event.isTeamEvent ? 'Team Event' : 'Solo Event'}
        </span>
        <span className="px-4 py-1.5 bg-gray-700/50 rounded-full text-sm font-medium text-gray-300">
          {event.category}
        </span>
      </div>

      {/* Basic Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4 text-gray-400">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            <span>{format(new Date(event.dateTime.seconds * 1000), 'MMMM d, yyyy')}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            <span>{format(new Date(event.dateTime.seconds * 1000), 'h:mm a')}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            <span>{event.location}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center text-gray-400">
            <Users className="h-5 w-5 mr-2" />
            <span>{event.attendees?.length || 0} registered participants</span>
          </div>
          {event.isTeamEvent && (
            <div className="p-3 bg-gray-800/50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Team Requirements:</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• {event.teamConfig.minMembers === event.teamConfig.maxMembers ? 
                  `Exactly ${event.teamConfig.minMembers} members per team` :
                  `${event.teamConfig.minMembers}-${event.teamConfig.maxMembers} members per team`}
                </li>
                <li>• Team leader required</li>
                <li>• All members must verify email</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Organization Info */}
      <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700/30">
        <h2 className="text-xl font-bold mb-2">Organized By</h2>
        <div className="flex flex-col space-y-2">
          <div className="flex items-center">
            <span className="text-gray-400 w-24">Type:</span>
            <span className="text-white capitalize">{event.organizationType}</span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-400 w-24">Name:</span>
            <span className="text-white">{event.organizer}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700/30">
        <h2 className="text-2xl font-bold mb-2">Description</h2>
        <p className="text-gray-400 whitespace-pre-wrap">{event.description}</p>
      </div>

      {/* Registration Info */}
      <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700/30">
        <h2 className="text-xl font-bold mb-2">Registration Details</h2>
        <div className="text-gray-400">
          <p>Registration Type: {event.registrationType}</p>
          {event.registrationType === 'googleForm' && (
            <a 
              href={event.googleFormLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 mt-2 inline-block"
            >
              Open Registration Form →
            </a>
          )}
        </div>
      </div>

      {/* Register Button */}
      <button
        onClick={handleRegister}
        disabled={isRegistered}
        className={`mt-6 w-full py-3 rounded-lg transition-colors ${
          isRegistered 
            ? 'bg-gray-700 cursor-not-allowed' 
            : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
        }`}
      >
        {isRegistered 
          ? 'Already Registered' 
          : event.registrationType === 'googleForm'
            ? 'Open Registration Form'
            : `Register ${event.isTeamEvent ? 'Team' : 'Now'}`
        }
      </button>

      {/* Team Registration Modal */}
      {isTeamModalOpen && (
        <TeamRegistrationModal
          isOpen={isTeamModalOpen}
          onClose={() => setIsTeamModalOpen(false)}
          onSubmit={handleTeamRegistration}
          minMembers={event.teamConfig.minMembers}
          maxMembers={event.teamConfig.maxMembers}
        />
      )}
    </div>
  );
};

export default EventDetails;
