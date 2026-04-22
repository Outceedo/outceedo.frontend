import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BookOpen, X, Loader2, AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getProfile } from "../../store/profile-slice";
import profile from "../../assets/images/avatar.png";
import Mediaview from "@/Pages/Media/MediaView";
import PlayerProfileDetails from "./PlayerProfileDetails";
import FollowersList from "../../components/follower/followerlist";
import Reviewview from "../Reviews/Reviewview";
import Swal from "sweetalert2";
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

function formatDateDMY(isoDate: string) {
  if (!isoDate) return "";
  const dateObj = new Date(isoDate);
  if (isNaN(dateObj.getTime())) return isoDate;
  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = dateObj.getFullYear();
  return `${day}-${month}-${year}`;
}

interface MatchRecord {
  id?: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  type: string;
  status: string;
  result: string;
  goals?: string;
  assists?: string;
  shots?: string;
  shotsOnTarget?: string;
  passes?: string;
  yellowcards?: string;
  redcards?: string;
}

interface Stat {
  name: string;
  averageScore: number;
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

// Function to map API stats to display stats with colors
const mapStatsToDisplay = (apiStats: any[]): Stat[] => {
  const statMapping: Record<string, { color: string }> = {
    pace: { color: "#E63946" },
    shooting: { color: "#D62828" },
    passing: { color: "#4CAF50" },
    dribbling: { color: "#68A357" },
    defending: { color: "#2D6A4F" },
    physical: { color: "#F4A261" },
  };

  // Default stats structure
  const defaultStats = [
    { name: "pace", averageScore: 0, color: "#E63946" },
    { name: "shooting", averageScore: 0, color: "#D62828" },
    { name: "passing", averageScore: 0, color: "#4CAF50" },
    { name: "dribbling", averageScore: 0, color: "#68A357" },
    { name: "defending", averageScore: 0, color: "#2D6A4F" },
    { name: "physical", averageScore: 0, color: "#F4A261" },
  ];

  // Map API stats to display format
  const mappedStats = defaultStats.map((defaultStat) => {
    const apiStat = apiStats.find(
      (stat) => stat.name.toLowerCase() === defaultStat.name.toLowerCase(),
    );

    return {
      name: defaultStat.name,
      averageScore: apiStat ? apiStat.averageScore : 0,
      color: defaultStat.color,
    };
  });

  return mappedStats;
};

const calculateOVR = (stats: Stat[]) => {
  if (!stats.length) return 0;
  const total = stats.reduce((sum, stat) => sum + stat.averageScore, 0);
  return Math.round(total / stats.length);
};

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
          className="text-yellow-400 text-base sm:text-xl"
        />
      ))}
      {hasHalfStar && (
        <FontAwesomeIcon
          icon={faStarHalfAlt}
          className="text-yellow-400 text-base sm:text-xl"
        />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <FontAwesomeIcon
          key={`empty-${i}`}
          icon={farStar}
          className="text-yellow-400 text-base sm:text-xl"
        />
      ))}
    </span>
  );
};

