import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

interface Event {
  title: string;
  dateTime: { seconds: number };
  location: string;
  description: string;
}

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string | null;
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({ isOpen, onClose, eventId }) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (eventId) {
        const eventDoc = await getDoc(doc(db, 'events', eventId));
        if (eventDoc.exists()) {
          setEvent(eventDoc.data() as Event);
        }
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchEventDetails();
    }
  }, [isOpen, eventId]);

  if (!isOpen || loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-2xl">
        {event ? (
          <>
            <h2 className="text-2xl font-bold text-white mb-4">{event.title}</h2>
            <p className="text-gray-400 mb-2">
              <strong>Date:</strong> {format(new Date(event.dateTime.seconds * 1000), 'MMMM d, yyyy h:mm aa')}
            </p>
            <p className="text-gray-400 mb-2">
              <strong>Location:</strong> {event.location}
            </p>
            <p className="text-gray-400 mb-4">
              <strong>Description:</strong> {event.description}
            </p>
            <button
              onClick={onClose}
              className="mt-4 w-full py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Close
            </button>
          </>
        ) : (
          <p className="text-gray-400">Event details not available.</p>
        )}
      </div>
    </div>
  );
};

export default EventDetailsModal;