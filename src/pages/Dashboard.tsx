import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, ClipboardList, LogOut, Menu, User, X, UserCog, Key } from 'lucide-react';
import toast from 'react-hot-toast';
import DecryptedText from '../components/DecryptedText';
import RotatingText from '../components/RotatingText';

interface Room {
  _id: string;
  number: string;
  type: string;
  floor?: number;
}

const Dashboard = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  // "newRoom" is the room we're about to add:
  const [newRoom, setNewRoom] = useState({ number: '', type: 'Standard' });

  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [userId, setUserId] = useState('');
  // <-- Track if the "Other" room already exists:
  const [hasOtherRoom, setHasOtherRoom] = useState(false);

  // Add new state for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);

  useEffect(() => {
    // Get username from localStorage
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setUsername(userData.username || 'Admin');
      setIsAdmin(userData.role === 'admin');
      setUserId(userData._id);
    }

    // Fetch rooms data
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rooms`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setRooms(data);

        // Check if an "OTHER" room is already in the list
        const alreadyHasOther = data.some((room: Room) => room.number === 'OTHER');
        setHasOtherRoom(alreadyHasOther);
      } else {
        toast.error('Failed to fetch rooms');
      }
    } catch (error) {
      toast.error('Failed to fetch rooms');
    }
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    // If user chose "Other" from dropdown, force number = "OTHER"
    if (newRoom.type === 'Other') {
      newRoom.number = 'OTHER';
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newRoom)
      });

      if (response.ok) {
        const data = await response.json();
        setRooms([...rooms, data]);
        setShowAddModal(false);
        setNewRoom({ number: '', type: 'Standard' });
        toast.success('Room added successfully');

        // If we just created the "OTHER" room, set `hasOtherRoom = true`
        if (data.number === 'OTHER') {
          setHasOtherRoom(true);
        }
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to add room');
      }
    } catch (error) {
      toast.error('Failed to add room');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleDeleteRoom = (room: Room) => {
    setRoomToDelete(room);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!roomToDelete) return;
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/rooms/${roomToDelete._id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      if (response.ok) {
        setRooms(rooms.filter(r => r._id !== roomToDelete._id));
        toast.success('Room deleted successfully');
        setShowDeleteModal(false);
      } else {
        toast.error('Failed to delete room');
      }
    } catch (error) {
      toast.error('Failed to delete room');
    }
  };

  const handlePasswordChange = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${userId}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ password: newPassword })
      });

      if (response.ok) {
        toast.success('Password updated successfully');
        setShowPasswordModal(false);
        setNewPassword('');
      } else {
        toast.error('Failed to update password');
      }
    } catch (error) {
      toast.error('Failed to update password');
    }
  };

  // Group rooms by floor (0 => Ground, etc.)
  const groupedRooms = rooms.reduce<Record<string, Room[]>>((acc, room) => {
    const floor = Math.floor(parseInt(room.number) / 100) || 0; // if "OTHER" => NaN => 0
    const floorName = floor === 0 ? 'Ground Floor' : `Floor ${floor}`;
    if (!acc[floorName]) {
      acc[floorName] = [];
    }
    acc[floorName].push(room);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row py-4 sm:py-0 gap-4 sm:gap-0">
            {/* Mobile: Two-line layout with menu on right */}
            <div className="flex items-center justify-between w-full sm:hidden">
              <div className="flex items-center gap-3">
                <img 
                  src="/images/logo.jpeg" 
                  alt="Hotel Logo" 
                  className="h-8 w-8 object-contain rounded-lg"
                />
                <div className="flex flex-col">
                  <DecryptedText
                    text="Best Western News"
                    animateOn="view"
                    revealDirection="start"
                    sequential
                    speed={60}
                    maxIterations={10}
                    useOriginalCharsOnly
                    className="text-lg font-semibold text-gray-900"
                  />
                  <DecryptedText
                    text="Inn & Suites"
                    animateOn="view"
                    revealDirection="start"
                    sequential
                    speed={60}
                    maxIterations={10}
                    useOriginalCharsOnly
                    className="text-base font-medium text-gray-700"
                  />
                </div>
              </div>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-[#013c80]"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

            {/* Desktop: Original layout */}
            <div className="hidden sm:flex items-center justify-center sm:justify-start">
              <img 
                src="/images/logo.jpeg" 
                alt="Hotel Logo" 
                className="h-12 w-auto object-contain rounded-xl"
              />
              <h1 className="ml-3 text-xl font-semibold text-gray-900">
                <DecryptedText
                  text="Best Western News Inn & Suites"
                  animateOn="view"
                  revealDirection="start"
                  sequential
                  speed={60}
                  maxIterations={10}
                  useOriginalCharsOnly
                  className="text-gray-900 font-semibold"
                />
              </h1>
            </div>
            
            {/* Desktop menu with updated styling */}
            <div className="hidden sm:flex sm:items-center sm:ml-auto sm:space-x-4">
              <div className="flex items-center space-x-2 text-[#013c80]">
                <User className="h-5 w-5" />
                <span>{username}</span>
                {isAdmin && (
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="p-1 hover:bg-gray-100 rounded-full text-[#013c80]"
                    title="Change Password"
                  >
                    <Key className="h-4 w-4" />
                  </button>
                )}
              </div>
              {isAdmin && (
                <>
                  <button
                    onClick={() => navigate('/users')}
                    className="flex items-center gap-2 px-4 py-2 text-[#013c80] hover:bg-gray-100 rounded-md"
                  >
                    <UserCog className="h-5 w-5" />
                    User Management
                  </button>
                  <button
                    onClick={() => navigate('/logbook')}
                    className="flex items-center gap-2 px-4 py-2 text-[#013c80] hover:bg-gray-100 rounded-md"
                  >
                    <ClipboardList className="h-5 w-5" />
                    Log Book
                  </button>
                </>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm text-[#013c80] hover:text-[#012b5c]"
              >
                <LogOut className="h-5 w-5 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu with updated styling */}
        {isMenuOpen && (
          <div className="sm:hidden bg-white border-t">
            <div className="px-4 pt-2 pb-3 space-y-1">
              <div className="flex items-center py-2 text-[#013c80]">
                <User className="h-5 w-5 mr-2" />
                <span>{username}</span>
              </div>
              {isAdmin && (
                <>
                  <button
                    onClick={() => navigate('/users')}
                    className="flex items-center w-full px-3 py-2 text-[#013c80] hover:bg-gray-100 rounded-md"
                  >
                    <UserCog className="h-5 w-5 mr-2" />
                    User Management
                  </button>
                  <button
                    onClick={() => navigate('/logbook')}
                    className="flex items-center w-full px-3 py-2 text-[#013c80] hover:bg-gray-100 rounded-md"
                  >
                    <ClipboardList className="h-5 w-5 mr-2" />
                    Log Book
                  </button>
                </>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 text-[#013c80] hover:bg-gray-100 rounded-md"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile: Centered layout, Desktop: Split layout */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          {/* Room Management text - centered on mobile, left on desktop */}
          <div className="flex items-center gap-6 justify-center sm:justify-start">
            <span className="text-xl sm:text-2xl font-bold text-gray-900">Room</span>
            <span className="inline-flex items-center bg-[#013c80] text-white px-3 py-1 rounded-md">
              <RotatingText
                texts={['Management', 'Oversight......', 'Coordination', 'Control..........']}
                rotationInterval={2000}
                mainClassName="text-xl sm:text-2xl font-bold"
                staggerFrom="last"
                staggerDuration={0.03}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '-120%', opacity: 0 }}
                splitLevelClassName="overflow-hidden"
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              />
            </span>
          </div>

          {/* Add Room button - centered with offset on mobile, right on desktop */}
          <div className="w-full sm:w-auto flex justify-end sm:justify-start pr-[calc(50%-100px)] sm:pr-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 bg-[#013c80] text-white rounded-md hover:bg-[#012b5c] transition duration-200 text-sm"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Room
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {Object.entries(groupedRooms).map(([floorName, floorRooms]) => (
            <div key={floorName} className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">{floorName}</h3>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {floorRooms.map((room) => (
                  <div
                    key={room._id}
                    className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-[#013c80] transition duration-200"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          Room {room.number}
                        </h4>
                        <p className="text-sm text-gray-600">{room.type}</p>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => navigate(`/rooms/${room._id}/issues`)}
                          className="text-[#013c80] hover:text-[#012b5c] transition-colors"
                          title="View Issues"
                        >
                          <ClipboardList className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(room)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Delete Room"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full transform transition-all">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-[#013c80]">Add New Room</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewRoom({ number: '', type: 'Standard' });
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddRoom} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                <input
                  type="text"
                  value={newRoom.number}
                  onChange={(e) => setNewRoom({ ...newRoom, number: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm 
                           focus:border-[#013c80] focus:ring-[#013c80] transition-colors
                           placeholder-gray-400 text-gray-900"
                  placeholder="e.g., 101"
                  pattern={newRoom.type === 'Other' ? undefined : '[0-9]{3}'}
                  title={newRoom.type === 'Other'
                    ? 'No numeric requirement for Other'
                    : 'Room number must be 3 digits'}
                  required
                  disabled={newRoom.type === 'Other'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                <select
                  value={newRoom.type}
                  onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm 
                           focus:border-[#013c80] focus:ring-[#013c80] transition-colors
                           text-gray-900"
                >
                  <option value="Standard">Standard</option>
                  <option value="Deluxe">Deluxe</option>
                  <option value="Suite">Suite</option>
                  {!hasOtherRoom && <option value="Other">Other</option>}
                </select>
              </div>
              <div className="flex justify-end items-center space-x-4 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewRoom({ number: '', type: 'Standard' });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 
                           hover:bg-gray-200 rounded-md transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#013c80] text-white text-sm font-medium 
                           rounded-md hover:bg-[#012b5c] transition-colors duration-200
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#013c80]"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setNewPassword('');
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter new password"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setNewPassword('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordChange}
                  disabled={!newPassword}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full transform transition-all">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Room
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Are you sure you want to delete Room {roomToDelete?.number}? This action cannot be undone.
                </p>
              </div>
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 
                           hover:bg-gray-200 rounded-md transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium 
                           rounded-md hover:bg-red-700 transition-colors duration-200
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
