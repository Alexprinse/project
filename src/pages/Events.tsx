import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Filter, Calendar, MapPin, Users, X, SlidersHorizontal, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Loading from '../components/Loading';

const categoryImages = {
  Technology: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
  Career: "https://images.unsplash.com/photo-1521737711867-e3b97375f902",
  Health: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528",
  Education: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1",
  Entertainment: "https://images.unsplash.com/photo-1603190287605-e6ade32fa852",
  default: "https://images.unsplash.com/photo-1523580494863-6f3031224c94"
};

// Add this helper function at the top of the file, after imports
const getEventTypeStyle = (isTeamEvent: boolean) => {
  return isTeamEvent 
    ? { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' }
    : { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' };
};

function Events() {
  interface Event {
    id: string;
    title: string;
    description: string;
    dateTime: Date;
    category: string;
    isTeamEvent?: boolean;
    registrationType?: string;
    attendees?: string[];
    location?: string;
  }

  interface EventStats {
    totalEvents: number;
    totalAttendees: number;
    upcomingEvents: number;
    engagementRate: number;
  }
  
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    timeFrame: 'all', // 'today', 'week', 'month', 'all'
    eventType: 'all', // 'team', 'solo', 'all'
    registrationType: 'all', // 'oneClick', 'googleForm', 'all'
  });
  const [sortBy, setSortBy] = useState('date'); // 'date', 'popularity'
  const [eventStats, setEventStats] = useState<EventStats>({
    totalEvents: 0,
    totalAttendees: 0,
    upcomingEvents: 0,
    engagementRate: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError('');
      try {
        const querySnapshot = await getDocs(collection(db, 'events'));
        const eventPromises = querySnapshot.docs.map(async (docSnapshot) => {
          const eventData = docSnapshot.data();
          return {
            id: docSnapshot.id,
            title: eventData.title,
            description: eventData.description,
            category: eventData.category,
            dateTime: eventData.dateTime?.seconds ? 
              new Date(eventData.dateTime.seconds * 1000) : 
              new Date(),
            isTeamEvent: eventData.isTeamEvent,
            registrationType: eventData.registrationType,
            attendees: eventData.attendees,
            location: eventData.location
          };
        });
        const eventData = await Promise.all(eventPromises);
        setEvents(eventData);

        // Calculate stats
        const now = new Date();
        const upcomingEventsCount = eventData.filter(event => 
          new Date(event.dateTime) > now
        ).length;

        const totalAttendees = eventData.reduce((sum, event) => 
          sum + (event.attendees?.length || 0), 0
        );

        setEventStats({
          totalEvents: eventData.length,
          totalAttendees,
          upcomingEvents: upcomingEventsCount,
          engagementRate: Math.round((totalAttendees / eventData.length) || 0),
        });

      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Failed to fetch events. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Filter events based on category selection
  const getFilteredEvents = () => {
    return events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !filters.category || event.category === filters.category;
      
      const matchesTimeFrame = filters.timeFrame === 'all' || (() => {
        const eventDate = new Date(event.dateTime);
        const now = new Date();
        switch (filters.timeFrame) {
          case 'today':
            return eventDate.toDateString() === now.toDateString();
          case 'week':
            const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            return eventDate >= now && eventDate <= weekFromNow;
          case 'month':
            return eventDate.getMonth() === now.getMonth() && 
                   eventDate.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      })();

      const matchesEventType = filters.eventType === 'all' || 
        (filters.eventType === 'team' ? event.isTeamEvent : !event.isTeamEvent);

      const matchesRegistrationType = filters.registrationType === 'all' || 
        event.registrationType === filters.registrationType;

      return matchesSearch && matchesCategory && matchesTimeFrame && 
             matchesEventType && matchesRegistrationType;
    }).sort((a, b) => {
      if (sortBy === 'popularity') {
        return (b.attendees?.length || 0) - (a.attendees?.length || 0);
      }
      return b.dateTime.getTime() - a.dateTime.getTime();
    });
  };

  // Add this handler function inside the Events component
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
            Campus Events
          </h1>
          <p className="text-gray-400">Discover and participate in exciting campus activities</p>
        </div>

        {/* Stats Dashboard */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Events */}
            <div className="bg-gray-800/80 p-6 rounded-xl border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Events</p>
                  <p className="text-2xl font-bold text-white mt-1">{eventStats.totalEvents}</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </div>

            {/* Total Attendees */}
            <div className="bg-gray-800/80 p-6 rounded-xl border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Attendees</p>
                  <p className="text-2xl font-bold text-white mt-1">{eventStats.totalAttendees}</p>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Users className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-gray-800/80 p-6 rounded-xl border border-gray-700/50 hover:border-green-500/50 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Upcoming Events</p>
                  <p className="text-2xl font-bold text-white mt-1">{eventStats.upcomingEvents}</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <Clock className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </div>

            {/* Engagement Rate */}
            <div className="bg-gray-800/80 p-6 rounded-xl border border-gray-700/50 hover:border-yellow-500/50 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Avg. Engagement</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {eventStats.engagementRate} <span className="text-sm text-gray-400">per event</span>
                  </p>
                </div>
                <div className="p-3 bg-yellow-500/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-yellow-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 text-white rounded-xl border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                showFilters 
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <SlidersHorizontal className="h-5 w-5" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          {/* Active Filters */}
          {(filters.category || filters.timeFrame !== 'all' || filters.eventType !== 'all') && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-400">Active filters:</span>
              {filters.category && (
                <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center">
                  {filters.category}
                  <button
                    onClick={() => handleFilterChange('category', '')}
                    className="ml-2 hover:text-blue-300"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.timeFrame !== 'all' && (
                <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center">
                  {filters.timeFrame}
                  <button
                    onClick={() => handleFilterChange('timeFrame', 'all')}
                    className="ml-2 hover:text-purple-300"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.eventType !== 'all' && (
                <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-green-500/10 text-green-400 border border-green-500/20 flex items-center">
                  {filters.eventType === 'team' ? 'Team Events' : 'Solo Events'}
                  <button
                    onClick={() => handleFilterChange('eventType', 'all')}
                    className="ml-2 hover:text-green-300"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-700/30 rounded-xl border border-gray-600/10">
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-700/50 text-white rounded-xl border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="">All Categories</option>
                <option value="Technology">Technology</option>
                <option value="Career">Career</option>
                <option value="Health">Health</option>
                <option value="Education">Education</option>
                <option value="Entertainment">Entertainment</option>
              </select>

              <select
                value={filters.timeFrame}
                onChange={(e) => handleFilterChange('timeFrame', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-700/50 text-white rounded-xl border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>

              <select
                value={filters.eventType}
                onChange={(e) => handleFilterChange('eventType', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-700/50 text-white rounded-xl border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="all">All Types</option>
                <option value="team">Team Events</option>
                <option value="solo">Solo Events</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-700/50 text-white rounded-xl border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="date">Sort by Date</option>
                <option value="popularity">Sort by Popularity</option>
              </select>
            </div>
          )}
        </div>

        {/* Events Grid with updated styling */}
        {loading ? (
          <Loading />
        ) : error ? (
          <div className="text-center py-12 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50">
            <AlertCircle className="h-12 w-12 mx-auto text-red-400 mb-4" />
            <p className="text-red-400">{error}</p>
          </div>
        ) : getFilteredEvents().length === 0 ? (
          <div className="text-center py-12 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50">
            <Calendar className="h-12 w-12 mx-auto text-gray-500 mb-4" />
            <p className="text-gray-400">No events found matching your criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredEvents().map(event => (
              <div key={event.id} 
                className="group bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 overflow-hidden hover:border-blue-500/50 transition-all duration-300"
              >
                {/* Image Section */}
                <div className="relative h-48">
                  <img
                    src={categoryImages[event.category as keyof typeof categoryImages] || categoryImages.default}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/50 to-transparent" />
                  
                  {/* Category and Event Type Badges - Positioned over image */}
                  <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 backdrop-blur-md">
                      {event.category}
                    </span>
                    {event.isTeamEvent !== undefined && (
                      <span className={`px-3 py-1 text-xs font-medium rounded-full backdrop-blur-md ${
                        getEventTypeStyle(event.isTeamEvent).bg
                      } ${getEventTypeStyle(event.isTeamEvent).text} border ${
                        getEventTypeStyle(event.isTeamEvent).border
                      }`}>
                        {event.isTeamEvent ? 'Team Event' : 'Solo Event'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 space-y-4">
                  {/* Title and Date */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-2 flex-1">
                        {event.title}
                      </h3>
                      <span className="text-sm text-gray-400 whitespace-nowrap ml-4">
                        {format(event.dateTime, 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-400 text-sm line-clamp-2">
                    {event.description}
                  </p>

                  {/* Event Details */}
                  <div className="grid grid-cols-2 gap-3 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{format(event.dateTime, 'h:mm a')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <Users className="h-4 w-4 flex-shrink-0" />
                      <span>{event.attendees?.length || 0} Participants</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link 
                    to={`/event/${event.id}`}
                    className="block w-full py-2.5 px-4 bg-gray-700/50 text-white text-center rounded-lg hover:bg-blue-500/20 hover:text-blue-400 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Events;
