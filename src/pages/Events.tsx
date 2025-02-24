import React from 'react';
import { Search, Filter, Calendar, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';

function Events() {
  const events = [
    {
      id: 1,
      title: 'Tech Conference 2024',
      date: new Date(2024, 3, 15),
      location: 'Main Auditorium',
      attendees: 120,
      category: 'Technology',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000'
    },
    {
      id: 2,
      title: 'Career Fair',
      date: new Date(2024, 3, 20),
      location: 'Student Center',
      attendees: 250,
      category: 'Career',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1000'
    }
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Events</h1>
        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-4">
          <div className="relative flex-1 sm:flex-none">
            <input
              type="text"
              placeholder="Search events..."
              className="w-full bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <button className="bg-gray-800 p-2 rounded-lg hover:bg-gray-700 transition-colors">
            <Filter className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <div key={event.id} className="bg-gray-800 rounded-lg overflow-hidden">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-blue-400">{event.category}</span>
                <div className="flex items-center text-gray-400">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{event.attendees}</span>
                </div>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-white mb-2">{event.title}</h3>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{format(event.date, 'MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{event.location}</span>
                </div>
              </div>
              <button className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Events;