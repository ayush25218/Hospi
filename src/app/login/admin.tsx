'use client'; // Ye zaroori hai kyunki hum hooks istemal karenge

import { useParams } from 'next/navigation';
import { LuUser, LuLock, LuLogIn } from 'react-icons/lu';

export default function LoginPage() {
  const params = useParams();
  const role = params.role as string;

  // Function to capitalize the first letter (e.g., "doctor" -> "Doctor")
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl">
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
        <form className="space-y-6">
          {/* Email Input */}
          <div className="relative">
            <span className="absolute left-3 top-3.5 text-gray-400">
              <LuUser className="w-5 h-5" />
            </span>
            <input
              type="email"
              placeholder="Email address"
              required
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
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

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