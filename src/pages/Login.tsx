import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import toast from 'react-hot-toast';
// Import DecryptedText
import DecryptedText from '../components/DecryptedText';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to login');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative before:content-[''] before:absolute before:inset-0 before:bg-black/40"
      style={{ backgroundImage: 'url("/images/hotel-bg.jpg")' }}
    >
      <div className="relative z-10 mx-4 w-full max-w-sm"> {/* ⬅️ Made the box smaller */}
        <div className="bg-white/95 p-5 sm:p-6 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.2)]">
          <div className="text-center mb-6">
            <img
              src="/images/logo.jpeg"
              alt="Hotel Logo"
              className="w-16 h-16 sm:w-20 sm:h-20 mx-auto object-contain mb-3 rounded-2xl shadow-lg"
            />

            {/* Heading with animation */}
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">
              <DecryptedText
                text="Best Western News Inn & Suites"
                animateOn="view"
                revealDirection="start"
                sequential
                speed={60}
                maxIterations={10}
                useOriginalCharsOnly
                className="text-gray-900 font-bold"
              />
            </h1>

            {/* Subheading */}
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              <DecryptedText
                text="Sign in to your account"
                animateOn="hover"
                revealDirection="start"
                sequential
                speed={60}
                maxIterations={10}
                useOriginalCharsOnly
              />
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1 relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) =>
                    setCredentials({ ...credentials, username: e.target.value })
                  }
                  className="pl-10 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#013c80] focus:border-[#013c80] bg-white shadow-sm"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
                className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#013c80] focus:border-[#013c80] bg-white shadow-sm"
                placeholder="Enter your password"
              />
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full bg-[#013c80] text-white py-3 rounded-lg hover:bg-[#012b5c] transition duration-200 font-medium shadow-sm"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
