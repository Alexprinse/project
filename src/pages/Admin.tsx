import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebaseConfig';
import Loading from '../components/Loading';  // Import the Loading component

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

  useEffect(() => {
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

    if (user && user.role === 'admin') {
      fetchRequests();
      fetchOrganizers();
    }
  }, [user]);

  const approveOrganizer = async (userId: string) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      role: 'organizer',
      requestOrganizer: false,
    });
    setRequests(requests.filter(request => request.id !== userId));
    fetchOrganizers();
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
    <div className="p-6 bg-gray-900 rounded-lg shadow-lg text-white">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text animate-pulse">
        Admin Panel
      </h1>
      <div className="flex justify-center mb-4">
        <button
          className={`p-2 mx-2 ${activeTab === 'requests' ? 'bg-blue-500' : 'bg-gray-700'} rounded text-white`}
          onClick={() => setActiveTab('requests')}
        >
          New Requests
        </button>
        <button
          className={`p-2 mx-2 ${activeTab === 'organizers' ? 'bg-blue-500' : 'bg-gray-700'} rounded text-white`}
          onClick={() => setActiveTab('organizers')}
        >
          Organizers
        </button>
      </div>
      {activeTab === 'requests' && (
        <>
          <h2 className="text-2xl font-bold mb-4">Organizer Requests</h2>
          {requests.length === 0 ? (
            <p>No requests</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requests.map(request => (
                <div key={request.id} className="bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                  <p className="text-lg font-semibold mb-2">Name: {request.name}</p>
                  <p className="text-lg mb-2">Email: {request.email}</p>
                  <p className="text-lg mb-2">ID No: {request.idNo}</p>
                  <p className="text-lg mb-2">Branch: {request.branch}</p>
                  <div className="flex justify-between mt-4">
                    <button
                      onClick={() => approveOrganizer(request.id)}
                      className="p-2 bg-blue-500 rounded text-white hover:bg-blue-600 transition-colors duration-300"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => denyOrganizerRequest(request.id)}
                      className="p-2 bg-red-500 rounded text-white hover:bg-red-600 transition-colors duration-300"
                    >
                      Deny
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      {activeTab === 'organizers' && (
        <>
          <h2 className="text-2xl font-bold mb-4">Current Organizers</h2>
          {organizers.length === 0 ? (
            <p>No organizers</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {organizers.map(organizer => (
                <div key={organizer.id} className="bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                  <p className="text-lg font-semibold mb-2">Name: {organizer.name}</p>
                  <p className="text-lg mb-2">Email: {organizer.email}</p>
                  <p className="text-lg mb-2">ID No: {organizer.idNo}</p>
                  <p className="text-lg mb-2">Branch: {organizer.branch}</p>
                  <button
                    onClick={() => revokeOrganizer(organizer.id)}
                    className="mt-4 p-2 bg-red-500 rounded text-white hover:bg-red-600 transition-colors duration-300"
                  >
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Admin;