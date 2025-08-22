import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';

// --- Page Imports ---
import LandingPage from './features/landing/LandingPage.jsx';
import GuestViewPage from './features/guest/GuestViewPage.jsx';
import DashboardPage from './features/dashboard/DashboardPage.jsx';
import EditorPage from './features/editor/EditorPage.jsx';
import LoginPage from './features/auth/LoginPage.jsx';


function App() {
  const [view, setView] = useState('landing');
  const [page, setPage] = useState('loading');
  const [user, setUser] = useState(null);
  const [slug, setSlug] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      handleRouting(session?.user ?? null);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    handleRouting(user);
  }, [user]);

  const handleRouting = (currentUser) => {
    const path = window.location.pathname.split('/').filter(Boolean);
    const pageSlug = path[0];
    const action = path[1];

    if (!pageSlug) {
      if (currentUser) {
        setView('app');
        setPage('dashboard');
      } else {
        setView('landing');
      }
    } else if (pageSlug === 'editor' && action === 'new' && currentUser) {
      setView('app');
      setSlug('new');
      setPage('editor');
    } else {
      setView('app');
      if (action === 'edit' && currentUser) {
        setSlug(pageSlug);
        setPage('editor');
      } else {
        setSlug(pageSlug);
        setPage('guest');
      }
    }
  };

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

  const handleCreateNew = () => {
    window.history.pushState({}, '', '/editor/new');
    setSlug('new');
    setPage('editor');
  };

  const handleSave = (updatedData) => {
    console.log('Saving data...', updatedData);
    alert('Changes saved! (Check the console to see the data)');
    handleNavigateToDashboard();
  };

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
            onCreateNew={handleCreateNew} // Pass the new handler
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
