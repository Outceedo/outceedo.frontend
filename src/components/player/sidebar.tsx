import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";

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
    icon: "fas fa-tachometer-alt",
    path: "/player/dashboard",
  },
  { id: 2, name: "Profile", icon: "fas fa-user", path: "/profile" },
  {
    id: 3,
    name: "My Bookings",
    icon: "fas fa-calendar-check",
    path: "/mybooking",
  },
  { id: 4, name: "Matches", icon: "fas fa-futbol", path: "/matches" },
  { id: 5, name: "Experts", icon: "fas fa-user-tie", path: "/viewexperts" },
  { id: 6, name: "Sponsors", icon: "fas fa-handshake", path: "/sponsors" },
];

interface MenuItemsProps {
  setOpen?: (open: boolean) => void;
}

function MenuItems({ setOpen }: MenuItemsProps) {
  const navigate = useNavigate();

  return (
    <nav className="mt-8 flex-col flex gap-2">
      {adminSidebarMenuItems.map((menuItem) => (
        <div
          key={menuItem.id}
          onClick={() => {
            navigate(menuItem.path);
            if (setOpen) setOpen(false);
          }}
          className="flex cursor-pointer text-xl items-center gap-2 rounded-md px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <i className={menuItem.icon}></i>
          <span>{menuItem.name}</span>
        </div>
      ))}
    </nav>
  );
}

interface PlayerSideBarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

function PlayerSideBar({ open, setOpen }: PlayerSideBarProps) {
  const navigate = useNavigate();

  return (
    <Fragment>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64">
          <div className="flex flex-col h-full">
            <SheetHeader className="border-b">
              <SheetTitle className="flex gap-2 mt-5 mb-5">
                {/* <h1 className="text-2xl font-extrabold">Admin Panel</h1> */}
              </SheetTitle>
            </SheetHeader>
            <MenuItems setOpen={setOpen} />
          </div>
        </SheetContent>
      </Sheet>
      <aside className="hidden w-64 flex-col border-r bg-background p-6 lg:flex">
        <div
          onClick={() => navigate("/admin/dashboard")}
          className="flex cursor-pointer items-center gap-2"
        >
          {/* <h1 className="text-2xl font-extrabold">Admin Panel</h1> */}
        </div>
        <MenuItems />
      </aside>
    </Fragment>
  );
}

export default PlayerSideBar;
