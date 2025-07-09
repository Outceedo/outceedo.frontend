import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

import { Card } from "@/components/ui/card";

import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getProfile } from "../../store/profile-slice";

import profile from "../../assets/images/avatar.png";
import Mediaview from "@/Pages/Media/MediaView";
import PlayerProfileDetails from "./PlayerProfileDetails";

import Reviewview from "../Reviews/Reviewview";

// FontAwesome for stars
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar as faStarSolid,
  faStarHalfAlt,
} from "@fortawesome/free-solid-svg-icons";

import { faStar as farStar } from "@fortawesome/free-regular-svg-icons";

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

// StarRating component for review stars
const StarRating: React.FC<{
  avg: number;
  total?: number;
  className?: string;
}> = ({ avg, total = 5, className }) => {
  const fullStars = Math.floor(avg);
  const hasHalfStar = avg - fullStars >= 0.25 && avg - fullStars < 0.75;
  const emptyStars = total - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <span className={className}>
      {[...Array(fullStars)].map((_, i) => (
        <FontAwesomeIcon
          key={`full-${i}`}
          icon={faStarSolid}
          className="text-yellow-400 text-xl"
        />
      ))}
      {hasHalfStar && (
        <FontAwesomeIcon
          icon={faStarHalfAlt}
          className="text-yellow-400 text-xl"
        />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <FontAwesomeIcon
          key={`empty-${i}`}
          icon={farStar}
          className="text-yellow-400 text-xl"
        />
      ))}
    </span>
  );
};

const Playerview: React.FC = () => {
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
          // Dispatch action to fetch profile by username
          await dispatch(getProfile(username));
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [dispatch]);

  // Update profile data when the Redux state changes
  useEffect(() => {
    if (status === "succeeded" && viewedProfile) {
      let processedProfile = viewedProfile;
      if (viewedProfile.user) {
        processedProfile = viewedProfile.user;
      } else if (viewedProfile.data) {
        processedProfile = viewedProfile.data;
      }
      setProfileData(processedProfile);
      setIsLoading(false);
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

    setPlayerStats(
      stats.map((stat) => ({
        ...stat,
        percentage: Math.round(stat.percentage),
      }))
    );
  };

  // Calculate OVR rating
  const OVR = calculateOVR(playerStats);

  // Calculate review stats
  const reviewsArray = profileData?.reviewsReceived || [];
  const totalReviews = reviewsArray.length;
  const avgRating =
    totalReviews === 0
      ? 0
      : reviewsArray.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) /
        totalReviews;

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
          <div className="flex flex-col lg:flex-row gap-6 items-center
           mt-4">
             <img
    src={profileData.photo || profile}
    alt={`${displayName}'s profile`}
    className="rounded-lg w-60 h-60 object-cover shadow-md sm:self-center"
  />

            <div className="flex flex-col mt-5 w-full gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white font-Raleway">
                  {displayName}
                </h2>
                <div className="flex flex-wrap gap-x-8 gap-y-2 text-gray-600 font-Opensans mt-2 dark:text-gray-300">
                  <span>
                    {profileData.age ? `Age: ${profileData.age}` : ""}
                  </span>
                  <span>
                    {profileData.height
                      ? `Height: ${profileData.height}cm`
                      : ""}
                  </span>
                  <span>
                    {profileData.weight
                      ? `Weight: ${profileData.weight}kg`
                      : ""}
                  </span>
                  <span>Location: {location}</span>
                  <span>Club: {profileData.company || ""}</span>
                  <span>
                    {`Language:  `}
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

              {/* Review stars and count */}
              <div className="flex items-center gap-2 mt-4">
                <StarRating avg={avgRating} className="mr-2" />
                <span className="text-gray-500">
                  {totalReviews} review{totalReviews !== 1 ? "s" : ""}
                </span>
              </div>
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
              {activeTab === "details" && (
                <PlayerProfileDetails playerData={profileData} />
              )}
              {activeTab === "media" && <Mediaview Data={profileData} />}
              {activeTab === "reviews" && <Reviewview Data={profileData} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Playerview;
