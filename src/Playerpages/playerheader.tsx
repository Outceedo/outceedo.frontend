"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { faBell, faSun, faMoon, faGem } from "@fortawesome/free-solid-svg-icons";

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
  const location = useLocation();
  const currentTitle = pageTitles[location.pathname] || "Dashboard";
  const [isDarkMode, setIsDarkMode] = useState(false);

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
    <div className=" dark:bg-gray-900 ">
        
      <main className="flex-1  dark:bg-gray-900 dark:text-white ">
        <div className="fixed top-0 left-72 right-0 bg-white dark:bg-gray-900 shadow-md px-6 py-4 z-50 flex justify-between items-center">
          {/* Page Title */}
          <h1 className="text-2xl mr-60 font-semibold text-gray-800 dark:text-white">{currentTitle}</h1>

          {/* Right Section - Buttons */}
          <div className="flex space-x-4">
            {/* Upgrade Button */}
            <Button variant="outline" className="bg-slate-100 dark:bg-gray-800 h-12 cursor-pointer">
              
              <FontAwesomeIcon icon={faGem} className="text-blue-700" />
              <span className="ml-2 text-gray-800 dark:text-white">Upgrade to Premium</span>
            </Button>

            {/* Notification Bell with Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="cursor-pointer">
                  <FontAwesomeIcon icon={faBell} className="text-gray-600 dark:text-gray-400 text-xl" />
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-56">
                <p className="text-gray-500 text-sm p-2">No new notifications</p>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Dark Mode Toggle */}
            <Button variant="ghost" onClick={toggleTheme} className="cursor-pointer">
              <FontAwesomeIcon icon={isDarkMode ? faMoon : faSun} className="text-gray-600 cursor-pointer dark:text-gray-400 text-xl" />
            </Button>
          </div>
        </div>
    
      </main>
      
    </div>
  );
};

export default PlayerHeader;
