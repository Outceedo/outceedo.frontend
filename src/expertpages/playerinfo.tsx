import React, { useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import profile1 from "../assets/images/profile1.jpg";

// Import components
import Media from "../Playerpages/MediaUpload";
import ProfileDetails from "../Playerpages/profiledetails";
import Reviews from "../Playerpages/reviews";

// Types definition for better scalability
interface Stat {
  label: string;
  percentage: number;
  color: string;
}

interface PlayerData {
  id: string;
  name: string;
  age: number;
  height: string;
  weight: string;
  location: string;
  profileImage: string;
  stats: Stat[];
}

// Tab type for better type safety
type TabType = "details" | "media" | "reviews";

// Mock data - this would come from an API in the future
const playerData: PlayerData = {
  id: "player123",
  name: "Rohan Roshan",
  age: 14,
  height: "166cm",
  weight: "45kg",
  location: "London, England",
  profileImage: profile1,
  stats: [
    { label: "Pace", percentage: 60, color: "#E63946" },
    { label: "Shooting", percentage: 55, color: "#D62828" },
    { label: "Passing", percentage: 80, color: "#4CAF50" },
    { label: "Dribbling", percentage: 65, color: "#68A357" },
    { label: "Defending", percentage: 90, color: "#2D6A4F" },
    { label: "Physical", percentage: 60, color: "#F4A261" },
  ],
};

// Function to calculate the average OVR value - moved outside component for reusability
const calculateOVR = (stats: Stat[]): string => {
  const totalPercentage = stats.reduce((acc, stat) => acc + stat.percentage, 0);
  return (totalPercentage / stats.length).toFixed(1);
};

const Profile: React.FC = () => {
  // State management
  const [activeTab, setActiveTab] = useState<TabType>("details");
  const [player] = useState<PlayerData>(playerData); // In real app, this would be fetched from an API

  // Calculate OVR
  const ovrValue = calculateOVR(player.stats);

  // Tab configuration for easy extension
  const tabs: { id: TabType; label: string }[] = [
    { id: "details", label: "Details" },
    { id: "media", label: "Media" },
    { id: "reviews", label: "Reviews" },
  ];

  return (
    <div className="flex">
      <div className="bg-white h-full w-full rounded-lg p-6 dark:bg-gray-800 dark:text-white shadow-md">
        {/* Profile Header */}
        <div className="flex items-center">
          <img
            src={player.profileImage}
            alt={`${player.name}'s profile`}
            className="rounded-full w-40 h-40 object-cover border-4 border-gray-200 dark:border-gray-700 shadow-lg"
          />
          <div className="ml-6">
            <h2 className="text-2xl font-Raleway font-semibold">
              {player.name}
            </h2>
            <p className="text-gray-500 font-Opensans dark:text-gray-400">
              Age {player.age} | {player.height} | {player.weight} |{" "}
              {player.location}
            </p>
          </div>
        </div>

        {/* OVR Stats Overview */}
        <div className="bg-yellow-100 p-5 rounded-lg shadow-lg w-full mx-auto my-8 dark:bg-gray-700 transition-all duration-300 hover:shadow-xl">
          <div className="flex justify-between items-center flex-wrap gap-4">
            {/* OVR Display */}
            <div className="text-center mb-4 sm:mb-0">
              <div className="flex flex-col items-center">
                <span className="block text-4xl font-bold text-gray-800 dark:text-white">
                  {ovrValue}%
                </span>
                <span className="text-xl font-Raleway text-gray-700 dark:text-gray-300">
                  OVR
                </span>
              </div>
            </div>

            {/* Stats Progress Bars */}
            <div className="flex flex-wrap justify-center gap-5 flex-1">
              {player.stats.map((stat, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className="w-20 h-20 sm:w-24 sm:h-24 relative"
                    style={{ transform: "rotate(-90deg)" }}
                  >
                    <CircularProgressbar
                      value={stat.percentage}
                      styles={buildStyles({
                        textSize: "26px",
                        pathColor: stat.color,
                        textColor: "#333",
                        trailColor: "rgba(200,200,200,0.3)",
                        strokeLinecap: "round",
                      })}
                      circleRatio={0.5}
                    />
                    <div
                      className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-stone-800 dark:text-white"
                      style={{ transform: "rotate(90deg)" }}
                    >
                      {stat.percentage}%
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-700 font-Raleway dark:text-white mt-2">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="p-4">
          <div className="flex items-center border-b pb-2 gap-5 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-lg font-semibold capitalize px-3 py-2 focus:outline-none transition-all duration-300 ${
                  activeTab === tab.id
                    ? "text-red-600 border-b-2 border-red-600"
                    : "text-gray-700 dark:text-white hover:text-red-600 dark:hover:text-red-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === "details" && (
              <ProfileDetails
                playerData={player}
                isExpertView={true} // Passing a prop to indicate this is expert view (read-only)
              />
            )}

            {activeTab === "media" && (
              <Media
                playerId={player.id}
                isExpertView={true} // Passing a prop to indicate this is expert view (read-only)
              />
            )}

            {activeTab === "reviews" && (
              <Reviews
                playerId={player.id}
                isExpertView={true} // Passing a prop to indicate this is expert view (read-only)
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
