import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, User, Shield, Key, Trash2, X, Menu, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

interface UserData {
  _id: string;
  username: string;
  role: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'staff' });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUsername, setCurrentUsername] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserData | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('staff');

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setCurrentUsername(userData.username || '');
    }

    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (error) {
      toast.error('Failed to fetch users');
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newUser)
      });

      if (response.ok) {
        await fetchUsers();
        toast.success('User added successfully');
        setShowAddModal(false);
        setNewUser({ username: '', password: '', role: 'staff' });
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to add user');
      }
    } catch (error) {
      toast.error('Failed to add user');
    }
  };

  const handleDeleteUser = (user: UserData) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${userToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        await fetchUsers();
        toast.success('User deleted successfully');
        setShowDeleteModal(false);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to delete user');
      }
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handlePasswordChange = async () => {
    if (!userToEdit || !newPassword) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${userToEdit._id}/password`, {
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
        setUserToEdit(null);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update password');
      }
    } catch (error) {
      toast.error('Failed to update password');
    }
  };

  const handleRoleChange = async () => {
    if (!userToEdit || !newRole) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${userToEdit._id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        await fetchUsers(); // Refresh the users list
        toast.success('Role updated successfully');
        setShowRoleModal(false);
        setNewRole('staff');
        setUserToEdit(null);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update role');
      }
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAVBAR */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-md"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <div className="flex items-center gap-3 ml-2">
                <img
                  src="/images/logo.jpeg"
                  alt="Hotel Logo"
                  className="h-8 w-8 object-contain rounded-lg"
                />
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-[#013c80]" />
                  <h1 className="text-xl font-semibold text-gray-900">User Management</h1>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center justify-center px-4 py-2 bg-[#013c80] text-white rounded-md 
                          hover:bg-[#012b5c] transition-all duration-200 text-sm"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add User
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-sm rounded-lg divide-y divide-gray-200">
          {users.map((user) => (
            <div key={user._id} className="p-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-[#013c80] bg-opacity-10 p-2 rounded-full">
                  <User className="h-5 w-5 text-[#013c80]" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{user.username}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                    {user.role}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {user.username !== currentUsername && (
                  <>
                    <button
                      onClick={() => {
                        setUserToEdit(user);
                        setNewPassword('');
                        setShowPasswordModal(true);
                      }}
                      className="text-[#013c80] hover:text-[#012b5c] transition-colors p-2 rounded-md hover:bg-[#013c80] hover:bg-opacity-5"
                      title="Change Password"
                    >
                      <Key className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        setUserToEdit(user);
                        setNewRole(user.role);
                        setShowRoleModal(true);
                      }}
                      className="text-[#013c80] hover:text-[#012b5c] transition-colors p-2 rounded-md hover:bg-[#013c80] hover:bg-opacity-5"
                      title="Change Role"
                    >
                      <Shield className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user)}
                      className="text-red-600 hover:text-red-800 transition-colors p-2 rounded-md hover:bg-red-50"
                      title="Delete User"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ADD USER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full transform transition-all">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-[#013c80]">Add New User</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewUser({ username: '', password: '', role: 'staff' });
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="w-full px-4 py-2 border rounded-md focus:ring-[#013c80] focus:border-[#013c80]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-4 py-2 border rounded-md focus:ring-[#013c80] focus:border-[#013c80]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-4 py-2 border rounded-md focus:ring-[#013c80] focus:border-[#013c80]"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewUser({ username: '', password: '', role: 'staff' });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#013c80] hover:bg-[#012b5c] rounded-md"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE USER MODAL */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full transform transition-all">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-lg font-semibold text-gray-900">Delete User</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Are you sure you want to delete user "{userToDelete.username}"? This action cannot be undone.
                </p>
              </div>
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {showPasswordModal && userToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full transform transition-all">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-[#013c80]">Change Password</h3>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setNewPassword('');
                  setUserToEdit(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password for {userToEdit.username}
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:ring-[#013c80] focus:border-[#013c80]"
                  placeholder="Enter new password"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setNewPassword('');
                    setUserToEdit(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordChange}
                  disabled={!newPassword}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#013c80] hover:bg-[#012b5c] rounded-md
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CHANGE ROLE MODAL */}
      {showRoleModal && userToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full transform transition-all">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-[#013c80]">Change Role</h3>
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setNewRole('staff');
                  setUserToEdit(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Role for {userToEdit.username}
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:ring-[#013c80] focus:border-[#013c80]"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => {
                    setShowRoleModal(false);
                    setNewRole('staff');
                    setUserToEdit(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRoleChange}
                  disabled={newRole === userToEdit.role}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#013c80] hover:bg-[#012b5c] rounded-md
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update Role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;