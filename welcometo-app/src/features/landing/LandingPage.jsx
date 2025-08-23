import React, { useState } from 'react';
import Icon from '../../components/ui/Icon';
import { supabase } from '../../lib/supabaseClient';

const LandingPage = ({ onLoginClick }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formState, setFormState] = useState({ name: '', email: '', phone: '' });
  const [formStatus, setFormStatus] = useState({ loading: false, error: null, success: false });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormStatus({ loading: true, error: null, success: false });

    const { error } = await supabase.from('wt_leads').insert({
      full_name: formState.name,
      email: formState.email,
      contact_number: formState.phone,
    });

    if (error) {
      setFormStatus({ loading: false, error: 'Something went wrong. Please try again.', success: false });
      console.error('Error inserting lead:', error);
    } else {
      setFormStatus({ loading: false, error: null, success: true });
      setFormState({ name: '', email: '', phone: '' });
    }
  };

  return (
    <>
      <div className="bg-white text-gray-800 font-sans">
        <header className="absolute top-0 left-0 w-full z-10 bg-white bg-opacity-90 backdrop-blur-sm shadow-sm">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Icon name="home" className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-800">WelcomeTo</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-green-700">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-green-700">Pricing</a>
            </nav>
            <button 
              onClick={onLoginClick}
              className="bg-green-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-green-700 transition-transform hover:scale-105"
            >
              Host Login
            </button>
          </div>
        </header>

        <main>
          <section className="relative h-[60vh] md:h-[80vh] flex items-center justify-center text-center text-white">
            <div className="absolute top-0 left-0 w-full h-full bg-black opacity-40"></div>
            <img 
              src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop" 
              alt="Beautiful holiday rental property" 
              className="w-full h-full object-cover"
            />
            <div className="relative z-10 px-4">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight">
                The Perfect Welcome for Every Guest
              </h1>
              <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto">
                Create beautiful, digital welcome books for your properties. Save time, impress guests, and earn 5-star reviews.
              </p>
              <div className="mt-10">
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-green-600 text-white font-bold px-8 py-4 rounded-lg text-lg hover:bg-green-700 transition-transform hover:scale-105 shadow-lg"
                >
                  Get Started Free
                </button>
              </div>
            </div>
          </section>

          <section id="features" className="py-20 bg-gray-50">
            <div className="container mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Everything Your Guests Need, in One Place</h2>
                <p className="mt-4 text-lg text-gray-600">From WiFi codes to local tips, empower your guests with instant information.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                <div className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mx-auto mb-4">
                    <Icon name="wifi" className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Essential Info</h3>
                  <p className="text-gray-600">Share WiFi details, check-in instructions, and appliance guides with ease.</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mx-auto mb-4">
                    <Icon name="mapPin" className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Local Favourites</h3>
                  <p className="text-gray-600">Curate your personal recommendations for restaurants, cafes, and attractions.</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mx-auto mb-4">
                    <Icon name="star" className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Elevate Your Brand</h3>
                  <p className="text-gray-600">Add your logo and property photos for a professional, branded experience.</p>
                </div>
              </div>
            </div>
          </section>

          <section id="pricing" className="py-20 bg-white">
            <div className="container mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Simple, Transparent Pricing</h2>
                <p className="mt-4 text-lg text-gray-600">Choose the plan that's right for you. All prices in ZAR.</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <div className="border border-gray-200 rounded-xl p-8 text-center flex flex-col">
                  <h3 className="text-2xl font-semibold">Solo Host</h3>
                  <p className="text-gray-500 mt-2">Perfect for your first property.</p>
                  <p className="text-5xl font-bold mt-6">R300<span className="text-lg font-normal text-gray-500">/mo</span></p>
                  <p className="mt-2 font-semibold text-gray-700">1 Property</p>
                  <div className="flex-grow"></div>
                  <button onClick={() => setIsModalOpen(true)} className="mt-8 w-full bg-gray-100 text-green-700 font-semibold py-3 rounded-lg hover:bg-gray-200">Get Started</button>
                </div>
                <div className="border-2 border-green-600 rounded-xl p-8 text-center relative shadow-xl flex flex-col">
                  <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full absolute -top-4 right-8">MOST POPULAR</span>
                  <h3 className="text-2xl font-semibold text-green-700">Property Manager</h3>
                  <p className="text-gray-500 mt-2">For hosts with a growing portfolio.</p>
                  <p className="text-5xl font-bold mt-6">R1000<span className="text-lg font-normal text-gray-500">/mo</span></p>
                  <p className="mt-2 font-semibold text-gray-700">Up to 5 Properties</p>
                  <div className="flex-grow"></div>
                  <button onClick={() => setIsModalOpen(true)} className="mt-8 w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700">Get Started</button>
                </div>
                <div className="border border-gray-200 rounded-xl p-8 text-center flex flex-col">
                  <h3 className="text-2xl font-semibold">Professional</h3>
                  <p className="text-gray-500 mt-2">For agencies and large portfolios.</p>
                  <p className="text-5xl font-bold mt-6">R200<span className="text-lg font-normal text-gray-500">/prop/mo</span></p>
                  <p className="mt-2 font-semibold text-gray-700">For 6+ Properties</p>
                  <div className="flex-grow"></div>
                  <button onClick={() => setIsModalOpen(true)} className="mt-8 w-full bg-gray-100 text-green-700 font-semibold py-3 rounded-lg hover:bg-gray-200">Contact Us</button>
                </div>
              </div>
            </div>
          </section>
          
          <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-6 text-center">
               <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Trusted by Hosts Worldwide</h2>
               <div className="mt-10 max-w-3xl mx-auto">
                  <div className="bg-white p-8 rounded-xl shadow-md">
                      <p className="text-xl italic text-gray-700">"WelcomeTo has been a game-changer. I spend less time answering repetitive questions and my guests constantly mention how helpful the welcome book is in their reviews!"</p>
                      <p className="mt-6 font-semibold text-gray-800">- Sarah J, Airbnb Superhost</p>
                  </div>
               </div>
            </div>
          </section>

          <section className="py-20 bg-green-600 text-white">
            <div className="container mx-auto px-6 text-center">
              <h2 className="text-3xl md:text-4xl font-bold">Ready to Impress Your Guests?</h2>
              <p className="mt-4 text-lg text-green-100 max-w-2xl mx-auto">Join hundreds of hosts who are providing a better guest experience.</p>
              <div className="mt-8">
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-white text-green-700 font-bold px-8 py-4 rounded-lg text-lg hover:bg-gray-100 transition-transform hover:scale-105 shadow-lg"
                >
                  Get Started Today
                </button>
              </div>
            </div>
          </section>
        </main>
        <footer className="bg-gray-800 text-white">
          <div className="container mx-auto px-6 py-8 text-center">
            <p>&copy; {new Date().getFullYear()} WelcomeTo. All rights reserved.</p>
          </div>
        </footer>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            
            {formStatus.success ? (
              <div className="text-center">
                <Icon name="star" className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800">Thank You!</h3>
                <p className="text-gray-600 mt-2">We've received your details and will be in touch shortly.</p>
                <button onClick={() => { setIsModalOpen(false); setFormStatus({ loading: false, error: null, success: false }); }} className="mt-6 w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700">
                  Close
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Get Started with WelcomeTo</h3>
                <p className="text-gray-600 mb-6">Enter your details and we'll be in touch to set up your account.</p>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="font-semibold text-gray-700">Full Name</label>
                    <input type="text" id="name" name="name" required value={formState.name} onChange={handleFormChange} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"/>
                  </div>
                  <div>
                    <label htmlFor="email" className="font-semibold text-gray-700">Email Address</label>
                    <input type="email" id="email" name="email" required value={formState.email} onChange={handleFormChange} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"/>
                  </div>
                  <div>
                    <label htmlFor="phone" className="font-semibold text-gray-700">Contact Number (Optional)</label>
                    <input type="tel" id="phone" name="phone" value={formState.phone} onChange={handleFormChange} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"/>
                  </div>
                  {formStatus.error && <p className="text-red-500 text-sm">{formStatus.error}</p>}
                  <button type="submit" disabled={formStatus.loading} className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 disabled:bg-green-300">
                    {formStatus.loading ? 'Submitting...' : 'Submit Inquiry'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default LandingPage;
