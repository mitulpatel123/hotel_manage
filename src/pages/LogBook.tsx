import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Filter, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';

interface Log {
  _id: string;
  action: string;
  details: string;
  performedBy: {
    username: string;
  };
  timestamp: string;
}

const LogBook: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, actionFilter, userFilter]);

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (actionFilter) params.append('action', actionFilter);
      if (userFilter) params.append('user', userFilter);

      const url = `${import.meta.env.VITE_API_URL}/api/logs?${params.toString()}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }

      const data: Log[] = await response.json();
      setLogs(data);
    } catch (error) {
      toast.error('Failed to fetch logs');
    }
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setActionFilter('');
    setUserFilter('');
  };

  // Optionally map the raw action to more friendly text
  const formatAction = (action: string): string => {
    const actionMap: { [key: string]: string } = {
      create: 'Created',
      update: 'Updated',
      delete: 'Deleted'
    };
    return actionMap[action] || action;
  };

  const formatDate = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
                  <ClipboardList className="h-5 w-5 text-[#013c80]" />
                  <h1 className="text-xl font-semibold text-gray-900">Log Book</h1>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {showFilters && (
          <div className="mb-6 bg-white p-4 rounded-lg shadow">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Action Type</label>
                <input
                  type="text"
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  placeholder="e.g. create, update, delete"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">User</label>
                <input
                  type="text"
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  placeholder="Filter by username"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="divide-y divide-gray-200">
            {logs.map((log) => (
              <div key={log._id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {/* Simple avatar from first letter of username */}
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {log.performedBy.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {log.performedBy.username}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(log.timestamp)}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      <span className="font-medium">{formatAction(log.action)}:</span>{' '}
                      {log.details}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                No logs found
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LogBook;
