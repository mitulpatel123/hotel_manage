import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import DecryptedText from '../components/DecryptedText';

const PinScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [pin, setPin] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/verify-pin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pin }),
      });

      if (response.ok) {
        localStorage.setItem('viewPin', pin);
        toast.success('PIN verified successfully', {
          icon: '✅',
        });
        navigate('/view/dashboard');
      } else {
        toast.error('Invalid PIN', {
          icon: '❌',
        });
      }
    } catch (error) {
      toast.error('Error verifying PIN', {
        icon: '❌',
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && pin.length === 5) {
      handleSubmit(e);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative before:content-[''] before:absolute before:inset-0 before:bg-black/40"
      style={{ backgroundImage: 'url("/images/hotel-bg.jpg")' }}
    >
      <div className="relative z-10 mx-4 w-full max-w-sm sm:max-w-md">
        <div className="bg-white/95 p-5 sm:p-8 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.2)]">
          <div className="text-center mb-5 sm:mb-8">
            <img
              src="/images/logo.jpeg"
              alt="Hotel Logo"
              className="w-16 h-16 sm:w-24 sm:h-24 mx-auto object-contain mb-3 sm:mb-4 rounded-2xl shadow-lg"
            />

            <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
              <DecryptedText
                text="Best Western News Inn & Suites"
                animateOn="view"
                revealDirection="start"
                sequential={true}
                speed={60}
                maxIterations={10}
                useOriginalCharsOnly={true}
                className="text-gray-900 font-bold"
              />
            </h1>

            <p className="text-xs sm:text-base text-gray-600 mt-2">
              <DecryptedText
                text="Enter PIN to access the system"
                animateOn="hover"
                revealDirection="start"
                sequential={true}
                speed={60}
                maxIterations={10}
                useOriginalCharsOnly={true}
              />
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <input
                type="password"
                maxLength={5}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 text-center text-lg border rounded-lg focus:ring-2 focus:ring-[#013c80] focus:border-[#013c80] bg-white shadow-sm"
                placeholder="• • • • •"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={pin.length !== 5}
              className="w-full bg-[#013c80] text-white py-3 rounded-lg hover:bg-[#012b5c] transition duration-200 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
