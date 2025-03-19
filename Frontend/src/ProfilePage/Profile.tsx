import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faPen } from "@fortawesome/free-solid-svg-icons";
import { faLinkedin, faInstagram, faFacebook,faTwitter } from "@fortawesome/free-brands-svg-icons";

import profile1 from "../assets/images/profile1.jpg";
import { Link , useLocation} from 'react-router-dom'; // Correct import for Link
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import SideNavbar from "./sideNavbar"; // Corrected import
import React, { useState, useEffect } from 'react';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

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

const Profile: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [aboutMe, setAboutMe] = useState(localStorage.getItem("aboutMe") || "I am from London, UK. A passionate, versatile musician bringing light to classics from Ella Fitzgerald to Guns and Roses. Guaranteed to get the crowd dancing.");
  const [isEditing, setIsEditing] = useState(false);
   const [activeTab, setActiveTab] = useState<"details" | "media"| "reviews" >("details");
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

  const handleSave = () => {
    localStorage.setItem("aboutMe", aboutMe);
    setIsEditing(false);
  };

  const [certificates, setCertificates] = useState([
    "Fundamentals of Music Theory",
    "Getting Started With Music Theory"
  ]);
  const [awards, setAwards] = useState([
    "Fundamentals of Music Theory",
    "Getting Started With Music Theory"
  ]);
  const [isEditingCertificates, setIsEditingCertificates] = useState(false);
  const [isEditingAwards, setIsEditingAwards] = useState(false);

  useEffect(() => {
    const savedCertificates = localStorage.getItem("certificates");
    const savedAwards = localStorage.getItem("awards");
    if (savedCertificates) setCertificates(JSON.parse(savedCertificates));
    if (savedAwards) setAwards(JSON.parse(savedAwards));
  }, []);

  const saveCertificates = () => {
    localStorage.setItem("certificates", JSON.stringify(certificates));
    setIsEditingCertificates(false);
  };

  const saveAwards = () => {
    localStorage.setItem("awards", JSON.stringify(awards));
    setIsEditingAwards(false);
  };

  

  return (
    <>
      <div className="flex">
        <SideNavbar /> {/* Sidebar, applying dark mode */}

        {/* Main Content */}
        <main className="flex-1 p-6 dark:bg-gray-900">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Profile</h1>
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
          <div className="bg-white shadow-lg rounded-lg p-10 mt-10 dark:bg-gray-800 dark:text-white">
            <div className="flex items-center">
              <img src={profile1} alt="Player" className="rounded-full w-40 h-40" />
              <div className="ml-4">
                <h2 className="text-xl font-Raleway font-semibold">Rohan Roshan</h2>
                <p className="text-gray-500 font-Opensans dark:text-gray-400">Age 14 | 166cm | 45kg | London, England</p>
              </div>
            </div>

            {/* OVR Overview */}
            <div className="bg-yellow-100 p-3 rounded-lg shadow-lg w-full mx-auto mb-6 mt-10 dark:bg-gray-700">
              {/* Progress Bars */}
              <div className="flex justify-center gap-5">
                <div className="text-left mb-6">
                  <h2 className="text-3xl font-bold mr-28 mt-5 text-gray-800 dark:text-white">
                    <span className="block font-light text-4xl">{OVR}%</span>  {/* Percentage on top */}
                    <span className="text-xl font-Raleway "> OVR </span>  {/* OVR text below */}
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
                        className="absolute inset-0 flex items-center justify-center text-2xl font-semibold text-stone-800 dark:text-white"
                        style={{
                          transform: `rotate(90deg)`, // Rotate text back to normal position
                        }}
                      >
                        {stat.percentage}%
                      </div>
                    </div>
                    <p className="text-sm font-bold text-gray-700 font-Raleway dark:text-white">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Details Section */}
            <div className="mt-4">
              <div className="flex items-center border-b pb-2 gap-5">
              <Link
      to="/details"
      className={`text-lg font-semibold ${
        activeTab === "details"
          ? "text-red-600 border-b-2 border-red-600"
          : "text-gray-700 dark:text-white hover:text-red-600 dark:hover:text-red-600"
      }`}
      onClick={() => setActiveTab("details")}
    >
      Details
    </Link>
    <Link
        to="/media"
        className={`text-lg font-semibold  ${
          location.pathname === "/media"
            ? "text-red-600 border-b-2 border-red-600"
            : "text-gray-700 dark:text-white hover:text-red-600 "
        }`}
      >
        Media
      </Link>

      <Link
        to="/reviews"
        className={`text-lg font-semibold  ${
          location.pathname === "/reviews"
            ? "text-red-600 border-b-2 border-red-600"
            : "text-gray-700 dark:text-white hover:text-red-600 "
        }`}
      >
        Reviews
      </Link>

              </div>
            </div>

               {/* About Me Section */}
          <div className="mt-4 relative border p-4 rounded-lg dark:bg-gray-700 dark:text-white">
            <h3 className="text-lg font-semibold">About Me</h3>
            {isEditing ? (
              <>
                <textarea
                  value={aboutMe}
                  onChange={(e) => setAboutMe(e.target.value)}
                  className="w-full p-2 border rounded-lg dark:bg-gray-600 dark:text-white"
                ></textarea>
                <button
                  onClick={handleSave}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save
                </button>
              </>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 mt-1">{aboutMe}</p>
            )}
            <FontAwesomeIcon
              icon={faPen}
              className="absolute top-2 right-2 text-gray-500 dark:text-gray-300 cursor-pointer"
              onClick={() => setIsEditing(true)}
            />
          </div>

            {/* Certificates & Awards */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="relative border p-4 rounded-lg dark:bg-gray-700">
              <h3 className="text-lg font-semibold">Certificates</h3>
              {isEditingCertificates ? (
                <div>
                  {certificates.map((cert, index) => (
                    <input
                      key={index}
                      type="text"
                      className="p-2 border font-Opensans rounded mt-2 dark:bg-gray-600 w-full"
                      value={cert}
                      onChange={(e) => {
                        const newCertificates = [...certificates];
                        newCertificates[index] = e.target.value;
                        setCertificates(newCertificates);
                      }}
                    />
                  ))}
                  <button onClick={saveCertificates} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">Save</button>
                </div>
              ) : (
                <div>
                  {certificates.map((cert, index) => (
                    <div key={index} className="p-2 border font-Opensans rounded mt-2 dark:bg-gray-600">{cert}</div>
                  ))}
                  <FontAwesomeIcon icon={faPen} onClick={() => setIsEditingCertificates(true)} className="absolute top-2 right-2 text-gray-500 dark:text-gray-300 cursor-pointer" />
                </div>
              )}
            </div>
            <div className="relative border p-4 rounded-lg dark:bg-gray-700">
              <h3 className="text-lg font-semibold">Awards</h3>
              {isEditingAwards ? (
                <div>
                  {awards.map((award, index) => (
                    <input
                      key={index}
                      type="text"
                      className="p-2 border font-Opensans rounded mt-2 dark:bg-gray-600 w-full"
                      value={award}
                      onChange={(e) => {
                        const newAwards = [...awards];
                        newAwards[index] = e.target.value;
                        setAwards(newAwards);
                      }}
                    />
                  ))}
                  <button onClick={saveAwards} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">Save</button>
                </div>
              ) : (
                <div>
                  {awards.map((award, index) => (
                    <div key={index} className="p-2 border font-Opensans rounded mt-2 dark:bg-gray-600">{award}</div>
                  ))}
                  <FontAwesomeIcon icon={faPen} onClick={() => setIsEditingAwards(true)} className="absolute top-2 right-2 text-gray-500 dark:text-gray-300 cursor-pointer" />
                </div>
              )}
            </div>
          </div>

            {/* Social Links */}
            <div className="mt-4 relative border p-4 rounded-lg dark:bg-gray-700">
              <h3 className="text-lg font-Raleway font-semibold">Socials</h3>
              <div className="flex space-x-4 mt-2">
                <FontAwesomeIcon icon={faLinkedin} className="text-blue-600 text-3xl cursor-pointer" />
                <FontAwesomeIcon icon={faInstagram} className="text-pink-600 text-3xl cursor-pointer" />
                <FontAwesomeIcon icon={faFacebook} className="text-blue-800 text-3xl cursor-pointer" />
                <FontAwesomeIcon icon={faTwitter} className="text-blue-600 text-3xl cursor-pointer" />
              </div>
             
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Profile;