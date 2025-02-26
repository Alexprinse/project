import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { useAuthState } from 'react-firebase-hooks/auth';
import Loading from '../components/Loading';  // Import the Loading component
import { Edit, Save, X } from 'lucide-react'; // Add these imports
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

// Add these interfaces at the top
interface TeamMember {
  name: string;
  email: string;
  idNumber: string;
  branch: string;
}

interface Team {
  leader: TeamMember & { uid: string };
  members: TeamMember[];
  registeredAt: any;
}

const EventParticipants: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [user] = useAuthState(auth);
  const [event, setEvent] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [creator, setCreator] = useState<any>(null);

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

        if (eventData.attendees && Array.isArray(eventData.attendees)) {
          const participantsList = await Promise.all(
            eventData.attendees.map(async (attendeeId: string) => {
              try {
                // Get user data directly from users collection
                const userDocRef = doc(db, 'users', attendeeId);
                const userDocSnap = await getDoc(userDocRef);
                
                if (userDocSnap.exists()) {
                  const userData = userDocSnap.data();
                  return {
                    id: attendeeId,
                    name: userData.name || userData.displayName,
                    idNumber: userData.idNo || 'Not provided',
                    branch: userData.branch || 'Not provided',
                    registeredAt: userData.createdAt || new Date(),
                  };
                }
                return null;
              } catch (err) {
                console.error(`Error fetching user ${attendeeId}:`, err);
                return null;
              }
            })
          );

          const validParticipants = participantsList.filter((p): p is NonNullable<typeof p> => p !== null);
          setParticipants(validParticipants);
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

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
        }
      }
    };
    fetchUserRole();
  }, [user]);

  useEffect(() => {
    const fetchCreator = async () => {
      if (event?.organizerId) {
        try {
          const creatorDoc = await getDoc(doc(db, 'users', event.organizerId));
          if (creatorDoc.exists()) {
            setCreator(creatorDoc.data());
          }
        } catch (err) {
          console.error('Error fetching creator details:', err);
        }
      }
    };

    if (event) {
      fetchCreator();
    }
  }, [event]);

  const handleSaveEdit = async () => {
    try {
      const eventRef = doc(db, 'events', eventId!);
      const updatedFields = {
        title: editedEvent.title,
        description: editedEvent.description,
        location: editedEvent.location,
        dateTime: editedEvent.dateTime,
      };
      
      await updateDoc(eventRef, updatedFields);
      setEvent({
        ...event,
        ...updatedFields
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating event:', err);
      alert('Failed to update event details');
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (!event) {
    return <div className="text-white">Event not found</div>;
  }

  return (
    <div className="p-6 bg-gray-900 rounded-lg shadow-lg text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text animate-pulse">
          Event Details
        </h1>
        {(userRole === 'admin' || user?.uid === event?.organizerId) && (
          <button
            onClick={() => {
              if (isEditing) {
                setIsEditing(false);
                setEditedEvent(event);
              } else {
                setIsEditing(true);
                setEditedEvent({...event});
              }
            }}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            {isEditing ? (
              <>
                <X className="h-5 w-5" />
                <span>Cancel</span>
              </>
            ) : (
              <>
                <Edit className="h-5 w-5" />
                <span>Edit</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="mb-6 space-y-4">
        {isEditing ? (
          // Edit form
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
              <input
                type="text"
                value={editedEvent.title}
                onChange={(e) => setEditedEvent({...editedEvent, title: e.target.value})}
                className="w-full bg-gray-800/50 text-white px-4 py-2.5 rounded-lg border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                value={editedEvent.description}
                onChange={(e) => setEditedEvent({...editedEvent, description: e.target.value})}
                className="w-full bg-gray-800/50 text-white px-4 py-2.5 rounded-lg border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 h-32 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
              <input
                type="text"
                value={editedEvent.location}
                onChange={(e) => setEditedEvent({...editedEvent, location: e.target.value})}
                className="w-full bg-gray-800/50 text-white px-4 py-2.5 rounded-lg border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Date and Time</label>
              <DatePicker
                selected={editedEvent.dateTime ? new Date(editedEvent.dateTime.seconds * 1000) : null}
                onChange={(date) => {
                  if (date) {
                    setEditedEvent({
                      ...editedEvent,
                      dateTime: {
                        seconds: Math.floor(date.getTime() / 1000),
                        nanoseconds: 0
                      }
                    });
                  }
                }}
                showTimeSelect
                dateFormat="MMMM d, yyyy h:mm aa"
                className="w-full bg-gray-800/50 text-white px-4 py-2.5 rounded-lg border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                placeholderText="Select date and time"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Registration Type</label>
              <select
                value={editedEvent.registrationType}
                onChange={(e) => setEditedEvent({...editedEvent, registrationType: e.target.value})}
                className="w-full bg-gray-800/50 text-white px-4 py-2.5 rounded-lg border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                disabled
              >
                <option value="oneClick">One-Click Registration</option>
                <option value="googleForm">Google Form</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Event Type</label>
              <select
                value={editedEvent.isTeamEvent ? 'team' : 'solo'}
                onChange={(e) => setEditedEvent({...editedEvent, isTeamEvent: e.target.value === 'team'})}
                className="w-full bg-gray-800/50 text-white px-4 py-2.5 rounded-lg border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                disabled
              >
                <option value="solo">Solo Registration</option>
                <option value="team">Team Registration</option>
              </select>
            </div>
            <button
              onClick={handleSaveEdit}
              className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
            >
              <Save className="h-5 w-5" />
              <span>Save Changes</span>
            </button>
          </div>
        ) : (
          // Display event details
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">{event.title}</h2>
            <div className="flex items-center text-sm text-gray-400 space-x-2">
              <span>Created by</span>
              <span className="text-blue-400">
                {creator?.name || 'Loading...'}
              </span>
              <span className="text-gray-500">
                ({creator?.role === 'admin' ? 'Admin' : event.organizationType === 'club' ? event.organizer : `${event.organizer} Department`})
              </span>
            </div>

            {/* Add this new section */}
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                event.isTeamEvent 
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' 
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/20'
              }`}>
                {event.isTeamEvent ? 'Team Event' : 'Solo Event'}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-700/50 text-gray-300 border border-gray-600/20">
                {event.registrationType === 'googleForm' ? 'Google Form Registration' : 'One-Click Registration'}
              </span>
              {event.isTeamEvent && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-700/50 text-gray-300 border border-gray-600/20">
                  {event.teamConfig.minMembers === event.teamConfig.maxMembers
                    ? `${event.teamConfig.minMembers} Members per Team`
                    : `${event.teamConfig.minMembers}-${event.teamConfig.maxMembers} Members per Team`}
                </span>
              )}
            </div>

            <p className="text-lg text-gray-300">{event.description}</p>
            <p className="text-lg text-gray-400">
              {new Date(event.dateTime.seconds * 1000).toLocaleString()}
            </p>
            <p className="text-lg text-gray-400">{event.location}</p>
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Participants</h2>
        
        {event.registrationType === 'googleForm' ? (
          <div className="p-4 bg-gray-800/50 rounded-lg">
            <p className="text-gray-400">
              This event uses Google Form registration. Please check the form responses for participant details.
            </p>
            <a 
              href={event.googleFormLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-blue-400 hover:text-blue-300"
            >
              View Google Form →
            </a>
          </div>
        ) : event.isTeamEvent ? (
          <div className="grid grid-cols-1 gap-6">
            {event.teams?.map((team: Team, index: number) => (
              <div key={index} className="p-6 bg-gray-800/50 rounded-lg border border-gray-700/50">
                <div className="mb-4 pb-4 border-b border-gray-700/50">
                  <h3 className="text-lg font-semibold text-blue-400">Team {index + 1}</h3>
                  <p className="text-sm text-gray-400">Registered on: {new Date(team.registeredAt.seconds * 1000).toLocaleString()}</p>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gray-700/30 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Team Leader</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <p className="text-gray-400">Name: <span className="text-white">{team.leader.name}</span></p>
                      <p className="text-gray-400">ID: <span className="text-white">{team.leader.idNumber}</span></p>
                      <p className="text-gray-400">Email: <span className="text-white">{team.leader.email}</span></p>
                      <p className="text-gray-400">Branch: <span className="text-white">{team.leader.branch}</span></p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-300">Team Members</h4>
                    {team.members.map((member: TeamMember, mIndex: number) => (
                      <div key={mIndex} className="p-4 bg-gray-700/30 rounded-lg">
                        <div className="grid grid-cols-2 gap-4">
                          <p className="text-gray-400">Name: <span className="text-white">{member.name}</span></p>
                          <p className="text-gray-400">ID: <span className="text-white">{member.idNumber}</span></p>
                          <p className="text-gray-400">Email: <span className="text-white">{member.email}</span></p>
                          <p className="text-gray-400">Branch: <span className="text-white">{member.branch}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Participants ({participants.length})</h2>
              <div className="text-sm text-gray-400">
                Showing all registered participants
              </div>
            </div>
            <SoloParticipantsList participants={participants} />
          </>
        )}
      </div>
    </div>
  );
};

// Update the interface
interface SoloParticipantsListProps {
  participants: Array<{
    id: string;
    name: string;
    idNumber: string;
    branch: string;
    registeredAt: any;
  }>;
}

// Update the SoloParticipantsList component
const SoloParticipantsList: React.FC<SoloParticipantsListProps> = ({ participants }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {participants.map((participant) => (
      <div key={participant.id} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:bg-gray-800 transition-colors">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-white">{participant.name}</h3>
            <span className="text-xs text-gray-500">
              {new Date(participant.registeredAt?.seconds * 1000).toLocaleDateString()}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p className="text-gray-400">
              ID Number:
              <span className="ml-2 text-white font-medium">
                {participant.idNumber}
              </span>
            </p>
            <p className="text-gray-400">
              Branch:
              <span className="ml-2 text-white font-medium">
                {participant.branch}
              </span>
            </p>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default EventParticipants;
