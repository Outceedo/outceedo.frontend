import { Fragment, MouseEvent, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sheet, SheetContent } from "../ui/sheet";
import "@fortawesome/fontawesome-free/css/all.min.css";
import profile from "../../assets/images/profile.jpg";
import { LogOut } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getProfile } from "@/store/profile-slice";

interface MenuItem {
  id: number;
  name: string;
  icon: string;
  path: string;
}

const expertSidebarMenuItems: MenuItem[] = [
  {
    id: 1,
    name: "Dashboard",
    icon: "fas fa-table-columns",
    path: "/expert/dashboard",
  },
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
    name: "Sponsors",
    icon: "fas fa-handshake",
    path: "/expert/sponsors",
  },
  { id: 6, name: "Profile", icon: "fas fa-user", path: "/expert/profile" },
];

interface MenuItemsProps {
  setOpen?: (open: boolean) => void;
}

function MenuItems({ setOpen }: MenuItemsProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  // Fetch profile data from Redux store
  const { viewedProfile, status } = useAppSelector((state) => state.profile);

  // Format name from profile data
  const expertName = viewedProfile
    ? `${viewedProfile.firstName || ""} ${viewedProfile.lastName || ""}`.trim()
    : "Loading...";

  // Get age and profession details from profile data
  const expertAge = viewedProfile?.age ? `Age ${viewedProfile.age}` : "";
  const expertProfession = viewedProfile?.profession || "Expert";
  const expertSubProfession = viewedProfile?.subProfession || "";

  // Function to handle logout
  function handleLogout(event: MouseEvent<HTMLDivElement>) {
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
      {/* Logo */}
      <h1 className="font-bold text-center text-gray-800 dark:text-white mt-3">
        LOGO
      </h1>

      {/* Profile Section */}
      <div className="flex flex-col items-center gap-2 mb-6">
        <img
          src={viewedProfile?.photo || profile}
          alt="Profile"
          className="rounded-full w-20 h-20 cursor-pointer object-cover"
          onClick={() => navigate("/details-form")}
        />
        <h2 className="text-lg font-semibold font-Raleway text-gray-800 dark:text-white">
          {expertName}
        </h2>
        <p className="text-gray-500 text-sm font-Opensans dark:text-gray-400">
          {expertAge}
        </p>
        <p className="text-gray-600 font-bold text-sm font-Raleway dark:text-gray-400">
          {expertProfession}
          {expertSubProfession ? ` - ${expertSubProfession}` : ""}
        </p>

        {/* Show loading indicator if profile is still loading */}
        {status === "loading" && (
          <div className="text-sm text-gray-500">Loading profile...</div>
        )}

        {/* Edit Profile Button */}
        <button
          onClick={() => navigate("/details-form")}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md px-4 py-2 text-sm font-medium mt-1 transition-colors"
        >
          Edit Profile
        </button>
      </div>

      {/* Navigation Items */}
      <div className="flex flex-col gap-3 w-full px-4">
        {expertSidebarMenuItems.map((menuItem) => {
          const isActive = location.pathname === menuItem.path;

          return (
            <div
              key={menuItem.id}
              onClick={() => {
                navigate(menuItem.path);
                if (setOpen) setOpen(false);
              }}
              className={`flex items-center gap-3 px-3 py-2 text-md cursor-pointer rounded-md transition-colors
                ${
                  isActive
                    ? "bg-gray-100 text-black font-medium dark:bg-gray-700 dark:text-white"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }
              `}
            >
              <i
                className={`${menuItem.icon} ${
                  isActive
                    ? "text-gray-800 dark:text-white"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              ></i>
              <span className={isActive ? "font-medium" : ""}>
                {menuItem.name}
              </span>
            </div>
          );
        })}
        <div
          className="cursor-pointer px-6 mt-2 flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </div>
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
