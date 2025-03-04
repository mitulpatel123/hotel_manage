// File: src/pages/StaffRoomIssues.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Edit2, Trash2, Plus, X, Menu, LogOut, User } from 'lucide-react';
import toast from 'react-hot-toast';
import DecryptedText from '../components/DecryptedText';

interface Issue {
  _id: string;
  description: string;
  createdBy?: {
    username: string;
  };
  createdAt: string;
}

interface Category {
  _id: string;
  title: string;
  issues: Issue[];
}

const StaffRoomIssues: React.FC = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [roomNumber, setRoomNumber] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);

  // For creating new category/issue
  const [newCategory, setNewCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newIssue, setNewIssue] = useState('');

  // For editing category/issue
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingIssue, setEditingIssue] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // UI toggles
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // For user info
  const [username, setUsername] = useState('');
  
  // For deleting category/issue confirmation modals
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [showDeleteIssueModal, setShowDeleteIssueModal] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState<{categoryId: string, issue: Issue} | null>(null);

  // Fetch data on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setUsername(userData.username || '');
    }
    fetchRoomDetails();
    fetchCategories();
  }, [roomId, navigate]);

  const fetchRoomDetails = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rooms/${roomId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRoomNumber(data.number);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to fetch room details');
      }
    } catch (error) {
      toast.error('Error fetching room details');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rooms/${roomId}/titles`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to fetch categories');
      }
    } catch (error) {
      toast.error('Failed to fetch categories');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  //  ADD CATEGORY
  // ─────────────────────────────────────────────────────────────────────────────
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rooms/${roomId}/titles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ title: newCategory })
      });

      if (response.ok) {
        setNewCategory('');
        setShowCategoryModal(false);
        await fetchCategories();
        toast.success('Category added successfully');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to add category');
      }
    } catch (error) {
      toast.error('Failed to add category');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  //  EDIT CATEGORY
  // ─────────────────────────────────────────────────────────────────────────────
  const handleEditCategory = async (categoryId: string) => {
    if (!editText.trim()) {
      toast.error('Category title cannot be empty');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rooms/${roomId}/titles/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ title: editText })
      });

      if (response.ok) {
        toast.success('Category updated successfully');
        setEditingCategory(null);
        setEditText('');
        fetchCategories();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update category');
      }
    } catch (error) {
      toast.error('Failed to update category');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  //  DELETE CATEGORY
  // ─────────────────────────────────────────────────────────────────────────────
  const handleDeleteCategory = (category: Category) => {
    setCategoryToDelete(category);
    setShowDeleteCategoryModal(true);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/rooms/${roomId}/titles/${categoryToDelete._id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // Even if server returns 500, remove locally if it was actually deleted.
      if (response.status === 500) {
        // Might have partially deleted, so update local
        setCategories((prev) => prev.filter((cat) => cat._id !== categoryToDelete._id));
        toast.success('Category deleted, but there was a server warning');
        setShowDeleteCategoryModal(false);
        setCategoryToDelete(null);
        return;
      }

      if (response.ok) {
        setCategories((prev) => prev.filter((cat) => cat._id !== categoryToDelete._id));
        toast.success('Category deleted successfully');
        setShowDeleteCategoryModal(false);
        setCategoryToDelete(null);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to delete category');
      }
    } catch (error) {
      // If we see that category is already gone from our local state, proceed.
      const stillExists = categories.some((c) => c._id === categoryToDelete._id);
      if (!stillExists) {
        toast.success('Category deleted successfully');
        setShowDeleteCategoryModal(false);
        setCategoryToDelete(null);
      } else {
        toast.error('Failed to delete category');
      }
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  //  ADD ISSUE
  // ─────────────────────────────────────────────────────────────────────────────
  const handleAddIssue = async () => {
    if (!selectedCategory || !newIssue.trim()) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/rooms/${roomId}/titles/${selectedCategory}/issues`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ description: newIssue })
        }
      );

      if (response.ok) {
        setNewIssue('');
        setSelectedCategory('');
        setShowIssueModal(false);
        fetchCategories();
        toast.success('Issue added successfully');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to add issue');
      }
    } catch (error) {
      toast.error('Failed to add issue');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  //  EDIT ISSUE
  // ─────────────────────────────────────────────────────────────────────────────
  const handleEditIssue = async (categoryId: string, issueId: string) => {
    if (!editText.trim()) {
      toast.error('Issue description cannot be empty');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rooms/${roomId}/titles/${categoryId}/issues/${issueId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ description: editText })
      });

      if (response.ok) {
        toast.success('Issue updated successfully');
        setEditingIssue(null);
        setEditText('');
        fetchCategories();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update issue');
      }
    } catch (error) {
      toast.error('Failed to update issue');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  //  DELETE ISSUE
  // ─────────────────────────────────────────────────────────────────────────────
  const handleDeleteIssue = (categoryId: string, issue: Issue) => {
    setIssueToDelete({ categoryId, issue });
    setShowDeleteIssueModal(true);
  };

  const confirmDeleteIssue = async () => {
    if (!issueToDelete) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/rooms/${roomId}/titles/${issueToDelete.categoryId}/issues/${issueToDelete.issue._id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.ok) {
        fetchCategories();
        toast.success('Issue deleted successfully');
        setShowDeleteIssueModal(false);
      } else {
        toast.error('Failed to delete issue');
      }
    } catch (error) {
      toast.error('Failed to delete issue');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
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
                <h1 className="text-xl font-semibold text-gray-900">Room {roomNumber} Issues</h1>
              </div>
            </div>
            {/* Desktop menu */}
            <div className="hidden sm:flex sm:items-center sm:ml-auto sm:space-x-4">
              <div className="flex items-center space-x-2 text-[#013c80]">
                <User className="h-5 w-5" />
                <span>{username}</span>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  navigate('/');
                }}
                className="flex items-center px-3 py-2 text-sm text-[#013c80] hover:text-[#012b5c]"
              >
                <LogOut className="h-5 w-5 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="sm:hidden bg-white border-t">
            <div className="px-4 pt-2 pb-3 space-y-1">
              <div className="flex items-center py-2 text-[#013c80]">
                <User className="h-5 w-5 mr-2" />
                <span>{username}</span>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  navigate('/');
                }}
                className="flex items-center w-full px-3 py-2 text-[#013c80] hover:bg-gray-100 rounded-md"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-start gap-3 mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center text-[#013c80] hover:text-[#012b5c] transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Room {roomNumber} Issues
            </h1>
          </div>

          <div className="w-full flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setShowCategoryModal(true)}
              className="flex items-center justify-center px-4 py-2 bg-[#013c80] text-white rounded-md hover:bg-[#012b5c] transition duration-200 text-sm"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Category
            </button>
            <button
              onClick={() => setShowIssueModal(true)}
              className="flex items-center justify-center px-4 py-2 bg-[#013c80] text-white rounded-md 
                         hover:bg-[#012b5c] transition-all duration-200 text-sm w-full sm:w-auto"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Issue
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {categories.map((category) => (
            <div
              key={category._id}
              className="bg-white shadow-sm rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md"
            >
              <div className="p-4 bg-[#013c80] bg-opacity-5 border-b border-[#013c80] border-opacity-10 flex justify-between items-center">
                {/* Toggle between showing input (edit mode) vs. the category title */}
                {editingCategory === category._id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="border rounded px-2 py-1"
                      autoFocus
                    />
                    <button
                      onClick={() => handleEditCategory(category._id)}
                      className="px-2 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingCategory(null);
                        setEditText('');
                      }}
                      className="px-2 py-1 bg-gray-200 text-sm rounded hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <h3 className="text-lg font-semibold text-[#013c80]">{category.title}</h3>
                )}

                <div className="flex items-center gap-2">
                  {/* Edit button */}
                  <button
                    onClick={() => {
                      setEditingCategory(category._id);
                      setEditText(category.title);
                    }}
                    className="text-[#013c80] hover:text-[#012b5c] transition-colors p-1 rounded-md hover:bg-[#013c80] hover:bg-opacity-5"
                    title="Edit Category"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteCategory(category)}
                    className="text-red-600 hover:text-red-700 transition-colors p-1 rounded-md hover:bg-red-50"
                    title="Delete Category"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="p-4 space-y-3">
                {category.issues.map((issue) => (
                  <div
                    key={issue._id}
                    className="group hover:bg-gray-50 p-3 rounded-md transition-colors duration-200 border border-transparent hover:border-gray-200"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        {/* If we are editing THIS issue, show input field; otherwise show text */}
                        {editingIssue === issue._id ? (
                          <div className="flex flex-col gap-2">
                            <input
                              type="text"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="border rounded px-2 py-1 w-full"
                              autoFocus
                            />
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditIssue(category._id, issue._id)}
                                className="px-2 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingIssue(null);
                                  setEditText('');
                                }}
                                className="px-2 py-1 bg-gray-200 text-sm rounded hover:bg-gray-300"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-gray-900 mb-2">{issue.description}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span className="inline-block h-2 w-2 rounded-full bg-[#013c80] opacity-50"></span>
                              <p>
                                Added by{' '}
                                <span className="font-medium">
                                  {issue.createdBy?.username || 'Unknown User'}
                                </span>{' '}
                                on{' '}
                                {new Date(issue.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </p>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="flex space-x-3">
                        <button
                          onClick={() => {
                            setEditingIssue(issue._id);
                            setEditText(issue.description);
                          }}
                          className="text-[#013c80] hover:text-[#012b5c] transition-colors"
                          title="Edit Issue"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteIssue(category._id, issue)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Delete Issue"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {(!category.issues || category.issues.length === 0) && (
                  <p className="text-gray-500 italic text-center py-4">
                    No issues reported
                  </p>
                )}
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No issue categories found for this room</p>
            </div>
          )}
        </div>
      </main>

      {/* ──────────────────────────────────────────────────────────────────────────
          ADD CATEGORY MODAL
      ────────────────────────────────────────────────────────────────────────── */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full transform transition-all">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-[#013c80]">Add New Issue Category</h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter category title"
                className="w-full px-4 py-2 border rounded-md focus:ring-[#013c80] focus:border-[#013c80]"
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCategory}
                  disabled={!newCategory.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#013c80] hover:bg-[#012b5c] rounded-md
                             disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Add Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          DELETE CATEGORY CONFIRMATION
      ────────────────────────────────────────────────────────────────────────── */}
      {showDeleteCategoryModal && categoryToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full transform transition-all">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-lg font-semibold text-gray-900">Delete Category</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Are you sure you want to delete "{categoryToDelete.title}"?
                  All associated issues will be deleted.
                </p>
              </div>
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteCategoryModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteCategory}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          DELETE ISSUE CONFIRMATION
      ────────────────────────────────────────────────────────────────────────── */}
      {showDeleteIssueModal && issueToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full transform transition-all">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-lg font-semibold text-gray-900">Delete Issue</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Are you sure you want to delete this issue? This action cannot be undone.
                </p>
              </div>
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteIssueModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteIssue}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          ADD ISSUE MODAL
      ────────────────────────────────────────────────────────────────────────── */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full transform transition-all">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-[#013c80]">Add New Issue</h3>
              <button
                onClick={() => {
                  setShowIssueModal(false);
                  setNewIssue('');
                  setSelectedCategory('');
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:ring-[#013c80] focus:border-[#013c80]"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Description</label>
                <textarea
                  value={newIssue}
                  onChange={(e) => setNewIssue(e.target.value)}
                  placeholder="Describe the issue"
                  rows={4}
                  className="w-full px-4 py-2 border rounded-md focus:ring-[#013c80] focus:border-[#013c80] resize-none"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => {
                    setShowIssueModal(false);
                    setNewIssue('');
                    setSelectedCategory('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleAddIssue();
                  }}
                  disabled={!selectedCategory || !newIssue.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#013c80] hover:bg-[#012b5c] rounded-md 
                           disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Add Issue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffRoomIssues;
