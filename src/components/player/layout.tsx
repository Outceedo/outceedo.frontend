import { Outlet } from "react-router-dom";
import PlayerSideBar from "./sidebar";
import PlayerHeader from "./Header";
import { useState } from "react";

function PlayerLayout() {
  const [openSidebar, setOpenSidebar] = useState(false);

  return (
    <div className="flex min-h-screen w-full dark:bg-gray-900">
      {/* Sidebar component - appears on left for desktop, slides in for mobile */}
      <PlayerSideBar open={openSidebar} setOpen={setOpenSidebar} />
      
      {/* Main content container */}
      <div className="flex flex-1 flex-col w-full">
        {/* Header - always at top */}
        <PlayerHeader setOpen={setOpenSidebar} />
        
        {/* Main content area with responsive padding */}
        <main className="flex-1 flex-col flex bg-muted/40 p-2 sm:p-4 md:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default PlayerLayout;