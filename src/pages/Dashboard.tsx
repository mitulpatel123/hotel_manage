// File: src/pages/Dashboard.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ClipboardList, LogOut, Menu, User, X, UserCog, Key } from 'lucide-react';
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
  const [newRoom, setNewRoom] = useState({ number: '', type: 'Standard' });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [userId, setUserId] = useState('');
  const [hasOtherRoom, setHasOtherRoom] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Get username + role from localStorage
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setUsername(userData.username || 'Admin');
      setIsAdmin(userData.role === 'admin');
      setUserId(userData._id);
    }
    // Fetch rooms
    fetchRooms();
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  //  FETCH ROOMS
  // ─────────────────────────────────────────────────────────────────────────────
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

        // Check if "OTHER" already exists
        const alreadyHasOther = data.some((r: Room) => r.number === 'OTHER');
        setHasOtherRoom(alreadyHasOther);
      } else {
        toast.error('Failed to fetch rooms');
      }
    } catch (error) {
      toast.error('Failed to fetch rooms');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  //  ADD ROOM
  // ─────────────────────────────────────────────────────────────────────────────
  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newRoom.type === 'Other') {
      // Force number = "OTHER"
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
        // Instead of just adding locally, re-fetch so order is correct
        await fetchRooms();
        toast.success('Room added successfully');
        setShowAddModal(false);
        setNewRoom({ number: '', type: 'Standard' });
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to add room');
      }
    } catch (error) {
      toast.error('Failed to add room');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  //  DELETE ROOM
  // ─────────────────────────────────────────────────────────────────────────────
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
        // Re-fetch rooms so the order remains consistent
        await fetchRooms();
        toast.success('Room deleted successfully');
        setShowDeleteModal(false);
      } else {
        toast.error('Failed to delete room');
      }
    } catch (error) {
      toast.error('Failed to delete room');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  //  LOGOUT / PASSWORD
  // ─────────────────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
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

  // ─────────────────────────────────────────────────────────────────────────────
  //  GROUP ROOMS BY FLOOR
  // ─────────────────────────────────────────────────────────────────────────────
  const groupedRooms = rooms.reduce<Record<string, Room[]>>((acc, room) => {
    // If room.number is "OTHER" => we can treat floor as 999 or 0. 
    // Or use parseInt safely:
    const n = parseInt(room.number); 
    const floor = isNaN(n) ? 0 : Math.floor(n / 100);
    const floorName = floor === 0 ? 'Ground Floor' : `Floor ${floor}`;
    if (!acc[floorName]) acc[floorName] = [];
    acc[floorName].push(room);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAVBAR */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
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
            </div>
            
            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-md"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

            {/* Desktop menu */}
            <div className="hidden md:flex items-center space-x-4">
              {isAdmin && (
                <>
                  <button
                    onClick={() => navigate('/users')}
                    className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    <User className="h-5 w-5" />
                    <span>User Management</span>
                  </button>
                  <button
                    onClick={() => navigate('/logbook')}
                    className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    <ClipboardList className="h-5 w-5" />
                    <span>Log Book</span>
                  </button>
                </>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
            {isAdmin && (
              <>
                <button
                  onClick={() => {
                    navigate('/users');
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium w-full"
                >
                  <User className="h-5 w-5" />
                  <span>User Management</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/logbook');
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium w-full"
                >
                  <ClipboardList className="h-5 w-5" />
                  <span>Log Book</span>
                </button>
              </>
            )}
            <button
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium w-full"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
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

      {/* ADD ROOM MODAL */}
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
                  title={
                    newRoom.type === 'Other'
                      ? 'No numeric requirement for Other'
                      : 'Room number must be 3 digits'
                  }
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

      {/* CHANGE PASSWORD MODAL */}
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

      {/* DELETE ROOM CONFIRMATION */}
      {showDeleteModal && roomToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full transform transition-all">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-lg font-semibold text-gray-900">Delete Room</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Are you sure you want to delete Room {roomToDelete.number}? This action cannot be undone.
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
