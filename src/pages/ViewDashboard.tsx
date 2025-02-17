import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ClipboardList, X, Menu, User } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Animations/components
import DecryptedText from '../components/DecryptedText';
import RotatingText from '../components/RotatingText';
import TrueFocus from '../components/TrueFocus';

interface Room {
  _id: string;
  number: string;
  type: string;
  floor: number;
}

const ViewDashboard: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Check for PIN
  useEffect(() => {
    const pin = localStorage.getItem('viewPin');
    if (!pin) {
      navigate('/');
      return;
    }
    fetchRooms();
  }, [navigate]);

  // Fetch rooms with X-View-Pin
  const fetchRooms = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rooms`, {
        headers: {
          'X-View-Pin': localStorage.getItem('viewPin') || '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRooms(data);
      } else {
        toast.error('Failed to fetch rooms', {
          icon: '❌',
        });
      }
    } catch (error) {
      toast.error('Error fetching rooms', {
        icon: '❌',
      });
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
      {/* Navbar */}
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

            {/* Desktop buttons */}
            <div className="hidden sm:flex items-center justify-center sm:justify-end sm:ml-auto gap-4">
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

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="sm:hidden bg-white border-t">
            <div className="px-4 pt-2 pb-3 space-y-1">
              <button
                onClick={() => navigate('/login')}
                className="flex items-center w-full px-3 py-2 text-[#013c80] hover:bg-gray-100 rounded-md"
              >
                <User className="h-5 w-5 mr-2" />
                Login for Edit Access
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('viewPin');
                  navigate('/');
                }}
                className="flex items-center w-full px-3 py-2 text-[#013c80] hover:bg-gray-100 rounded-md"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Exit
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Room Management and View Only */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-start sm:gap-6 mb-8">
          {/* "Room" and rotating synonyms in a row */}
          <div className="flex items-center gap-6">
            <span className="text-xl sm:text-2xl font-bold text-gray-900">Room</span>
            {/* Blue highlight for synonyms */}
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

          {/* "View Only" with increased spacing */}
          <div className="text-sm sm:mt-0 sm:ml-6 text-gray-500 flex justify-center sm:inline-block">
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

        {/* Rooms by floor */}
        <div className="space-y-8">
          {Object.entries(groupedRooms).map(([floorName, floorRooms]) => (
            <div key={floorName} className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {floorName}
                </h3>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {floorRooms.map((room) => (
                  <div
                    key={room._id}
                    className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          Room {room.number}
                        </h4>
                        <p className="text-sm text-gray-600">{room.type}</p>
                      </div>
                      <button
                        onClick={() => navigate(`/view/rooms/${room._id}/issues`)}
                        className="flex items-center text-[#013c80] hover:text-[#013c80]"
                      >
                        <ClipboardList className="h-5 w-5 mr-1 text-[#013c80]" />
                        View Issues
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ViewDashboard;
