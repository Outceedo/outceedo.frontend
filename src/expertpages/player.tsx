import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLinkedin, faInstagram, faFacebook,faTwitter } from "@fortawesome/free-brands-svg-icons";
import profile1 from "../assets/images/profile1.jpg";
import { useNavigate } from 'react-router-dom'; // Correct import for Link
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import ExpertNavbar from "./expertNavbar"; // Corrected import
import ExpertHeader from "./expertheader";
import { SidebarProvider } from "@/components/ui/sidebar"
interface Stat {
  label: string;
  percentage: number;
  color: string;
}

// Stats data
const stats: Stat[] = [
  { label: "Pace", percentage: 60, color: "#E63946" },
  { label: "Shooting", percentage: 55, color: "#D62828" },
  { label: "Passing", percentage: 80, color: "#4CAF50" },
  { label: "Dribbling", percentage: 65, color: "#68A357" },
  { label: "Defending", percentage: 90, color: "#2D6A4F" },
  { label: "Physical", percentage: 60, color: "#F4A261" },
];

// Function to calculate the average OVR value
const calculateOVR = (stats: Stat[]) => {
  const totalPercentage = stats.reduce((acc, stat) => acc + stat.percentage, 0);
  return (totalPercentage / stats.length).toFixed(1); // Round to 1 decimal place
};

const OVR = calculateOVR(stats);

const Player: React.FC = ({ children }: { children?: React.ReactNode }) => {
  const navigate= useNavigate();
  return (
    <>
      <SidebarProvider>
      <div className="flex w-full  dark:bg-gray-900">
        <ExpertNavbar />
        <div className="flex w-full">
          {/* Player Header */}
          <ExpertHeader />

          {/* Page Content */}
          <div className="w-full px-6 pt-4 pb-10 mt-20 ml-20 bg-white dark:bg-slate-800">
            {/* Render children if any */}
            {children}
    

          {/* Profile Info */}
          <div className="bg-white shadow-lg rounded-lg p-10 mt-10 dark:bg-gray-800 dark:text-white">
            <div className="flex items-center">
              <img src={profile1} alt="Player" className="rounded-full w-40 h-40" />
              <div className="ml-4">
                <h2 className="text-xl font-Raleway font-semibold">Rohan Roshan</h2>
                <p className="text-gray-500 font-Opensans dark:text-gray-400">Age 14 | 166cm | 45kg | London, England</p>
              </div>
            </div>

            {/* OVR Overview */}
            <div className="bg-yellow-100 p-3 rounded-lg shadow-lg w-full mx-auto mb-6 mt-10 dark:bg-gray-700">
              {/* Progress Bars */}
              <div className="flex justify-center gap-5">
                <div className="text-left mb-6">
                  <h2 className="text-3xl font-bold mr-28 mt-5 text-gray-800 dark:text-white">
                    <span className="block font-light text-4xl">{OVR}%</span>  {/* Percentage on top */}
                    <span className="text-xl font-Raleway "> OVR </span>  {/* OVR text below */}
                  </h2>
                </div>
                {stats.map((stat, index) => (
                  <div key={index} className="flex flex-col items-center relative">
                    <div className="w-24 h-24 relative" style={{ transform: "rotate(-90deg)" }}>
                      {/* Circular Progressbar */}
                      <CircularProgressbar
                        value={stat.percentage}
                        styles={buildStyles({
                          textSize: "26px",
                          pathColor: stat.color,
                          textColor: "#333",
                          trailColor: "#ddd",
                          strokeLinecap: "round",
                        })}
                        circleRatio={0.5}
                      />
                      {/* Percentage Text inside Progressbar */}
                      <div
                        className="absolute inset-0 flex items-center justify-center text-2xl font-semibold text-stone-800 dark:text-white"
                        style={{
                          transform: `rotate(90deg)`, // Rotate text back to normal position
                        }}
                      >
                        {stat.percentage}%
                      </div>
                    </div>
                    <p className="text-sm font-bold text-gray-700 font-Raleway dark:text-white">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Details Section */}
            <div className="mt-4">
            <div className="flex items-center border-b pb-2 gap-5">
      <span
        onClick={() => navigate("/player")}
        className="cursor-pointer text-gray-700 font-Raleway text-lg font-semibold hover:text-red-600 dark:text-white dark:hover:text-red-600"
      >
        Details
      </span>
      <span
        onClick={() => navigate("/playermedia")}
        className="cursor-pointer text-gray-700 font-Raleway text-lg font-semibold hover:text-red-600 dark:text-white dark:hover:text-red-600"
      >
        Media
      </span>
      <span
        onClick={() => navigate("/playerreviews")}
        className="cursor-pointer text-gray-700 font-Raleway text-lg font-semibold hover:text-red-600 dark:text-white dark:hover:text-red-600"
      >
        Reviews
      </span>
    </div>            </div>

               {/* About Me Section */}
          <div className="mt-4 relative border p-4 rounded-lg dark:bg-gray-700 dark:text-white">
            <h3 className="text-lg font-semibold">About Me</h3>
           <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Laboriosam adipisci omnis corporis architecto placeat vel asperiores nostrum non blanditiis, praesentium, voluptatem officiis rerum vitae in veritatis quo temporibus, accusantium sequi.</p>
           
          </div>

            {/* Certificates & Awards */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="relative border p-4 rounded-lg dark:bg-gray-700">
              <h3 className="text-lg font-semibold">Certificates</h3>
              <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Sint dolores sed, ullam quis non magnam? Sapiente </p>
                  
               </div> 
            
            
              <div className="relative border p-4 rounded-lg dark:bg-gray-700">
              <h3 className="text-lg font-semibold">Awards</h3>
             <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam quae natus quasi voluptas eius minus laboriosam! </p>
            </div>
          </div>
          
          </div>

            {/* Social Links */}
            <div className="mt-4 relative border p-4 rounded-lg dark:bg-gray-700">
              <h3 className="text-lg font-Raleway font-semibold">Socials</h3>
              <div className="flex space-x-4 mt-2">
                <FontAwesomeIcon icon={faLinkedin} className="text-blue-600 text-3xl cursor-pointer" />
                <FontAwesomeIcon icon={faInstagram} className="text-pink-600 text-3xl cursor-pointer" />
                <FontAwesomeIcon icon={faFacebook} className="text-blue-800 text-3xl cursor-pointer" />
                <FontAwesomeIcon icon={faTwitter} className="text-blue-600 text-3xl cursor-pointer" />
              </div>
             
  </div>
  </div>
  </div>
  </div>
  </SidebarProvider>
  
  </>
          
        
  );
};

export default Player;