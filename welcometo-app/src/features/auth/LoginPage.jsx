import React, { useState } from 'react';
import Icon from '../../components/ui/Icon';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('alex@host.com'); // Pre-filled for demo
  const [password, setPassword] = useState('password'); // Pre-filled for demo

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you'd send the email and password to Supabase here.
    // For now, we just call the onLogin function passed from App.jsx.
    onLogin();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl">
        <div className="text-center">
            <div className="flex justify-center items-center mb-4">
                 <Icon name="home" className="w-10 h-10 text-green-600" />
                 <span className="text-3xl font-bold text-gray-800 ml-2">WelcomeTo</span>
            </div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Host Sign In
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Access your property dashboard.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input 
                id="email-address" 
                name="email" 
                type="email" 
                autoComplete="email" 
                required 
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm" 
                placeholder="Email address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" class="sr-only">Password</label>
              <input 
                id="password" 
                name="password" 
                type="password" 
                autoComplete="current-password" 
                required 
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm" 
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <div>
            <button 
              type="submit" 
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
