import { Outlet } from "react-router-dom";
import Seo from "@/components/seo/Seo";

import { useState } from "react";
import SponsorHeader from "./Header";
import SponsorSideBar from "./sidebar";

function SponsorLayout() {
  const [openSidebar, setOpenSidebar] = useState(false);

  return (
    <div className="flex min-h-screen w-full dark:bg-gray-900">
      <Seo title="Sponsor" noindex />
      <SponsorSideBar open={openSidebar} setOpen={setOpenSidebar} />
      <div className="flex flex-1 flex-col min-w-0">
        <SponsorHeader setOpen={setOpenSidebar} />
        <main className="flex-1 flex-col flex bg-muted/40 p-4 md:p-6 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default SponsorLayout;
