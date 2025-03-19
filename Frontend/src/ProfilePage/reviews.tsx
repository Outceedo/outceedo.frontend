import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import profile1 from "../assets/images/profile1.jpg";
import { Link,useLocation } from 'react-router-dom';
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import profile2 from "../assets/images/profile2.jpg";
import SideNavbar from "./sideNavbar";
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import React, { useState, useEffect } from 'react';


    // Define the type for a single review
    interface Review {
      name: string;
      time: string;
      review: string;
      profileImage: string;
    }
    
    const reviews: Review[] = [
      { name: "Laura W", time: "1 year ago", review: "An incredible, heartfelt musician and a delight to work with .", profileImage: profile2 },
      { name: "Kenny B", time: "1 year ago", review: "An incredible, heartfelt musician and a delight to work with.", profileImage: profile2 },
      { name: "Nicola B", time: "1 year ago", review: "An incredible, heartfelt musician and a delight to work with.", profileImage: profile2 },
  ];
  
interface Stat {
  label: string;
  percentage: number;
  color: string;
}

// Stats data
const stats: Stat[] = [
  { label: "Pace", percentage: 60, color: "#E63946" },
  { label: "Shooting", percentage: 55, color: "#D62828" },
  { label: "Passing", percentage: 80, color: "#4CAF50" },
  { label: "Dribbling", percentage: 65, color: "#68A357" },
  { label: "Defending", percentage: 90, color: "#2D6A4F" },
  { label: "Physical", percentage: 60, color: "#F4A261" },
];

// Function to calculate the average OVR value
const calculateOVR = (stats: Stat[]) => {
  const totalPercentage = stats.reduce((acc, stat) => acc + stat.percentage, 0);
  return (totalPercentage / stats.length).toFixed(1); // Round to 1 decimal place
};

const OVR = calculateOVR(stats);


