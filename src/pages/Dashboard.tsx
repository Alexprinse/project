import React from 'react';
import { Calendar, Users, TrendingUp, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

function Dashboard() {
  const upcomingEvents = [
    {
      id: 1,
      title: 'Tech Conference 2024',
      date: new Date(2024, 3, 15),
      attendees: 120,
      location: 'Main Auditorium'
    },
    {
      id: 2,
      title: 'Career Fair',
      date: new Date(2024, 3, 20),
      attendees: 250,
      location: 'Student Center'
    }
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h1>
        <Link
          to="/create-event"
          className="w-full sm:w-auto bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-center"
        >
          Create Event
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div className="bg-gray-800 p-4 md:p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 mb-1">Total Events</p>
              <p className="text-xl md:text-2xl font-bold text-white">24</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-gray-800 p-4 md:p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 mb-1">Total Attendees</p>
              <p className="text-xl md:text-2xl font-bold text-white">1,234</p>
            </div>
            <Users className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-gray-800 p-4 md:p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 mb-1">Engagement Rate</p>
              <p className="text-xl md:text-2xl font-bold text-white">85%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-gray-800 p-4 md:p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 mb-1">Upcoming Events</p>
              <p className="text-xl md:text-2xl font-bold text-white">8</p>
            </div>
            <Clock className="h-8 w-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-gray-800 rounded-lg p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold text-white mb-4">Upcoming Events</h2>
        <div className="space-y-4">
          {upcomingEvents.map(event => (
            <div key={event.id} className="bg-gray-700 p-4 rounded-lg">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{event.title}</h3>
                  <p className="text-gray-400">{format(event.date, 'MMMM d, yyyy')}</p>
                  <p className="text-gray-400">{event.location}</p>
                </div>
                <div className="w-full sm:w-auto text-left sm:text-right">
                  <div className="flex items-center space-x-2 text-gray-400 justify-start sm:justify-end">
                    <Users className="h-4 w-4" />
                    <span>{event.attendees} attendees</span>
                  </div>
                  <button className="mt-2 text-blue-400 hover:text-blue-300 transition-colors w-full sm:w-auto">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;