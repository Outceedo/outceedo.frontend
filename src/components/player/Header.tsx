import { AlignJustify, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faGem } from "@fortawesome/free-solid-svg-icons";

interface PlayerHeaderProps {
  setOpen: (open: boolean) => void;
}

function PlayerHeader({ setOpen }: PlayerHeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-background">
      <Button
        onClick={() => setOpen(true)}
        className="lg:hidden sm:block bg-white text-black hover:bg-slate-100"
      >
        <AlignJustify />
        <span className="sr-only">Toggle Menu</span>
      </Button>
      <div className="flex justify-end gap-3 items-center w-full">
        <Button className="h-12 w-48 md:w-56 border p-4 rounded-lg flex items-center justify-center space-x-3 bg-slate-100 hover:bg-slate-200">
          
          <FontAwesomeIcon
            icon={faGem}
            className="text-blue-700 dark:text-gray-400 text-xl"
          />
          <p className="text-gray-800 font-Opensans dark:text-white ">
            Upgrade to Premium
          </p>
        </Button>
        <Button className="bg-white hover:bg-white">
          <FontAwesomeIcon
            icon={faBell}
            className="text-black dark:text-slate-200 text-xl"
          />
        </Button>
      </div>
    </header>
  );
}

export default PlayerHeader;
