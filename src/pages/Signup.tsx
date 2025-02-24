import React, { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigate, Link } from 'react-router-dom';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const db = getFirestore();

function Signup() {
  const [name, setName] = useState('');
  const [idNo, setIdNo] = useState('');
  const [email, setEmail] = useState('');
  const [branch, setBranch] = useState('');
  const [password, setPassword] = useState('');
  const [requestOrganizer, setRequestOrganizer] = useState(false); // Request to become an organizer
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, 'users', user.uid), {
        name,
        idNo,
        email,
        branch,
        role: 'general', // Default role is general
        requestOrganizer, // Store the request to become an organizer
        eventsRegistered: 0,
        upcomingEvents: 0,
        completedEvents: 0,
      });
      await sendEmailVerification(user);
      navigate('/verify-email');
    } catch (err) {
      console.error('Error during signup:', err); // Log the error for debugging
      setError('Failed to sign up');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <form onSubmit={handleSignup} className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-4">Sign Up</h2>
        {error && <p className="text-red-500">{error}</p>}
        <div className="mb-4">
          <label className="block text-gray-400">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-400">ID No</label>
          <input
            type="text"
            value={idNo}
            onChange={(e) => setIdNo(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-400">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-400">Branch</label>
          <input
            type="text"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-400">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-400">Request to become an organizer</label>
          <input
            type="checkbox"
            checked={requestOrganizer}
            onChange={(e) => setRequestOrganizer(e.target.checked)}
            className="rounded bg-gray-700 text-white"
          />
        </div>
        <button type="submit" className="w-full p-2 bg-blue-500 rounded text-white">Sign Up</button>
        <div className="mt-4 text-gray-400">
          Already have an account? <Link to="/login" className="text-blue-400">Login</Link>
        </div>
      </form>
    </div>
  );
}

export default Signup;