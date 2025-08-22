import React, { useState, useEffect } from 'react';
import Icon from '../../components/ui/Icon';
import { supabase } from '../../lib/supabaseClient';

// A blank template for creating a new welcome book
const blankBookTemplate = {
  title: '',
  welcome_message: '',
  hero_image_url: 'https://placehold.co/1200x600/e2e8f0/a0aec0?text=Upload+a+Hero+Image',
  groupedSections: [
    {
      groupTitle: 'Arrival & Essentials',
      items: [
        { title: 'Welcome', icon_name: 'home', content: '', images: [] },
        { title: 'Meet Hosts', icon_name: 'users', content: '', images: [] },
        { title: 'Check-in / Check-out', icon_name: 'key', content: '', images: [] },
        { title: 'WiFi', icon_name: 'wifi', content: '', images: [] },
      ]
    },
    {
      groupTitle: 'About the Home',
      items: [
        { title: 'Amenities', icon_name: 'star', content: '', images: [] },
        { title: 'House Rules', icon_name: 'shield', content: '', images: [] },
        { title: 'Kitchen', icon_name: 'utensils', content: '', images: [] },
        { title: 'Pet Policy', icon_name: 'pawPrint', content: '', images: [] },
      ]
    },
    {
      groupTitle: 'Local Guide & Help',
      items: [
        { title: 'Emergency', icon_name: 'alertTriangle', content: '', images: [] },
        { title: 'Contact', icon_name: 'mail', content: '', images: [] },
        { title: 'Local Favourites', icon_name: 'mapPin', content: [], images: [] }
      ]
    }
  ]
};


// --- Main Page Component ---
const EditorPage = ({ slug, onSave, onExit }) => {
  const [bookData, setBookData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchFullPropertyData = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('wt_properties')
        .select(`*, wt_sections (*, wt_images (*)), wt_local_favourites (*)`)
        .eq('slug', slug)
        .single();

      if (error) {
        console.error('Error fetching property data:', error);
        setError('Failed to load property data.');
      } else {
        const formattedData = {
          ...data,
          groupedSections: [
            {
              groupTitle: 'Arrival & Essentials',
              items: data.wt_sections.filter(s => ['Welcome', 'Meet Hosts', 'Check-in / Check-out', 'WiFi'].includes(s.title))
            },
            {
              groupTitle: 'About the Home',
              items: data.wt_sections.filter(s => ['Amenities', 'House Rules', 'Kitchen', 'Pet Policy'].includes(s.title))
            },
            {
              groupTitle: 'Local Guide & Help',
              items: [
                ...data.wt_sections.filter(s => ['Emergency', 'Contact'].includes(s.title)),
                {
                  title: 'Local Favourites',
                  icon_name: 'mapPin',
                  content: data.wt_local_favourites,
                  images: []
                }
              ]
            }
          ]
        };
        setBookData(formattedData);
      }
      setLoading(false);
    };

    if (slug === 'new') {
      // If we are creating a new property, use the blank template
      setBookData(blankBookTemplate);
      setLoading(false);
    } else if (slug) {
      // Otherwise, fetch the existing property data
      fetchFullPropertyData();
    }
  }, [slug]);

  const handleSaveClick = async () => {
    setSaving(true);
    console.log("Saving data to Supabase...", bookData);
    await new Promise(resolve => setTimeout(resolve, 1000));
    onSave(bookData);
    setSaving(false);
  };

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


  if (loading) {
    return <div className="p-8 text-center">Loading editor...</div>;
  }
  
  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
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
                    <button onClick={handleSaveClick} disabled={saving} className="flex items-center justify-center bg-green-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-green-700 disabled:bg-green-300">
                        <Icon name="save" className="w-5 h-5 mr-2" />
                        {saving ? 'Saving...' : 'Save Changes'}
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
                        <textarea id="welcomeMessage" value={bookData.welcome_message} onChange={(e) => handleInputChange(e, 'welcome_message')} rows="3" className="mt-1 block w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:border-green-500 focus:ring-green-500"></textarea>
                    </div>
                    <div>
                        <label className="font-semibold text-gray-700">Hero Image</label>
                        <div className="mt-2 flex items-center space-x-4">
                            <img src={bookData.hero_image_url} alt="Hero" className="w-48 h-24 object-cover rounded-lg"/>
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
                                    <Icon name={section.icon_name} className="w-6 h-6 text-green-600" />
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
                                                    <img src={img.image_url} alt="" className="w-32 h-20 object-cover rounded-lg"/>
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
