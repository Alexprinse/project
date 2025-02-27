import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebaseConfig';
import Loading from '../components/Loading';  // Import the Loading component
import { Shield, UserPlus, Users, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const db = getFirestore();

interface User {
  id: string;
  requestOrganizer: boolean;
  role: string;
  name: string;
  email: string;
  idNo: string;
  branch: string;
}

const Admin: React.FC = () => {
  const [authUser] = useAuthState(auth);
  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<User[]>([]);
  const [organizers, setOrganizers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'requests' | 'organizers'>('requests');
  const [loading, setLoading] = useState(true);  // Add loading state

  useEffect(() => {
    const fetchUser = async () => {
      if (authUser) {
        const userDoc = await getDocs(collection(db, 'users'));
        const userData = userDoc.docs
          .map(doc => ({ ...doc.data(), id: doc.id } as User))
          .find((u: User) => u.email === authUser.email);
        setUser(userData || null);
      }
    };

    fetchUser();
  }, [authUser]);

  const fetchRequests = async () => {
    setLoading(true);  // Set loading to true
    const querySnapshot = await getDocs(collection(db, 'users'));
    const requestsData = querySnapshot.docs
      .map(doc => ({ ...doc.data(), id: doc.id } as User))
      .filter((user: User) => user.requestOrganizer && user.role === 'general');
    setRequests(requestsData);
    setLoading(false);  // Set loading to false
  };

  const fetchOrganizers = async () => {
    setLoading(true);  // Set loading to true
    const querySnapshot = await getDocs(collection(db, 'users'));
    const organizersData = querySnapshot.docs
      .map(doc => ({ ...doc.data(), id: doc.id } as User))
      .filter((user: User) => user.role === 'organizer');
    setOrganizers(organizersData);
    setLoading(false);  // Set loading to false
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchRequests();
      fetchOrganizers();
    }
  }, [user]);

  const approveOrganizer = async (userId: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        role: 'organizer',
        requestOrganizer: false,
      });
      console.log(`User ${userId} approved as organizer`);

      // Update the state
      setRequests(requests.filter(request => request.id !== userId));
      fetchOrganizers();
    } catch (error) {
      console.error('Error approving organizer:', error);
    }
  };

  const denyOrganizerRequest = async (userId: string) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      requestOrganizer: false,
    });
    setRequests(requests.filter(request => request.id !== userId));
  };

  const revokeOrganizer = async (userId: string) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      role: 'general',
    });
    setOrganizers(organizers.filter(organizer => organizer.id !== userId));
  };

  if (!user || user.role !== 'admin') {
    return <div className="text-white">Access Denied</div>;
  }

  if (loading) {
    return <Loading />;  // Render Loading component when loading
  }

  return (
    <div className="min-h-screen p-6 bg-gray-900">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gray-800/50 rounded-2xl border border-gray-700/50">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
            <p className="text-gray-400 mt-1">Manage organizer requests and permissions</p>
          </div>
          <Shield className="h-12 w-12 text-blue-400" />
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 p-1 bg-gray-800/50 rounded-xl w-fit">
          <button
            className={`flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 ${
              activeTab === 'requests'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
            onClick={() => setActiveTab('requests')}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Requests {requests.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-white/20 rounded-full">
                {requests.length}
              </span>
            )}
          </button>
          <button
            className={`flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 ${
              activeTab === 'organizers'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
            onClick={() => setActiveTab('organizers')}
          >
            <Users className="h-4 w-4 mr-2" />
            Organizers {organizers.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-white/20 rounded-full">
                {organizers.length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'requests' && (
            <div className="space-y-6">
              {requests.length === 0 ? (
                <div className="text-center py-12 bg-gray-800/50 rounded-2xl border border-gray-700/50">
                  <UserPlus className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                  <p className="text-gray-400">No pending organizer requests</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {requests.map(request => (
                    <div key={request.id} 
                      className="group p-6 bg-gray-800/50 rounded-2xl border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                            {request.name}
                          </h3>
                          <p className="text-gray-400">{request.email}</p>
                        </div>
                        <span className="px-3 py-1 text-xs font-medium text-yellow-400 bg-yellow-400/10 rounded-full border border-yellow-400/20">
                          Pending
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="px-4 py-3 bg-gray-900/50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">ID Number</p>
                          <p className="text-sm text-gray-300">{request.idNo}</p>
                        </div>
                        <div className="px-4 py-3 bg-gray-900/50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Branch</p>
                          <p className="text-sm text-gray-300">{request.branch}</p>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => approveOrganizer(request.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => denyOrganizerRequest(request.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                        >
                          <XCircle className="h-4 w-4" />
                          Deny
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'organizers' && (
            <div className="space-y-6">
              {organizers.length === 0 ? (
                <div className="text-center py-12 bg-gray-800/50 rounded-2xl border border-gray-700/50">
                  <Users className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                  <p className="text-gray-400">No organizers found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {organizers.map(organizer => (
                    <div key={organizer.id} 
                      className="group p-6 bg-gray-800/50 rounded-2xl border border-gray-700/50 hover:border-red-500/50 transition-all duration-300">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white group-hover:text-red-400 transition-colors">
                            {organizer.name}
                          </h3>
                          <p className="text-gray-400">{organizer.email}</p>
                        </div>
                        <span className="px-3 py-1 text-xs font-medium text-green-400 bg-green-400/10 rounded-full border border-green-400/20">
                          Active
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="px-4 py-3 bg-gray-900/50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">ID Number</p>
                          <p className="text-sm text-gray-300">{organizer.idNo}</p>
                        </div>
                        <div className="px-4 py-3 bg-gray-900/50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Branch</p>
                          <p className="text-sm text-gray-300">{organizer.branch}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => revokeOrganizer(organizer.id)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                      >
                        <AlertTriangle className="h-4 w-4" />
                        Revoke Access
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;