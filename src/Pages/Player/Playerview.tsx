import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import axios from "axios";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getProfile } from "../../store/profile-slice";

import profile from "../../assets/images/avatar.png";
import Mediaview from "@/Pages/Media/MediaView";
import PlayerProfileDetails from "./PlayerProfileDetails";
import FollowersList from "../../components/follower/followerlist"; // Import the FollowersList component

import Reviewview from "../Reviews/Reviewview";
import Swal from "sweetalert2";

// FontAwesome for stars and follow icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar as faStarSolid,
  faStarHalfAlt,
  faUserPlus,
  faUserCheck,
  faHeart,
  faLock,
  faUserMinus,
} from "@fortawesome/free-solid-svg-icons";

import { faStar as farStar } from "@fortawesome/free-regular-svg-icons";

interface Stat {
  label: string;
  percentage: number;
  color: string;
}

interface Profile {
  id?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  photo?: string;
  age?: number;
  height?: number;
  weight?: number;
  city?: string;
  country?: string;
  company?: string;
  language?: string[];
  role?: string;
  reviewsReceived?: any[];
  followersCount?: number;
  [key: string]: any;
}

interface Follower {
  id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  photo?: string;
  role?: string;
  [key: string]: any;
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

  // Follow functionality state
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  // Followers modal state
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Get profile data and subscription status from Redux store
  const { viewedProfile, status } = useAppSelector((state) => state.profile);
  const {
    isActive,
    planName,
    loading: subscriptionLoading,
  } = useAppSelector((state) => state.subscription);

  const API_FOLLOW_URL = `${import.meta.env.VITE_PORT}/api/v1/user/profile`;

  // Determine if user is on a premium plan
  const isUserOnPremiumPlan =
    isActive && planName && planName.toLowerCase() !== "free";

  // Check if follow is allowed for current plan
  const isFollowAllowed = () => {
    return isUserOnPremiumPlan;
  };

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

  // Check if current user is following this player and get followers count
  useEffect(() => {
    if (profileData?.id) {
      checkFollowStatus();
      // Set initial followers count
      setFollowersCount(profileData.followersCount || 0);
    }
  }, [profileData]);

