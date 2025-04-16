import React, { useState, useEffect, useRef } from "react";
import profile1 from "../assets/images/profile1.jpg";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera } from "@fortawesome/free-solid-svg-icons";
import ProfileDetails from "./profiledetails";
import Reviews from "./reviews";
import { Card } from "@/components/ui/card";
import PlayerMedia from "./media";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  getProfile,
  updateProfile,
  updateProfilePhoto,
} from "../store/profile-slice";

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

// Fallback player data if profile not loaded yet
const fallbackPlayerData = {
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();

  // Get profile state from Redux store
  const { currentProfile, status, error } = useAppSelector(
    (state) => state.profile
  );
  const user = useAppSelector((state) => state.auth.user);

  // Local state for player stats which might not be directly part of the API response
  const [playerStats, setPlayerStats] = useState(initialStats);

  // Fetch profile data on component mount
  useEffect(() => {
    if (user?.username) {
      dispatch(getProfile(user.username));
    }
  }, [dispatch, user]);

  // Get stats from localStorage if available
  useEffect(() => {
    const savedStats = localStorage.getItem("playerStats");
    if (savedStats) {
      setPlayerStats(JSON.parse(savedStats));
    }
  }, []);

  // Handle profile photo change
  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Dispatch action to update profile photo
    dispatch(updateProfilePhoto(file));

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Merge API profile data with local data
  const playerData = currentProfile
    ? {
        ...fallbackPlayerData,
        ...currentProfile,
        // Keep local stats if they're not provided by the API
        stats: playerStats,
        // Use profile image from API if available
        profileImage:
          currentProfile.profileImage || fallbackPlayerData.profileImage,
      }
    : fallbackPlayerData;

  // Calculate OVR score
  const ovrScore = calculateOVR(playerData.stats);

  // Show loading state
  if (status === "loading" && !currentProfile) {
    return (
      <div className="flex w-full min-h-screen dark:bg-gray-900 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (status === "failed" && error) {
    return (
      <div className="flex w-full min-h-screen dark:bg-gray-900 items-center justify-center">
        <div className="text-center text-red-600 p-4 bg-red-100 dark:bg-red-900 dark:text-red-200 rounded-lg">
          <p>Error loading profile: {error}</p>
          <button
            onClick={() =>
              user?.username && dispatch(getProfile(user.username))
            }
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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
            <div className="relative mt-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white font-Raleway">
                  {playerData.name}
                </h2>
                <div className="flex flex-wrap gap-8 text-gray-600 font-Opensans mt-5 dark:text-gray-300">
                  <span>Age: {playerData.age}</span>
                  <span>Height: {playerData.height}</span>
                  <span>Weight: {playerData.weight}</span>
                  <span>Location: {playerData.location}</span>
                  <span>Club: {playerData.club}</span>
                  <span>Languages: {playerData.languages.join(", ")}</span>
                </div>
              </div>

              {/* OVR Section */}
              <Card className="bg-yellow-100 dark:bg-gray-700 p-3 w-fit mt-8 relative">
                <div className="flex flex-wrap gap-6 items-center">
                  <div>
                    <h2 className="text-xl ml-5 text-gray-800 dark:text-white">
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
              </Card>
            </div>
          </div>
          {/* Tabs Section */}
          <div className="mt-8">
            <div className="flex gap-4 border-b ">
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
              {playerData && (
                <>
                  {activeTab === "details" && (
                    <ProfileDetails
                      playerData={playerData}
                      isExpertView={false}
                      onUpdate={(data) => dispatch(updateProfile(data))}
                    />
                  )}
                  {activeTab === "media" && (
                    <PlayerMedia
                      playerId={playerData.id}
                      isExpertView={false}
                    />
                  )}
                  {activeTab === "reviews" && (
                    <Reviews playerId={playerData.id} isExpertView={false} />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
