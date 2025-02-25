import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Calendar, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';  // Import the initialized Firestore instance

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError('');
      try {
        const querySnapshot = await getDocs(collection(db, 'events'));
        const eventPromises = querySnapshot.docs.map(async (docSnapshot) => {
          const eventDoc = await getDoc(doc(db, 'events', docSnapshot.id));
          return { id: eventDoc.id, ...eventDoc.data(), dateTime: eventDoc.data().dateTime ? eventDoc.data().dateTime.toDate() : new Date() };
        });
        const eventData = await Promise.all(eventPromises);
        setEvents(eventData);
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
  const filteredEvents = events.filter(event => !categoryFilter || event.category === categoryFilter);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Events</h1>
        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-4">
          <div className="relative flex-1 sm:flex-none">
            <select
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-gray-800 text-white pl-4 pr-10 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
            >
              <option value="">All Categories</option>
              <option value="Technology">Technology</option>
              <option value="Career">Career</option>
              <option value="Health">Health</option>
              <option value="Education">Education</option>
              <option value="Entertainment">Entertainment</option>
            </select>
          </div>
          <button className="bg-gray-800 p-2 rounded-lg hover:bg-gray-700 transition-colors">
            <Filter className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-white text-center">Loading events...</p>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : filteredEvents.length === 0 ? (
        <p className="text-white text-center">No events found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <div key={event.id} className="bg-gray-800 rounded-lg overflow-hidden">
              <img
                src={event.eventImage || 'https://via.placeholder.com/300'} // Default image if none provided
                alt={event.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-blue-400">{event.category}</span>
                  <div className="flex items-center text-gray-400">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{event.attendees || 0}</span>
                  </div>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-2">{event.title}</h3>
                <div className="space-y-2 text-gray-400">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{format(event.dateTime, 'MMMM d, yyyy h:mm aa')}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{event.location}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/events/${event.id}`)}
                  className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Events;
