import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFirestore, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebaseConfig';

const db = getFirestore();

const RegisterEvent: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [authUser] = useAuthState(auth);
  const [event, setEvent] = useState<any>(null);
  const [responses, setResponses] = useState<any>({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      const docRef = doc(db, 'events', eventId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setEvent(docSnap.data());
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleResponseChange = (question: string, value: string) => {
    setResponses({ ...responses, [question]: value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authUser && event) {
      const userRef = doc(db, 'users', authUser.uid);
      await updateDoc(userRef, {
        upcomingEvents: arrayUnion({
          eventId,
          title: event.title,
          date: event.date,
          location: event.location,
          responses,
        }),
      });
      navigate('/profile');
    }
  };

  if (!event) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="p-6 bg-gray-900 rounded-lg shadow-lg text-white">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text animate-pulse">
        Register for {event.title}
      </h1>
      <form onSubmit={handleRegister}>
        {event.questions.map((question: any, index: number) => (
          <div key={index} className="mb-4">
            <label className="block text-gray-400">{question.label}</label>
            {question.type === 'text' && (
              <input
                type="text"
                onChange={(e) => handleResponseChange(question.label, e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white"
                required
              />
            )}
            {question.type === 'textarea' && (
              <textarea
                onChange={(e) => handleResponseChange(question.label, e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white"
                required
              />
            )}
            {question.type === 'number' && (
              <input
                type="number"
                onChange={(e) => handleResponseChange(question.label, e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white"
                required
              />
            )}
            {question.type === 'date' && (
              <input
                type="date"
                onChange={(e) => handleResponseChange(question.label, e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white"
                required
              />
            )}
            {question.type === 'time' && (
              <input
                type="time"
                onChange={(e) => handleResponseChange(question.label, e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white"
                required
              />
            )}
          </div>
        ))}
        <button type="submit" className="w-full p-2 bg-blue-500 rounded text-white">
          Register
        </button>
      </form>
    </div>
  );
};

export default RegisterEvent;