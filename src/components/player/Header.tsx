import { AlignJustify } from "lucide-react";
import { Button } from "../ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faGem,
  faMoon,
  faSun,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

interface PlayerHeaderProps {
  setOpen: (open: boolean) => void;
}

const menuItems = [
  { path: "/player/details-form", name: "Edit Profile" },
  { path: "/player/dashboard", name: "Dashboard" },
  { path: "/player/viewexperts", name: "Experts" },
  { path: "/player/matches", name: "Matches" },
  { path: "/player/mybooking", name: "My Bookings" },
  { path: "/player/sponsors", name: "Sponsors" },
  { path: "/player/profile", name: "Profile" },
  { path: "/player/exdetails", name: "Expert Profile" },
  { path: "/player/sponsorinfo", name: "Sponsor Profile" },
  { path: "/player/applications", name: "Sponsor Applications" },
];

function PlayerHeader({ setOpen }: PlayerHeaderProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const location = useLocation();
  const currentTitle =
    menuItems.find((item) => location.pathname.startsWith(item.path))?.name ??
    "Dashboard";

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
    <header className="flex flex-wrap items-center justify-between gap-2 px-3 py-3 bg-background dark:bg-slate-950">
      {/* Left Section: Menu Button + Page Title */}
      <div className="flex items-center gap-2">
        <Button
          onClick={() => setOpen(true)}
          className="lg:hidden bg-white dark:bg-slate-700 dark:text-white text-black hover:bg-slate-100 dark:hover:bg-slate-600 p-2"
          size="sm"
        >
          <AlignJustify className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>

        {/* Show current page title truncated if needed */}
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white truncate max-w-[150px] sm:max-w-xs md:max-w-md">
          {currentTitle}
        </h2>
      </div>

      {/* Right Section: Premium Button, Notifications, Theme Toggle */}
      <div className="flex flex-nowrap justify-end gap-2 items-center">
        {/* Premium button - adaptive size and hidden text on smallest screens */}
        <Button className="h-10 px-2 sm:px-4 rounded-lg flex items-center justify-center space-x-1 sm:space-x-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-700 dark:border-slate-600 transition-colors">
          <FontAwesomeIcon
            icon={faGem}
            className="text-blue-700 dark:text-blue-400 text-lg sm:text-xl"
          />
          <p className="text-gray-800 font-Opensans dark:text-white text-lg md:block hidden xs:inline">
            Upgrade to Premium
          </p>
        </Button>

        {/* Notification button with adaptive size */}
        <Button
          className="bg-white hover:bg-white dark:bg-slate-950 dark:hover:bg-slate-700 dark:text-white transition-colors p-2 sm:p-3 h-10 w-10"
          size="sm"
        >
          <FontAwesomeIcon
            icon={faBell}
            className="text-black dark:text-white text-lg sm:text-xl"
          />
        </Button>

        {/* Theme toggle with adaptive size */}
        <Button
          onClick={toggleTheme}
          className="p-2 sm:p-3 rounded-full dark:bg-slate-950 bg-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors h-10 w-10"
          size="sm"
        >
          <FontAwesomeIcon
            icon={isDarkMode ? faMoon : faSun}
            className="text-gray-600 dark:text-white text-lg sm:text-xl"
          />
        </Button>
      </div>
    </header>
  );
}

export default PlayerHeader;
