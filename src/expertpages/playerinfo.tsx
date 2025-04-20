import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Reviews from "./playerreviews";
import { Card } from "@/components/ui/card";
import PlayerMedia from "./playermedia";
import ProfileDetails from "./profiledetails";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { getProfile } from "../store/profile-slice";

// Import default images
import player from "../assets/images/player.jpg";
import player1 from "../assets/images/player1.jpg";
import player2 from "../assets/images/player2.jpg";
import player3 from "../assets/images/player3.jpg";
import player4 from "../assets/images/player4.jpg";
import player5 from "../assets/images/player5.jpg";

const defaultImages = [player, player1, player2, player3, player4, player5];

interface Stat {
  label: string;
  percentage: number;
  color: string;
}

const defaultStats: Stat[] = [
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

const PlayerInfo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"details" | "media" | "reviews">(
    "details"
  );
  const [profileData, setProfileData] = useState<Profile | null>(null);
  const [playerStats, setPlayerStats] = useState<Stat[]>(defaultStats);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Get profile data from Redux store
  const { viewedProfile, status } = useAppSelector((state) => state.profile);

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        // First try to get username from localStorage
        const username = localStorage.getItem("viewplayerusername");

        if (username) {
          console.log(`Found username in localStorage: ${username}`);
          // Dispatch action to fetch profile by username
          await dispatch(getProfile(username));
        } else {
          // Fallback to stored profile data if username is not available
          console.log("Username not found in localStorage");
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error loading profile data:", error);
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [dispatch]);

  // Update profile data when the Redux state changes
  useEffect(() => {
    if (status === "succeeded" && viewedProfile) {
      console.log("Profile data from Redux:", viewedProfile);

      // IMPORTANT: Check what the structure of your profile data is
      // It may be nested inside a 'user' object or be the direct response
      let processedProfile = viewedProfile;

      // Check if profile is nested inside a property (common API pattern)
      if (viewedProfile.user) {
        processedProfile = viewedProfile.user;
      } else if (viewedProfile.data) {
        processedProfile = viewedProfile.data;
      }

      // Log what we're actually setting as profile data
      console.log("Setting profile data:", processedProfile);

      setProfileData(processedProfile);
      setIsLoading(false);

      // Generate stats based on player attributes if available
      if (processedProfile.role === "player") {
        generatePlayerStats(processedProfile);
      }
    } else if (status === "failed") {
      setIsLoading(false);
    }
  }, [viewedProfile, status]);

  // Generate player stats based on profile attributes
  const generatePlayerStats = (profile: Profile) => {
    const height = profile.height || 0;
    const weight = profile.weight || 0;
    const age = profile.age || 20;

    // Generate stats based on physical attributes
    const stats: Stat[] = [
      {
        label: "Pace",
        percentage: Math.min(
          95,
          Math.max(50, height && weight ? 100 - (weight / height) * 100 : 60)
        ),
        color: "#E63946",
      },
      {
        label: "Shooting",
        percentage: Math.min(95, Math.max(50, 65 + (age / 35) * 20)),
        color: "#D62828",
      },
      {
        label: "Passing",
        percentage: Math.min(95, Math.max(50, 70 + (age / 35) * 15)),
        color: "#4CAF50",
      },
      {
        label: "Dribbling",
        percentage: Math.min(95, Math.max(50, 85 - (age / 35) * 10)),
        color: "#68A357",
      },
      {
        label: "Defending",
        percentage: Math.min(
          95,
          Math.max(50, weight ? 60 + (weight / 100) * 30 : 60)
        ),
        color: "#2D6A4F",
      },
      {
        label: "Physical",
        percentage: Math.min(
          95,
          Math.max(50, height && weight ? (weight / height) * 200 : 60)
        ),
        color: "#F4A261",
      },
    ];

    // Round all percentages to integers
    setPlayerStats(
      stats.map((stat) => ({
        ...stat,
        percentage: Math.round(stat.percentage),
      }))
    );
  };

  // Calculate OVR rating
  const OVR = calculateOVR(playerStats);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Profile Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          The profile you are looking for could not be found.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  const displayName =
    `${profileData.firstName || ""} ${profileData.lastName || ""}`.trim() ||
    profileData.username ||
    "Anonymous User";
  const location =
    profileData.city && profileData.country
      ? `${profileData.city}, ${profileData.country}`
      : profileData.country || profileData.city || "N/A";

  console.log("About to render with profile:", profileData);

  return (
    <div className="flex w-full min-h-screen dark:bg-gray-900">
      <div className="flex-1 p-4">
        <div className="ml-8">
          <div
            onClick={() => navigate(-1)}
            className="flex flex-col text-4xl font-bold text-start cursor-pointer"
          >
            ←
          </div>
          <div className="flex flex-col lg:flex-row gap-6 items-start mt-4">
            <img
              src={profileData.photo || defaultImages[0]}
              alt={`${displayName}'s profile`}
              className="rounded-lg w-60 h-60 object-cover shadow-md"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = defaultImages[0];
              }}
            />

            <div className="flex flex-col mt-5 w-full gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white font-Raleway">
                  {displayName}
                </h2>
                <div className="flex flex-wrap gap-8 text-gray-600 font-Opensans mt-2 dark:text-gray-300">
                  <span>
                    {profileData.age ? `Age: ${profileData.age}` : ""}
                  </span>
                  <span>
                    {profileData.height ? `${profileData.height}cm` : ""}
                  </span>
                  <span>
                    {profileData.weight ? `${profileData.weight}kg` : ""}
                  </span>
                  <span>{location}</span>
                  <span>{profileData.company || ""}</span>
                  <span>
                    {Array.isArray(profileData.language) &&
                    profileData.language.length > 0
                      ? profileData.language.join(", ")
                      : ""}
                  </span>
                </div>
              </div>

              {/* OVR Section - Only show for players */}
              {profileData.role === "player" && (
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

                    {playerStats.map((stat, index) => (
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
              )}
            </div>
          </div>

          {/* Tabs Section */}
          <div className="mt-8">
            <div className="flex gap-4 border-b">
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
              {/* Pass the entire profile data to child components */}
              {activeTab === "details" && (
                <ProfileDetails playerData={profileData} isExpertView={true} />
              )}
              {activeTab === "media" && (
                <PlayerMedia playerData={profileData} isExpertView={true} />
              )}
              {activeTab === "reviews" && (
                <Reviews playerData={profileData} isExpertView={true} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerInfo;
