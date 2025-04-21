import { Fragment } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sheet, SheetContent } from "../ui/sheet";
import "@fortawesome/fontawesome-free/css/all.min.css";
import profile from "../../assets/images/profile.jpg";

interface MenuItem {
  id: number;
  name: string;
  icon: string;
  path: string;
}

const adminSidebarMenuItems: MenuItem[] = [
  {
    id: 1,
    name: "Dashboard",
    icon: "fas fa-table-columns",
    path: "/player/dashboard",
  },
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
  { id: 6, name: "Profile", icon: "fas fa-user", path: "/player/profile" },
];

interface MenuItemsProps {
  setOpen?: (open: boolean) => void;
}

function MenuItems({ setOpen }: MenuItemsProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="flex flex-col gap-6 p-4 w-full h-full overflow-y-auto">
      {/* Logo */}
      <h1 className="font-bold text-center text-gray-800 dark:text-white mt-6">
        LOGO
      </h1>

      {/* Profile Section */}
      <div className="flex flex-col items-center gap-2 mb-6">
        <img
          src={profile}
          alt="Profile"
          className="rounded-full w-20 h-20 cursor-pointer"
          onClick={() => navigate("/detailsform")}
        />
        <h2 className="text-lg font-semibold font-Raleway text-gray-800 dark:text-white">
          Rohan Roshan
        </h2>
        <p className="text-gray-500 text-sm font-Opensans dark:text-gray-400">
          Under 15
        </p>
        <p className="text-gray-600 font-bold text-sm font-Raleway dark:text-gray-400">
          Goal Keeper
        </p>

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
        {adminSidebarMenuItems.map((menuItem) => {
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
      </div>
    </nav>
  );
}

interface PlayerSideBarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

function PlayerSideBar({ open, setOpen }: PlayerSideBarProps) {
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
