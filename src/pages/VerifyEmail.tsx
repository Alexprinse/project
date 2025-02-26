import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Mail } from 'react-feather';
import { auth } from '../firebaseConfig';
import { useAuthState } from 'react-firebase-hooks/auth';
import { User } from 'firebase/auth';
import { sendEmailVerification as sendVerificationEmail } from 'firebase/auth';

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

  const sendEmailVerification = async (user: User) => {
    try {
      await sendVerificationEmail(user);
      setError('');
    } catch (err) {
      setError('Failed to send verification email. Please try again later.');
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
            Verify Email
          </h1>
          <p className="text-gray-400 mt-2">Please verify your email to continue</p>
        </div>

        {/* Form Card */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-700/50">
          {error && (
            <div className="mb-6 flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-3 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <div className="flex items-start space-x-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Mail className="h-6 w-6 text-blue-400 mt-1" />
              <div>
                <h3 className="text-white font-medium">Verification Email Sent</h3>
                <p className="text-gray-400 text-sm mt-1">
                  We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
                </p>
              </div>
            </div>

            <button
              onClick={handleVerify}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              I've verified my email
            </button>

            <div className="text-center text-gray-400 text-sm">
              Didn't receive the email?{' '}
              <button
                onClick={() => user && sendEmailVerification(user)}
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Resend verification email
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;