import React, { useState } from 'react';
import { MapPin, Trash, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { auth } from '../firebaseConfig';

const db = getFirestore();

function CreateEventWithForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState<Date | null>(null); // Combined date and time state
  const [location, setLocation] = useState('');
  const [eventImage, setEventImage] = useState<File | null>(null);
  const [category, setCategory] = useState('');
  const [registrationType, setRegistrationType] = useState('oneClick');
  const [googleFormLink, setGoogleFormLink] = useState('');
  const [formSections, setFormSections] = useState([{ id: Date.now(), fields: [{ id: Date.now(), type: 'text', label: '' }] }]);
  const [organizationType, setOrganizationType] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [minTeamSize, setMinTeamSize] = useState<number>(1);
  const [maxTeamSize, setMaxTeamSize] = useState<number>(2);
  const [isTeamEvent, setIsTeamEvent] = useState(false);
  const navigate = useNavigate();

  interface FormSection {
    id: number;
    fields: { id: number; type: string; label: string }[];
  }

  interface TeamConfig {
    minMembers: number;
    maxMembers: number;
    requiredRoles?: string[];
  }

  interface EventData {
    title: string;
    description: string;
    dateTime: Date | null;
    location: string;
    eventImage: string;
    category: string;
    registrationType: string;
    teamConfig?: TeamConfig;
    isTeamEvent: boolean;
    googleFormLink: string;
    formSections: FormSection[];
    organizerId: string;
    organizationType: string;
    organizer: string;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (user) {
        // Create the base event data
        const eventData: Omit<EventData, 'teamConfig'> = {
          title,
          description,
          dateTime,
          location,
          eventImage: eventImage ? URL.createObjectURL(eventImage) : '',
          category,
          registrationType,
          isTeamEvent,
          googleFormLink: registrationType === 'googleForm' ? googleFormLink : '',
          formSections,
          organizerId: user.uid,
          organizationType,
          organizer,
        };

        // Add teamConfig only if it's a team event
        const finalEventData = {
          ...eventData,
          ...(isTeamEvent && {
            teamConfig: {
              minMembers: minTeamSize,
              maxMembers: maxTeamSize,
            }
          })
        };

        await addDoc(collection(db, 'events'), finalEventData);
        alert('Event created successfully.');
        navigate('/events');
      }
    } catch (err) {
      console.error('Error creating event:', err);
      alert('Failed to create the event. Please try again.');
    }
  };

  interface ImageChangeEvent extends React.ChangeEvent<HTMLInputElement> {
    target: HTMLInputElement & EventTarget & { files: FileList | null };
  }

  const handleImageChange = (e: ImageChangeEvent) => {
    if (e.target.files && e.target.files[0]) {
      setEventImage(e.target.files[0]);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg text-white">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-700/50">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text">
            Create New Event
          </h1>
          <p className="text-sm text-gray-400 mt-1">Fill in the details below to create a new event.</p>
        </div>
        <button
          onClick={() => navigate('/events')}
          className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
        >
          <X className="h-5 w-5 text-gray-400 hover:text-white" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Event Title */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Event Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-gray-800/50 text-white px-4 py-2.5 rounded-lg border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent placeholder-gray-500"
            placeholder="Enter event title"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-gray-800/50 text-white px-4 py-2.5 rounded-lg border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent placeholder-gray-500 h-32 resize-none"
            placeholder="Enter event description"
            required
          />
        </div>

        {/* Date and Time */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Date and Time</label>
          <DatePicker
            selected={dateTime}
            onChange={(date) => setDateTime(date)}
            showTimeSelect
            dateFormat="MMMM d, yyyy h:mm aa"
            className="w-full bg-gray-800/50 text-white px-4 py-2.5 rounded-lg border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent placeholder-gray-500"
            placeholderText="Select event date and time"
            required
          />
        </div>

        {/* Location */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-gray-800/50 text-white pl-10 pr-4 py-2.5 rounded-lg border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent placeholder-gray-500"
              placeholder="Enter event location"
              required
            />
          </div>
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

        {/* Organization Type */}
        <div>
          <label className="block text-white mb-2">Organized By</label>
          <div className="flex items-center space-x-4 mb-4">
            <div>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio h-5 w-5 text-blue-500"
                  value="club"
                  checked={organizationType === 'club'}
                  onChange={(e) => setOrganizationType(e.target.value)}
                />
                <span className="ml-2 text-white">Club</span>
              </label>
            </div>
            <div>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio h-5 w-5 text-blue-500"
                  value="branch"
                  checked={organizationType === 'branch'}
                  onChange={(e) => setOrganizationType(e.target.value)}
                />
                <span className="ml-2 text-white">Branch</span>
              </label>
            </div>
          </div>

          {/* Club or Branch Selection */}
          {organizationType && (
            <div className="mt-2">
              <select
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              >
                <option value="">Select {organizationType}</option>
                {organizationType === 'club' ? (
                  <>
                    <option value="Techxcel">Techxcel</option>
                    <option value="Artix">Artix</option>
                    <option value="Pixel Pro">Pixel Pro</option>
                  </>
                ) : (
                  <>
                    <option value="ECE">ECE</option>
                    <option value="CSE">CSE</option>
                    <option value="EEE">EEE</option>
                  </>
                )}
              </select>
            </div>
          )}
        </div>

        {/* Registration Type */}
        <div>
          <label className="block text-white mb-2">Registration Type</label>
          <div className="flex items-center space-x-4 mb-4">
            <div>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio h-5 w-5 text-blue-500"
                  value="solo"
                  checked={!isTeamEvent}
                  onChange={() => setIsTeamEvent(false)}
                />
                <span className="ml-2 text-white">Solo Registration</span>
              </label>
            </div>
            <div>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio h-5 w-5 text-blue-500"
                  value="team"
                  checked={isTeamEvent}
                  onChange={() => setIsTeamEvent(true)}
                />
                <span className="ml-2 text-white">Team Registration</span>
              </label>
            </div>
          </div>

          {/* Team Configuration */}
          {isTeamEvent && (
            <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 space-y-4">
              <h3 className="text-lg font-medium text-gray-300">Team Configuration</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Minimum Team Size
                  </label>
                  <select
                    value={minTeamSize}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setMinTeamSize(value);
                      if (value > maxTeamSize) {
                        setMaxTeamSize(value);
                      }
                    }}
                    className="w-full bg-gray-800/50 text-white px-4 py-2.5 rounded-lg border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value={1}>1 Members</option>
                    <option value={2}>2 Members</option>
                    <option value={3}>3 Members</option>
                    <option value={4}>4 Members</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Maximum Team Size
                  </label>
                  <select
                    value={maxTeamSize}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setMaxTeamSize(value);
                      if (value < minTeamSize) {
                        setMinTeamSize(value);
                      }
                    }}
                    className="w-full bg-gray-800/50 text-white px-4 py-2.5 rounded-lg border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value={2}>2 Members</option>
                    <option value={3}>3 Members</option>
                    <option value={4}>4 Members</option>
                    <option value={5}>5 Members</option>
                  </select>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-400 mb-2">Team Requirements:</h4>
                <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                  <li>Teams must have {minTeamSize === maxTeamSize ? 
                    `${minTeamSize} members` : 
                    `${minTeamSize}-${maxTeamSize} members`}
                  </li>
                  <li>One member must be designated as team leader</li>
                  <li>All team members must provide their details</li>
                  <li>Each member must verify their email</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Registration Method Selection */}
        <div>
          <label className="block text-white mb-2">Registration Method</label>
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
            <div>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio h-5 w-5 text-blue-500"
                  value="googleForm"
                  checked={registrationType === 'googleForm'}
                  onChange={(e) => setRegistrationType(e.target.value)}
                />
                <span className="ml-2 text-white">Google Form</span>
              </label>
            </div>
          </div>
        </div>

        {registrationType === 'googleForm' && (
          <div>
            <label className="block text-white mb-2">Google Form Link</label>
            <input
              type="url"
              value={googleFormLink}
              onChange={(e) => setGoogleFormLink(e.target.value)}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter Google Form link"
              required
            />
          </div>
        )}



        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700/50">
          <button
            type="button"
            onClick={() => navigate('/events')}
            className="px-6 py-2.5 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors border border-gray-700/50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Create Event
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateEventWithForm;
