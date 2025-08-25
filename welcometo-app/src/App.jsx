import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';

// --- Page Imports ---
import LandingPage from './features/landing/LandingPage.jsx';
import GuestViewPage from './features/guest/GuestViewPage.jsx';
import DashboardPage from './features/dashboard/DashboardPage.jsx';
import EditorPage from './features/editor/EditorPage.jsx';
import LoginPage from './features/auth/LoginPage.jsx';
import GuestViewPage from "./editor/guest/GuestViewPage";

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

  // --- Main Save Function ---
  const handleSave = async (bookData) => {
    if (!user) {
      alert("You must be logged in to save.");
      return;
    }

    try {
      // Step 1: Prepare and save the main property data
      const propertySlug = bookData.slug || bookData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      const propertyPayload = {
        user_id: user.id,
        title: bookData.title,
        slug: propertySlug,
        welcome_message: bookData.welcome_message,
        hero_image_url: bookData.hero_image_url,
      };
      if (bookData.id) {
        propertyPayload.id = bookData.id;
      }

      const { data: property, error: propError } = await supabase
        .from('wt_properties')
        .upsert(propertyPayload)
        .select()
        .single();

      if (propError) throw propError;

      // Step 2: Prepare and save the sections and their images
      const allSections = bookData.groupedSections.flatMap(group => group.items);
      
      for (const section of allSections) {
        if (Array.isArray(section.content)) continue; // Skip 'Local Favourites' for now

        const sectionPayload = {
          property_id: property.id,
          title: section.title,
          icon_name: section.icon_name,
          content: section.content,
          display_order: allSections.indexOf(section),
        };
        if (section.id) {
          sectionPayload.id = section.id;
        }
        
        const { data: savedSection, error: sectionError } = await supabase.from('wt_sections').upsert(sectionPayload).select().single();
        if (sectionError) throw sectionError;

        // Now handle images for this section
        if (section.wt_images) {
            // Delete images that are no longer present
            const existingImageUrls = section.wt_images.map(img => img.image_url);
            const { data: currentImages, error: fetchError } = await supabase.from('wt_images').select('image_url').eq('section_id', savedSection.id);
            if(fetchError) throw fetchError;

            const imagesToDelete = currentImages.filter(img => !existingImageUrls.includes(img.image_url));
            if (imagesToDelete.length > 0) {
                const { error: deleteImgError } = await supabase.from('wt_images').delete().in('image_url', imagesToDelete.map(i => i.image_url));
                if (deleteImgError) throw deleteImgError;
            }

            // Upsert current images
            const imagesToSave = section.wt_images.map((img, index) => ({
                id: img.id,
                section_id: savedSection.id,
                image_url: img.image_url,
                caption: img.caption,
                display_order: index
            }));
            if (imagesToSave.length > 0) {
                const { error: imgError } = await supabase.from('wt_images').upsert(imagesToSave);
                if (imgError) throw imgError;
            }
        }
      }

      // Step 3: Prepare and save the local favourites
      const favouritesSection = allSections.find(item => item.title === 'Local Favourites');
      if (favouritesSection) {
        const { error: deleteFavError } = await supabase.from('wt_local_favourites').delete().eq('property_id', property.id);
        if (deleteFavError) throw deleteFavError;

        const favouritesToSave = favouritesSection.content.map((fav, index) => ({
          property_id: property.id,
          name: fav.name,
          description: fav.description,
          url: fav.url,
          display_order: index,
        }));
        
        if (favouritesToSave.length > 0) {
            const { error: favError } = await supabase.from('wt_local_favourites').insert(favouritesToSave);
            if (favError) throw favError;
        }
      }

      alert('Property saved successfully!');
      handleNavigateToDashboard();

    } catch (error) {
      console.error('Error saving property:', error);
      alert(`Error: ${error.message}`);
    }
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
            onCreateNew={handleCreateNew}
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

