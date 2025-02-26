import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

interface RequireEmailVerificationProps {
  children: React.ReactNode;
}

const RequireEmailVerification: React.FC<RequireEmailVerificationProps> = ({ children }) => {
  const [user, loading] = useAuthState(auth);
  const [checkingEmail, setCheckingEmail] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkEmailVerification = async () => {
      if (!loading && user) {
        // Reload user to get latest email verification status
        await user.reload();
        if (!user.emailVerified) {
          navigate('/verify-email');
        }
        setCheckingEmail(false);
      } else if (!loading && !user) {
        navigate('/login');
      }
    };

    checkEmailVerification();
  }, [user, loading, navigate]);

  if (loading || checkingEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700/50 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500/50 border-t-blue-500 rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Verifying your email status...</p>
        </div>
      </div>
    );
  }

  if (!user?.emailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
        <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700/50 max-w-md w-full">
          <div className="flex items-center justify-center text-amber-500 mb-4">
            <AlertCircle className="h-12 w-12" />
          </div>
          <h2 className="text-2xl font-bold text-white text-center mb-4">
            Email Verification Required
          </h2>
          <p className="text-gray-400 text-center mb-6">
            Please verify your email address before accessing this page. Check your inbox for a verification link.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate('/verify-email')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Go to Verification Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RequireEmailVerification;