import { Outlet } from "react-router-dom";
import ExpertSideBar from "./sidebar";
import ExpertHeader from "./Header";
import { useState } from "react";

function ExpertLayout() {
  const [openSidebar, setOpenSidebar] = useState(false);

  return (
    <div className="flex min-h-screen w-full dark:bg-gray-900">
  <ExpertSideBar open={openSidebar} setOpen={setOpenSidebar} />
  <div className="flex flex-1 flex-col min-w-0">
    <ExpertHeader setOpen={setOpenSidebar} />
    <main className="flex-1 flex-col flex bg-muted/40 p-2 sm:p-4 md:p-6 lg:p-8 overflow-x-hidden">
      <div className="w-full max-w-full">
        <Outlet />
      </div>
    </main>
  </div>
</div>
  );
}

export default ExpertLayout;
