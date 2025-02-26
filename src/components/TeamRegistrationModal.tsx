import React, { useState } from 'react';
import { X, Plus, Trash2, AlertCircle } from 'lucide-react';

interface TeamMember {
  name: string;
  email: string;
  idNumber: string;
  branch: string;
}

interface TeamRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (members: TeamMember[]) => void;
  minMembers: number;
  maxMembers: number;
}

const TeamRegistrationModal: React.FC<TeamRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  minMembers,
  maxMembers,
}) => {
  const [members, setMembers] = useState<TeamMember[]>([
    { name: '', email: '', idNumber: '', branch: '' },
  ]);
  const [error, setError] = useState('');

  const handleAddMember = () => {
    if (members.length < maxMembers) {
      setMembers([...members, { name: '', email: '', idNumber: '', branch: '' }]);
    }
  };

  const handleRemoveMember = (index: number) => {
    if (members.length > minMembers) {
      setMembers(members.filter((_, i) => i !== index));
    }
  };

  const handleMemberChange = (index: number, field: keyof TeamMember, value: string) => {
    const newMembers = [...members];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setMembers(newMembers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    const isValid = members.every(member => 
      member.name && 
      member.email && 
      member.email.endsWith('@rguktong.ac.in') && 
      member.idNumber.match(/^O\d{6}$/) &&
      member.branch
    );

    if (!isValid) {
      setError('Please fill all fields correctly for each member');
      return;
    }

    onSubmit(members);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800/90 rounded-xl border border-gray-700/50 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Team Registration</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-4 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          )}

          {members.map((member, index) => (
            <div key={index} className="p-4 bg-gray-900/50 rounded-lg space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium text-white">
                  {index === 0 ? 'Team Leader' : `Member ${index + 1}`}
                </h3>
                {index !== 0 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Name</label>
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                    className="w-full bg-gray-700/50 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-1">Email</label>
                  <input
                    type="email"
                    value={member.email}
                    onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                    className="w-full bg-gray-700/50 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    pattern="[a-z0-9._%+-]+@rguktong\.ac\.in$"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-1">ID Number</label>
                  <input
                    type="text"
                    value={member.idNumber}
                    onChange={(e) => handleMemberChange(index, 'idNumber', e.target.value.toUpperCase())}
                    className="w-full bg-gray-700/50 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    pattern="O[0-9]{6}"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-1">Branch</label>
                  <select
                    value={member.branch}
                    onChange={(e) => handleMemberChange(index, 'branch', e.target.value)}
                    className="w-full bg-gray-700/50 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    required
                  >
                    <option value="">Select Branch</option>
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="CIVIL">CIVIL</option>
                    <option value="MECH">MECH</option>
                  </select>
                </div>
              </div>
            </div>
          ))}

          {members.length < maxMembers && (
            <button
              type="button"
              onClick={handleAddMember}
              className="w-full py-3 flex items-center justify-center gap-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Team Member
            </button>
          )}

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-700/50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Register Team
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamRegistrationModal;