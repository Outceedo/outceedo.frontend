import { Fragment, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sheet, SheetContent } from "../ui/sheet";
import "@fortawesome/fontawesome-free/css/all.min.css";
import profile from "../../assets/images/avatar.png";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getProfile } from "@/store/profile-slice";

// --- Role-based Menu Definitions ---
interface MenuItem {
  id: number;
  name: string;
  icon: string;
  path: string;
  isLogout?: boolean;
}

export const sidebarMenus: Record<string, MenuItem[]> = {
  admin: [
    {
      id: 1,
      name: "Dashboard",
      icon: "fas fa-table-columns",
      path: "/admin/dashboard",
    },
    {
      id: 2,
      name: "Players ",
      icon: "fas fa-user-tie",
      path: "/admin/viewplayers",
    },
    { id: 3, name: "Matches", icon: "fas fa-futbol", path: "/admin/matches" },
    {
      id: 4,
      name: "My Bookings",
      icon: "fas fa-calendar-check",
      path: "/admin/mybooking",
    },
    { id: 5, name: "Calendar", icon: "fas fa-calendar", path: "/admin/slots" },
    { id: 6, name: "Profile", icon: "fas fa-user", path: "/admin/profile" },
    {
      id: 7,
      name: "Logout",
      icon: "fas fa-sign-out-alt",
      path: "/logout",
      isLogout: true,
    },
  ],
  player: [
    {
      id: 1,
      name: "Players",
      icon: "fas fa-user-tie",
      path: "/admin/player",
    },
    {
      id: 2,
      name: "Bookings",
      icon: "fas fa-calendar-check",
      path: "/admin/player/booking",
    },
    {
      id: 3,
      name: "SponsorShip Application ",
      icon: " fas fa-file-signature",
      path: "/admin/player/sponsorshipapplication",
    },
    // {
    //   id: 4,
    //   name: "Certifications&Award",
    //   icon: "fas fa-award ",
    //   path: "/admin/certifications&awards",
    // },
    {
      id: 5,
      name: "Reports",
      icon: "fas fa-file-alt",
      path: "/admin/player/reports",
    },

    {
      id: 6,
      name: "Dashboard",
      icon: "fas fa-table-columns",
      path: "/admin/dashboard",
    },
  ],
  expert: [
    {
      id: 1,
      name: "Experts",
      icon: "fas fa-user-tie",
      path: "/admin/expert",
    },
    {
      id: 2,
      name: "Bookings",
      icon: "fas fa-calendar-check",
      path: "/admin/expert/booking",
    },

    {
      id: 3,
      name: "Services",
      icon: "fas fa-hands-helping",
      path: "/admin/expert/services",
    },
    // {
    //   id: 4,
    //   name: "Certifications&Awards",
    //   icon: "fas fa-award ",
    //   path: "/admin/expertcetification",
    // },
    {
      id: 5,
      name: "Reports",
      icon: "fas fa-file-alt",
      path: "/admin/expert/reports",
    },

    {
      id: 6,
      name: "Dashboard",
      icon: "fas fa-table-columns",
      path: "/admin/dashboard",
    },
  ],
  sponsor: [
    {
      id: 1,
      name: "Dashboard",
      icon: "fas fa-table-columns",
      path: "/sponsor/dashboard",
    },
    {
      id: 2,
      name: "Sponsorships",
      icon: "fas fa-hand-holding-usd",
      path: "/sponsor/sponsorships",
    },
    { id: 3, name: "Profile", icon: "fas fa-user", path: "/sponsor/profile" },
    {
      id: 4,
      name: "Logout",
      icon: "fas fa-sign-out-alt",
      path: "/logout",
      isLogout: true,
    },
  ],
  team: [
    {
      id: 1,
      name: "Dashboard",
      icon: "fas fa-table-columns",
      path: "/team/dashboard",
    },
    { id: 2, name: "Matches", icon: "fas fa-futbol", path: "/team/matches" },
    { id: 3, name: "Members", icon: "fas fa-users", path: "/team/members" },
    { id: 4, name: "Profile", icon: "fas fa-user", path: "/team/profile" },
    {
      id: 5,
      name: "Logout",
      icon: "fas fa-sign-out-alt",
      path: "/logout",
      isLogout: true,
    },
  ],
  fan: [
    {
      id: 1,
      name: "Dashboard",
      icon: "fas fa-table-columns",
      path: "/fan/dashboard",
    },
    { id: 2, name: "Favourites", icon: "fas fa-star", path: "/fan/favourites" },
    { id: 3, name: "Profile", icon: "fas fa-user", path: "/fan/profile" },
    {
      id: 4,
      name: "Logout",
      icon: "fas fa-sign-out-alt",
      path: "/logout",
      isLogout: true,
    },
  ],
};

