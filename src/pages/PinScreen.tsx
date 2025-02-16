import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const PinScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [pin, setPin] = useState('');

  const verifyPin = async () => {
    // For demo purposes, using a hardcoded PIN
    const VALID_PIN = '47123';
    
    try {
      if (pin === VALID_PIN) {
        localStorage.setItem('viewPin', pin);
        toast.success('PIN verified successfully');
        // Check if we were trying to access login page
        const intendedPath = location.state?.from || '/view/dashboard';
        navigate(intendedPath);
      } else {
        toast.error('Invalid PIN');
        setPin('');
      }
    } catch (error) {
      toast.error('Failed to verify PIN');
      setPin('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && pin.length === 5) {
      verifyPin();
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative before:content-[''] before:absolute before:inset-0 before:bg-black/40" 
      style={{ backgroundImage: 'url("/images/hotel-bg.jpg")' }}
    >
      <div className="relative z-10 mx-4 w-full max-w-md">
        <div className="bg-white/95 p-6 sm:p-8 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.2)]">
          <div className="text-center mb-6 sm:mb-8">
            <img 
              src="/images/logo.jpeg" 
              alt="Hotel Logo" 
              className="w-20 h-20 sm:w-24 sm:h-24 mx-auto object-contain mb-3 sm:mb-4 rounded-2xl shadow-lg"
            />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Best Western News Inn & Suites</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-2">Enter PIN to access the system</p>
          </div>

          <div className="space-y-6">
            <div>
              <input
                type="password"
                maxLength={5}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 text-center text-lg border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                placeholder="• • • • •"
              />
            </div>

            <button
              onClick={verifyPin}
              disabled={pin.length !== 5}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-200 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Verify PIN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PinScreen;