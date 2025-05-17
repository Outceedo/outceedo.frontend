import { Outlet } from "react-router-dom";
import TeamSideBar from "./sidebar";
import TeamHeader from "./Header";
import { useState } from "react";

function TeamLayout() {
  const [openSidebar, setOpenSidebar] = useState(false);

  return (
    <div className="flex min-h-screen w-full dark:bg-gray-900">
      <TeamSideBar open={openSidebar} setOpen={setOpenSidebar} />
      <div className="flex flex-1 flex-col ">
        <TeamHeader setOpen={setOpenSidebar} />
        <main className="flex-1 flex-col flex bg-muted/40 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default TeamLayout;
