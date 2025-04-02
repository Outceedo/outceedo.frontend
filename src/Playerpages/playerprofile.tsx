import React, { useState, useEffect, useRef } from "react";
import profile1 from "../assets/images/profile1.jpg";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faSave,
  faTimes,
  faCamera,
} from "@fortawesome/free-solid-svg-icons";

import Media from "./media";
import ProfileDetails from "./profiledetails";
import Reviews from "./reviews";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

interface Stat {
  label: string;
  percentage: number;
  color: string;
}

const initialStats: Stat[] = [
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

// Initial player data
const initialPlayerData = {
  id: "player123",
  name: "Rohan Roshan",
  age: 14,
  height: "166cm",
  weight: "45kg",
  location: "London, England",
  club: "Local FC",
  languages: ["English", "Spanish"],
  profileImage: profile1,
  stats: initialStats,
  aboutMe:
    "I am from London, UK. A passionate versatile player with dedication to improving my skills.",
  certificates: [
    "Youth Football Academy Certificate",
    "Junior League MVP 2023",
  ],
  awards: ["Best Young Talent 2022", "Regional Championship Winner 2023"],
  socials: {
    linkedin: "https://linkedin.com/in/rohan-roshan",
    instagram: "https://instagram.com/rohan.player",
    facebook: "https://facebook.com/rohanroshan",
    twitter: "https://twitter.com/rohan_player",
  },
};

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"details" | "media" | "reviews">(
    "details"
  );

  // File input reference
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for player data
  const [playerData, setPlayerData] = useState(initialPlayerData);

  // State for editing mode
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingStats, setIsEditingStats] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // State for temporary edits
  const [tempProfile, setTempProfile] = useState(playerData);
  const [tempStats, setTempStats] = useState(playerData.stats);

  // Calculate OVR score
  const ovrScore = calculateOVR(playerData.stats);

  // Load saved data from localStorage if available
  useEffect(() => {
    const savedProfile = localStorage.getItem("playerProfile");
    if (savedProfile) {
      setPlayerData(JSON.parse(savedProfile));
      setTempProfile(JSON.parse(savedProfile));
      setTempStats(JSON.parse(savedProfile).stats);
    }
  }, []);

  // Handle profile photo change
  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Convert to base64 for preview and storage
    const reader = new FileReader();
    reader.onload = (e) => {
      const updatedProfile = {
        ...playerData,
        profileImage: e.target?.result as string,
      };

      setPlayerData(updatedProfile);
      setTempProfile(updatedProfile);
      localStorage.setItem("playerProfile", JSON.stringify(updatedProfile));

      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle profile edits
  const handleProfileChange = (field: string, value: any) => {
    setTempProfile({
      ...tempProfile,
      [field]: value,
    });
  };

  // Handle stat changes
  const handleStatChange = (index: number, value: number) => {
    const newStats = [...tempStats];
    newStats[index].percentage = value;
    setTempStats(newStats);
  };

  // Save profile changes
  const saveProfileChanges = () => {
    setPlayerData(tempProfile);
    setIsEditingProfile(false);
    localStorage.setItem("playerProfile", JSON.stringify(tempProfile));
  };

  // Save stats changes
  const saveStatsChanges = () => {
    const updatedPlayerData = {
      ...playerData,
      stats: tempStats,
    };
    setPlayerData(updatedPlayerData);
    setIsEditingStats(false);
    localStorage.setItem("playerProfile", JSON.stringify(updatedPlayerData));
  };

  // Cancel edits
  const cancelProfileEdit = () => {
    setTempProfile(playerData);
    setIsEditingProfile(false);
  };

  const cancelStatsEdit = () => {
    setTempStats(playerData.stats);
    setIsEditingStats(false);
  };

  return (
    <div className="flex w-full min-h-screen dark:bg-gray-900">
      <div className="flex-1 p-4">
        <div className="ml-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start mt-4 relative">
            {/* Profile Image with Edit Capability */}
            <div className="relative group">
              <img
                src={playerData.profileImage}
                alt={`${playerData.name}'s profile`}
                className="rounded-lg w-60 h-60 object-cover shadow-md"
              />
              <div
                onClick={handlePhotoClick}
                className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-lg cursor-pointer"
              >
                <div className="text-white text-center">
                  <FontAwesomeIcon icon={faCamera} size="2x" className="mb-2" />
                  <p className="text-sm font-medium">Change Photo</p>
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Profile Info */}
            <div className="flex flex-col mt-5 w-full gap-4">
              {!isEditingProfile ? (
                <>
                  <div className="relative">
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
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="absolute top-0 right-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name
                    </label>
                    <Input
                      value={tempProfile.name}
                      onChange={(e) =>
                        handleProfileChange("name", e.target.value)
                      }
                      className="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Age
                      </label>
                      <Input
                        type="number"
                        value={tempProfile.age}
                        onChange={(e) =>
                          handleProfileChange("age", parseInt(e.target.value))
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Height
                      </label>
                      <Input
                        value={tempProfile.height}
                        onChange={(e) =>
                          handleProfileChange("height", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Weight
                      </label>
                      <Input
                        value={tempProfile.weight}
                        onChange={(e) =>
                          handleProfileChange("weight", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Location
                      </label>
                      <Input
                        value={tempProfile.location}
                        onChange={(e) =>
                          handleProfileChange("location", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Club
                      </label>
                      <Input
                        value={tempProfile.club}
                        onChange={(e) =>
                          handleProfileChange("club", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Languages
                      </label>
                      <Input
                        value={tempProfile.languages.join(", ")}
                        onChange={(e) =>
                          handleProfileChange(
                            "languages",
                            e.target.value.split(", ")
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <Button variant="outline" onClick={cancelProfileEdit}>
                      <FontAwesomeIcon icon={faTimes} className="mr-1" /> Cancel
                    </Button>
                    <Button
                      variant="default"
                      className="bg-red-600 hover:bg-red-700"
                      onClick={saveProfileChanges}
                    >
                      <FontAwesomeIcon icon={faSave} className="mr-1" /> Save
                    </Button>
                  </div>
                </div>
              )}

              {/* OVR Section */}
              <Card className="bg-yellow-100 dark:bg-gray-700 p-3 w-full md:w-fit relative">
                {!isEditingStats ? (
                  <>
                    <div className="flex flex-wrap gap-6 items-center">
                      <div>
                        <h2 className="text-xl text-gray-800 dark:text-white">
                          <span className="block font-bold font-opensans text-3xl">
                            {ovrScore}
                          </span>
                          <span className="text-xl font-opensans">OVR</span>
                        </h2>
                      </div>

                      {playerData.stats.map((stat, index) => (
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
                    <button
                      onClick={() => setIsEditingStats(true)}
                      className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      Edit Stats
                    </h3>

                    {tempStats.map((stat, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {stat.label}
                          </label>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {stat.percentage}%
                          </span>
                        </div>
                        <Slider
                          value={[stat.percentage]}
                          min={0}
                          max={100}
                          step={1}
                          onValueChange={(value) =>
                            handleStatChange(index, value[0])
                          }
                        />
                      </div>
                    ))}

                    <div className="flex justify-between items-center pt-2">
                      <div className="text-lg font-bold">
                        New OVR: {calculateOVR(tempStats)}
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" onClick={cancelStatsEdit}>
                          <FontAwesomeIcon icon={faTimes} className="mr-1" />{" "}
                          Cancel
                        </Button>
                        <Button
                          variant="default"
                          className="bg-red-600 hover:bg-red-700"
                          onClick={saveStatsChanges}
                        >
                          <FontAwesomeIcon icon={faSave} className="mr-1" />{" "}
                          Save
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
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

            <div className="mt-4">
              {/* Pass isExpertView=false to enable editing */}
              {activeTab === "details" && (
                <ProfileDetails playerData={playerData} isExpertView={false} />
              )}
              {activeTab === "media" && (
                <Media playerId={playerData.id} isExpertView={false} />
              )}
              {activeTab === "reviews" && (
                <Reviews playerId={playerData.id} isExpertView={false} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
