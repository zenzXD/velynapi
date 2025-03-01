export const metadata = {
    title: "Pricing Page",
    description: "Choose the best plan for your needs",
  };
  
  const PricingPage = () => {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-50 to-blue-100 p-6">
        <h1 className="text-5xl font-extrabold text-gray-800 mb-6">Our Pricing Plans</h1>
        <p className="text-gray-600 mb-12 text-center max-w-lg text-lg">
          Choose a plan that fits your needs. Upgrade anytime to unlock more features.
        </p>
        <div className="flex justify-center items-center gap-12 w-full max-w-7xl">
          {/* Basic Plan */}
          <div className="w-72 bg-white p-8 rounded-2xl shadow-lg text-center border border-gray-200 transform hover:scale-105 transition duration-300 -translate-x-8">
            <h2 className="text-3xl font-bold text-gray-800">Basic</h2>
            <p className="text-gray-500 mt-2 text-lg">Great for personal use</p>
            <p className="text-5xl font-extrabold text-gray-900 mt-4">$0<span className="text-xl">/mo</span></p>
            <ul className="mt-6 space-y-2 text-gray-600 text-lg">
              <li>✔ Free Request</li>
              <li>✔ 10 EndPoint</li>
              <li>✔ Free Limit</li>
            </ul>
            <button className="mt-6 px-6 py-3 bg-blue-500 text-white text-lg rounded-xl hover:bg-blue-600 transition shadow-lg">Choose Plan</button>
          </div>
          
          {/* Pro Plan */}
          <div className="w-80 bg-white p-10 rounded-2xl shadow-xl text-center border-2 border-blue-600 transform hover:scale-105 transition duration-300 translate-y-4">
            <h2 className="text-3xl font-bold text-gray-800">Pro</h2>
            <p className="text-gray-500 mt-2 text-lg">Perfect for professionals</p>
            <p className="text-5xl font-extrabold text-gray-900 mt-4">$3<span className="text-xl">/mo</span></p>
            <ul className="mt-6 space-y-2 text-gray-600 text-lg">
              <li>✔ 10/Request</li>
              <li>✔ 15 EndPoint</li>
              <li>✔ 1000/Limit</li>
            </ul>
            <button className="mt-6 px-6 py-3 bg-blue-600 text-white text-lg rounded-xl hover:bg-blue-700 transition shadow-lg">Choose Plan</button>
          </div>
          
          {/* Premium Plan */}
          <div className="w-72 bg-white p-8 rounded-2xl shadow-lg text-center border border-gray-200 transform hover:scale-105 transition duration-300 translate-x-8">
            <h2 className="text-3xl font-bold text-gray-800">Premium</h2>
            <p className="text-gray-500 mt-2 text-lg">For businesses and teams</p>
            <p className="text-5xl font-extrabold text-gray-900 mt-4">$5<span className="text-xl">/mo</span></p>
            <ul className="mt-6 space-y-2 text-gray-600 text-lg">
              <li>✔ 20/Request</li>
              <li>✔ 24/7 Support</li>
              <li>✔ Unlimited/Limit</li>
            </ul>
            <button className="mt-6 px-6 py-3 bg-blue-500 text-white text-lg rounded-xl hover:bg-blue-600 transition shadow-lg">Choose Plan</button>
          </div>
        </div>
      </div>
    );
  };
  
  export default PricingPage;
  