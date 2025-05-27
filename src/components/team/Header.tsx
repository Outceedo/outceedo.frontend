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

interface teamHeaderProps {
  setOpen: (open: boolean) => void;
}
const menuItems = [
  { path: "/team/details-form", name: "Edit Profile" },
  { path: "/team/dashboard", name: "Dashboard" },
  { path: "/team/player", name: "Players" },
  { path: "/team/experts", name: "Experts" },
  { path: "/team/sponsors", name: "Sponsor" },
  { path: "/team/sponsorsapplication", name: "Sponsors Application" },
  { path: "/team/profile", name: "Profile" },
  { path: "/team/sponsorinfo", name: "Sponsor Profile" },
  { path: "/team/playerinfo", name: "Player Profile" },
  { path: "/team/exdetails", name: "Expert Profile" },
];
function TeamHeader({ setOpen }: teamHeaderProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const location = useLocation();
  const currentTitle =
    menuItems.find((item) => location.pathname.startsWith(item.path))?.name ??
    "Players";
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
    <header className="flex items-center justify-between px-4 py-3 bg-background dark:bg-slate-950">
      {/* Left Section: Menu Button + Page Title */}
      <div className="flex items-center gap-4">
        <Button
          onClick={() => setOpen(true)}
          className="lg:hidden sm:block bg-white dark:bg-slate-700 dark:text-white text-black hover:bg-slate-100 dark:hover:bg-slate-600"
        >
          <AlignJustify />
          <span className="sr-only">Toggle Menu</span>
        </Button>

        {/* Show current page title on all screen sizes */}
        <h2 className="text-xl font-bold text-gray-800 dark:text-white whitespace-nowrap overflow-hidden text-ellipsis max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
          {currentTitle}
        </h2>
      </div>

      {/* Right Section: Premium Button, Notifications, Theme Toggle */}
      <div className="flex justify-end gap-3 items-center w-full">
        <Button className="h-12 w-48 md:w-56 p-4 rounded-lg flex items-center justify-center space-x-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-700 dark:border-slate-600 transition-colors">
          <FontAwesomeIcon
            icon={faGem}
            className="text-blue-700 dark:text-blue-400 text-xl"
          />
          <p className="text-gray-800 font-Opensans dark:text-white">
            Upgrade to Premium
          </p>
        </Button>
        <Button className="bg-white hover:bg-white dark:bg-slate-950 dark:hover:bg-slate-700 dark:text-white transition-colors p-3">
          <FontAwesomeIcon
            icon={faBell}
            className="text-black dark:text-white text-xl"
          />
        </Button>
        <Button
          onClick={toggleTheme}
          className="p-4 rounded-full dark:bg-slate-950 bg-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <FontAwesomeIcon
            icon={isDarkMode ? faMoon : faSun}
            className="text-gray-600 dark:text-white text-xl"
          />
        </Button>
      </div>
    </header>
  );
}

export default TeamHeader;
