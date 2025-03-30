import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "react-circular-progressbar/dist/styles.css";
import { faBell, faSun, faMoon } from "@fortawesome/free-solid-svg-icons";
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // Import for dynamic title

const pageTitles: { [key: string]: string } = {
  "/dashboard": "Dashboard",
  "/profile": "Profile",
  "/mybooking": "My Bookings",
  "/matches": "Matches",
  "/expertspage": "Experts",
  "/sponsors": "Sponsors",
  "/experts": "Experts",
};

const PlayerHeader: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const location = useLocation(); // Get current route
  const currentTitle = pageTitles[location.pathname] || "Dashboard"; // Default to Dashboard

  // On initial load, check if dark mode is enabled
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode === "enabled") {
      setIsDarkMode(true);
      document.body.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.body.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) {
      document.body.classList.remove("dark");
      localStorage.setItem("darkMode", "disabled");
    } else {
      document.body.classList.add("dark");
      localStorage.setItem("darkMode", "enabled");
    }
  };

  return (
    <>
      <div className=" dark:bg-gray-900 ">
        <main className="flex-1 p-6 dark:bg-gray-900 dark:text-white">
          <div className="fixed top-0 left-64 right-0 bg-white dark:bg-gray-900 shadow-md px-6 py-4 z-50 flex justify-between items-center">
            <h1 className="text-2xl font-Raleway font-semibold text-gray-800 dark:text-white">
              {" "}
              {currentTitle}
            </h1>
            <div className="flex space-x-4">
              <button className="h-12 w-full border p-4 rounded-lg flex items-center justify-center space-x-3 bg-slate-100 dark:bg-gray-800">
                <i className="fas fa-gem text-blue-700"></i>
                <p className="text-gray-800 font-Opensans dark:text-white">
                  Upgrade to Premium
                </p>
              </button>
              <button>
                <FontAwesomeIcon
                  icon={faBell}
                  className="text-gray-600 dark:text-gray-400 text-xl"
                />
              </button>
              <button
                onClick={toggleTheme}
                className="p-4 rounded-full dark:bg-gray-800"
              >
                <FontAwesomeIcon
                  icon={isDarkMode ? faMoon : faSun}
                  className="text-gray-600 dark:text-gray-400 text-xl"
                />
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default PlayerHeader;