  const checkFollowStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !profileData?.id) return;

      const response = await axios.get(
        `${API_FOLLOW_URL}/${profileData.id}/follow-status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsFollowing(response.data?.isFollowing || false);
    } catch (error) {
      console.error("Error checking follow status:", error);
      // If endpoint doesn't exist, default to false
      setIsFollowing(false);
    }
  };

  // Fetch followers list
  const fetchFollowers = async () => {
    if (!profileData?.id) return;

    setLoadingFollowers(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_FOLLOW_URL}/${profileData.id}/followers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFollowers(response.data?.users || []);
    } catch (error) {
      console.error("Error fetching followers:", error);
      setFollowers([]);
    } finally {
      setLoadingFollowers(false);
    }
  };

  // Handle followers count click
  const handleFollowersClick = () => {
    setIsFollowersModalOpen(true);
    fetchFollowers();
  };

  const handleFollow = async () => {
    if (!isFollowAllowed()) {
      const currentPlanName = planName || "Free";

      Swal.fire({
        icon: "info",
        title: "Upgrade to Premium",
        html: `
          <div class="text-left">
            <p class="mb-3">Following players is only available for Premium members.</p>
            <div class="bg-blue-50 p-3 rounded-lg mb-3">
              <h4 class="font-semibold text-blue-800 mb-2">Premium Benefits:</h4>
              <ul class="text-sm text-blue-700 space-y-1">
                <li>• Follow your favorite players</li>
                <li>• Access to all expert services</li>
                <li>• Unlimited bookings</li>
                <li>• Priority support</li>
                <li>• Enhanced storage capacity</li>
                <li>• Worldwide expert search</li>
                <li>• Reports download & share</li>
              </ul>
            </div>
            <p class="text-sm text-gray-600">Your current plan: <strong>${currentPlanName}</strong></p>
            <p class="text-xs text-gray-500 mt-2">Free plan has limited features</p>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: "Upgrade Now",
        cancelButtonText: "Maybe Later",
        confirmButtonColor: "#3B82F6",
        cancelButtonColor: "#6B7280",
        customClass: {
          popup: "swal-wide",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/plans");
        }
      });
      return;
    }

    if (!profileData?.id) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Player information not available. Please try again.",
        timer: 3000,
        showConfirmButton: false,
      });
      return;
    }

    setIsFollowLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          icon: "error",
          title: "Authentication Failed",
          text: "Please login to follow players.",
          timer: 3000,
          showConfirmButton: false,
        });
        return;
      }

      const displayName =
        `${profileData.firstName || ""} ${profileData.lastName || ""}`.trim() ||
        profileData.username ||
        "this player";

      let response;
      let newFollowStatus;

      if (isFollowing) {
        // Unfollow the player
        response = await axios.post(
          `${API_FOLLOW_URL}/${profileData.id}/unfollow`,
          {},
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        newFollowStatus = false;
      } else {
        // Follow the player
        response = await axios.post(
          `${API_FOLLOW_URL}/${profileData.id}/follow`,
          {},
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        newFollowStatus = true;
      }

      setIsFollowing(newFollowStatus);

      // Update followers count
      setFollowersCount((prev) => (newFollowStatus ? prev + 1 : prev - 1));

      Swal.fire({
        icon: "success",
        title: newFollowStatus ? "Following!" : "Unfollowed",
        text: newFollowStatus
          ? `You are now following ${displayName}`
          : `You unfollowed ${displayName}`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error: any) {
      console.error("Follow/Unfollow error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to update follow status. Please try again.";

      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
        timer: 3000,
        showConfirmButton: false,
      });
    } finally {
      setIsFollowLoading(false);
    }
  };

  // Handle unfollow with confirmation
  const handleUnfollowWithConfirmation = async () => {
    if (!isFollowing) return;

    const displayName =
      `${profileData?.firstName || ""} ${profileData?.lastName || ""}`.trim() ||
      profileData?.username ||
      "this player";

    Swal.fire({
      title: "Unfollow Player?",
      text: `Are you sure you want to unfollow ${displayName}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, unfollow",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        handleFollow(); // This will trigger unfollow since isFollowing is true
      }
    });
  };

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
          <div className="flex flex-col lg:flex-row gap-6 items-center mt-4">
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
                    {`Language: `}
                    {Array.isArray(profileData.language) &&
                    profileData.language.length > 0
                      ? profileData.language.join(", ")
                      : ""}
                  </span>
                </div>
              </div>

              {/* Follow Button Section - For all roles except current player */}
              {localStorage.getItem("role") && (
                <div className="mt-4">
                  {/* Follow Plan Info Banner */}
                  {!subscriptionLoading && !isFollowAllowed() && (
                    <div className="w-full max-w-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        <FontAwesomeIcon icon={faLock} className="mr-2" />
                        Following players is a <strong>Premium feature</strong>.
                        <button
                          onClick={() => navigate("/plans")}
                          className="ml-2 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                          Upgrade to Premium
                        </button>{" "}
                        to follow your favorite players.
                      </p>
                    </div>
                  )}

                  {/* Follow/Unfollow Buttons */}
                  <div className="flex items-center gap-4">
                    {isFollowAllowed() && isFollowing ? (
                      // Show both Following button and Unfollow button when following
                      <div className="flex items-center gap-2">
                        <Button
                          disabled
                          className="px-6 py-2 rounded-lg font-semibold bg-green-600 text-white cursor-default"
                        >
                          <FontAwesomeIcon
                            icon={faUserCheck}
                            className="text-sm mr-2"
                          />
                          Following
                        </Button>
                        <Button
                          onClick={handleUnfollowWithConfirmation}
                          disabled={isFollowLoading}
                          className="px-4 py-2 rounded-lg font-semibold bg-gray-500 hover:bg-red-600 text-white transition-colors"
                        >
                          {isFollowLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <FontAwesomeIcon
                                icon={faUserMinus}
                                className="text-sm mr-2"
                              />
                              Unfollow
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      // Show single Follow or Upgrade button when not following
                      <Button
                        onClick={handleFollow}
                        disabled={isFollowLoading}
                        className={`px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                          isFollowAllowed()
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "bg-gray-400 hover:bg-gray-500 text-white cursor-pointer"
                        }`}
                      >
                        {isFollowLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        ) : isFollowAllowed() ? (
                          <>
                            <FontAwesomeIcon
                              icon={faUserPlus}
                              className="text-sm"
                            />
                            Follow
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon
                              icon={faLock}
                              className="text-sm"
                            />
                            Upgrade to Follow
                          </>
                        )}
                      </Button>
                    )}

                    {/* Followers count display - Make it clickable */}
                    <div
                      className="text-sm text-gray-600 dark:text-gray-300 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      onClick={handleFollowersClick}
                    >
                      <span className="font-semibold">{followersCount}</span>{" "}
                      followers
                    </div>
                  </div>

                  {isFollowing && isFollowAllowed() && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                      <FontAwesomeIcon icon={faHeart} className="mr-1" />
                      You're following {displayName}
                    </p>
                  )}
                </div>
              )}

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

      {/* Followers Modal */}
      {isFollowersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-[95vw] max-w-md p-6 relative max-h-[80vh] overflow-hidden">
            <button
              onClick={() => setIsFollowersModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl z-10"
            >
              ✕
            </button>
            <h3 className="text-lg font-semibold mb-4 text-center dark:text-white">
              Followers ({followersCount})
            </h3>
            <div className="overflow-y-auto max-h-96">
              <FollowersList followers={followers} loading={loadingFollowers} />
            </div>
          </div>
        </div>
      )}

      {/* Add CSS for wider SweetAlert modals */}
      <style jsx global>{`
        .swal-wide {
          width: 600px !important;
        }
      `}</style>
    </div>
  );
};

export default Playerview;
