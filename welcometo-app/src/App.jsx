import React, { useState, useEffect } from 'react';

// --- Page Imports ---
// We've replaced the placeholder with the real component.
import GuestViewPage from './features/guest/GuestViewPage.jsx';

// --- Placeholder Page Imports ---
// These will be replaced later.
const LoginPage = () => <div className="p-8">Login Page</div>;
const DashboardPage = () => <div className="p-8">Dashboard Page</div>;
const EditorPage = () => <div className="p-8">Editor Page</div>;


function App() {
  // --- State Management ---
  const [page, setPage] = useState('loading'); // loading, login, dashboard, editor, guest
  const [user, setUser] = useState(null); // Will hold user data from Supabase
  const [slug, setSlug] = useState(null); // The unique URL slug for a property

  // --- Routing Effect ---
  useEffect(() => {
    const path = window.location.pathname.split('/').filter(Boolean);
    
    if (path.length === 0) {
      // For now, we default to a guest view for the demo.
      // Later, this will show the login page.
      setSlug('sunny-condo'); // Default slug for the demo
      setPage('guest');
    } else {
      // A guest is viewing a specific welcome book
      setSlug(path[0]);
      setPage('guest');
    }
  }, [user]);

  // --- Render Logic ---
  const renderPage = () => {
    switch (page) {
      case 'login':
        return <LoginPage />;
      case 'dashboard':
        return <DashboardPage />;
      case 'editor':
        return <EditorPage />;
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