const Reviews: React.FC = () => {
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);
    
  // On initial load, check if dark mode is enabled
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode === "enabled") {
      setIsDarkMode(true);
      document.body.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.body.classList.remove('dark');
    }
  }, []);
    
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) {
      document.body.classList.remove('dark');
      localStorage.setItem("darkMode", "disabled");
    } else {
      document.body.classList.add('dark');
      localStorage.setItem("darkMode", "enabled");
    }
  };

   


  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const handleCardClick = (review: Review) => {
    setSelectedReview(review);
  };

  const closeModal = () => {
    setSelectedReview(null);
  };



  

  return (
    <>
      <div className="flex">
        <SideNavbar />
        
        {/* Main Content */}
        <main className="flex-1 p-6 dark:bg-gray-900 dark:text-white">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-Raleway font-semibold text-gray-800 dark:text-white">Profile</h1>
            <div className="flex space-x-4">
              <button className="h-12 w-full border p-4 rounded-lg flex items-center justify-center space-x-3 bg-slate-100 dark:bg-gray-800">
                <i className="fas fa-gem text-blue-700"></i>
                <p className="text-gray-800 font-Opensans dark:text-white">Upgrade to Premium</p>
              </button>
              <button>
                <FontAwesomeIcon icon={faBell} className="text-gray-600 dark:text-gray-400 text-xl" />
              </button>
              <button onClick={toggleTheme} className="p-4 rounded-full dark:bg-gray-800">
                <FontAwesomeIcon
                  icon={isDarkMode ? faMoon : faSun}
                  className="text-gray-600 dark:text-gray-400 text-xl"
                />
              </button>
            </div>
          </div>

          {/* Profile Info */}
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-10 mt-10">
            <div className="flex items-center">
              <img src={profile1} alt="Player" className="rounded-full w-40 h-40" />
              <div className="ml-4">
                <h2 className="text-xl font-Raleway font-semibold text-gray-800 dark:text-white">Rohan Roshan</h2>
                <p className="text-gray-500 font-Opensans dark:text-gray-400">Age 14 | 166cm | 45kg | London, England</p>
              </div>
            </div>

            {/* OVR Overview */}
            <div className="bg-yellow-100 dark:bg-gray-700 p-3 rounded-lg shadow-lg w-auto mx-auto mb-6 mt-10">
              {/* Progress Bars */}
              <div className="flex justify-center gap-5">
                <div className="text-left mb-6">
                  <h2 className="text-3xl font-bold mr-28 mt-5 text-gray-800 dark:text-white">
                    <span className="block font-light text-4xl">{OVR}%</span> {/* Percentage on top */}
                    <span className="text-xl font-Raleway"> OVR </span> {/* OVR text below */}
                  </h2>
                </div>
                {stats.map((stat, index) => (
                  <div key={index} className="flex flex-col items-center relative">
                    <div className="w-24 h-24 relative" style={{ transform: "rotate(-90deg)" }}>
                      {/* Circular Progressbar */}
                      <CircularProgressbar
                        value={stat.percentage}
                        styles={buildStyles({
                          textSize: "26px",
                          pathColor: stat.color,
                          textColor: "#333",
                          trailColor: "#ddd",
                          strokeLinecap: "round",
                        })}
                        circleRatio={0.5}
                      />
                      {/* Percentage Text inside Progressbar */}
                      <div
                        className="absolute inset-0 flex items-center justify-center text-2xl font-semibold text-stone-800  dark:text-white"
                        style={{
                          transform: `rotate(90deg)`, // Rotate text back to normal position
                        }}
                      >
                        {stat.percentage}%
                      </div>
                    </div>
                    <p className="text-sm font-bold font-Raleway text-gray-700 dark:text-gray-400">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center border-b pb-2 gap-5">
                  <div className="mt-4">
                                       <div className="flex items-center border-b pb-2 gap-5">
                                       <Link
                               to="/profile"
                               className={`text-lg font-semibold font-Raleway ${
                                 location.pathname === "details"
                                   ? "text-red-600 border-b-2 border-red-600"
                                   : "text-gray-700 dark:text-white hover:text-red-600 dark:hover:text-red-600"
                               }`}
                             >
                               Details
                             </Link>
                             <Link
                                 to="/media"
                                 className={`text-lg font-semibold font-Raleway ${
                                   location.pathname === "/media"
                                     ? "text-red-600 border-b-2 border-red-600"
                                     : "text-gray-700 dark:text-white hover:text-red-600 "
                                 }`}
                               >
                                 Media
                               </Link>
                         
                               <Link
                                 to="/reviews"
                                 className={`text-lg font-semibold font-Raleway ${
                                   location.pathname === "/reviews"
                                     ? "text-red-600 border-b-2 border-red-600"
                                     : "text-gray-700 dark:text-white hover:text-red-600 "
                                 }`}
                               >
                                 Reviews
                               </Link>
                         
                             </div>
                           </div>
                                         
              </div>
            </div>

            {/* Reviews Section */}
           
            <div>
      {/* Reviews Section */}
      <div className="grid md:grid-cols-3 gap-6 mt-6">
        {reviews.map((review, index) => (
          <div
            key={index}
            className="border dark:bg-gray-800 dark:border-gray-600 rounded-lg p-4 shadow-sm cursor-pointer"
            onClick={() => handleCardClick(review)}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
                <img src={profile2} alt="Player" className="rounded-full" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-white">{review.name}</p>
                <p className="text-gray-500 text-sm dark:text-gray-400">{review.time}</p>
              </div>
            </div>
            <p className="mt-3 text-gray-700 dark:text-gray-300">{review.review}</p>
          </div>
        ))}
      </div>

      {/* Popup Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center  items-center">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-96 shadow-lg">
            <h2 className="text-lg font-bold">{selectedReview.name}</h2>
            <img src={profile2} alt="Player" className="rounded-full justify-center w-24 h-24 " />
            <p className="text-gray-500 text-sm">{selectedReview.time}</p>
            <p className="mt-4 text-gray-700 dark:text-gray-300">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illum sequi voluptatum facilis suscipit exercitationem, natus vero eligendi sunt similique ipsa omnis qui eum incidunt molestias quod recusandae animi, accusantium porro.</p>
            <p className="mt-4 text-gray-700 dark:text-gray-300">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Delectus error architecto voluptas, amet quibusdam dicta nisi obcaecati labore quod voluptate explicabo alias praesentium ipsam aspernatur impedit quo velit blanditiis excepturi!{selectedReview.review}</p>
            <button
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
    </div>
    </main></div>
    </>







           



    
  );
};

export default Reviews;