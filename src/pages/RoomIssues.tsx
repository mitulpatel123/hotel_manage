import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Plus, Edit2, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Issue {
  _id: string;
  description: string;
  createdAt: string;
  createdBy: {
    username: string;
  };
}

interface IssueTitle {
  _id: string;
  title: string;
  createdAt: string;
  createdBy: {
    username: string;
  };
}

const RoomIssues = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [titles, setTitles] = useState<IssueTitle[]>([]);
  const [issues, setIssues] = useState<{ [key: string]: Issue[] }>({});
  const [showAddTitleModal, setShowAddTitleModal] = useState(false);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [addingIssueToTitle, setAddingIssueToTitle] = useState<string | null>(null);
  const [newIssue, setNewIssue] = useState('');
  const [editingIssue, setEditingIssue] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    fetchTitles();
  }, [roomId]);

  const fetchTitles = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rooms/${roomId}/titles`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTitles(data);
        // Fetch issues for each title
        data.forEach((title: IssueTitle) => {
          fetchIssues(title._id);
        });
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to fetch titles');
      }
    } catch (error) {
      toast.error('Failed to fetch titles');
    }
  };

  const fetchIssues = async (titleId: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/rooms/${roomId}/titles/${titleId}/issues`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      if (response.ok) {
        const data = await response.json();
        setIssues(prev => ({ ...prev, [titleId]: data }));
      }
    } catch (error) {
      toast.error('Failed to fetch issues');
    }
  };

  const handleAddTitle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rooms/${roomId}/titles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ title: newTitle })
      });

      if (response.ok) {
        const data = await response.json();
        setTitles([...titles, data]);
        setIssues({ ...issues, [data._id]: [] });
        setShowAddTitleModal(false);
        setNewTitle('');
        toast.success('Title added successfully');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to add title');
      }
    } catch (error) {
      toast.error('Failed to add title');
    }
  };

  const handleEditTitle = async (titleId: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/rooms/${roomId}/titles/${titleId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ title: newTitle })
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTitles(titles.map(t => (t._id === titleId ? data : t)));
        setEditingTitleId(null);
        setNewTitle('');
        toast.success('Title updated successfully');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update title');
      }
    } catch (error) {
      toast.error('Failed to update title');
    }
  };

  const handleDeleteTitle = async (titleId: string) => {
    if (!window.confirm('Are you sure you want to delete this title and all its issues?')) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/rooms/${roomId}/titles/${titleId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.ok) {
        setTitles(titles.filter(t => t._id !== titleId));
        const newIssues = { ...issues };
        delete newIssues[titleId];
        setIssues(newIssues);
        toast.success('Title deleted successfully');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to delete title');
      }
    } catch (error) {
      toast.error('Failed to delete title');
    }
  };

  const handleAddIssue = async (titleId: string) => {
    if (!newIssue.trim()) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/rooms/${roomId}/titles/${titleId}/issues`,
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
        const data = await response.json();
        setIssues({
          ...issues,
          [titleId]: [...(issues[titleId] || []), data]
        });
        setNewIssue('');
        setAddingIssueToTitle(null);
        toast.success('Issue added successfully');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to add issue');
      }
    } catch (error) {
      toast.error('Failed to add issue');
    }
  };

  const handleEditIssue = async (issueId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rooms/${roomId}/issues/${issueId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ description: editText })
      });

      if (response.ok) {
        const data = await response.json();
        setIssues(prev => {
          const newIssues = { ...prev };
          Object.keys(newIssues).forEach(titleId => {
            newIssues[titleId] = newIssues[titleId].map(issue => issue._id === issueId ? data : issue);
          });
          return newIssues;
        });
        setEditingIssue(null);
        setEditText('');
        toast.success('Issue updated successfully');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update issue');
      }
    } catch (error) {
      toast.error('Failed to update issue');
    }
  };

  const handleDeleteIssue = async (issueId: string) => {
    if (!window.confirm('Are you sure you want to delete this issue?')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rooms/${roomId}/issues/${issueId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setIssues(prev => {
          const newIssues = { ...prev };
          Object.keys(newIssues).forEach(titleId => {
            newIssues[titleId] = newIssues[titleId].filter(issue => issue._id !== issueId);
          });
          return newIssues;
        });
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Back to Dashboard
            </button>
            <img
              src="/images/logo.jpeg"
              alt="Hotel Logo"
              className="h-8 w-8 object-contain rounded-lg"
            />
          </div>
          <button
            onClick={() => setShowAddTitleModal(true)}
            className="flex items-center px-4 py-2 bg-[#013c80] text-white rounded-md hover:bg-[#012b5c]"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Title
          </button>
        </div>

        <div className="space-y-6">
          {titles.map((title) => (
            <div key={title._id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 flex items-center justify-between border-b border-gray-200">
                {editingTitleId === title._id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleEditTitle(title._id);
                    }}
                    className="flex-1 mr-4"
                  >
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Enter new title"
                      autoFocus
                    />
                  </form>
                ) : (
                  <h3 className="text-lg font-medium text-gray-900">{title.title}</h3>
                )}
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  {editingTitleId === title._id ? (
                    <>
                      <button
                        onClick={() => handleEditTitle(title._id)}
                        className="w-full sm:w-auto px-2 py-1 sm:px-3 sm:py-2 text-blue-600 hover:text-blue-800 text-xs sm:text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingTitleId(null);
                          setNewTitle('');
                        }}
                        className="w-full sm:w-auto px-2 py-1 sm:px-3 sm:py-2 text-gray-600 hover:text-gray-800 text-xs sm:text-sm"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingTitleId(title._id);
                          setNewTitle(title.title);
                        }}
                        className="p-2 text-gray-600 hover:text-blue-600"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTitle(title._id)}
                        className="p-2 text-gray-600 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setAddingIssueToTitle(title._id)}
                        className="p-2 text-gray-600 hover:text-green-600"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="p-4 space-y-3">
                {issues[title._id]?.map((issue) => (
                  <div
                    key={issue._id}
                    className="flex items-start justify-between group hover:bg-gray-50 p-2 rounded-md"
                  >
                    <div>
                      {editingIssue === issue._id ? (
                        <div className="flex flex-col gap-2">
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full px-2 py-1 sm:px-3 sm:py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <div className="flex flex-col sm:flex-row gap-2">
                            <button
                              onClick={() => handleEditIssue(issue._id)}
                              className="w-full sm:w-auto px-2 py-1 sm:px-3 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs sm:text-sm"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingIssue(null);
                                setEditText('');
                              }}
                              className="w-full sm:w-auto px-2 py-1 sm:px-3 sm:py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-xs sm:text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-gray-900">{issue.description}</p>
                          <p className="text-sm text-gray-500">
                            Added by {issue.createdBy.username} on{' '}
                            {new Date(issue.createdAt).toLocaleDateString()}
                          </p>
                        </>
                      )}
                    </div>
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
                        onClick={() => handleDeleteIssue(issue._id)}
                        className="p-1 text-gray-600 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {addingIssueToTitle === title._id && (
                  <div className="mt-3">
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        value={newIssue}
                        onChange={(e) => setNewIssue(e.target.value)}
                        className="w-full px-2 py-1 sm:px-3 sm:py-2 border rounded-md"
                        placeholder="Type issue description"
                        autoFocus
                      />
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => handleAddIssue(title._id)}
                          className="w-full sm:w-auto px-2 py-1 sm:px-3 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs sm:text-sm"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => {
                            setAddingIssueToTitle(null);
                            setNewIssue('');
                          }}
                          className="w-full sm:w-auto px-2 py-1 sm:px-3 sm:py-2 text-gray-700 hover:text-gray-900 text-xs sm:text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAddTitleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add New Title</h3>
            </div>
            <form onSubmit={handleAddTitle} className="p-6">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-2 py-1 sm:px-3 sm:py-2 border rounded-md"
                placeholder="Enter title"
                required
              />
              <div className="mt-4 flex flex-col sm:flex-row justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddTitleModal(false);
                    setNewTitle('');
                  }}
                  className="w-full sm:w-auto px-2 py-1 sm:px-3 sm:py-2 text-gray-700 hover:text-gray-900 text-xs sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-2 py-1 sm:px-3 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs sm:text-sm"
                >
                  Add Title
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomIssues;