import React, { useState, useEffect } from 'react';
import Icon from '../../components/ui/Icon';

// --- Mock Data ---
// In a real app, this would be fetched from Supabase based on the 'slug'.
// This represents the data for the property being edited.
const mockBookToEdit = {
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
          { title: 'Local Favourites', icon: 'mapPin', content: [{ name: 'The Salty Pelican', description: 'Great for fresh seafood with a beautiful view of the harbor.', url: 'https://example.com' }, { name: 'The Coffee Bean', description: 'Our favorite spot for morning coffee and pastries. The almond croissants are a must-try!', url: 'https://example.com' }], images: [] },
          { title: 'Emergency', icon: 'alertTriangle', content: 'In case of an emergency, please dial 911. The nearest hospital is Seaside General, 10 minutes away. A fire extinguisher is under the sink.', images: [] },
          { title: 'Contact', icon: 'mail', content: 'For non-urgent matters, you can reach us through the booking platform. For urgent issues, call or text us at 555-123-4567.', images: [] },
        ]
      }
    ]
  }
};

// --- Main Page Component ---
const EditorPage = ({ slug, onSave, onExit }) => {
  const [bookData, setBookData] = useState(null);

  useEffect(() => {
    // Simulate fetching the data for the property being edited.
    setBookData(mockBookToEdit[slug]);
  }, [slug]);

  // --- Handlers for form changes ---
  const handleInputChange = (e, field) => {
    setBookData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSectionChange = (groupIndex, itemIndex, value) => {
    const updatedData = { ...bookData };
    updatedData.groupedSections[groupIndex].items[itemIndex].content = value;
    setBookData(updatedData);
  };

  const handleFavouriteChange = (groupIndex, itemIndex, favIndex, field, value) => {
    const updatedData = { ...bookData };
    updatedData.groupedSections[groupIndex].items[itemIndex].content[favIndex][field] = value;
    setBookData(updatedData);
  };

  const addFavourite = (groupIndex, itemIndex) => {
    const updatedData = { ...bookData };
    updatedData.groupedSections[groupIndex].items[itemIndex].content.push({ name: '', description: '', url: '' });
    setBookData(updatedData);
  };

  const removeFavourite = (groupIndex, itemIndex, favIndex) => {
    const updatedData = { ...bookData };
    updatedData.groupedSections[groupIndex].items[itemIndex].content.splice(favIndex, 1);
    setBookData(updatedData);
  };

  if (!bookData) {
    return <div className="p-8">Loading editor...</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
        <header className="bg-white shadow-md sticky top-0 z-10">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <Icon name="home" className="w-7 h-7 text-green-600" />
                    <span className="text-2xl font-bold text-gray-800">WelcomeTo Editor</span>
                </div>
                <div className="flex items-center space-x-4">
                    <button onClick={onExit} className="font-semibold text-gray-600 hover:text-gray-900">
                        Exit
                    </button>
                    <button onClick={() => onSave(bookData)} className="flex items-center justify-center bg-green-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-green-700">
                        <Icon name="save" className="w-5 h-5 mr-2" />
                        Save Changes
                    </button>
                </div>
            </div>
        </header>

        <main className="container mx-auto p-6 md:p-8">
            <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Main Details</h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="title" className="font-semibold text-gray-700">Property Title</label>
                        <input type="text" id="title" value={bookData.title} onChange={(e) => handleInputChange(e, 'title')} className="mt-1 block w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:border-green-500 focus:ring-green-500"/>
                    </div>
                    <div>
                        <label htmlFor="welcomeMessage" className="font-semibold text-gray-700">Welcome Message</label>
                        <textarea id="welcomeMessage" value={bookData.welcomeMessage} onChange={(e) => handleInputChange(e, 'welcomeMessage')} rows="3" className="mt-1 block w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:border-green-500 focus:ring-green-500"></textarea>
                    </div>
                    <div>
                        <label className="font-semibold text-gray-700">Hero Image</label>
                        <div className="mt-2 flex items-center space-x-4">
                            <img src={bookData.heroImage} alt="Hero" className="w-48 h-24 object-cover rounded-lg"/>
                            <button className="flex items-center bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300">
                                <Icon name="upload" className="w-5 h-5 mr-2" />
                                Upload New
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {bookData.groupedSections.map((group, groupIndex) => (
                <div key={groupIndex} className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-500 mb-4 border-b pb-2">{group.groupTitle}</h2>
                    <div className="space-y-6">
                        {group.items.map((section, itemIndex) => (
                            <div key={itemIndex} className="bg-white p-6 rounded-xl shadow-lg">
                                <div className="flex items-center space-x-3 mb-4">
                                    <Icon name={section.icon} className="w-6 h-6 text-green-600" />
                                    <h3 className="text-xl font-bold text-gray-800">{section.title}</h3>
                                </div>

                                {Array.isArray(section.content) ? (
                                    <div className="space-y-4">
                                        {section.content.map((item, favIndex) => (
                                            <div key={favIndex} className="border rounded-lg p-4 space-y-3 relative">
                                                <button onClick={() => removeFavourite(groupIndex, itemIndex, favIndex)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
                                                    <Icon name="trash" className="w-5 h-5" />
                                                </button>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-600">Name</label>
                                                    <input type="text" value={item.name} onChange={(e) => handleFavouriteChange(groupIndex, itemIndex, favIndex, 'name', e.target.value)} className="mt-1 block w-full px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-md"/>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-600">Description</label>
                                                    <input type="text" value={item.description} onChange={(e) => handleFavouriteChange(groupIndex, itemIndex, favIndex, 'description', e.target.value)} className="mt-1 block w-full px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-md"/>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-600">URL</label>
                                                    <input type="text" value={item.url} onChange={(e) => handleFavouriteChange(groupIndex, itemIndex, favIndex, 'url', e.target.value)} className="mt-1 block w-full px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-md"/>
                                                </div>
                                            </div>
                                        ))}
                                        <button onClick={() => addFavourite(groupIndex, itemIndex)} className="flex items-center text-green-600 font-semibold px-4 py-2 rounded-lg hover:bg-green-50">
                                            <Icon name="plus" className="w-5 h-5 mr-2" />
                                            Add Favourite
                                        </button>
                                    </div>
                                ) : (
                                    <textarea value={section.content} onChange={(e) => handleSectionChange(groupIndex, itemIndex, e.target.value)} rows="4" className="block w-full px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-md"></textarea>
                                )}

                                {section.images !== undefined && (
                                    <div className="mt-4">
                                        <label className="font-semibold text-gray-700">Images</label>
                                        <div className="mt-2 flex items-center flex-wrap gap-4">
                                            {section.images.map((img, imgIndex) => (
                                                <div key={imgIndex} className="relative">
                                                    <img src={img} alt="" className="w-32 h-20 object-cover rounded-lg"/>
                                                    <button className="absolute -top-2 -right-2 bg-white rounded-full p-1 text-red-500 shadow-md hover:bg-red-50">
                                                        <Icon name="trash" className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                            <button className="flex items-center justify-center w-32 h-20 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 hover:text-gray-700">
                                                <Icon name="upload" className="w-6 h-6" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </main>
    </div>
  );
};

export default EditorPage;
