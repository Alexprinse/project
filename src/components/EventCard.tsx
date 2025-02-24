import React from 'react';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';
import type { Events } from '../lib/supabase';

interface EventCardProps {
  event: Events;
  onRegister: (eventId: string) => void;
}

export function EventCard({ event, onRegister }: EventCardProps) {
  const availableSpots = event.capacity - (event.registered_count || 0);

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      {event.image_url && (
        <img
          src={event.image_url}
          alt={event.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">{event.title}</h3>
          <span className={`text-sm px-2 py-1 rounded ${
            event.status === 'published' ? 'bg-green-500/10 text-green-400' : 
            event.status === 'draft' ? 'bg-yellow-500/10 text-yellow-400' : 
            'bg-red-500/10 text-red-400'
          }`}>
            {event.status}
          </span>
        </div>
        
        <div className="space-y-2 text-gray-400 mb-4">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{format(new Date(event.start_time), 'MMMM d, yyyy')}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            <span>{format(new Date(event.start_time), 'h:mm a')} - {format(new Date(event.end_time), 'h:mm a')}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            <span>{availableSpots} spots available</span>
          </div>
        </div>

        {event.description && (
          <p className="text-gray-400 mb-4 line-clamp-2">{event.description}</p>
        )}

        <button
          onClick={() => onRegister(event.id)}
          disabled={availableSpots <= 0}
          className={`w-full py-2 px-4 rounded-lg transition-colors ${
            availableSpots > 0
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          {availableSpots > 0 ? 'Register Now' : 'Join Waitlist'}
        </button>
      </div>
    </div>
  );
}