const Playerview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "details" | "media" | "reviews" | "matches"
  >("details");
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [matchesError, setMatchesError] = useState<string | null>(null);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchRecord | null>(null);
  const [profileData, setProfileData] = useState<Profile | null>(null);
  const [playerStats, setPlayerStats] = useState<Stat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [followersLimit, setFollowersLimit] = useState(10);
  const [followersPage, setFollowersPage] = useState(1);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { viewedProfile, status } = useAppSelector((state) => state.profile);
  const {
    isActive,
    planName,
    loading: subscriptionLoading,
  } = useAppSelector((state) => state.subscription);

  const API_FOLLOW_URL = `${import.meta.env.VITE_PORT}/api/v1/user/profile`;
  const API_STATS_URL = `${import.meta.env.VITE_PORT}/api/v1/user/reports`;

  const isUserOnPremiumPlan =
    isActive && planName && planName.toLowerCase() !== "free";

  const isFollowAllowed = () => {
    if (localStorage.getItem("role") === "player") {
      return isUserOnPremiumPlan;
    }
    return true;
  };

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const username = localStorage.getItem("viewplayerusername");
        if (username) {
          setTimeout(() => {
            dispatch(getProfile(username));
          }, 200);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, [dispatch]);

  useEffect(() => {
    if (status === "succeeded" && viewedProfile) {
      // Process the profile data but don't set loading to false immediately
      let processedProfile = viewedProfile;
      if (viewedProfile.user) {
        processedProfile = viewedProfile.user;
      } else if (viewedProfile.data) {
        processedProfile = viewedProfile.data;
      }

      // Set profile data
      setProfileData(processedProfile);

      // Only set loading to false after the timeout has completed
      // We'll use a minimum timeout to ensure loading state is maintained
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);

      // Fetch stats only if the profile is a player
      if (processedProfile.role === "player" && processedProfile.id) {
        fetchPlayerStats(processedProfile.id);
      }
    } else if (status === "failed") {
      // Even on failure, respect the minimum loading time
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  }, [viewedProfile, status]);

  useEffect(() => {
    if (profileData?.id) {
      checkFollowStatus();
      setFollowersCount(profileData.followersCount || 0);
      fetchFollowers(100, followersPage);
    }
    // eslint-disable-next-line
  }, [profileData]);

  const fetchPlayerStats = async (playerId: string) => {
    setStatsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_STATS_URL}/player/${playerId}/overall`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Map the API response to the correct format
      const apiStats = response.data.data || [];
      const mappedStats = mapStatsToDisplay(apiStats);

      setPlayerStats(mappedStats);
    } catch (error) {
      console.error("Error fetching player stats:", error);
      // Set default stats if API fails
      const defaultStats = mapStatsToDisplay([]);
      setPlayerStats(defaultStats);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchMatches = async (userId: string) => {
    setMatchesLoading(true);
    setMatchesError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_PORT}/api/v1/user/matches/user/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.data?.matches) {
        const sorted = [...response.data.matches].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
        setMatches(sorted);
      } else {
        setMatches([]);
      }
    } catch {
      setMatchesError("Failed to load match data.");
      setMatches([]);
    } finally {
      setMatchesLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !profileData?.id) return;
      const response = await axios.get(
        `${API_FOLLOW_URL}/${viewedProfile.id}/isfollowing`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setIsFollowing(response.data?.isFollowing || false);
    } catch {
      setIsFollowing(false);
    }
  };

  const fetchFollowers = async (
    limit = followersLimit,
    page = followersPage,
  ) => {
    if (!profileData?.id) return;
    setLoadingFollowers(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_FOLLOW_URL}/${profileData.id}/followers?limit=${limit}&page=${page}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setFollowers(response.data?.users || []);
      setFollowersCount(response.data?.users.length);
    } catch {
      setFollowers([]);
    } finally {
      setLoadingFollowers(false);
    }
  };

  const handleFollowersClick = () => {
    setIsFollowersModalOpen(true);
    fetchFollowers(followersLimit, followersPage);
  };

  const handleFollowersLimitChange = (newLimit: number) => {
    setFollowersLimit(newLimit);
    setFollowersPage(1);
    fetchFollowers(newLimit, 1);
  };

  const handleFollowersPageChange = (newPage: number) => {
    setFollowersPage(newPage);
    fetchFollowers(followersLimit, newPage);
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
        customClass: { popup: "swal-wide" },
      }).then((result) => {
        if (result.isConfirmed) navigate("/plans");
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
        response = await axios.patch(
          `${API_FOLLOW_URL}/${profileData.id}/unfollow`,
          {},
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );
        newFollowStatus = false;
      } else {
        response = await axios.patch(
          `${API_FOLLOW_URL}/${profileData.id}/follow`,
          {},
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );
        newFollowStatus = true;
      }
      setIsFollowing(newFollowStatus);
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
      if (result.isConfirmed) handleFollow();
    });
  };

  const OVR = calculateOVR(playerStats);
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
    <div className="w-full min-h-screen dark:bg-gray-900">
      <div className="w-full px-2 sm:px-4">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-center mt-1 sm:mt-3">
            <img
              src={profileData.photo || profile}
              alt={`${displayName}'s profile`}
              className="rounded-lg w-32 h-32 sm:w-48 sm:h-48 md:w-60 md:h-60 object-cover shadow-md"
            />
            <div className="flex flex-col mt-1 sm:mt-5 w-full gap-2 sm:gap-4">
              <div>
                <h2 className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-white font-Raleway">
                  {displayName}
                </h2>
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-gray-600 font-Opensans mt-2 dark:text-gray-300 text-xs sm:text-sm">
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
              {((localStorage.getItem("role") === "player" &&
                isUserOnPremiumPlan) ||
                localStorage.getItem("role") !== "player") && (
                <div className="mt-3 sm:mt-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                    {isFollowAllowed() && isFollowing ? (
                      <div className="flex flex-col sm:flex-row items-center gap-2">
                        <Button
                          disabled
                          className="px-4 py-2 rounded-lg font-semibold bg-green-600 text-white cursor-default w-full sm:w-auto"
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
                          className="px-4 py-2 rounded-lg font-semibold bg-gray-500 hover:bg-red-600 text-white transition-colors w-full sm:w-auto"
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
                      <Button
                        onClick={handleFollow}
                        disabled={isFollowLoading}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto`}
                      >
                        {isFollowLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <FontAwesomeIcon
                              icon={faUserPlus}
                              className="text-sm"
                            />
                            Follow
                          </>
                        )}
                      </Button>
                    )}
                    <div
                      className="text-sm text-gray-600 dark:text-gray-300 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      onClick={handleFollowersClick}
                    >
                      <span className="font-semibold">{followersCount}</span>{" "}
                      followers
                    </div>
                  </div>
                  {isFollowing && isFollowAllowed() && (
                    <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 mt-1 sm:mt-2">
                      <FontAwesomeIcon icon={faHeart} className="mr-1" />
                      You're following {displayName}
                    </p>
                  )}
                </div>
              )}
              {localStorage.getItem("role") === "player" &&
                !isUserOnPremiumPlan && (
                  <div className="mt-3 sm:mt-4">
                    {!subscriptionLoading && (
                      <div className="w-full max-w-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2 sm:p-3 mb-2 sm:mb-4">
                        <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                          <FontAwesomeIcon icon={faLock} className="mr-2" />
                          Following players is a{" "}
                          <strong>Premium feature</strong>.
                          <button
                            onClick={() => navigate("/plans")}
                            className="ml-2 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                          >
                            Upgrade to Premium
                          </button>
                          to follow your favorite players.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              {profileData.role === "player" && (
                <div className="flex flex-wrap gap-3 items-start mt-0 w-full">
                <Card className="bg-yellow-100 dark:bg-gray-700 p-2 sm:p-3 w-fit max-w-full overflow-x-auto flex-shrink-0">
                  {statsLoading ? (
                    <div className="flex items-center justify-center p-4 sm:p-8">
                      <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-t-2 border-b-2 border-red-600"></div>
                      <span className="ml-2 text-xs sm:text-sm">
                        Loading stats...
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3 sm:gap-6 items-center">
                      <div>
                        <h2 className="text-base sm:text-xl text-gray-800 dark:text-white">
                          <span className="block font-bold font-opensans text-xl sm:text-3xl">
                            {OVR}
                          </span>
                          <span className="text-base sm:text-xl font-opensans">
                            OVR
                          </span>
                        </h2>
                      </div>
                      {playerStats.map((stat, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div
                            className="w-12 h-12 sm:w-20 sm:h-20 relative"
                            style={{ transform: "rotate(-90deg)" }}
                          >
                            <CircularProgressbar
                              value={stat.averageScore}
                              styles={buildStyles({
                                textSize: "18px",
                                pathColor: stat.color,
                                trailColor: "#ddd",
                                strokeLinecap: "round",
                              })}
                              circleRatio={0.5}
                            />
                            <div
                              className="absolute inset-0 flex items-center justify-center text-xs sm:text-sm ml-1 sm:ml-3 font-semibold font-opensans text-stone-800 dark:text-white"
                              style={{ transform: "rotate(90deg)" }}
                            >
                              {Math.round(stat.averageScore)}
                            </div>
                          </div>
                          <p className="text-xs sm:text-sm -mt-5 sm:-mt-8 font-opensans text-gray-700 dark:text-white capitalize">
                            {stat.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
                {(() => {
                  const team = profileData.associatedTeam as { teamName?: string; teamUsername?: string; photo?: string } | null;
                  if (!team?.teamUsername) return null;
                  return (
                    <div className="flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm min-w-[140px] max-w-[160px] flex-shrink-0">
                      <div className="h-8 bg-red-600" />
                      <div className="px-3 pb-1">
                        <div className="-mt-5 mb-2">
                          <img
                            src={team.photo || "/avatar.png"}
                            alt={team.teamName || team.teamUsername}
                            className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow"
                            onError={(e) => { e.currentTarget.src = "/avatar.png"; }}
                          />
                        </div>
                        <p className="text-xs font-bold dark:text-white leading-tight line-clamp-1">
                          {team.teamName || team.teamUsername}
                        </p>
                        {/* <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">@{team.teamUsername}</p> */}
                        <span className="inline-block mt-1 text-[10px] font-medium text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded-full">
                          My Team
                        </span>
                      </div>
                    </div>
                  );
                })()}
                </div>
              )}
              <div className="flex items-center gap-2 mt-3 sm:mt-4">
                <StarRating avg={avgRating} className="mr-2" />
                <span className="text-gray-500 text-xs sm:text-base">
                  {totalReviews} review{totalReviews !== 1 ? "s" : ""}
                </span>
                <span className="text-xs sm:text-base">
                  ({avgRating.toFixed(1)}/5)
                </span>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-8">
            <div className="flex gap-2 sm:gap-4 border-b overflow-x-auto">
              {(["details", "media", "reviews", "matches"] as const).map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      if (tab === "matches" && profileData?.id && matches.length === 0 && !matchesLoading) {
                        fetchMatches(profileData.id);
                      }
                    }}
                    className={`text-sm sm:text-md font-medium capitalize transition-all duration-150 px-2 pb-1 border-b-2 ${
                      activeTab === tab
                        ? "text-red-600 border-red-600"
                        : "border-transparent text-gray-600 dark:text-white hover:text-red-600"
                    }`}
                  >
                    {tab}
                  </button>
                ),
              )}
            </div>
            <div className="mt-3 sm:mt-4">
              {activeTab === "details" && (
                <PlayerProfileDetails playerData={profileData} />
              )}
              {activeTab === "media" && <Mediaview Data={profileData} />}
              {activeTab === "reviews" && <Reviewview Data={profileData} />}
              {activeTab === "matches" && (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        profileData?.id && fetchMatches(profileData.id)
                      }
                      disabled={matchesLoading}
                    >
                      {matchesLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
                        </>
                      )}
                    </Button>
                  </div>
                  {matchesLoading ? (
                    <div className="flex justify-center items-center py-10">
                      <Loader2 className="h-8 w-8 animate-spin text-red-500" />
                    </div>
                  ) : matchesError ? (
                    <div className="flex flex-col items-center justify-center text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-md">
                      <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
                      <p className="text-red-600 dark:text-red-400 mb-4">
                        {matchesError}
                      </p>
                      <Button
                        variant="outline"
                        onClick={() =>
                          profileData?.id && fetchMatches(profileData.id)
                        }
                      >
                        Try Again
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="dark:bg-gray-800 dark:text-gray-300">
                          <TableRow className="dark:border-gray-700">
                            <TableHead className="dark:text-gray-300">
                              Date
                            </TableHead>
                            <TableHead className="dark:text-gray-300">
                              Home Team
                            </TableHead>
                            <TableHead className="dark:text-gray-300">
                              Away Team
                            </TableHead>
                            <TableHead className="dark:text-gray-300">
                              Type
                            </TableHead>
                            <TableHead className="dark:text-gray-300">
                              Status
                            </TableHead>
                            <TableHead className="dark:text-gray-300">
                              Result
                            </TableHead>
                            <TableHead className="dark:text-gray-300">
                              Stats
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {matches.length === 0 ? (
                            <TableRow className="dark:border-gray-700">
                              <TableCell
                                colSpan={7}
                                className="text-center dark:text-gray-300"
                              >
                                No matches found
                              </TableCell>
                            </TableRow>
                          ) : (
                            matches.map((match, index) => (
                              <TableRow
                                key={match.id || index}
                                className={
                                  index % 2 === 0
                                    ? "bg-white dark:bg-gray-800"
                                    : "bg-gray-100 dark:bg-gray-700"
                                }
                              >
                                <TableCell className="font-medium dark:text-gray-300">
                                  {formatDateDMY(match.date)}
                                </TableCell>
                                <TableCell className="dark:text-gray-300">
                                  {match.homeTeam}
                                </TableCell>
                                <TableCell className="dark:text-gray-300">
                                  {match.awayTeam}
                                </TableCell>
                                <TableCell className="dark:text-gray-300">
                                  {match.type}
                                </TableCell>
                                <TableCell className="dark:text-gray-300">
                                  {match.status}
                                </TableCell>
                                <TableCell className="dark:text-gray-300">
                                  {match.result}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => {
                                      setSelectedMatch(match);
                                      setStatsModalOpen(true);
                                    }}
                                    className="dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-gray-700"
                                  >
                                    <BookOpen className="h-4 w-4" />
                                    <span className="sr-only">View Stats</span>
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {statsModalOpen && selectedMatch && (
        <div className="fixed inset-0 z-50 flex justify-center items-center">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setStatsModalOpen(false)}
          />
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md z-50 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
              <h2 className="text-xl font-semibold dark:text-white">
                Match Statistics
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setStatsModalOpen(false)}
                className="dark:text-gray-400 hover:dark:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6">
              <div className="mb-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-medium text-lg dark:text-white mb-2 border-b border-gray-200 dark:border-gray-600 pb-2">
                  {selectedMatch.homeTeam} vs {selectedMatch.awayTeam}
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Date:</p>
                    <p className="font-medium dark:text-white">
                      {formatDateDMY(selectedMatch.date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Type:</p>
                    <p className="font-medium dark:text-white">
                      {selectedMatch.type || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Status:</p>
                    <p className="font-medium dark:text-white">
                      {selectedMatch.status || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Result:</p>
                    <p className="font-medium dark:text-white">
                      {selectedMatch.result || "-"}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium dark:text-white mb-4 text-lg border-b border-gray-200 dark:border-gray-600 pb-2">
                  Performance Statistics
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {(
                    [
                      { label: "Goals", value: selectedMatch.goals },
                      { label: "Assists", value: selectedMatch.assists },
                      { label: "Shots", value: selectedMatch.shots },
                      {
                        label: "Shots on Target",
                        value: selectedMatch.shotsOnTarget,
                      },
                      { label: "Passes", value: selectedMatch.passes },
                    ] as const
                  ).map(({ label, value }) => (
                    <div
                      key={label}
                      className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
                    >
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        {label}
                      </p>
                      <p className="text-2xl font-bold dark:text-white">
                        {value || "0"}
                      </p>
                    </div>
                  ))}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                          Yellow Cards
                        </p>
                        <p className="text-2xl font-bold dark:text-white">
                          {selectedMatch.yellowcards || "0"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                          Red Cards
                        </p>
                        <p className="text-2xl font-bold dark:text-white">
                          {selectedMatch.redcards || "0"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() => setStatsModalOpen(false)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isFollowersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-[98vw] max-w-md p-2 sm:p-6 relative max-h-[80vh] overflow-hidden">
            <button
              onClick={() => setIsFollowersModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-lg sm:text-xl z-10"
            >
              ✕
            </button>
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4 text-center dark:text-white">
              Followers ({followersCount})
            </h3>
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div>
                <label className="mr-1 sm:mr-2 font-medium text-xs sm:text-sm">
                  Followers per page:
                </label>
                <select
                  value={followersLimit}
                  onChange={(e) =>
                    handleFollowersLimitChange(Number(e.target.value))
                  }
                  className="border rounded px-1 sm:px-2 py-1 text-xs sm:text-sm"
                >
                  {[1, 5, 10, 20, 50].map((val) => (
                    <option key={val} value={val}>
                      {val}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <button
                  disabled={followersPage === 1 || loadingFollowers}
                  onClick={() => handleFollowersPageChange(followersPage - 1)}
                  className="px-2 py-1 border rounded mr-1 sm:mr-2 text-xs sm:text-sm"
                >
                  Prev
                </button>
                <span className="text-xs sm:text-sm">Page {followersPage}</span>
                <button
                  disabled={
                    followers.length < followersLimit || loadingFollowers
                  }
                  onClick={() => handleFollowersPageChange(followersPage + 1)}
                  className="px-2 py-1 border rounded ml-1 sm:ml-2 text-xs sm:text-sm"
                >
                  Next
                </button>
              </div>
            </div>
            <div className="overflow-y-auto max-h-64 sm:max-h-96">
              <FollowersList followers={followers} loading={loadingFollowers} />
            </div>
          </div>
        </div>
      )}
      <style jsx global>{`
        .swal-wide {
          width: 98vw !important;
          max-width: 600px;
        }
      `}</style>
    </div>
  );
};

export default Playerview;
