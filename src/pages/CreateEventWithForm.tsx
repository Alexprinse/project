import React, { useState } from 'react';
import { MapPin, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { auth } from '../firebaseConfig';

const db = getFirestore();

function CreateEventWithForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState(null); // Combined date and time state
  const [location, setLocation] = useState('');
  const [eventImage, setEventImage] = useState(null);
  const [category, setCategory] = useState('');
  const [registrationType, setRegistrationType] = useState('oneClick');
  const [formSections, setFormSections] = useState([{ id: Date.now(), fields: [{ id: Date.now(), type: 'text', label: '' }] }]);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (user) {
        await addDoc(collection(db, 'events'), {
          title,
          description,
          dateTime,  // Store combined date and time
          location,
          eventImage: eventImage ? URL.createObjectURL(eventImage) : '',
          category,
          registrationType,
          formSections,
          organizerId: user.uid, // Add organizerId
        });
        alert('Event created successfully.');
        navigate('/events');
      }
    } catch (err) {
      console.error('Error creating event:', err);
      alert('Failed to create the event. Please try again.');
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setEventImage(e.target.files[0]);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Create New Event</h1>
        <p className="text-gray-400 mt-2">Fill in the details below to create a new event.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 space-y-6">
        <div>
          <label className="block text-white mb-2">Event Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter event title"
            required
          />
        </div>

        <div>
          <label className="block text-white mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 h-32"
            placeholder="Enter event description"
            required
          ></textarea>
        </div>

        <div>
          <label className="block text-white mb-2">Date and Time</label>
          <DatePicker
            selected={dateTime}
            onChange={setDateTime}
            showTimeSelect
            dateFormat="MMMM d, yyyy h:mm aa"
            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholderText="Select event date and time"
            required
          />
        </div>

        <div>
          <label className="block text-white mb-2">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter event location"
            required
          />
          <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        <div>
          <label className="block text-white mb-2">Event Image</label>
          <input
            type="file"
            onChange={handleImageChange}
            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-white mb-2">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          >
            <option value="">Select category</option>
            <option value="Technology">Technology</option>
            <option value="Games">Games</option>
            <option value="Career">Career</option>
            <option value="Health">Health</option>
            <option value="Education">Education</option>
            <option value="Entertainment">Entertainment</option>
          </select>
        </div>

        <div>
          <label className="block text-white mb-2">Registration Type</label>
          <div className="flex items-center space-x-4">
            <div>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio h-5 w-5 text-blue-500"
                  value="oneClick"
                  checked={registrationType === 'oneClick'}
                  onChange={(e) => setRegistrationType(e.target.value)}
                />
                <span className="ml-2 text-white">One-Click Registration</span>
              </label>
            </div>
            <div>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio h-5 w-5 text-blue-500"
                  value="form"
                  checked={registrationType === 'form'}
                  onChange={(e) => setRegistrationType(e.target.value)}
                />
                <span className="ml-2 text-white">Form</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            onClick={() => navigate('/events')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Create Event
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateEventWithForm;
