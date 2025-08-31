import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/ui/Icon.jsx';
import { supabase } from '../../lib/supabaseClient.js';

const blankBookTemplate = {
  title: '',
  welcome_message: '',
  hero_image_url: 'https://placehold.co/1200x600/e2e8f0/a0aec0?text=Upload+a+Hero+Image',
  groupedSections: [
    {
      groupTitle: 'Arrival & Essentials',
      items: [
        { title: 'Welcome', icon_name: 'home', content: '', wt_images: [] },
        { title: 'Meet Hosts', icon_name: 'users', content: '', wt_images: [] },
        { title: 'Check-in / Check-out', icon_name: 'key', content: '', wt_images: [] },
        { title: 'WiFi', icon_name: 'wifi', content: '', wt_images: [] },
      ]
    },
    {
      groupTitle: 'About the Home',
      items: [
        { title: 'Amenities', icon_name: 'star', content: '', wt_images: [] },
        { title: 'House Rules', icon_name: 'shield', content: '', wt_images: [] },
        { title: 'Kitchen', icon_name: 'utensils', content: '', wt_images: [] },
        { title: 'Pet Policy', icon_name: 'pawPrint', content: '', wt_images: [] },
      ]
    },
    {
      groupTitle: 'Local Guide & Help',
      items: [
        { title: 'Emergency', icon_name: 'alertTriangle', content: '', wt_images: [] },
        { title: 'Contact', icon_name: 'mail', content: '', wt_images: [] },
        { title: 'Local Favourites', icon_name: 'mapPin', content: [], wt_images: [] }
      ]
    }
  ]
};

