import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebaseConfig';
import { getFirestore, doc, getDoc, onSnapshot, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Camera, Edit, Award, Calendar, Users, Clock, 
  Trophy, BookOpen, Sparkles, ChevronRight, Settings, MapPin, Check
} from 'lucide-react';
import Loading from '../components/Loading';
import PasswordEditModal from '../components/PasswordEditModal'; // Import the PasswordEditModal component
import { format } from 'date-fns';

const db = getFirestore();

// Add new interfaces for better type safety
interface ProfileData {
  name: string;
  email: string;
  idNo: string;
  branch: string;
  role: string;
  photoURL?: string;
  bio?: string;
  achievements?: Achievement[];
  skills?: string[];
  eventsRegistered: number;
  completedEvents: number;
}

interface Achievement {
  title: string;
  date: string;
  description: string;
}

// Add this new interface after your existing interfaces
interface EventData {
  id: string;
  title: string;
  description: string;
  dateTime: { seconds: number };
  location: string;
  attendees?: string[];
}

// Add this interface after your existing interfaces
interface EditableFields {
  name: string;
  bio: string;
}

const Profile = () => {
  const [user] = useAuthState(auth);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'events'>('overview');
  const [upcomingEventsCount, setUpcomingEventsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const navigate = useNavigate();

  // Add these new states in your Profile component
  const [registeredEvents, setRegisteredEvents] = useState<EventData[]>([]);
  const [eventsTabView, setEventsTabView] = useState<'upcoming' | 'completed'>('upcoming');

  // Add these new state variables in your Profile component
  const [isEditing, setIsEditing] = useState(false);
  const [editableFields, setEditableFields] = useState<EditableFields>({
    name: '',
    bio: '',
  });

  // Add state for password edit modal
  const [isPasswordEditModalOpen, setIsPasswordEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfileData(docSnap.data() as ProfileData);
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
          setProfileData(data as ProfileData);
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

  // Add this new useEffect after your existing ones
  useEffect(() => {
    const fetchRegisteredEvents = async () => {
      if (user) {
        const eventsQuery = query(
          collection(db, 'events'),
          where('attendees', 'array-contains', user.uid)
        );
        const eventsSnapshot = await getDocs(eventsQuery);
        const eventsData = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as EventData[];
        setRegisteredEvents(eventsData);
      }
    };
    fetchRegisteredEvents();
  }, [user]);

  // Add this function in your Profile component
  const handleSaveChanges = async () => {
    if (!user) return;

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        name: editableFields.name,
        bio: editableFields.bio,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  // Add this useEffect to initialize editable fields
  useEffect(() => {
    if (profileData) {
      setEditableFields({
        name: profileData.name || '',
        bio: profileData.bio || '',
      });
    }
  }, [profileData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        {loading ? (
          <Loading />
        ) : (
          <div className="space-y-8">
            {/* Profile Header */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Avatar Section */}
                <div className="relative">
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 p-1">
                    <div className="w-full h-full rounded-2xl bg-gray-800 flex items-center justify-center overflow-hidden">
                      {profileData?.photoURL ? (
                        <img src={profileData.photoURL} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-4xl font-bold text-white">
                            {profileData?.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button className="absolute bottom-2 right-2 p-2 rounded-xl bg-gray-700/90 backdrop-blur-sm border border-gray-600/50 text-gray-300 hover:text-white transition-colors">
                    <Camera className="h-5 w-5" />
                  </button>
                </div>

                {/* Profile Info */}
                <ProfileInfo 
                  profileData={profileData}
                  isEditing={isEditing}
                  setIsEditing={setIsEditing}
                  editableFields={editableFields}
                  setEditableFields={setEditableFields}
                  handleSaveChanges={handleSaveChanges}
                />
              </div>

              {/* Password Edit Button */}
              {isEditing && (
                <div className="mt-4">
                  <button
                    onClick={() => setIsPasswordEditModalOpen(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Change Password
                  </button>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <StatCard icon={Calendar} label="Events Registered" value={profileData?.eventsRegistered || 0} />
                <StatCard icon={Clock} label="Upcoming Events" value={upcomingEventsCount} />
                <StatCard icon={Trophy} label="Achievements" value={profileData?.achievements?.length || 0} />
                <StatCard icon={Users} label="Teams Joined" value={profileData?.completedEvents || 0} />
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex space-x-2 bg-gray-800/50 backdrop-blur-sm p-1 rounded-xl">
              {(['overview', 'achievements', 'events'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2.5 px-4 rounded-lg transition-all duration-200 ${
                    activeTab === tab 
                      ? 'bg-blue-500 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Profile Information */}
                  <div className="space-y-4">
                    <ProfileField label="Email" value={profileData?.email || ''} />
                    <ProfileField label="ID No" value={profileData?.idNo || ''} />
                    <ProfileField label="Branch" value={profileData?.branch || ''} />
                    <ProfileField label="Role" value={profileData?.role || ''} />
                  </div>
                </div>
              )}

              {activeTab === 'achievements' && (
                <div className="space-y-4">
                  {profileData?.achievements?.map((achievement, index) => (
                    <div key={index} className="p-4 bg-gray-700/30 rounded-xl border border-gray-700/50">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-yellow-500/10">
                          <Trophy className="h-6 w-6 text-yellow-500" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{achievement.title}</h3>
                          <p className="text-gray-400 text-sm mt-1">{achievement.description}</p>
                          <span className="text-sm text-gray-500 mt-2 block">{achievement.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'events' && (
                <div className="space-y-6">
                  {/* Events Tab Navigation */}
                  <div className="flex space-x-2 bg-gray-700/30 p-1 rounded-lg">
                    {(['upcoming', 'completed'] as const).map((view) => (
                      <button
                        key={view}
                        onClick={() => setEventsTabView(view)}
                        className={`flex-1 py-2 px-4 rounded-lg transition-all duration-200 ${
                          eventsTabView === view 
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                        }`}
                      >
                        {view.charAt(0).toUpperCase() + view.slice(1)}
                      </button>
                    ))}
                  </div>

                  {/* Events List */}
                  <div className="space-y-4">
                    {registeredEvents
                      .filter(event => {
                        const eventDate = new Date(event.dateTime.seconds * 1000);
                        const now = new Date();
                        return eventsTabView === 'upcoming' 
                          ? eventDate > now 
                          : eventDate <= now;
                      })
                      .map(event => (
                        <div 
                          key={event.id}
                          className="group bg-gray-700/30 rounded-xl border border-gray-700/50 overflow-hidden hover:border-blue-500/50 transition-all duration-200"
                        >
                          <div className="p-4">
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                                  {event.title}
                                </h3>
                                <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                                  {event.description}
                                </p>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="text-sm text-gray-400">
                                  {format(new Date(event.dateTime.seconds * 1000), 'MMM d, yyyy')}
                                </span>
                                <span className="text-sm text-gray-500 mt-1">
                                  {format(new Date(event.dateTime.seconds * 1000), 'h:mm a')}
                                </span>
                              </div>
                            </div>
                            
                            <div className="mt-4 flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-gray-400">
                                  <MapPin className="h-4 w-4" />
                                  <span className="text-sm">{event.location}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                  <Users className="h-4 w-4" />
                                  <span className="text-sm">{event.attendees?.length || 0} attendees</span>
                                </div>
                              </div>
                              <Link
                                to={`/event/${event.id}`}
                                className="px-4 py-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors text-sm"
                              >
                                View Details
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}

                    {registeredEvents.filter(event => {
                      const eventDate = new Date(event.dateTime.seconds * 1000);
                      const now = new Date();
                      return eventsTabView === 'upcoming' 
                        ? eventDate > now 
                        : eventDate <= now;
                    }).length === 0 && (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 mx-auto text-gray-500 mb-3" />
                        <p className="text-gray-400">No {eventsTabView} events found</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Admin/Organizer Actions */}
            {(profileData?.role === 'organizer' || profileData?.role === 'admin') && (
              <div className="grid grid-cols-1 gap-4">
                <Link 
                  to="/manage-events" 
                  className="flex items-center justify-between p-4 bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700/50 hover:border-blue-500/50 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Calendar className="h-5 w-5 text-blue-400" />
                    </div>
                    <span className="font-medium text-white">Manage Events</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </Link>
                {/* Show Admin Dashboard only for admin role */}
                {profileData?.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="flex items-center justify-between p-4 bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700/50 hover:border-purple-500/50 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/10">
                        <Settings className="h-5 w-5 text-purple-400" />
                      </div>
                      <span className="font-medium text-white">Admin Dashboard</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </div>
.      {/* Password Edit Modal */}
      <PasswordEditModal
        isOpen={isPasswordEditModalOpen}
        onClose={() => setIsPasswordEditModalOpen(false)}
      />
    </div>
  );
};

// Updated helper components
const StatCard = ({ icon: Icon, label, value }: { icon: any; label: string; value: number }) => (
  <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-700/50">
    <div className="flex items-center gap-3 mb-3">
      <div className="p-2 rounded-lg bg-blue-500/10">
        <Icon className="h-5 w-5 text-blue-400" />
      </div>
      <span className="text-sm text-gray-400 truncate">{label}</span>
    </div>
    <div className="text-2xl font-bold text-white">{value}</div>
  </div>
);

const ProfileField = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-700/50">
    <span className="text-gray-400">{label}</span>
    <span className="font-medium text-white">{value}</span>
  </div>
);

// Update the ProfileInfo component definition
interface ProfileInfoProps {
  profileData: ProfileData | null;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  editableFields: EditableFields;
  setEditableFields: (value: React.SetStateAction<EditableFields>) => void;
  handleSaveChanges: () => Promise<void>;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({
  profileData,
  isEditing,
  setIsEditing,
  editableFields,
  setEditableFields,
  handleSaveChanges
}) => (
  <div className="flex-1 text-center md:text-left">
    <div className="flex items-center justify-center md:justify-between gap-4 mb-4">
      {isEditing ? (
        <input
          type="text"
          value={editableFields.name}
          onChange={(e) => setEditableFields(prev => ({ ...prev, name: e.target.value }))}
          className="text-2xl font-bold bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-1 text-white focus:outline-none focus:border-blue-500/50"
        />
      ) : (
        <h1 className="text-3xl font-bold text-white">{profileData?.name}</h1>
      )}
      <button 
        onClick={() => {
          if (isEditing) {
            handleSaveChanges();
          } else {
            setIsEditing(true);
          }
        }}
        className="p-2 rounded-xl bg-gray-700/50 hover:bg-gray-700 transition-colors"
      >
        {isEditing ? (
          <Check className="h-5 w-5 text-green-400" />
        ) : (
          <Settings className="h-5 w-5 text-gray-300" />
        )}
      </button>
    </div>
    {isEditing ? (
      <textarea
        value={editableFields.bio}
        onChange={(e) => setEditableFields(prev => ({ ...prev, bio: e.target.value }))}
        placeholder="Add a bio..."
        className="w-full h-24 bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50 resize-none"
      />
    ) : (
      <p className="text-gray-400 mb-4">{profileData?.bio || 'No bio added yet'}</p>
    )}
    <div className="flex flex-wrap gap-2">
      {profileData?.skills?.map((skill, index) => (
        <span 
          key={index}
          className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-sm"
        >
          {skill}
        </span>
      ))}
    </div>
  </div>
);

export default Profile;
