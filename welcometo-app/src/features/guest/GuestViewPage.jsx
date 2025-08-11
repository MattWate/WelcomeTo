import React, { useState, useEffect } from 'react';

// --- Mock Data ---
// In a real application, you would fetch this data from Supabase
// based on the 'slug' prop.
const mockData = {
  'sunny-condo': {
    title: 'Welcome to the Sunny Beachside Condo!',
    welcomeMessage: 'We are so excited to have you! We hope you have a fantastic stay. Please make yourself at home and enjoy the sound of the waves.',
    heroImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop',
    groupedSections: [
      {
        groupTitle: 'Arrival & Essentials',
        items: [
          { title: 'Welcome', icon: 'home', content: 'Welcome to your home away from home! We\'ve put this guide together to help you find everything you need for a comfortable and enjoyable stay.', images: [] },
          { title: 'Meet Hosts', icon: 'users', content: 'We are Alex and Sam! We live nearby and are available if you need anything. We love this area and are happy to share our favorite spots with you.', images: [] },
          { title: 'Check-in / Check-out', icon: 'key', content: 'Check-in is after 3 PM. The door code is 1234. To disarm the alarm, enter 5678 on the keypad by the door.\n\nCheck-out is at 11 AM. Please load the dishwasher and take out the trash.', images: ['https://placehold.co/400x300/F3F4F6/9CA3AF?text=Alarm+Keypad', 'https://placehold.co/400x300/F3F4F6/9CA3AF?text=Door+Lock'] },
          { title: 'WiFi', icon: 'wifi', content: 'Network: BeachHouseNet\nPassword: sunshine2025', images: [] },
        ]
      },
      {
        groupTitle: 'About the Home',
        items: [
          { title: 'Amenities', icon: 'star', content: 'We provide fresh towels, linens, basic toiletries, and a fully equipped kitchen. You\'ll also find beach towels and chairs in the closet.', images: [] },
          { title: 'House Rules', icon: 'shield', content: 'Please be respectful of our neighbors and keep noise to a minimum after 10 PM. No smoking indoors. Have fun!', images: [] },
          { title: 'Kitchen', icon: 'utensils', content: 'The kitchen is fully equipped with an oven, stove, microwave, and dishwasher. Pots, pans, and utensils are in the cabinets.', images: ['https://placehold.co/400x300/F3F4F6/9CA3AF?text=Coffee+Maker', 'https://placehold.co/400x300/F3F4F6/9CA3AF?text=Oven+Controls'] },
          { title: 'Pet Policy', icon: 'pawPrint', content: 'We love furry friends! Please keep pets off the furniture and clean up after them. A fee may apply for any damages.', images: [] },
        ]
      },
      {
        groupTitle: 'Local Guide & Help',
        items: [
          { title: 'Local Favourites', icon: 'mapPin', content: [{ name: 'The Salty Pelican', description: 'Great for fresh seafood with a beautiful view of the harbor.', url: 'https://example.com' }, { name: 'The Coffee Bean', description: 'Our favorite spot for morning coffee and pastries. The almond croissants are a must-try!', url: 'https://example.com' }, { name: 'Sunset Beach Rentals', description: 'Rent paddleboards and kayaks here for a fun day on the water.', url: 'https://example.com' }], images: [] },
          { title: 'Emergency', icon: 'alertTriangle', content: 'In case of an emergency, please dial 911. The nearest hospital is Seaside General, 10 minutes away. A fire extinguisher is under the sink.', images: [] },
          { title: 'Contact', icon: 'mail', content: 'For non-urgent matters, you can reach us through the booking platform. For urgent issues, call or text us at 555-123-4567.', images: [] },
        ]
      }
    ]
  }
};

// --- Helper Components ---
// NOTE: In a real app, this Icon component should be moved to 'src/components/ui/Icon.jsx'
const Icon = ({ name, className }) => {
  const icons = {
    home: <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    key: <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0-3 3L12 7l3-3m-3 3a2 2 0 1 0 4 0 2 2 0 0 0-4 0z"/>,
    star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
    wifi: <><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></>,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
    utensils: <><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3z"/></>,
    mapPin: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>,
    alertTriangle: <><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
    pawPrint: <><circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10z"/></>,
    mail: <><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></>,
    chevronDown: <path d="m6 9 6 6 6-6" />,
    externalLink: <><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></>,
  };
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>{icons[name] || icons.home}</svg>;
};


// --- Main Page Component ---
const GuestViewPage = ({ slug }) => {
  const [openSection, setOpenSection] = useState('0-0'); // Open the first item of the first group by default
  const [book, setBook] = useState(null);

  useEffect(() => {
    // Simulate fetching data. In a real app, this would be an async call to Supabase.
    const data = mockData[slug];
    setBook(data);
  }, [slug]);

  const handleToggleSection = (id) => {
    setOpenSection(openSection === id ? null : id);
  };

  if (!book) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600">Welcome Book Not Found</h2>
            <p className="text-gray-600 mt-2">The link you followed may be broken or the page may have been removed.</p>
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
                                                  <Icon name={section.icon} className="w-7 h-7 text-green-600" />
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
