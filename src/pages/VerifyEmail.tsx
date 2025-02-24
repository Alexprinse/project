import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebaseConfig';
import { useAuthState } from 'react-firebase-hooks/auth';

function VerifyEmail() {
  const [user] = useAuthState(auth);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleVerify = async () => {
    if (user) {
      await user.reload();
      if (user.emailVerified) {
        navigate('/');
      } else {
        setError('Email not verified. Please check your inbox.');
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-4">Verify Email</h2>
        {error && <p className="text-red-500">{error}</p>}
        <p className="text-gray-400 mb-4">A verification email has been sent to your email address. Please check your inbox and click on the verification link.</p>
        <button onClick={handleVerify} className="w-full p-2 bg-blue-500 rounded text-white">I have verified my email</button>
      </div>
    </div>
  );
}

export default VerifyEmail;