import { Outlet } from "react-router-dom";
import PlayerSideBar from "./sidebar";
import PlayerHeader from "./Header";
import { useState } from "react";

function PlayerLayout() {
  const [openSidebar, setOpenSidebar] = useState(false);

  return (
    <div className="flex min-h-screen w-full dark:bg-gray-900">
      <PlayerSideBar open={openSidebar} setOpen={setOpenSidebar} />
      <div className="flex flex-1 flex-col ">
        <PlayerHeader setOpen={setOpenSidebar} />
        <main className="flex-1 flex-col flex bg-muted/40 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default PlayerLayout;
