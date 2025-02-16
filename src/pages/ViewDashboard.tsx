import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ClipboardList } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Room {
  _id: string;
  number: string;
  type: string;
  floor: number;
}

const ViewDashboard = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const pin = localStorage.getItem('viewPin');
    if (!pin) {
      navigate('/');
      return;
    }
    fetchRooms();
  }, [navigate]);

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
        toast.error('Failed to fetch rooms');
      }
    } catch (error) {
      toast.error('Error fetching rooms');
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
          <div className="flex flex-col sm:flex-row py-4 sm:py-0 gap-4 sm:gap-0">
            <div className="flex items-center justify-center sm:justify-start">
              <img 
                src="/images/logo.jpeg" 
                alt="Hotel Logo" 
                className="h-12 w-auto object-contain rounded-xl"
              />
              <h1 className="ml-3 text-xl font-semibold text-gray-900">
                Best Western News Inn & Suites
              </h1>
            </div>
            <div className="flex items-center justify-center sm:justify-end sm:ml-auto gap-3">
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition duration-200"
              >
                Login for Edit Access
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('viewPin');
                  navigate('/');
                }}
                className="inline-flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
                Exit
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-semibold text-gray-900">Room Management (View Only)</h2>
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
                    className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">Room {room.number}</h4>
                        <p className="text-sm text-gray-600">{room.type}</p>
                      </div>
                      <button
                        onClick={() => navigate(`/view/rooms/${room._id}/issues`)}
                        className="flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <ClipboardList className="h-5 w-5 mr-1" />
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
