import React, { useState, useEffect } from 'react';
import Icon from '../../components/ui/Icon';
import { supabase } from '../../lib/supabaseClient';

const DashboardPage = ({ user, onLogout, onSelectProperty, onEditProperty, onCreateNew }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProperties = async () => {
      if (!user) return;

      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('wt_properties')
        .select('id, title, slug') // Changed 'name' to 'title' to match DB schema
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching properties:', error);
        setError('Failed to load your properties.');
      } else {
        setProperties(data);
      }
      setLoading(false);
    };

    fetchProperties();
  }, [user]);

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Icon name="home" className="w-7 h-7 text-green-600" />
            <span className="text-2xl font-bold text-gray-800">WelcomeTo</span>
          </div>
          <div className="flex items-center space-x-4">
             <div className="flex items-center space-x-2">
                <Icon name="user" className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700 font-medium">{user?.email}</span>
             </div>
            <button onClick={onLogout} className="text-sm font-medium text-gray-600 hover:text-green-600">Logout</button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">Your Properties</h1>
            <button 
              onClick={onCreateNew} // This now calls the function from App.jsx
              className="flex items-center justify-center bg-green-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-green-700 transition-transform hover:scale-105"
            >
                <Icon name="plus" className="w-5 h-5 mr-2" />
                Create New Property
            </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading && <div className="p-6 text-center text-gray-500">Loading properties...</div>}
          {error && <div className="p-6 text-center text-red-500">{error}</div>}
          {!loading && !error && (
            <ul className="divide-y divide-gray-200">
                {properties.length > 0 ? (
                  properties.map(prop => (
                      <li key={prop.id} className="p-4 md:p-6 hover:bg-gray-50 transition-colors">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                              <div className="mb-4 sm:mb-0">
                                  <h3 className="text-xl font-semibold text-gray-800">{prop.title}</h3>
                                  <div className="flex items-center text-sm text-gray-500 mt-2">
                                      <Icon name="link" className="w-4 h-4 mr-2" />
                                      <span>/{prop.slug}</span>
                                  </div>
                              </div>
                              <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                                  <button 
                                      onClick={() => onEditProperty(prop.slug)}
                                      className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1">
                                      <Icon name="edit" className="w-4 h-4" />
                                      <span>Edit</span>
                                  </button>
                                  <button 
                                      onClick={() => onSelectProperty(prop.slug)}
                                      className="text-sm font-semibold text-green-600 hover:text-green-800">
                                      View as Guest &rarr;
                                  </button>
                              </div>
                          </div>
                      </li>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500">You haven't created any properties yet. Click "Create New Property" to get started.</div>
                )}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
