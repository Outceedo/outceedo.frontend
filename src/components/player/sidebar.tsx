// Updated PlayerSideBar with isActive logic and header label sync

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
  { id: 1, name: "Dashboard", icon: "fas fa-table-columns", path: "/player/dashboard" },
  { id: 2, name: "Experts", icon: "fas fa-user-tie", path: "/player/viewexperts" },
  { id: 3, name: "Matches", icon: "fas fa-futbol", path: "/player/matches" },
  { id: 4, name: "My Bookings", icon: "fas fa-calendar-check", path: "/player/mybooking" },
  { id: 5, name: "Sponsors", icon: "fas fa-handshake", path: "/player/sponsors" },
  { id: 6, name: "Profile", icon: "fas fa-user", path: "/player/profile" },
];

interface MenuItemsProps {
  setOpen?: (open: boolean) => void;
}

function MenuItems({ setOpen }: MenuItemsProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="flex-col flex gap-2 p-4 fixed ">
      <h1 className="font-bold text-center mb-2 text-gray-800 dark:text-white">LOGO</h1>

      <div className="text-center p-5 rounded-md ml-3 mb-4">
        <img
          src={profile}
          alt="Profile"
          className="rounded-full mx-auto w-24 h-24 cursor-pointer"
          onClick={() => navigate("/detailsform")}
        />
        <h2 className="text-lg font-semibold mt-4 font-Raleway text-gray-800 dark:text-white">Rohan Roshan</h2>
        <p className="text-gray-500 text-sm font-Opensans dark:text-gray-400">Under 15</p>
        <p className="text-gray-600 font-bold text-sm font-Raleway dark:text-gray-400">Goal Keeper</p>
      </div>

      {adminSidebarMenuItems.map((menuItem) => {
        const isActive = location.pathname === menuItem.path;

        return (
          <div
            key={menuItem.id}
            onClick={() => {
              navigate(menuItem.path);
              if (setOpen) setOpen(false);
            }}
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-md cursor-pointer 
              ${isActive ? "bg-muted text-foreground font-semibold dark:bg-gray-700" : "text-muted-foreground hover:dark:bg-gray-700  hover:text-foreground "}
            `}
          >
            <i className={`${menuItem.icon}`}></i>
            <span>{menuItem.name}</span>
          </div>
        );
      })}
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
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-56">
          <div className="flex flex-col h-full">
            <MenuItems setOpen={setOpen} />
          </div>
        </SheetContent>
      </Sheet>
      <aside className="hidden w-64 flex-col border-r bg-background p-6 lg:flex dark:bg-slate-950">
        <MenuItems />
      </aside>
    </Fragment>
  );
}

export default PlayerSideBar;
