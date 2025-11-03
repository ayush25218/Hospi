'use client'; // This is required for hooks like useState and useRouter

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LuUser, LuLock, LuLogIn, } from 'react-icons/lu';
export default function LoginPage() {
  const params = useParams();
  const router = useRouter(); // Page redirect karne ke liye
  const role = params.role as string;

  // Form inputs ko store karne ke liye state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // --- Yahaan DUMMY ID aur PASSWORD set karein ---
  const DUMMY_EMAIL = 'admin@hospi.com';
  const DUMMY_PASSWORD = 'admin123';
  // ----------------------------------------------

  // Function to capitalize the first letter (e.g., "doctor" -> "Doctor")
  const capitalize = (s: string) => {
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  // Jab form submit hoga toh yeh function chalega
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Page ko reload hone se rokein
    setError(''); // Puraana error saaf karein

    // --- Yahaan DUMMY LOGIC check ho raha hai ---
    if (email === DUMMY_EMAIL && password === DUMMY_PASSWORD) {
      // Login successful! Dashboard par redirect karein.
      // Yahi woh step hai jo "sidebar open karega"
      router.push('/dashboard');
    } else {
      // Login fail hua
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl">
        {/* --- Header --- */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-600">Hospi!</h1>
          <h2 className="mt-2 text-2xl font-semibold text-gray-800">
            {capitalize(role)} Login
          </h2>
          <p className="text-gray-500">
            Welcome back! Please enter your credentials.
          </p>
        </div>

        {/* --- Login Form --- */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Email Input */}
          <div className="relative">
            <span className="absolute left-3 top-3.5 text-gray-400">
              <LuUser className="w-5 h-5" />
            </span>
            <input
              type="email"
              placeholder="Email or Username"
              required
              value={email} // State se connect karein
              onChange={(e) => setEmail(e.target.value)} // State update karein
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <span className="absolute left-3 top-3.5 text-gray-400">
              <LuLock className="w-5 h-5" />
            </span>
            <input
              type="password"
              placeholder="Password"
              required
              value={password} // State se connect karein
              onChange={(e) => setPassword(e.target.value)} // State update karein
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* --- Error Message --- */}
          {error && (
            <div className="flex items-center p-3 text-sm text-red-700 bg-red-100 rounded-lg">
              <div className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center py-3 px-4 font-semibold text-white 
                       bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none 
                       focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <LuLogIn className="w-5 h-5 mr-2" />
            Login
          </button>
        </form>
      </div>
    </div>
  );
}