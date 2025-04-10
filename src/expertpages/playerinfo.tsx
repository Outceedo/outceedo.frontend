import React, { useState } from "react";
import profile1 from "../assets/images/profile1.jpg";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useNavigate } from "react-router-dom";
import Reviews from "./playerreviews";
import { Card } from "@/components/ui/card";
import PlayerMedia from "./playermedia";
import ProfileDetails from "./profiledetails";

interface Stat {
  label: string;
  percentage: number;
  color: string;
}

// Static stats data for the player profile
const stats: Stat[] = [
  { label: "Pace", percentage: 60, color: "#E63946" },
  { label: "Shooting", percentage: 55, color: "#D62828" },
  { label: "Passing", percentage: 80, color: "#4CAF50" },
  { label: "Dribbling", percentage: 65, color: "#68A357" },
  { label: "Defending", percentage: 90, color: "#2D6A4F" },
  { label: "Physical", percentage: 60, color: "#F4A261" },
];

const calculateOVR = (stats: Stat[]) => {
  const total = stats.reduce((sum, stat) => sum + stat.percentage, 0);
  return (total / stats.length).toFixed(1);
};

const OVR = calculateOVR(stats);

// Enhanced player data with social media links
const playerData = {
  id: "player123",
  name: "Rohan Roshan",
  age: 14,
  height: "166cm",
  weight: "45kg",
  location: "London, England",
  club: "Local FC",
  languages: ["English", "Spanish"],
  profileImage: profile1,
  stats: stats,
  aboutMe:
    "I am from London, UK. A passionate, versatile musician bringing light to classics from Ella Fitzgerald to Guns and Roses. Guaranteed to get the crowd dancing.",
  certificates: [
    "Fundamentals of Music Theory",
    "Getting Started With Music Theory",
  ],
  awards: ["Junior Music Championship 2023", "Best Performer Award 2024"],
  socials: {
    linkedin: "https://linkedin.com/in/rohan-roshan",
    instagram: "https://instagram.com/rohan.music",
    facebook: "https://facebook.com/rohanroshan",
    twitter: "https://twitter.com/rohan_music",
  },
};

const ExpertviewProfile: React.FC = () => {
  

  const [activeTab, setActiveTab] = useState<"details" | "media" | "reviews">(
    "details"
  );
  const navigate=useNavigate();
  return (
    <div className="flex w-full min-h-screen dark:bg-gray-900">
      <div className="flex-1 p-4">
        <div className="ml-8">
        <div  onClick={() => navigate(-1)} className=" flex flex-col text-4xl font-bold text-start"> ← </div> 
          <div className="flex flex-col lg:flex-row gap-6 items-start mt-4">
         
            <img
              src={playerData.profileImage}
              alt={`${playerData.name}'s profile`}
              className="rounded-lg w-60 h-60 object-cover shadow-md"
            />

            <div className="flex flex-col mt-5 w-full gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white font-Raleway">
                  {playerData.name}
                </h2>
                <div className="flex flex-wrap gap-8 text-gray-600 font-Opensans mt-2 dark:text-gray-300">
                  <span>Age: {playerData.age}</span>
                  <span>{playerData.height}</span>
                  <span>{playerData.weight}</span>
                  <span>{playerData.location}</span>
                  <span>{playerData.club}</span>
                  <span>{playerData.languages.join(", ")}</span>
                </div>
              </div>

              {/* OVR Section */}
              <Card className="bg-yellow-100 dark:bg-gray-700 p-3 w-fit">
                <div className="flex flex-wrap gap-6 items-center">
                  <div>
                    <h2 className="text-xl text-gray-800 dark:text-white">
                      <span className="block font-bold font-opensans text-3xl">
                        {OVR}
                      </span>
                      <span className="text-xl font-opensans">OVR</span>
                    </h2>
                  </div>

                  {stats.map((stat, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className="w-20 h-20 relative"
                        style={{ transform: "rotate(-90deg)" }}
                      >
                        <CircularProgressbar
                          value={stat.percentage}
                          styles={buildStyles({
                            textSize: "26px",
                            pathColor: stat.color,
                            trailColor: "#ddd",
                            strokeLinecap: "round",
                          })}
                          circleRatio={0.5}
                        />
                        <div
                          className="absolute inset-0 flex items-center justify-center text-sm ml-3 font-semibold font-opensans text-stone-800 dark:text-white"
                          style={{ transform: "rotate(90deg)" }}
                        >
                          {stat.percentage}%
                        </div>
                      </div>
                      <p className="text-sm -mt-8 font-opensans text-gray-700 dark:text-white">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="mt-8">
            <div className="flex gap-4 border-b pb-2">
              {(["details", "media", "reviews"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-md font-medium capitalize transition-all duration-150 px-2 pb-1 border-b-2 ${
                    activeTab === tab
                      ? "text-red-600 border-red-600"
                      : "border-transparent text-gray-600 dark:text-white hover:text-red-600"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>            
           <div className="mt-4 ">
              {/* Pass isExpertView prop to all components to disable editing */}
              {activeTab === "details" && (
                <ProfileDetails playerData={playerData} isExpertView={true} />
              )}
              {activeTab === "media" && (
                <PlayerMedia playerId={playerData.id} isExpertView={true} />
              )}
              {activeTab === "reviews" && (
                <Reviews playerId={playerData.id} isExpertView={true} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertviewProfile;
