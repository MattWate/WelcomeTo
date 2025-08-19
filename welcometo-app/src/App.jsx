import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient'; // Import the Supabase client

// --- Page Imports ---
import LandingPage from './features/landing/LandingPage.jsx';
import GuestViewPage from './features/guest/GuestViewPage.jsx';
import DashboardPage from './features/dashboard/DashboardPage.jsx';
import EditorPage from './features/editor/EditorPage.jsx';
import LoginPage from './features/auth/LoginPage.jsx';


function App() {
  // --- State Management ---
  const [view, setView] = useState('landing');
  const [page, setPage] = useState('loading');
  const [user, setUser] = useState(null);
  const [slug, setSlug] = useState(null);

  // --- Supabase Auth Listener ---
  useEffect(() => {
    // Check for an initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      // Finished loading, now run the routing logic
      handleRouting(session?.user ?? null);
    };

    getSession();

    // Listen for changes in authentication state (login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Cleanup subscription on component unmount
    return () => subscription.unsubscribe();
  }, []);

  // --- Routing Logic ---
  const handleRouting = (currentUser) => {
    const path = window.location.pathname.split('/').filter(Boolean);
    const action = path[1];

    if (path.length === 0) {
      if (currentUser) {
        setView('app');
        setPage('dashboard');
      } else {
        setView('landing');
      }
    } else {
      setView('app');
      if (action === 'edit' && currentUser) {
        setSlug(path[0]);
        setPage('editor');
      } else {
        setSlug(path[0]);
        setPage('guest');
      }
    }
  };
  
  // Re-run routing logic whenever the user state changes
  useEffect(() => {
    handleRouting(user);
  }, [user]);


  // --- Event Handlers ---
  const handleLoginClick = () => {
    setView('app');
    setPage('login');
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setView('landing');
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
    console.log('Saving data...', updatedData);
    alert('Changes saved! (Check the console to see the data)');
    handleNavigateToDashboard();
  };

  // --- Render Logic ---
  const renderAppContent = () => {
    switch (page) {
      case 'login':
        return <LoginPage />;
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
      {view === 'landing' && !user ? (
        <LandingPage onLoginClick={handleLoginClick} />
      ) : (
        renderAppContent()
      )}
    </div>
  );
}

export default App;
