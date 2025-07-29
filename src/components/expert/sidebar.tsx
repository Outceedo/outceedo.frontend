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

const expertSidebarMenuItems: MenuItem[] = [
  // {
  //   id: 1,
  //   name: "Dashboard",
  //   icon: "fas fa-table-columns",
  //   path: "/expert/dashboard",
  // },
  {
    id: 2,
    name: "Players",
    icon: "fas fa-user-tie",
    path: "/expert/viewplayers",
  },
  { id: 3, name: "Matches", icon: "fas fa-futbol", path: "/expert/matches" },
  {
    id: 4,
    name: "My Bookings",
    icon: "fas fa-calendar-check",
    path: "/expert/mybooking",
  },
  {
    id: 5,
    name: "Calendar",
    icon: "fas fa-calendar",
    path: "/expert/slots",
  },

  { id: 6, name: "Profile", icon: "fas fa-user", path: "/expert/profile" },
  {
    id: 7,
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
  const dispatch = useAppDispatch();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Fetch profile data from Redux store
  const { currentProfile, status } = useAppSelector((state) => state.profile);

  // Format name from profile data
  const expertName = currentProfile
    ? `${currentProfile.firstName || ""} ${
        currentProfile.lastName || ""
      }`.trim()
    : "Loading...";

  // Get age and profession details from profile data
  const expertAge = currentProfile?.age ? `Age ${currentProfile.age}` : "";
  const expertProfession = currentProfile?.profession || "Expert";
  const expertSubProfession = currentProfile?.subProfession || "";
  console.log(currentProfile?.id);
  localStorage.setItem("expertId", currentProfile?.id);

  // Function to handle logout
  function handleLogout() {
    // Close dialog
    setShowLogoutDialog(false);

    // Clear the token from localStorage
    localStorage.removeItem("token");

    // Also clear any other user-related data that might be stored
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("userid");

    // Navigate to login page
    navigate("/login");

    // Refresh the page to ensure all state is reset
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

  // Fetch profile data when component mounts
  useEffect(() => {
    const username = localStorage.getItem("username");
    if (username) {
      dispatch(getProfile(username));
    } else {
      console.error("No expert username found in localStorage");
    }
  }, [dispatch]);

  return (
    <nav className="flex flex-col gap-6 p-4 w-full h-full overflow-y-auto">
      {/* Logout Confirmation Dialog */}
      {showLogoutDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop with blur effect */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowLogoutDialog(false)}
          ></div>

          {/* Dialog */}
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
          onClick={() => navigate("/expert/details-form")}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = profile; // Fallback to default profile image
          }}
        />
        <h2 className="text-lg font-semibold font-Raleway text-gray-800 dark:text-white">
          {expertName}
        </h2>
        <p className="text-gray-500 text-sm font-Opensans dark:text-gray-400 font-sans">
          {currentProfile?.age
            ? `Age ${currentProfile.age} yrs (${
                new Date().getFullYear() - currentProfile.age
              })`
            : ""}
        </p>
        <p className="text-gray-600 font-bold text-sm font-Raleway dark:text-gray-400">
          {expertProfession.toUpperCase()}
          {expertSubProfession
            ? ` - ${
                expertSubProfession.charAt(0).toUpperCase() +
                expertSubProfession.slice(1)
              }`
            : ""}
        </p>
        <p className="text-gray-600 font-bold text-sm font-Raleway dark:text-gray-400">
          {currentProfile?.gender?.charAt(0).toUpperCase() +
            currentProfile?.gender?.slice(1)}
        </p>

        {/* Show loading indicator if profile is still loading */}
        {status === "loading" && (
          <div className="text-sm text-gray-500">Loading profile...</div>
        )}

        {/* Edit Profile Button */}
        <button
          onClick={() => navigate("/expert/details-form")}
          className="bg-red-500 hover:bg-red-600 text-white rounded-md px-4 py-2 text-sm font-medium mt-1 transition-colors flex justify-center items-center"
        >
          Edit Profile
        </button>
      </div>

      {/* Navigation Items */}
      <div className="flex flex-col gap-3 w-full px-4">
        {expertSidebarMenuItems.map((menuItem) => {
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
                    ? "text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
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

interface ExpertSideBarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

function ExpertSideBar({ open, setOpen }: ExpertSideBarProps) {
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

export default ExpertSideBar;
