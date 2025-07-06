import { Outlet } from "react-router-dom";
import ExpertSideBar from "./sidebar";
import ExpertHeader from "./Header";
import { useState } from "react";

function ExpertLayout() {
  const [openSidebar, setOpenSidebar] = useState(false);

  return (
    <div className="flex min-h-screen w-full dark:bg-gray-900">
      {/* Sidebar for desktop */}
      <div className="hidden md:block">
        <ExpertSideBar open={true} setOpen={setOpenSidebar} />
      </div>

      {/* Sidebar drawer for mobile */}
      <div
        className={`fixed inset-0 z-40 transition-transform duration-200 md:hidden ${
          openSidebar ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-black/40 transition-opacity ${
            openSidebar ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setOpenSidebar(false)}
        />
        {/* Sidebar */}
        <div className="relative z-50 h-full w-64 bg-white dark:bg-gray-800 shadow-lg">
          <ExpertSideBar open={openSidebar} setOpen={setOpenSidebar} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        <ExpertHeader setOpen={setOpenSidebar} />
        <main className="flex-1 flex flex-col bg-muted/40 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default ExpertLayout;