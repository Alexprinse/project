import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import { updatePassword } from 'firebase/auth';

interface PasswordEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PasswordEditModal: React.FC<PasswordEditModalProps> = ({ isOpen, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    try {
      const user = auth.currentUser;
      if (user) {
        await updatePassword(user, newPassword);
        setSuccess('Password updated successfully.');
        setError('');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      setError('Error updating password: ' + (error as any).message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-4">Change Password</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}
        <div className="space-y-4">
          <input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50"
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50"
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePasswordChange}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordEditModal;