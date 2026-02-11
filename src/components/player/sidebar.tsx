import { Fragment, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sheet, SheetContent } from "../ui/sheet";
import "@fortawesome/fontawesome-free/css/all.min.css";
import profile from "../../assets/images/avatar.png";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getProfile } from "@/store/profile-slice";
import logo from "../../assets/images/outceedologo.png";

interface MenuItem {
  id: number;
  name: string;
  icon: string;
  path: string;
  isLogout?: boolean;
}

const adminSidebarMenuItems: MenuItem[] = [
  {
    id: 2,
    name: "Experts",
    icon: "fas fa-user-tie",
    path: "/player/viewexperts",
  },
  { id: 3, name: "Matches", icon: "fas fa-futbol", path: "/player/matches" },
  {
    id: 4,
    name: "My Bookings",
    icon: "fas fa-calendar-check",
    path: "/player/mybooking",
  },
  {
    id: 5,
    name: "Sponsors",
    icon: "fas fa-handshake",
    path: "/player/sponsors",
  },
  {
    id: 6,
    name: "Applications",
    icon: "fas fa-file",
    path: "/player/applications",
  },
  { id: 7, name: "Profile", icon: "fas fa-user", path: "/player/profile" },
  {
    id: 8,
    name: "Referral",
    icon: "fas fa-user-plus",
    path: "/player/referral",
  },
  {
    id: 9,
    name: "Logout",
    icon: "fas fa-sign-out-alt",
    path: "/logout",
    isLogout: true,
  },
];

interface MenuItemsProps {
  setOpen?: (open: boolean) => void;
}

function MenuItems({ setOpen }: MenuItemsProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Fetch profile data from Redux store
  const { currentProfile, status } = useAppSelector((state) => state.profile);

  // Format name from profile data
  const playerName = currentProfile
    ? `${currentProfile.firstName || ""} ${
        currentProfile.lastName || ""
      }`.trim()
    : "Loading...";

  // Get age and profession from profile data
  const playerProfession = currentProfile?.profession || "";
  const playerSubProfession = currentProfile?.subProfession || "";

  // Calculate age from birthYear
  const calculateAge = (birthYear: number | undefined): number | null => {
    if (!birthYear) return null;
    const currentYear = new Date().getFullYear();
    return currentYear - birthYear;
  };

  const playerAge = calculateAge(currentProfile?.birthYear);

  // Function to handle logout
  function handleLogout() {
    setShowLogoutDialog(false);

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("userid");

    navigate("/login");
    window.location.reload();
  }

  // Handle menu item click
  const handleMenuItemClick = (menuItem: MenuItem) => {
    if (menuItem.isLogout) {
      setShowLogoutDialog(true);
    } else {
      navigate(menuItem.path);
      if (setOpen) setOpen(false);
    }
  };

  return (
    <nav className="flex flex-col gap-6 p-4 w-full h-full overflow-y-auto">
      {/* Logout Confirmation Dialog */}
      {showLogoutDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowLogoutDialog(false)}
          ></div>
          <div className="relative bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-80 z-10">
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              Confirm Logout
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to log out of your account?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowLogoutDialog(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logo */}
      <img src={logo} alt="logo" className="w-36 mx-auto" />

      {/* Profile Section */}
      <div className="flex flex-col items-center gap-2 mb-2">
        <img
          src={currentProfile?.photo || profile}
          alt="Profile"
          className="rounded-full w-20 h-20 cursor-pointer object-cover"
          onClick={() => navigate("/player/details-form")}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = profile;
          }}
        />
        <h2 className="text-lg font-semibold font-Raleway text-gray-800 dark:text-white">
          {playerName}
        </h2>
        <p className="text-gray-500 text-sm font-Opensans dark:text-gray-400 font-sans">
          {playerAge !== null && currentProfile?.birthYear
            ? `Age ${playerAge} yrs (${currentProfile.birthYear})`
            : ""}
        </p>
        <p className="text-gray-600 font-bold text-sm font-Raleway dark:text-gray-400">
          {playerProfession.toUpperCase()}
          {playerSubProfession
            ? ` - ${
                playerSubProfession.charAt(0).toUpperCase() +
                playerSubProfession.slice(1)
              }`
            : ""}
        </p>
        <p className="text-gray-600 font-bold text-sm font-Raleway dark:text-gray-400">
          {currentProfile?.gender
            ? currentProfile?.gender.charAt(0).toUpperCase() +
              currentProfile?.gender.slice(1)
            : null}
        </p>
        {status === "loading" && (
          <div className="text-sm text-gray-500">Loading profile...</div>
        )}
        <button
          onClick={() => navigate("/player/details-form")}
          className="bg-red-500 hover:bg-red-600 text-white rounded-md px-4 py-2 text-sm font-medium mt-1 transition-colors"
        >
          Edit Profile
        </button>
      </div>

      {/* Navigation Items */}
      <div className="flex flex-col gap-3 w-full px-4">
        {adminSidebarMenuItems.map((menuItem) => {
          const isActive =
            !menuItem.isLogout && location.pathname === menuItem.path;
          return (
            <div
              key={menuItem.id}
              onClick={() => handleMenuItemClick(menuItem)}
              className={`flex items-center gap-3 px-3 py-2 text-md cursor-pointer rounded-md transition-colors
                ${
                  isActive
                    ? "bg-gray-100 text-black font-medium dark:bg-gray-700 dark:text-white"
                    : menuItem.isLogout
                      ? "text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }
              `}
            >
              <i
                className={`${menuItem.icon} ${
                  isActive
                    ? "text-gray-800 dark:text-white"
                    : menuItem.isLogout
                      ? "text-red-500 dark:text-red-400"
                      : "text-gray-500 dark:text-gray-400"
                }`}
              ></i>
              <span className={isActive ? "font-medium" : ""}>
                {menuItem.name}
              </span>
            </div>
          );
        })}
      </div>
    </nav>
  );
}

interface PlayerSideBarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

function PlayerSideBar({ open, setOpen }: PlayerSideBarProps) {
  const dispatch = useAppDispatch();
  const { currentProfile } = useAppSelector((state) => state.profile);
  const [profileFetched, setProfileFetched] = useState(false);

  useEffect(() => {
    // Only fetch if not fetched before and not present in redux state
    if (!currentProfile && !profileFetched) {
      const username = localStorage.getItem("username");
      if (username) {
        dispatch(getProfile(username));
        setProfileFetched(true);
      }
    }
  }, [dispatch, currentProfile, profileFetched]);

  return (
    <Fragment>
      {/* Mobile sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-56 p-0 overflow-y-auto">
          <div className="flex flex-col h-full">
            <MenuItems setOpen={setOpen} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar - fixed position */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-full w-64 flex-col border-r bg-background dark:bg-slate-950 z-40">
        <MenuItems />
      </aside>

      {/* This empty div creates space for the fixed sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0"></div>
    </Fragment>
  );
}

export default PlayerSideBar;
