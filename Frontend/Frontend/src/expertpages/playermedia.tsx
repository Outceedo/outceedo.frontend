import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import profile1 from "../assets/images/profile1.jpg";
import { Link , useLocation} from 'react-router-dom';
import { faBell, faTrash, faImage, faVideo, faUpload } from "@fortawesome/free-solid-svg-icons";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import ExpertNavbar from "./expertNavbar";
import MediaUpload from "./MediaUpload";
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import React, { useState, useEffect } from 'react';
interface Stat {
  label: string;
  percentage: number;
  color: string;
}
interface UploadItem {
  id: number;
  title: string;
  file: File | null;
  preview: string | null;
  type: "photo" | "video";
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

const PlayerMedia: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("All");
  const location = useLocation();
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
  const [media, setMedia] = useState<UploadItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<number[]>([]);
  // Fetch media from local storage
useEffect(() => {
  const savedMedia = JSON.parse(localStorage.getItem("savedMedia") || "[]");
  setMedia(savedMedia);
}, []);

const handleMediaUpdate = () => {
  const updatedMedia = JSON.parse(localStorage.getItem("savedMedia") || "[]");
  setMedia(updatedMedia);
};
const filteredMedia =
    activeTab === "All"
      ? media
      : media.filter((item) => (activeTab === "Photos" ? item.type === "photo" : item.type === "video"));

  // **Handle Selection for Deletion**
  const handleSelect = (id: number) => {
    setSelectedMedia((prevSelected) =>
      prevSelected.includes(id) ? prevSelected.filter((mediaId) => mediaId !== id) : [...prevSelected, id]
    );
  };

  // **Handle Deletion of Selected Items**
  const handleDelete = () => {
    const updatedMedia = media.filter((item) => !selectedMedia.includes(item.id));
    setMedia(updatedMedia);
    setSelectedMedia([]);
    localStorage.setItem("savedMedia", JSON.stringify(updatedMedia));
  };


  return (
      <div className="flex">
       <ExpertNavbar />
        
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
            <div>
 
            <div className="mt-4 flex space-x-4 p-4">
        {[
          { name: "All", icon: null },
          { name: "Photos", icon: faImage },
          { name: "Videos", icon: faVideo },
        ].map((tab) => (
          <button
            key={tab.name}
            className={`px-4 py-2 rounded-md flex items-center gap-2 ${
              activeTab === tab.name ? "bg-yellow-200 dark:bg-yellow-400 font-semibold" : "bg-gray-100 dark:bg-gray-700"
            }`}
            onClick={() => setActiveTab(tab.name as "All" | "Photos" | "Videos")}
          >
            {tab.icon && <FontAwesomeIcon icon={tab.icon} />}
            {tab.name}
          </button>
        ))}
     <div className="flex justify-end w-full">  
     <button onClick={() => setIsModalOpen(true)} className="bg-[#FE221E] hover:bg-red-500 text-white font-semibold px-5 py-2 rounded-lg flex items-center gap-2" >
      <FontAwesomeIcon icon={faUpload} />
      Upload
    </button>
      </div></div>
      {/* Delete Button (Only if items are selected) */}
      {selectedMedia.length > 0 && (
        <div className="flex justify-between items-center bg-red-100 dark:bg-red-500 text-red-700 p-3 rounded-md mt-4">
          <p>{selectedMedia.length} item(s) selected for deletion.</p>
          <button onClick={handleDelete} className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded-md">
            <FontAwesomeIcon icon={faTrash} className="mr-2" />
            Delete Selected
          </button>
        </div>
      )}

      {/* Media Display Section */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-6">
        {filteredMedia.length === 0 ? (
          <p className="text-gray-400 text-center w-full">No Media Available</p>
        ) : (
          activeTab === "All" ? (
            <>
              {/* Display Photos Section */}
              {media.some((item) => item.type === "photo") && (
                <>
                  <h2 className="col-span-2 md:col-span-3 text-lg font-semibold text-gray-700 dark:text-white">
                    Photos
                  </h2>
                  {media
                    .filter((item) => item.type === "photo")
                    .map((item) => (
                      <div
                        key={item.id}
                        className={`relative bg-white p-4 shadow-md rounded-lg dark:bg-gray-700 cursor-pointer ${
                          selectedMedia.includes(item.id) ? "border-2 border-red-500" : ""
                        }`}
                        onClick={() => handleSelect(item.id)}
                      >
                        <p className="font-semibold text-gray-700 dark:text-white">{item.title}</p>
                        <img src={item.preview || ""} alt={item.title} className="w-full h-40 object-cover rounded-lg mt-2" />
                      </div>
                    ))}
                </>
              )}

              {/* Display Videos Section */}
              {media.some((item) => item.type === "video") && (
                <>
                  <h2 className="col-span-2 md:col-span-3 text-lg font-semibold text-gray-700 dark:text-white mt-4">
                    Videos
                  </h2>
                  {media
                    .filter((item) => item.type === "video")
                    .map((item) => (
                      <div
                        key={item.id}
                        className={`relative bg-white p-4 shadow-md rounded-lg dark:bg-gray-700 cursor-pointer ${
                          selectedMedia.includes(item.id) ? "border-2 border-red-500" : ""
                        }`}
                        onClick={() => handleSelect(item.id)}
                      >
                        <p className="font-semibold text-gray-700 dark:text-white">{item.title}</p>
                        <video src={item.preview || ""} controls className="w-full h-40 rounded-lg mt-2" />
                      </div>
                    ))}
                </>
              )}
            </>
          ) : (
            filteredMedia.map((item) => (
              <div
                key={item.id}
                className={`relative bg-white p-4 shadow-md rounded-lg dark:bg-gray-700 cursor-pointer ${
                  selectedMedia.includes(item.id) ? "border-2 border-red-500" : ""
                }`}
                onClick={() => handleSelect(item.id)}
              >
                <p className="font-semibold text-gray-700 dark:text-white">{item.title}</p>
                {item.type === "photo" ? (
                  <img src={item.preview || ""} alt={item.title} className="w-full h-40 object-cover rounded-lg mt-2" />
                ) : (
                  <video src={item.preview || ""} controls className="w-full h-40 rounded-lg mt-2" />
                )}
              </div>
            ))
          )
        )}
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="relative bg-white p-6 rounded-lg shadow-lg">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-2 right-6 text-gray-600 hover:text-gray-800 text-2xl">
              &times;
            </button>
            <MediaUpload onClose={() => setIsModalOpen(false)} onMediaUpdate={handleMediaUpdate} />
          </div>
        </div>
      )}
    </div>
      </div>
      </main>
    </div>
        
  );
};
export default PlayerMedia;
