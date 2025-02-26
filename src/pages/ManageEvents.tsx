import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebaseConfig';
import { collection, query, where, getDocs, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';  // Import the Loading component
import { Calendar, MapPin, Users, Trash2, ClipboardList } from 'lucide-react';
import { format } from 'date-fns';

// Add these category-specific image mappings at the top of the file, after imports
const categoryImages = {
  Technology: [
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa"
  ],
  Career: [
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40",
    "https://images.unsplash.com/photo-1521737711867-e3b97375f902",
    "https://images.unsplash.com/photo-1565728744382-61accd4aa148"
  ],
  Health: [
    "https://images.unsplash.com/photo-1505576399279-565b52d4ac71",
    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b",
    "https://images.unsplash.com/photo-1498837167922-ddd27525d352"
  ],
  Education: [
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1",
    "https://images.unsplash.com/photo-1509062522246-3755977927d7",
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b"
  ],
  Entertainment: [
    "https://images.unsplash.com/photo-1603190287605-e6ade32fa852",
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3",
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819"
  ],
  default: [
    "https://images.unsplash.com/photo-1523580494863-6f3031224c94",
    "https://images.unsplash.com/photo-1531297484001-80022131f5a1",
    "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"
  ]
};

// Add this helper function after the categoryImages object
const getRandomImage = (category: string): string => {
  const images = categoryImages[category as keyof typeof categoryImages] || categoryImages.default;
  return images[Math.floor(Math.random() * images.length)];
};

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
    <div className="p-6 bg-gray-900 rounded-lg shadow-lg">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text">
          Manage Events
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {events.map(event => (
            <div 
              key={event.id} 
              className="bg-gray-800/50 rounded-lg border border-gray-700/50 overflow-hidden hover:border-gray-600/50 transition-all duration-300"
            >
              <div className="relative">
                <img
                  src={event.eventImage || getRandomImage(event.category)}
                  alt={event.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = getRandomImage('default');
                    e.currentTarget.onerror = null; // Prevent infinite loop
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
                <div className="absolute top-4 right-4 flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    event.isTeamEvent 
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' 
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/20'
                  }`}>
                    {event.isTeamEvent ? 'Team Event' : 'Solo Event'}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">{event.title}</h2>
                  <p className="text-gray-400 line-clamp-2">{event.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{format(new Date(event.dateTime.seconds * 1000), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{event.attendees?.length || 0} Participants</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-700/50 flex gap-3">
                  <button
                    onClick={() => handleDetails(event.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                  >
                    <ClipboardList className="h-4 w-4" />
                    View Details
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {events.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No events found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageEvents;