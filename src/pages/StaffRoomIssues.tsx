import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

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
  const [newCategory, setNewCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newIssue, setNewIssue] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingIssue, setEditingIssue] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
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
        fetchCategories();
        toast.success('Category added successfully');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to add category');
      }
    } catch (error) {
      toast.error('Failed to add category');
    }
  };

  const handleEditCategory = async (categoryId: string) => {
    if (!editText.trim()) return;

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
        setEditingCategory(null);
        setEditText('');
        fetchCategories();
        toast.success('Category updated successfully');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update category');
      }
    } catch (error) {
      toast.error('Failed to update category');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!window.confirm('Are you sure you want to delete this category? All associated issues will be deleted.')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rooms/${roomId}/titles/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete category');
      }

      // Update local state
      setCategories(prevCategories => 
        prevCategories.filter(category => category._id !== categoryId)
      );

      toast.success('Category deleted successfully');
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast.error(error.message || 'Failed to delete category');
    }
  };

  const handleAddIssue = async () => {
    if (!selectedCategory || !newIssue.trim()) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rooms/${roomId}/titles/${selectedCategory}/issues`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ description: newIssue })
      });

      if (response.ok) {
        setNewIssue('');
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update issue');
      }

      // Update the local state with the returned updated issue
      setCategories(prevCategories => 
        prevCategories.map(cat => {
          if (cat._id === categoryId) {
            return {
              ...cat,
              issues: cat.issues.map(issue => 
                issue._id === issueId ? {
                  ...issue,
                  description: data.description,
                  createdBy: data.createdBy
                } : issue
              )
            };
          }
          return cat;
        })
      );

      setEditingIssue(null);
      setEditText('');
      toast.success('Issue updated successfully');
    } catch (error: any) {
      console.error('Error updating issue:', error);
      toast.error(error.message || 'Failed to update issue');
    } finally {
      // Always reset editing state
      setEditingIssue(null);
      setEditText('');
    }
  };

  const handleDeleteIssue = async (categoryId: string, issueId: string) => {
    if (!window.confirm('Are you sure you want to delete this issue?')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rooms/${roomId}/titles/${categoryId}/issues/${issueId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchCategories();
        toast.success('Issue deleted successfully');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to delete issue');
      }
    } catch (error) {
      toast.error('Failed to delete issue');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Link
            to="/dashboard"
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Room {roomNumber} Issues
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            Add Category
          </button>
          <button
            onClick={() => setShowIssueModal(true)}
            className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center gap-2"
          >
            Add Issue
          </button>
        </div>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add New Issue Category</h2>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Enter category title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  setNewCategory('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleAddCategory();
                  setShowCategoryModal(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add New Issue</h2>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 mb-4"
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.title}
                </option>
              ))}
            </select>
            <textarea
              value={newIssue}
              onChange={(e) => setNewIssue(e.target.value)}
              placeholder="Describe the issue"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowIssueModal(false);
                  setNewIssue('');
                  setSelectedCategory('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleAddIssue();
                  setShowIssueModal(false);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Add Issue
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category._id} className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <div className="flex items-center justify-between">
                {editingCategory === category._id ? (
                  <div className="flex-1 flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditCategory(category._id)}
                        className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingCategory(null);
                          setEditText('');
                        }}
                        className="flex-1 sm:flex-none px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold text-gray-900">{category.title}</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingCategory(category._id);
                          setEditText(category.title);
                        }}
                        className="p-1 text-gray-600 hover:text-blue-600"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category._id)}
                        className="p-1 text-gray-600 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="p-4 space-y-3">
              {category.issues.map((issue) => (
                <div key={issue._id} className="bg-gray-50 rounded-md p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {editingIssue === issue._id ? (
                        <div className="flex flex-col gap-2">
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditIssue(category._id, issue._id)}
                              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingIssue(null);
                                setEditText('');
                              }}
                              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-gray-700">{issue.description}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Added by {issue.createdBy?.username || 'Unknown User'} on {new Date(issue.createdAt).toLocaleDateString()}
                          </p>
                        </>
                      )}
                    </div>
                    {!editingIssue && (
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => {
                            setEditingIssue(issue._id);
                            setEditText(issue.description);
                          }}
                          className="p-1 text-gray-600 hover:text-blue-600"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteIssue(category._id, issue._id)}
                          className="p-1 text-gray-600 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {category.issues.length === 0 && (
                <p className="text-gray-500 italic">No issues in this category</p>
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
    </div>
  );
};

export default StaffRoomIssues;
