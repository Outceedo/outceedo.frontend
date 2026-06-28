import { AlignJustify } from "lucide-react";
import Chat from "@/common/chat";
import useUnreadChatCount from "@/common/useUnreadChatCount";
import { Button } from "../ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faMoon,
  faSun,
  faMessage,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import CoinsCounter from "../CoinsCounter";

interface ExpertHeaderProps {
  setOpen: (open: boolean) => void;
}
const menuItems = [
  { path: "/expert/dashboard", name: "Dashboard" },
  { path: "/expert/viewplayers", name: "Players" },
  { path: "/expert/matches", name: "Matches" },
  { path: "/expert/mybooking", name: "My Bookings" },
  { path: "/expert/sponsors", name: "Sponsors" },
  { path: "/expert/profile", name: "Profile" },
  { path: "/expert/sponsorinfo", name: "Sponsor Profile" },
  { path: "/expert/details-form", name: "Edit Profile" },
  { path: "/expert/playerinfo", name: "Player Profile" },
  { path: "/expert/slots", name: "Calendar" },
  { path: "/expert/referral", name: "Referral Program" },
  { path: "/expert/redeem", name: "Rewards" },
  { path: "/expert/feed", name: "Feed" },
];
function ExpertHeader({ setOpen }: ExpertHeaderProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const { count: unreadCount, refresh: refreshUnread } = useUnreadChatCount();
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
    <>
    <header className="flex flex-nowrap items-center justify-between px-2 sm:px-4 py-3 bg-background dark:bg-slate-950 w-full">
      {/* Left Section: Menu Button + Page Title */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0 w-0 flex-1">
        <Button
          onClick={() => setOpen(true)}
          className="lg:hidden sm:block bg-white dark:bg-slate-700 dark:text-white text-black hover:bg-slate-100 dark:hover:bg-slate-600 p-2"
          size="sm"
        >
          <AlignJustify />
          <span className="sr-only">Toggle Menu</span>
        </Button>
        {/* Show current page title on all screen sizes */}
        <h2 className="text-base sm:text-xl font-bold text-gray-800 dark:text-white whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px] xs:max-w-[150px] sm:max-w-xs md:max-w-md lg:max-w-lg">
          {currentTitle}
        </h2>
      </div>
      <div className="flex flex-nowrap justify-end gap-2 sm:gap-3 items-center flex-shrink-0">
        <CoinsCounter />
        <div className="relative">
          <Button
            onClick={() => setChatOpen(true)}
            aria-label="Messages"
            className="bg-white hover:bg-white dark:bg-slate-950 dark:hover:bg-slate-700 transition-colors p-2 sm:p-3 h-10 w-10 md:w-auto md:px-3"
            size="sm"
          >
            <FontAwesomeIcon
              icon={faMessage}
              className="text-red-500 text-xl sm:text-2xl"
            />
            <span className="hidden font-medium text-gray-800 dark:text-white md:inline">
              Messages
            </span>
          </Button>
          {unreadCount > 0 && (
            <span className="pointer-events-none absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
        <Button
          className="bg-white hover:bg-white dark:bg-slate-950 dark:hover:bg-slate-700 dark:text-white transition-colors p-2 sm:p-3 h-10 w-10"
          size="sm"
        >
          <FontAwesomeIcon
            icon={faBell}
            className="text-black dark:text-white text-lg sm:text-xl"
          />
        </Button>
        <Button
          onClick={toggleTheme}
          className="p-2 sm:p-4 rounded-full dark:bg-slate-950 bg-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors h-10 w-10"
          size="sm"
        >
          <FontAwesomeIcon
            icon={isDarkMode ? faMoon : faSun}
            className="text-gray-600 dark:text-white text-lg sm:text-xl"
          />
        </Button>
      </div>
    </header>
    <Chat
      open={chatOpen}
      onClose={() => {
        setChatOpen(false);
        refreshUnread();
      }}
    />
    </>
  );
}

export default ExpertHeader;
