import React, { useState } from 'react';
import { MapPin, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function CreateEventWithForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<Date | null>(null);
  const [location, setLocation] = useState('');
  const [eventImage, setEventImage] = useState<File | null>(null);
  const [registrationType, setRegistrationType] = useState('oneClick'); // Default to oneClick
  const [formSections, setFormSections] = useState([{ id: Date.now(), fields: [{ id: Date.now(), type: 'text', label: '' }] }]);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log({
      title,
      description,
      date,
      time,
      location,
      eventImage,
      registrationType,
      formSections,
    });
    // Navigate to another page or show a success message
    navigate('/events');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEventImage(e.target.files[0]);
    }
  };

  const addSection = () => {
    setFormSections([...formSections, { id: Date.now(), fields: [{ id: Date.now(), type: 'text', label: '' }] }]);
  };

  const removeSection = (sectionId: number) => {
    setFormSections(formSections.filter((section) => section.id !== sectionId));
  };

  const addField = (sectionId: number) => {
    setFormSections(
      formSections.map((section) => {
        if (section.id === sectionId) {
          return { ...section, fields: [...section.fields, { id: Date.now(), type: 'text', label: '' }] };
        }
        return section;
      })
    );
  };

  const removeField = (sectionId: number, fieldId: number) => {
    setFormSections(
      formSections.map((section) => {
        if (section.id === sectionId) {
          return { ...section, fields: section.fields.filter((field) => field.id !== fieldId) };
        }
        return section;
      })
    );
  };

  const handleFieldChange = (sectionId: number, fieldId: number, key: string, value: string) => {
    setFormSections(
      formSections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            fields: section.fields.map((field) => {
              if (field.id === fieldId) {
                return { ...field, [key]: value };
              }
              return field;
            }),
          };
        }
        return section;
      })
    );
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-white mb-2">Date</label>
            <div className="relative">
              <DatePicker
                selected={date}
                onChange={(date) => setDate(date)}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholderText="Select event date"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-white mb-2">Time</label>
            <div className="relative">
              <DatePicker
                selected={time}
                onChange={(time) => setTime(time)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="Time"
                dateFormat="h:mm aa"
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholderText="Select event time"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-white mb-2">Location</label>
          <div className="relative">
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

        {registrationType === 'form' && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-4">Registration Form</h2>
            {formSections.map((section, sectionIndex) => (
              <div key={section.id} className="bg-gray-700 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl text-white">Section {sectionIndex + 1}</h3>
                  <button
                    type="button"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => removeSection(section.id)}
                  >
                    <Trash className="h-5 w-5" />
                  </button>
                </div>
                {section.fields.map((field, fieldIndex) => (
                  <div key={field.id} className="mb-4">
                    <div className="flex items-center mb-2">
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => handleFieldChange(section.id, field.id, 'label', e.target.value)}
                        className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder={`Field ${fieldIndex + 1} Label`}
                      />
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700 ml-2"
                        onClick={() => removeField(section.id, field.id)}
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                    </div>
                    <select
                      value={field.type}
                      onChange={(e) => handleFieldChange(section.id, field.id, 'type', e.target.value)}
                      className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="text">Text</option>
                      <option value="textarea">Textarea</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                      <option value="time">Time</option>
                    </select>
                  </div>
                ))}
                <button
                  type="button"
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  onClick={() => addField(section.id)}
                >
                  Add Field
                </button>
              </div>
            ))}
            <button
              type="button"
              className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              onClick={addSection}
            >
              Add Section
            </button>
          </div>
        )}

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