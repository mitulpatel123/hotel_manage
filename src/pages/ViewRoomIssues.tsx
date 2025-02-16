import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface Issue {
  _id: string;
  description: string;
  createdBy?: {
    username: string;
  };
  createdAt: string;
}

interface IssueTitle {
  _id: string;
  title: string;
  issues: Issue[];
}

const ViewRoomIssues: React.FC = () => {
  const [titles, setTitles] = useState<IssueTitle[]>([]);
  const [roomNumber, setRoomNumber] = useState('');
  const { roomId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const pin = localStorage.getItem('viewPin');
    if (!pin) {
      navigate('/');
      return;
    }
    fetchRoomDetails();
    fetchTitles();
  }, [roomId, navigate]);

  const fetchRoomDetails = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rooms/${roomId}`, {
        headers: {
          'X-View-Pin': localStorage.getItem('viewPin') || '',
        },
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

  const fetchTitles = async () => {
    if (!roomId) return;
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/rooms/${roomId}/titles`,
        {
          headers: {
            'X-View-Pin': localStorage.getItem('viewPin') || '',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTitles(data);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to fetch issues');
      }
    } catch (error) {
      toast.error('Error fetching issues');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <button
              onClick={() => navigate('/view/dashboard')}
              className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-2xl font-semibold">
              Room {roomNumber} Issues (View Only)
            </h1>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Login for Edit Access
          </button>
        </div>

        <div className="space-y-6">
          {titles.map((title) => (
            <div
              key={title._id}
              className="bg-white shadow rounded-lg overflow-hidden"
            >
              <div className="p-4 bg-gray-50 border-b">
                <h3 className="text-lg font-semibold">{title.title}</h3>
              </div>
              <div className="p-4 space-y-3">
                {title.issues?.map((issue) => (
                  <div
                    key={issue._id}
                    className="group hover:bg-gray-50 p-2 rounded-md"
                  >
                    <div>
                      <p className="text-gray-900">{issue.description}</p>
                      <p className="text-sm text-gray-500">
                        Added by {issue.createdBy?.username || 'Unknown User'} on{' '}
                        {new Date(issue.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {(!title.issues || title.issues.length === 0) && (
                  <p className="text-gray-500 italic">No issues reported</p>
                )}
              </div>
            </div>
          ))}
          {titles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No issue categories found for this room</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewRoomIssues;
