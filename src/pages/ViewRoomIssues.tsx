import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ChevronLeft, LogOut } from 'lucide-react';
import DecryptedText from '../components/DecryptedText';
import TrueFocus from '../components/TrueFocus';

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

// Add this CSS class to handle custom scrollbar
const scrollbarStyles = `
  .custom-scrollbar {
    max-height: 300px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #013c80 #f3f4f6;
  }
  
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f3f4f6;
    border-radius: 3px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #013c80;
    border-radius: 3px;
    opacity: 0.5;
  }
`;

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
      {/* Add style tag for custom scrollbar */}
      <style>{scrollbarStyles}</style>
      
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row py-4 sm:py-0 gap-4 sm:gap-0">
            <div className="flex items-center justify-center sm:justify-start">
              <img
                src="/images/logo.jpeg"
                alt="Hotel Logo"
                className="h-12 w-auto object-contain rounded-xl"
              />
              <h1 className="ml-3 text-lg sm:text-xl font-semibold text-gray-900">
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
            <div className="flex items-center justify-center sm:justify-end sm:ml-auto gap-4">
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center px-4 py-2 bg-[#013c80] text-white text-sm rounded-md hover:bg-blue-700 transition duration-200"
              >
                Login for Edit Access
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('viewPin');
                  navigate('/');
                }}
                className="inline-flex items-center px-3 py-2 text-sm text-[#013c80] hover:text-[#013c80]"
              >
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5 mr-1 text-[#013c80]" />
                Exit
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-start gap-3 mb-8">
          <button
            onClick={() => navigate('/view/dashboard')}
            className="inline-flex items-center text-[#013c80] hover:text-blue-700 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Room {roomNumber}
            </h1>
            <div className="text-sm text-gray-500 ml-2">
              <TrueFocus
                sentence="View Only"
                manualMode={false}
                blurAmount={5}
                borderColor="#013c80"
                animationDuration={0.5}
                pauseBetweenAnimations={1}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {titles.map((title) => (
            <div
              key={title._id}
              className="bg-white shadow-sm rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md"
            >
              <div className="p-4 bg-[#013c80] bg-opacity-5 border-b border-[#013c80] border-opacity-10">
                <h3 className="text-lg font-semibold text-[#013c80]">{title.title}</h3>
              </div>
              {/* Add custom-scrollbar class to the issues container */}
              <div className="custom-scrollbar">
                <div className="p-4 space-y-3">
                  {title.issues?.map((issue) => (
                    <div
                      key={issue._id}
                      className="group hover:bg-gray-50 p-3 rounded-md transition-colors duration-200 border border-transparent hover:border-gray-200"
                    >
                      <div>
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
                      </div>
                    </div>
                  ))}
                  {(!title.issues || title.issues.length === 0) && (
                    <p className="text-gray-500 italic text-center py-4">
                      No issues reported
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
          {titles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No issue categories found for this room</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ViewRoomIssues;
