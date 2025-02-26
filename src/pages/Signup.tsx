import React, { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification, fetchSignInMethodsForEmail } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { AlertCircle, Mail, Info, CheckCircle, XCircle, Lock } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const db = getFirestore();

const isValidOrganizationEmail = (email: string): boolean => {
  return email.endsWith('@rguktong.ac.in');
};

const isValidIdNumber = (idNo: string): boolean => {
  const idPattern = /^O\d{6}$/;
  return idPattern.test(idNo);
};

function Signup() {
  const [name, setName] = useState('');
  const [idNo, setIdNo] = useState('');
  const [email, setEmail] = useState('');
  const [branch, setBranch] = useState('');
  const [password, setPassword] = useState('');
  const [requestOrganizer, setRequestOrganizer] = useState(false); // Request to become an organizer
  const [error, setError] = useState('');
  const [idNoError, setIdNoError] = useState('');
  const [passwordChecklist, setPasswordChecklist] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false
  });
  const [showPasswordChecklist, setShowPasswordChecklist] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIdNoError('');

    // Check password requirements
    if (!Object.values(passwordChecklist).every(Boolean)) {
      setError('Please meet all password requirements');
      return;
    }

    if (!isValidIdNumber(idNo)) {
      setIdNoError('ID Number must be in format: OXXXXXX');
      return;
    }

    // Check email domain
    if (!isValidOrganizationEmail(email)) {
      setError('Please use your organization email (@rguktong.ac.in)');
      return;
    }

    try {
      // Check if user exists
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length > 0) {
        setError('An account with this email already exists. Please sign in.');
        return;
      }

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
    } catch (err: any) {
      console.error('Error during signup:', err); // Log the error for debugging
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please sign in.');
      } else {
        setError('Failed to sign up. Please try again.');
      }
    }
  };

  const validatePassword = (value: string) => {
    setPasswordChecklist({
      length: value.length >= 8,
      uppercase: /[A-Z]/.test(value),
      number: /[0-9]/.test(value),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(value)
    });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // If user types @, autocomplete the domain
    if (value.endsWith('@')) {
      value = value + 'rguktong.ac.in';
    }
    
    setEmail(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
            Create Account
          </h1>
          <p className="text-gray-400 mt-2">Sign up to start managing campus events</p>
        </div>

        {/* Form Card */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-700/50">
          {error && (
            <div className="mb-6 flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-3 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-700/50 text-white px-4 py-2.5 rounded-lg border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">ID Number</label>
              <div className="relative">
                <input
                  type="text"
                  value={idNo}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    setIdNo(value);
                    if (value && !isValidIdNumber(value)) {
                      setIdNoError('ID Number must be in format: OXXXXXX');
                    } else {
                      setIdNoError('');
                    }
                  }}
                  placeholder="OXXXXXX"
                  className={`w-full bg-gray-700/50 text-white px-4 py-2.5 rounded-lg border ${
                    idNoError ? 'border-red-500/50' : 'border-gray-600/50'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent`}
                  required
                />
              </div>
              {idNoError && (
                <div className="mt-2 flex items-center gap-2 text-red-400 text-sm">
                  <Info className="h-4 w-4" />
                  <span>{idNoError}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-700/50 text-white rounded-lg border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                  placeholder="youremail@rguktong.ac.in"
                  required
                />
              </div>
              {email && !isValidOrganizationEmail(email) && (
                <div className="mt-2 flex items-center gap-2 text-yellow-400 text-sm">
                  <Info className="h-4 w-4" />
                  <span>Use your organization email (@rguktong.ac.in)</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Branch</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full bg-gray-700/50 text-white px-4 py-2.5 rounded-lg border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                required
              >
                <option value="">Select Branch</option>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="EEE">CIVIL</option>
                <option value="EEE">MECH</option>

              </select>
            </div>

            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    validatePassword(e.target.value);
                  }}
                  onFocus={() => setShowPasswordChecklist(true)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-700/50 text-white rounded-lg border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                  required
                />
              </div>
              
              {showPasswordChecklist && (
                <div className="mt-3 p-3 bg-gray-700/30 rounded-lg space-y-2">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Password must contain:</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      {passwordChecklist.length ? (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-500" />
                      )}
                      <span className={passwordChecklist.length ? "text-green-400" : "text-gray-400"}>
                        At least 8 characters
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {passwordChecklist.uppercase ? (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-500" />
                      )}
                      <span className={passwordChecklist.uppercase ? "text-green-400" : "text-gray-400"}>
                        One uppercase letter
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {passwordChecklist.number ? (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-500" />
                      )}
                      <span className={passwordChecklist.number ? "text-green-400" : "text-gray-400"}>
                        One number
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {passwordChecklist.special ? (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-500" />
                      )}
                      <span className={passwordChecklist.special ? "text-green-400" : "text-gray-400"}>
                        One special character
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={requestOrganizer}
                onChange={(e) => setRequestOrganizer(e.target.checked)}
                className="rounded bg-gray-700/50 text-blue-500 focus:ring-blue-500/50 focus:ring-offset-gray-800"
              />
              <label className="text-gray-400 text-sm">Request to become an organizer</label>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              Create Account
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;