import React, { useState, useEffect } from 'react';

// --- Page Imports ---
import LandingPage from './features/landing/LandingPage.jsx';
import GuestViewPage from './features/guest/GuestViewPage.jsx';
import DashboardPage from './features/dashboard/DashboardPage.jsx';
import EditorPage from './features/editor/EditorPage.jsx';
import LoginPage from './features/auth/LoginPage.jsx';


function App() {
  // --- State Management ---
  const [view, setView] = useState('landing'); // 'landing' or 'app'
  const [page, setPage] = useState('loading'); // loading, login, dashboard, editor, guest
  const [user, setUser] = useState(null); // Will hold user data from Supabase
  const [slug, setSlug] = useState(null); // The unique URL slug for a property

  // --- Routing Logic ---
  useEffect(() => {
    const path = window.location.pathname.split('/').filter(Boolean);
    const action = path[1]; // e.g., 'edit'

    if (path.length === 0) {
      // Root URL: /
      // If user is logged in, go to app dashboard, otherwise show landing page.
      if (user) {
        setView('app');
        setPage('dashboard');
      } else {
        setView('landing');
      }
    } else {
      // A guest is viewing a welcome book, so go directly to the app view.
      setView('app');
      setSlug(path[0]);
      setPage('guest');
    }
  }, [user]); // Re-run this logic when the user logs in or out.

  // --- Event Handlers ---
  const handleLoginClick = () => {
    setView('app');
    setPage('login');
  };
  
  const handleLogin = () => {
    setUser({ name: 'Alex Miller' }); // Simulate a logged-in user
    setView('app');
    setPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setView('landing'); // Go back to landing page on logout
    window.history.pushState({}, '', '/');
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
  const renderAppContent = () => {
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
      {view === 'landing' ? (
        <LandingPage onLoginClick={handleLoginClick} />
      ) : (
        renderAppContent()
      )}
    </div>
  );
}

export default App;