// --- Utility to get role from path ---
function getRoleFromPath(pathname: string): string {
  // Extracts the first segment after the leading slash
  const match = pathname.match(/^\/(\w+)/);
  if (!match) return "admin"; // Fallback/default
  const role = match[1];
  // Only allow defined roles
  return sidebarMenus[role] ? role : "admin";
}

// --- MenuItems Component ---
interface MenuItemsProps {
  setOpen?: (open: boolean) => void;
  menuItems: MenuItem[];
}

function MenuItems({ setOpen, menuItems }: MenuItemsProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Fetch profile data from Redux store
  const { currentProfile, status } = useAppSelector((state) => state.profile);

  // Format name from profile data
  const adminName = currentProfile
    ? `${currentProfile.firstName || ""} ${
        currentProfile.lastName || ""
      }`.trim()
    : "Loading...";

  // Get age and profession details from profile data
  const adminProfession = currentProfile?.profession || "NAN";
  const adminSubProfession = currentProfile?.subProfession || "";

  // Save id to localStorage
  useEffect(() => {
    if (currentProfile?.id) {
      localStorage.setItem("adminId", currentProfile.id);
    }
  }, [currentProfile?.id]);

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

  // Fetch profile data when component mounts
  useEffect(() => {
    const username = localStorage.getItem("username");
    if (username) {
      dispatch(getProfile(username));
    }
  }, [dispatch]);

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
      <h1 className="font-bold text-center text-gray-800 dark:text-white">
        LOGO
      </h1>

      {/* Profile Section */}
      <div className="flex flex-col items-center gap-2 mb-2">
        <img
          src={currentProfile?.photo || profile}
          alt="Profile"
          className="rounded-full w-20 h-20 cursor-pointer object-cover"
          onClick={() =>
            navigate(`/${getRoleFromPath(location.pathname)}/details-form`)
          }
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = profile;
          }}
        />
        <h2 className="text-lg font-semibold font-Raleway text-gray-800 dark:text-white">
          {adminName}
        </h2>
        <p className="text-gray-500 text-sm font-Opensans dark:text-gray-400 font-sans">
          {currentProfile?.age
            ? `Age ${currentProfile.age} yrs (${
                new Date().getFullYear() - currentProfile.age
              })`
            : ""}
        </p>
        <p className="text-gray-600 font-bold text-sm font-Raleway dark:text-gray-400">
          {adminProfession.toUpperCase()}
          {adminSubProfession
            ? ` - ${
                adminSubProfession.charAt(0).toUpperCase() +
                adminSubProfession.slice(1)
              }`
            : ""}
        </p>
        <p className="text-gray-600 font-bold text-sm font-Raleway dark:text-gray-400">
          {currentProfile?.gender
            ? currentProfile.gender.charAt(0).toUpperCase() +
              currentProfile.gender.slice(1)
            : ""}
        </p>
        {status === "loading" && (
          <div className="text-sm text-gray-500">Loading profile...</div>
        )}
      </div>

      {/* Navigation Items */}
      <div className="flex flex-col gap-3 w-full px-4">
        {menuItems.map((menuItem) => {
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

// --- Main Sidebar Component ---
interface AdminSideBarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  role: string;
}

function AdminSideBar({ open, setOpen, role }: AdminSideBarProps) {
  // const location = useLocation();
  //const role = getRoleFromPath(location.pathname);
  const menuItems = sidebarMenus[role] || sidebarMenus.admin;
  return (
    <Fragment>
      {/* Mobile sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-56 p-0 overflow-y-auto">
          <div className="flex flex-col h-full">
            <MenuItems setOpen={setOpen} menuItems={menuItems} />
          </div>
        </SheetContent>
      </Sheet>
      {/* Desktop sidebar - fixed position */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-full w-64 flex-col border-r bg-background dark:bg-slate-950 z-40">
        <MenuItems menuItems={menuItems} />
      </aside>
      {/* Spacer */}
      <div className="hidden lg:block w-64 flex-shrink-0"></div>
    </Fragment>
  );
}

export default AdminSideBar;
