import { AlignJustify, LogOut } from "lucide-react";
import { Button } from "../ui/button";

interface PlayerHeaderProps {
  setOpen: (open: boolean) => void;
}

function PlayerHeader({ setOpen }: PlayerHeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-background border-b">
      <Button
        onClick={() => setOpen(true)}
        className="lg:hidden sm:block bg-green-200 text-black hover:bg-green-300"
      >
        <AlignJustify />
        <span className="sr-only">Toggle Menu</span>
      </Button>
      <div className="flex flex-1 justify-end">
        <button className="h-12 w-full border p-4 rounded-lg flex items-center justify-center space-x-3 bg-slate-100 dark:bg-gray-800">
          <i className="fas fa-gem text-blue-700"></i>
          <p className="text-gray-800 font-Opensans dark:text-white">
            Upgrade to Premium
          </p>
        </button>
        <Button className="inline-flex gap-2 items-center rounded-md px-4 py-2 text-sm font-medium shadow bg-green-600 text-white hover:bg-green-700">
          <LogOut />
          Logout
        </Button>
      </div>
    </header>
  );
}

export default PlayerHeader;
