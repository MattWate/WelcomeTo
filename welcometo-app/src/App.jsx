import React, { useState, useEffect } from 'react';

// --- Page Imports ---
import GuestViewPage from './features/guest/GuestViewPage.jsx';
import DashboardPage from './features/dashboard/DashboardPage.jsx';
import EditorPage from './features/editor/EditorPage.jsx';

// --- Placeholder Page Imports ---
// This will be the last component we build.
const LoginPage = ({ onLogin }) => (
    <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-xl">
            <h1 className="text-3xl font-bold mb-4">WelcomeTo</h1>
            <p className="text-gray-600 mb-6">Host Login</p>
            <button 
                onClick={onLogin} 
                className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700"
            >
                Simulate Login
            </button>
        </div>
    </div>
);


function App() {
  // --- State Management ---
  const [page, setPage] = useState('loading'); // loading, login, dashboard, editor, guest
  const [user, setUser] = useState(null); // Will hold user data from Supabase
  const [slug, setSlug] = useState(null); // The unique URL slug for a property

  // --- Routing Logic ---
  useEffect(() => {
    const path = window.location.pathname.split('/').filter(Boolean);
    const action = path[1]; // e.g., 'edit'

    if (path.length === 0) {
      // Root URL: /
      setPage(user ? 'dashboard' : 'login');
    } else if (action === 'edit' && user) {
      // URL: /some-slug/edit
      setSlug(path[0]);
      setPage('editor');
    } else {
      // URL: /some-slug
      setSlug(path[0]);
      setPage('guest');
    }
  }, [user]); // Re-run this logic when the user logs in or out.

  // --- Event Handlers ---
  const handleLogin = () => {
    setUser({ name: 'Alex Miller' }); // Simulate a logged-in user
    window.history.pushState({}, '', '/');
    setPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    window.history.pushState({}, '', '/');
    setPage('login');
  };

  const handleNavigateToDashboard = () => {
    window.history.pushState({}, '', '/');
    setPage('dashboard');
  };

  const handleSelectProperty = (propertySlug) => {
    window.history.pushState({}, '', `/${propertySlug}`);
    setSlug(propertySlug);
    setPage('guest');
  };
  
  const handleEditProperty = (propertySlug) => {
    window.history.pushState({}, '', `/${propertySlug}/edit`);
    setSlug(propertySlug);
    setPage('editor');
  };

  const handleSave = (updatedData) => {
    console.log('Saving data...', updatedData); // In a real app, this would send data to Supabase.
    alert('Changes saved! (Check the console to see the data)');
    handleNavigateToDashboard();
  };

  // --- Render Logic ---
  const renderPage = () => {
    switch (page) {
      case 'login':
        return <LoginPage onLogin={handleLogin} />;
      case 'dashboard':
        return (
          <DashboardPage 
            user={user}
            onLogout={handleLogout}
            onSelectProperty={handleSelectProperty}
            onEditProperty={handleEditProperty}
          />
        );
      case 'editor':
        return <EditorPage slug={slug} onSave={handleSave} onExit={handleNavigateToDashboard} />;
      case 'guest':
        return <GuestViewPage slug={slug} />;
      case 'loading':
      default:
        return <div className="p-8">Loading...</div>;
    }
  };

  return (
    <div>
      {renderPage()}
    </div>
  );
}

export default App;
