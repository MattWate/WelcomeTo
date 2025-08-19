import React, { useState, useEffect } from 'react';
import Icon from '../../components/ui/Icon';
import { supabase } from '../../lib/supabaseClient'; // Import the Supabase client

// --- Main Page Component ---
const GuestViewPage = ({ slug }) => {
  const [openSection, setOpenSection] = useState('0-0');
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWelcomeBook = async () => {
      setLoading(true);
      setError(null);

      // Fetch data from Supabase for the property matching the slug
      const { data, error } = await supabase
        .from('wt_properties')
        .select(`
          title,
          welcome_message,
          hero_image_url,
          wt_sections (
            title,
            icon_name,
            content,
            display_order,
            wt_images ( image_url, caption )
          ),
          wt_local_favourites ( name, description, url, display_order )
        `)
        .eq('slug', slug)
        .single(); // .single() expects only one result

      if (error) {
        console.error('Error fetching welcome book:', error);
        setError('Could not find the requested welcome book.');
      } else if (data) {
        // --- Data Transformation ---
        // We need to re-shape the data from Supabase to match the component's expected structure.
        const formattedData = {
          title: data.title,
          welcomeMessage: data.welcome_message,
          heroImage: data.hero_image_url,
          groupedSections: [
            {
              groupTitle: 'Arrival & Essentials',
              items: data.wt_sections
                .filter(s => ['Welcome', 'Meet Hosts', 'Check-in / Check-out', 'WiFi'].includes(s.title))
                .sort((a, b) => a.display_order - b.display_order)
                .map(s => ({ ...s, images: s.wt_images.map(i => i.image_url) }))
            },
            {
              groupTitle: 'About the Home',
              items: data.wt_sections
                .filter(s => ['Amenities', 'House Rules', 'Kitchen', 'Pet Policy'].includes(s.title))
                .sort((a, b) => a.display_order - b.display_order)
                .map(s => ({ ...s, images: s.wt_images.map(i => i.image_url) }))
            },
            {
              groupTitle: 'Local Guide & Help',
              items: [
                ...data.wt_sections.filter(s => ['Emergency', 'Contact'].includes(s.title)),
                {
                  title: 'Local Favourites',
                  icon: 'mapPin',
                  content: data.wt_local_favourites.sort((a, b) => a.display_order - b.display_order),
                  images: []
                }
              ].sort((a, b) => (a.title === 'Local Favourites' ? 0 : 1) - (b.title === 'Local Favourites' ? 0 : 1)) // A simple sort to keep order
            }
          ]
        };
        setBook(formattedData);
      }
      setLoading(false);
    };

    if (slug) {
      fetchWelcomeBook();
    }
  }, [slug]);

  const handleToggleSection = (id) => {
    setOpenSection(openSection === id ? null : id);
  };

  if (loading) {
    return <div className="p-8 text-center">Loading Welcome Book...</div>;
  }

  if (error || !book) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600">Welcome Book Not Found</h2>
            <p className="text-gray-600 mt-2">{error || 'The link you followed may be broken or the page may have been removed.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <div className="max-w-4xl mx-auto">
          <header className="py-8 px-4 text-center">
               <div className="flex items-center justify-center mx-auto mb-6 space-x-3 text-gray-700">
                  <Icon name="home" className="w-8 h-8" />
                  <span className="text-3xl font-bold">WelcomeTo</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 tracking-tight">{book.title}</h1>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">{book.welcomeMessage}</p>
          </header>
          
          <div className="px-4 md:px-6 mb-8">
              <img src={book.heroImage} alt={book.title} className="w-full h-auto object-cover rounded-2xl shadow-xl" />
          </div>

          <main className="p-4 md:px-6">
              <div className="space-y-8">
                  {book.groupedSections.map((group, groupIndex) => (
                      <div key={groupIndex}>
                          <h2 className="text-2xl font-semibold text-gray-500 mb-4 border-b pb-2">{group.groupTitle}</h2>
                          <div className="space-y-4">
                              {group.items.map((section, itemIndex) => {
                                  const sectionId = `${groupIndex}-${itemIndex}`;
                                  const isOpen = openSection === sectionId;
                                  return (
                                      <div key={sectionId} className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300">
                                          <button
                                              onClick={() => handleToggleSection(sectionId)}
                                              className="w-full flex justify-between items-center p-6 text-left"
                                          >
                                              <div className="flex items-center space-x-4">
                                                  <Icon name={section.icon_name || section.icon} className="w-7 h-7 text-green-600" />
                                                  <h3 className="text-2xl font-bold text-gray-800">{section.title}</h3>
                                              </div>
                                              <Icon
                                                  name="chevronDown"
                                                  className={`w-6 h-6 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                                              />
                                          </button>
                                          <div
                                              className={`transition-all duration-500 ease-in-out grid ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                                          >
                                              <div className="overflow-hidden">
                                                  <div className="p-6 pt-0 pl-16">
                                                      {Array.isArray(section.content) ? (
                                                          <div className="space-y-4">
                                                              {section.content.map((item, itemIndex) => (
                                                                  <div key={itemIndex} className="border-b border-gray-200 pb-4 last:border-b-0">
                                                                      <h4 className="font-bold text-lg text-gray-800">{item.name}</h4>
                                                                      <p className="text-gray-600 mt-1">{item.description}</p>
                                                                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800 font-semibold text-sm mt-2 inline-flex items-center">
                                                                          Visit Website
                                                                          <Icon name="externalLink" className="w-4 h-4 ml-1" />
                                                                      </a>
                                                                  </div>
                                                              ))}
                                                          </div>
                                                      ) : (
                                                          <p className="text-gray-700 whitespace-pre-line leading-relaxed">{section.content}</p>
                                                      )}
                                                      
                                                      {section.images && section.images.length > 0 && (
                                                          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                              {section.images.map((img, imgIndex) => (
                                                                  <img key={imgIndex} src={img} alt={`${section.title} ${imgIndex + 1}`} className="w-full h-auto object-cover rounded-lg" />
                                                              ))}
                                                          </div>
                                                      )}
                                                  </div>
                                              </div>
                                          </div>
                                      </div>
                                  );
                              })}
                          </div>
                      </div>
                  ))}
              </div>
          </main>
          <footer className="text-center py-10 text-gray-500 text-sm">
              Powered by WelcomeTo
          </footer>
      </div>
    </div>
  );
};

export default GuestViewPage;
