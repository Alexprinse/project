import React, { useEffect, useState } from 'react';
import { Calendar, Users, TrendingUp, Clock, Activity, BarChart, MapPin, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebaseConfig';
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import Loading from '../components/Loading';  // Import the Loading component

// Add new interfaces
interface EventStats {
  totalEvents: number;
  upcomingEvents: number;
  totalAttendees: number;
  popularCategory: string;
  topLocation: string;
  attendanceRate: number;
  recentActivity: ActivityItem[];
}

interface ActivityItem {
  type: 'registration' | 'creation' | 'update';
  eventId: string;
  eventTitle: string;
  timestamp: Date;
}

const db = getFirestore();

function Dashboard() {
  const [user] = useAuthState(auth);
  const [role, setRole] = useState<string | null>(null);
  const [registeredEvents, setRegisteredEvents] = useState<any[]>([]);
  const [otherEvents, setOtherEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  // Add new state for stats
  const [stats, setStats] = useState<EventStats>({
    totalEvents: 0,
    upcomingEvents: 0,
    totalAttendees: 0,
    popularCategory: '',
    topLocation: '',
    attendanceRate: 0,
    recentActivity: []
  });

  // Add these new states after existing useState declarations
  const [eventFilter, setEventFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setRole(docSnap.data().role);
        }
      }
    };
    fetchUserRole();
  }, [user]);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const allEventsQuery = collection(db, 'events');
      const allEventsSnapshot = await getDocs(allEventsQuery);
      const allEventsData = allEventsSnapshot.docs.map(doc => ({ id: doc.id, attendees: [], dateTime: doc.data().dateTime, ...doc.data() }));

      // Calculate stats
      const now = new Date();
      const upcomingEventsCount = allEventsData.filter(event => 
        new Date(event.dateTime.seconds * 1000) > now
      ).length;

      // Calculate total unique attendees
      const allAttendees = new Set();
      allEventsData.forEach(event => {
        event.attendees?.forEach((attendee: string) => allAttendees.add(attendee));
      });

      setStats(prev => ({
        ...prev,
        totalEvents: allEventsData.length,
        upcomingEvents: upcomingEventsCount,
        totalAttendees: allAttendees.size
      }));

      if (user) {
        const registeredEventsQuery = query(collection(db, 'events'), where('attendees', 'array-contains', user.uid));
        const registeredEventsSnapshot = await getDocs(registeredEventsQuery);
        const registeredEventsData = registeredEventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setRegisteredEvents(registeredEventsData);
        setOtherEvents(allEventsData.filter(event => !registeredEventsData.some(regEvent => regEvent.id === event.id)));
      } else {
        setOtherEvents(allEventsData);
      }
      setLoading(false);
    };
    fetchEvents();
  }, [user]);

  // Add new async function to fetch advanced stats
  const fetchAdvancedStats = async () => {
    if (!user) return;
    
    const eventsRef = collection(db, 'events');
    const eventsSnapshot = await getDocs(eventsRef);
    const eventsData = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Calculate popular category
    const categories = eventsData.reduce((acc: any, event: any) => {
      acc[event.category] = (acc[event.category] || 0) + 1;
      return acc;
    }, {});
    const popularCategory = Object.entries(categories).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || '';

    // Calculate top location
    const locations = eventsData.reduce((acc: any, event: any) => {
      acc[event.location] = (acc[event.location] || 0) + 1;
      return acc;
    }, {});
    const topLocation = Object.entries(locations).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || '';

    // Calculate attendance rate
    const attendanceRate = eventsData.reduce((acc, event: any) => {
      return acc + (event.attendees?.length || 0);
    }, 0) / eventsData.length;

    setStats(prev => ({
      ...prev,
      popularCategory,
      topLocation,
      attendanceRate: Math.round(attendanceRate)
    }));
  };

  // Add this function after fetchAdvancedStats
  const getFilteredEvents = () => {
    const now = new Date();
    switch (eventFilter) {
      case 'upcoming':
        return registeredEvents.filter(event => 
          new Date(event.dateTime.seconds * 1000) > now
        );
      case 'completed':
        return registeredEvents.filter(event => 
          new Date(event.dateTime.seconds * 1000) <= now
        );
      default:
        return registeredEvents;
    }
  };

  useEffect(() => {
    fetchAdvancedStats();
  }, [user]);

  // Add this useEffect to fetch user name
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserName(userDoc.data().name);
        }
      }
    };
    fetchUserData();
  }, [user]);

  return (
    <div className="space-y-8">
      {/* Header with Welcome Message */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white/90">
          Welcome back, {userName || 'Loading...'}
        </h1>
        <p className="text-gray-400">Here's what's happening with your events</p>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <>
          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Total Events',
                value: stats.totalEvents,
                icon: Calendar,
                color: 'bg-blue-500/5',
                textColor: 'text-blue-300'
              },
              {
                title: 'Total Attendees',
                value: stats.totalAttendees,
                icon: Users,
                color: 'bg-purple-500/5',
                textColor: 'text-purple-300'
              },
              {
                title: 'Avg. Attendance',
                value: `${stats.attendanceRate} per event`,
                icon: BarChart,
                color: 'bg-teal-500/5',
                textColor: 'text-teal-300'
              },
              {
                title: 'Upcoming Events',
                value: stats.upcomingEvents,
                icon: Clock,
                color: 'bg-rose-500/5',
                textColor: 'text-rose-300'
              }
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">{stat.title}</p>
                    <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <h2 className="text-xl font-bold text-white/90 mb-4 flex items-center">
                <Award className="h-5 w-5 mr-2 text-rose-300/90" />
                Popular Category
              </h2>
              <p className="text-2xl font-semibold text-rose-300/90">
                {stats.popularCategory || 'N/A'}
              </p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <h2 className="text-xl font-bold text-white/90 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-teal-300/90" />
                Top Location
              </h2>
              <p className="text-2xl font-semibold text-teal-300/90">
                {stats.topLocation || 'N/A'}
              </p>
            </div>
          </div>

          {/* Registered Events with Enhanced UI */}
          {user && (
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-blue-500" />
                  Your Events
                </h2>
                <div className="flex space-x-2 mt-4 sm:mt-0">
                  {(['all', 'upcoming', 'completed'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setEventFilter(filter)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                        ${eventFilter === filter
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border border-gray-700/50'
                        }`}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                {getFilteredEvents().length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto text-gray-500 mb-3" />
                    <p className="text-gray-400">No {eventFilter} events found</p>
                  </div>
                ) : (
                  getFilteredEvents().map(event => (
                    <div
                      key={event.id}
                      className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{event.title}</h3>
                          <p className="text-gray-400">
                            {format(new Date(event.dateTime.seconds * 1000), 'MMMM d, yyyy h:mm aa')}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <p className="text-gray-400">{event.location}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center space-x-2 text-gray-400">
                            <Users className="h-4 w-4" />
                            <span>{event.attendees?.length || 0} attendees</span>
                          </div>
                          <Link
                            to={`/event-details/${event.id}`}
                            className="px-4 py-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Event Recommendations */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-purple-500" />
              Recommended for You
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {otherEvents.slice(0, 4).map(event => (
                <div
                  key={event.id}
                  className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200"
                >
                  <div className="flex flex-col h-full">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{event.title}</h3>
                      <p className="text-sm text-gray-400 mt-1">
                        {format(new Date(event.dateTime.seconds * 1000), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-2 text-gray-400">
                        <Users className="h-4 w-4" />
                        <span className="text-sm">{event.attendees?.length || 0}</span>
                      </div>
                      <Link
                        to={`/event-details/${event.id}`}
                        className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
                      >
                        Learn More →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;