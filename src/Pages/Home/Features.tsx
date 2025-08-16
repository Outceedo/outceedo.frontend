import React from "react";

const playerSteps = [
  "Create a Profile and Search an Expert",
  "Connect with Expert",
  "Book your assessment service",
  "Receive your assessment reports",
];

const expertSteps = [
  "Create a Profile",
  "Receive Bookings from Players",
  "Review Skills & Submit Assessment Reports",
  "Receive your payments",
];

const Features: React.FC = () => {
  return (
    <div id="features" className="py-10 md:py-20 bg-[#f4fcfb]">
      <div className="px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 font-Raleway">
            How it Works
          </h1>
        </div>
        <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 md:gap-8 mt-8">
          {/* Players Card */}
          <div className="flex-1 max-w-md w-full bg-[#fafcf3] rounded-xl shadow-md px-4 sm:px-6 md:px-8 py-8 mb-6 md:mb-0 border border-[#e6eae2] mx-auto">
            <h2 className="text-xl font-semibold text-red-600 mb-6 text-center">
              Players
            </h2>
            <ul className="space-y-4 sm:space-y-5">
              {playerSteps.map((step, idx) => (
                <li key={idx} className="flex items-center">
                  <span className="bg-white rounded-lg px-3 py-2 md:px-4 text-gray-800 text-base shadow-sm w-full flex items-center border border-[#e6eae2]">
                    <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-3 md:mr-4 flex-shrink-0" />
                    {step}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          {/* Experts Card */}
          <div className="flex-1 max-w-md w-full bg-[#fafcf3] rounded-xl shadow-md px-4 sm:px-6 md:px-8 py-8 border border-[#e6eae2] mx-auto">
            <h2 className="text-xl font-semibold text-red-600 mb-6 text-center">
              Experts
            </h2>
            <ul className="space-y-4 sm:space-y-5">
              {expertSteps.map((step, idx) => (
                <li key={idx} className="flex items-center">
                  <span className="bg-white rounded-lg px-3 py-2 md:px-4 text-gray-800 text-base shadow-sm w-full flex items-center border border-[#e6eae2]">
                    <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-3 md:mr-4 flex-shrink-0" />
                    {step}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
