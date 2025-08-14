import React from 'react';
import Icon from '../../components/ui/Icon'; // Assuming Icon component is in this path

const LandingPage = ({ onLoginClick }) => {
  return (
    <div className="bg-white text-gray-800 font-sans">
      {/* Header */}
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

      {/* Hero Section */}
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
                onClick={onLoginClick}
                className="bg-green-600 text-white font-bold px-8 py-4 rounded-lg text-lg hover:bg-green-700 transition-transform hover:scale-105 shadow-lg"
              >
                Create Your Welcome Book Free
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Everything Your Guests Need, in One Place</h2>
              <p className="mt-4 text-lg text-gray-600">From WiFi codes to local tips, empower your guests with instant information.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {/* Feature Item */}
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mx-auto mb-4">
                  <Icon name="wifi" className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Essential Info</h3>
                <p className="text-gray-600">Share WiFi details, check-in instructions, and appliance guides with ease.</p>
              </div>
              {/* Feature Item */}
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mx-auto mb-4">
                  <Icon name="mapPin" className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Local Favourites</h3>
                <p className="text-gray-600">Curate your personal recommendations for restaurants, cafes, and attractions.</p>
              </div>
              {/* Feature Item */}
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
        
        {/* Testimonial Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6 text-center">
             <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Trusted by Hosts Worldwide</h2>
             <div className="mt-10 max-w-3xl mx-auto">
                <div className="bg-gray-50 p-8 rounded-xl shadow-md">
                    <p className="text-xl italic text-gray-700">"WelcomeTo has been a game-changer. I spend less time answering repetitive questions and my guests constantly mention how helpful the welcome book is in their reviews!"</p>
                    <p className="mt-6 font-semibold text-gray-800">- Sarah J, Airbnb Superhost</p>
                </div>
             </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-20 bg-green-600 text-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold">Ready to Impress Your Guests?</h2>
            <p className="mt-4 text-lg text-green-100 max-w-2xl mx-auto">Join hundreds of hosts who are providing a better guest experience.</p>
            <div className="mt-8">
              <button 
                onClick={onLoginClick}
                className="bg-white text-green-700 font-bold px-8 py-4 rounded-lg text-lg hover:bg-gray-100 transition-transform hover:scale-105 shadow-lg"
              >
                Get Started Today
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white">
        <div className="container mx-auto px-6 py-8 text-center">
          <p>&copy; {new Date().getFullYear()} WelcomeTo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
