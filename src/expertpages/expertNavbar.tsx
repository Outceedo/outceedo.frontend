import profile2 from "../assets/images/profile2.jpg";
import "react-circular-progressbar/dist/styles.css";
import { useNavigate } from "react-router-dom";

const ExpertNavbar: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-lg p-6 h-full overflow-y-auto">
        <h1 className="font-bold text-center mb-2 text-gray-800 dark:text-white">LOGO</h1>
        
        <div className="text-center bg-slate-100 shadow-md dark:bg-gray-700 p-5 rounded-lg">
                 
                <img
                src={profile2}
                 alt="Profile"
                  className="rounded-full mx-auto w-24 h-24 cursor-pointer"
                onClick={() => navigate("/detailsform")}/>        
          <h2 className="text-lg font-semibold mt-4 font-Raleway text-gray-800 dark:text-white">Rohan Roshan</h2>
          <p className="text-gray-500 text-sm font-Opensans dark:text-gray-400">Under 15</p>
          <p className="text-gray-600 font-bold text-sm font-Raleway dark:text-gray-400">Goal Keeper</p>
        </div>
        <nav className="mt-6 font-Raleway font-semibold">
          <ul>
            {[
              { name: "Dashboard", icon: "fas fa-tachometer-alt", path: "" },
              { name: "Profile", icon: "fas fa-user-tie", path: "/expertdata" },
              { name: "My Bookings", icon: "fas fa-calendar-check", path: "" },
              { name: "Matches", icon: "fas fa-futbol", path: "" },
              { name: "Players", icon: "fas fa-user", path: "/playerpage" },
              { name: "Sponsors", icon: "fas fa-handshake", path: "" },
              
            ].map((item) => (
              <li key={item.name} className="p-3 hover:bg-gray-200 hover:shadow-md dark:hover:bg-gray-700 cursor-pointer rounded-lg flex items-center space-x-2">
                <div
      onClick={() => navigate(item.path)}
      className="flex items-center space-x-2 cursor-pointer"
    >
      <i className={`${item.icon} text-lg text-gray-800 dark:text-gray-300`}></i>
      <span className="text-gray-800 dark:text-white">{item.name}</span>
    </div>

              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 ml-64">
        {/* Main content will be rendered here based on route */}
      </div>
    </div>
  );
};

export default ExpertNavbar;
