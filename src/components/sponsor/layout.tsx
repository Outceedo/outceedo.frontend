import { Outlet } from "react-router-dom";

import { useState } from "react";
import SponsorHeader from "./Header";
import SponsorSideBar from "./sidebar";

function SponsorLayout() {
  const [openSidebar, setOpenSidebar] = useState(false);

  return (
    <div className="flex min-h-screen w-full dark:bg-gray-900">
      <SponsorSideBar open={openSidebar} setOpen={setOpenSidebar} />
      <div className="flex flex-1 flex-col ">
        <SponsorHeader setOpen={setOpenSidebar} />
        <main className="flex-1 flex-col flex bg-muted/40 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default SponsorLayout;
