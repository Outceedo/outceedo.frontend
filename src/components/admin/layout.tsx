import { Outlet, useLocation } from "react-router-dom";
import AdminSideBar from "./sidebar";
import AdminHeader from "./header";
import { useState } from "react";
import { sidebarMenus } from "./sidebar";

function getRoleFromPath(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] === "admin" && sidebarMenus[segments[1]]) {
    return segments[1];
  }
  if (sidebarMenus[segments[0]]) {
    return segments[0];
  }
  return "admin";
}

function AdminLayout() {
  const [openSidebar, setOpenSidebar] = useState(false);
 const location = useLocation();
  const role = getRoleFromPath(location.pathname);
  return (
    <div className="flex min-h-screen w-full dark:bg-gray-900">
      <AdminSideBar open={openSidebar} setOpen={setOpenSidebar} role={role} />
      <div className="flex flex-1 flex-col">
        <AdminHeader setOpen={setOpenSidebar} />
        <main className="flex-1 flex-col flex bg-muted/40 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
