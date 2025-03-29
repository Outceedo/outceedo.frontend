import profile1 from "../assets/images/profile1.jpg";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import SideNavbar from "./sideNavbar"; // Corrected import
import React, { useState } from 'react';
import PlayerHeader from "./playerheader";
import Media from "./media";
import ProfileDetails from "./profiledetails";
import Reviews from "./reviews";
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

const Profile: React.FC = ({ children }: { children?: React.ReactNode }) => {

   const [activeTab, setActiveTab] = useState<"details" | "media"| "reviews" >("details");

  return (
         
    
    <>
    <SidebarProvider>
      <div className="flex w-full dark:bg-gray-900">
        <SideNavbar />
        <div className="flex w-full">
          {/* Player Header */}
          <PlayerHeader />

          {/* Page Content */}
          <div className="w-full px-6 pt-4 pb-10 mt-20 ml-20 bg-white dark:bg-slate-800">
            {/* Render children if any */}
            {children}
        


          {/* Profile Info */}
          <div>
            <div className="flex  items-center">
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
            <div className="p-6">
      {/* Tab Navigation */}
      <div className="flex items-center border-b pb-2 gap-5">
        {(["details", "media", "reviews"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-lg font-semibold capitalize focus:outline-none ${
              activeTab === tab
                ? "text-red-600 border-b-2 border-red-600"
                : "text-gray-700 dark:text-white hover:text-red-600 dark:hover:text-red-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === "details" && (
          <div>
<ProfileDetails />
          </div>
        )}

        {activeTab === "media" && (
          <div>
            {/* Your media component */}
            <Media />
          </div>
        )}

        {activeTab === "reviews" && (
          <div>
            {/* Your reviews content goes here */}
           < Reviews />
          </div>
        )}
      </div>
    </div>
      </div>
</div> 
</div>
</div>
</SidebarProvider>    
      
    </>
  );
};

export default Profile;