const EditorPage = ({ slug, user, onSave, onExit }) => {
  const [bookData, setBookData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const heroImageInputRef = useRef(null);
  const sectionImageInputRef = useRef(null);
  const currentSectionForUpload = useRef(null);

  useEffect(() => {
    const fetchFullPropertyData = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('wt_properties')
        .select(`*, wt_sections (*, wt_images (*)), wt_local_favourites (*)`)
        .eq('slug', slug)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found, which is ok for a new slug
        console.error('Error fetching property data:', error);
        setError('Failed to load property data.');
      } else if (data) {
        const sections = data.wt_sections || [];
        const favourites = data.wt_local_favourites || [];
        
        const formattedData = {
          ...data,
          groupedSections: [
            {
              groupTitle: 'Arrival & Essentials',
              items: blankBookTemplate.groupedSections[0].items.map(templateItem => 
                sections.find(s => s.title === templateItem.title) || templateItem
              )
            },
            {
              groupTitle: 'About the Home',
              items: blankBookTemplate.groupedSections[1].items.map(templateItem => 
                sections.find(s => s.title === templateItem.title) || templateItem
              )
            },
            {
              groupTitle: 'Local Guide & Help',
              items: [
                ...(blankBookTemplate.groupedSections[2].items.map(templateItem => 
                  sections.find(s => s.title === templateItem.title) || templateItem
                ).filter(item => item.title !== 'Local Favourites')),
                {
                  title: 'Local Favourites',
                  icon_name: 'mapPin',
                  content: favourites,
                  wt_images: []
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
      setBookData(blankBookTemplate);
      setLoading(false);
    } else if (slug) {
      fetchFullPropertyData();
    }
  }, [slug]);

  const handleImageUpload = async (file) => {
    if (!file || !user) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`; // Create a user-specific folder path

    const { error: uploadError } = await supabase.storage
      .from('property_images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      alert(`Failed to upload image: ${uploadError.message}`);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from('property_images')
      .getPublicUrl(filePath);

    const publicUrl = data.publicUrl;

    if (currentSectionForUpload.current === 'hero') {
      setBookData(prev => ({ ...prev, hero_image_url: publicUrl }));
    } else {
      const { groupIndex, itemIndex } = currentSectionForUpload.current;
      setBookData(prev => {
        const updatedData = { ...prev };
        const newImage = { image_url: publicUrl, caption: '' };
        if (!updatedData.groupedSections[groupIndex].items[itemIndex].wt_images) {
            updatedData.groupedSections[groupIndex].items[itemIndex].wt_images = [];
        }
        updatedData.groupedSections[groupIndex].items[itemIndex].wt_images.push(newImage);
        return updatedData;
      });
    }
    setUploading(false);
  };
  
  const handleImageDelete = async (imageUrl, groupIndex, itemIndex, imgIndex) => {
      const filePath = `${user.id}/${imageUrl.split('/').pop()}`;
      
      const { error } = await supabase.storage.from('property_images').remove([filePath]);

      if (error) {
          console.error('Error deleting image:', error);
          alert(`Failed to delete image: ${error.message}`);
          return;
      }
      
      setBookData(prev => {
        const updatedData = { ...prev };
        updatedData.groupedSections[groupIndex].items[itemIndex].wt_images.splice(imgIndex, 1);
        return updatedData;
      });
  };


  const handleSaveClick = async () => {
    setSaving(true);
    await onSave(bookData);
    setSaving(false);
  };

  const handleInputChange = (e, field) => {
    setBookData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSectionChange = (groupIndex, itemIndex, value) => {
    setBookData(prev => {
      const updatedData = { ...prev };
      updatedData.groupedSections[groupIndex].items[itemIndex].content = value;
      return updatedData;
    });
  };
  
  const handleFavouriteChange = (groupIndex, itemIndex, favIndex, field, value) => {
    setBookData(prev => {
      const updatedData = { ...prev };
      updatedData.groupedSections[groupIndex].items[itemIndex].content[favIndex][field] = value;
      return updatedData;
    });
  };

  const addFavourite = (groupIndex, itemIndex) => {
    setBookData(prev => {
      const updatedData = { ...prev };
      updatedData.groupedSections[groupIndex].items[itemIndex].content.push({ name: '', description: '', url: '' });
      return updatedData;
    });
  };

  const removeFavourite = (groupIndex, itemIndex, favIndex) => {
     setBookData(prev => {
      const updatedData = { ...prev };
      updatedData.groupedSections[groupIndex].items[itemIndex].content.splice(favIndex, 1);
      return updatedData;
     });
  };

  if (loading || !bookData) {
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
                    <button onClick={handleSaveClick} disabled={saving || uploading} className="flex items-center justify-center bg-green-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-green-700 disabled:bg-green-300">
                        <Icon name="save" className="w-5 h-5 mr-2" />
                        {saving ? 'Saving...' : (uploading ? 'Uploading...' : 'Save Changes')}
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
                            <input type="file" ref={heroImageInputRef} onChange={(e) => handleImageUpload(e.target.files[0])} style={{ display: 'none' }} accept="image/*" />
                            <button onClick={() => { currentSectionForUpload.current = 'hero'; heroImageInputRef.current.click(); }} disabled={uploading} className="flex items-center bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 disabled:bg-gray-100">
                                <Icon name="upload" className="w-5 h-5 mr-2" />
                                {uploading ? 'Uploading...' : 'Upload New'}
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
                            <div key={section.title} className="bg-white p-6 rounded-xl shadow-lg">
                                <div className="flex items-center space-x-3 mb-4">
                                    <Icon name={section.icon_name} className="w-6 h-6 text-green-600" />
                                    <h3 className="text-xl font-bold text-gray-800">{section.title}</h3>
                                </div>

                                {Array.isArray(section.content) ? (
                                    <div className="space-y-4">
                                        {section.content.map((item, favIndex) => (
                                            <div key={item.id || favIndex} className="border rounded-lg p-4 space-y-3 relative">
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
                                    <textarea value={section.content || ''} onChange={(e) => handleSectionChange(groupIndex, itemIndex, e.target.value)} rows="4" className="block w-full px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-md"></textarea>
                                )}

                                {section.wt_images !== undefined && (
                                    <div className="mt-4">
                                        <label className="font-semibold text-gray-700">Images</label>
                                        <div className="mt-2 flex items-center flex-wrap gap-4">
                                            {section.wt_images.map((img, imgIndex) => (
                                                <div key={img.id || imgIndex} className="relative">
                                                    <img src={img.image_url} alt="" className="w-32 h-20 object-cover rounded-lg"/>
                                                    <button onClick={() => handleImageDelete(img.image_url, groupIndex, itemIndex, imgIndex)} className="absolute -top-2 -right-2 bg-white rounded-full p-1 text-red-500 shadow-md hover:bg-red-50">
                                                        <Icon name="trash" className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                            <input type="file" ref={sectionImageInputRef} onChange={(e) => handleImageUpload(e.target.files[0])} style={{ display: 'none' }} accept="image/*" />
                                            <button onClick={() => { currentSectionForUpload.current = { groupIndex, itemIndex }; sectionImageInputRef.current.click(); }} disabled={uploading} className="flex items-center justify-center w-32 h-20 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 hover:text-gray-700 disabled:bg-gray-50">
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

