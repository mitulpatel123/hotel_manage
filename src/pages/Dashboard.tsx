import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, ClipboardList, LogOut, Menu, User, X, UserCog, Key } from 'lucide-react';
import toast from 'react-hot-toast';

interface Room {
  _id: string;
  number: string;
  type: string;
  floor: number;
}

const Dashboard = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRoom, setNewRoom] = useState({ number: '', type: 'Standard' });
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [userId, setUserId] = useState('');

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
      } else {
        toast.error('Failed to fetch rooms');
      }
    } catch (error) {
      toast.error('Failed to fetch rooms');
    }
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const handleDeleteRoom = async (roomId: string) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/rooms/${roomId}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        if (response.ok) {
          setRooms(rooms.filter(r => r._id !== roomId));
          toast.success('Room deleted successfully');
        } else {
          toast.error('Failed to delete room');
        }
      } catch (error) {
        toast.error('Failed to delete room');
      }
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

  // Group rooms by floor
  const groupedRooms = rooms.reduce<Record<string, Room[]>>((acc, room) => {
    const floor = Math.floor(parseInt(room.number) / 100);
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
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <img 
                src="/images/logo.jpeg" 
                alt="Hotel Logo" 
                className="h-12 w-auto object-contain rounded-xl"
              />
              <h1 className="ml-3 text-xl font-semibold text-gray-900">
                Best Western News Inn & Suites
              </h1>
            </div>

            {/* Desktop menu */}
            <div className="hidden sm:flex sm:items-center sm:space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span className="text-gray-700">{username}</span>
                {isAdmin && (
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                    title="Change Password"
                  >
                    <Key className="h-4 w-4 text-gray-600" />
                  </button>
                )}
              </div>
              {isAdmin && (
                <>
                  <button
                    onClick={() => navigate('/users')}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <UserCog className="h-5 w-5" />
                    User Management
                  </button>
                  <button
                    onClick={() => navigate('/logbook')}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <ClipboardList className="h-5 w-5" />
                    Log Book
                  </button>
                </>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-5 w-5 mr-1" />
                Logout
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="sm:hidden bg-white border-t">
            <div className="px-4 pt-2 pb-3 space-y-1">
              <div className="flex items-center py-2 text-gray-700">
                <User className="h-5 w-5 mr-2" />
                <span>{username}</span>
              </div>
              {isAdmin && (
                <>
                  <button
                    onClick={() => navigate('/users')}
                    className="flex items-center w-full px-3 py-2 text-base text-gray-600 hover:text-gray-900"
                  >
                    <UserCog className="h-5 w-5 mr-2" />
                    User Management
                  </button>
                  <button
                    onClick={() => navigate('/logbook')}
                    className="flex items-center w-full px-3 py-2 text-base text-gray-600 hover:text-gray-900"
                  >
                    <ClipboardList className="h-5 w-5 mr-2" />
                    Log Book
                  </button>
                </>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 text-base text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Room Management</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Room
          </button>
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
                    className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-blue-500 transition duration-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">Room {room.number}</h4>
                        <p className="text-sm text-gray-600">{room.type}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/rooms/${room._id}/issues`)}
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                          title="View Issues"
                        >
                          <ClipboardList className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            setNewRoom({ number: room.number, type: room.type });
                            setShowAddModal(true);
                          }}
                          className="text-gray-600 hover:text-gray-800 flex items-center"
                          title="Edit Room"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(room._id)}
                          className="text-red-600 hover:text-red-800 flex items-center"
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
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add New Room</h3>
            </div>
            <form onSubmit={handleAddRoom} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Room Number</label>
                <input
                  type="text"
                  value={newRoom.number}
                  onChange={(e) => setNewRoom({ ...newRoom, number: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g., 101"
                  pattern="[0-9]{3}"
                  title="Room number must be 3 digits"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Room Type</label>
                <select
                  value={newRoom.type}
                  onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="Standard">Standard</option>
                  <option value="Deluxe">Deluxe</option>
                  <option value="Suite">Suite</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewRoom({ number: '', type: 'Standard' });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
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
    </div>
  );
};

export default Dashboard;