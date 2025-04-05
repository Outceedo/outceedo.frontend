import { Outlet } from "react-router-dom";
import ExpertSideBar from "./sidebar";
import ExpertHeader from "./Header";
import { useState } from "react";

function ExpertLayout() {
  const [openSidebar, setOpenSidebar] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      <ExpertSideBar open={openSidebar} setOpen={setOpenSidebar} />
      <div className="flex flex-1 flex-col">
        <ExpertHeader setOpen={setOpenSidebar} />
        <main className="flex-1 flex-col flex bg-muted/40 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default ExpertLayout;
