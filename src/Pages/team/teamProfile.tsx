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
import TeamProfileDetails from "./TeamProfileDetails";
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
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { faStar as farStar } from "@fortawesome/free-regular-svg-icons";

// --- Types ---

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
  company?: string; // Team Name
  photo?: string;
  city?: string;
  country?: string;
  sport?: string;
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

// --- Helper Functions ---

const mapStatsToDisplay = (apiStats: any[]): Stat[] => {
  const statMapping: Record<string, { color: string }> = {
    pace: { color: "#E63946" },
    shooting: { color: "#D62828" },
    passing: { color: "#4CAF50" },
    dribbling: { color: "#68A357" },
    defending: { color: "#2D6A4F" },
    physical: { color: "#F4A261" },
    // Add team specific mappings if needed (e.g., Strategy, Teamwork)
    teamwork: { color: "#3B82F6" },
    strategy: { color: "#8B5CF6" },
  };

  // Default stats structure (Adjust these names if your Team API returns different stat names)
  const defaultStats = [
    { name: "pace", averageScore: 0, color: "#E63946" },
    { name: "shooting", averageScore: 0, color: "#D62828" },
    { name: "passing", averageScore: 0, color: "#4CAF50" },
    { name: "dribbling", averageScore: 0, color: "#68A357" },
    { name: "defending", averageScore: 0, color: "#2D6A4F" },
    { name: "physical", averageScore: 0, color: "#F4A261" },
  ];

  const mappedStats = defaultStats.map((defaultStat) => {
    const apiStat = apiStats.find(
      (stat) => stat.name.toLowerCase() === defaultStat.name.toLowerCase()
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

// --- Main Component ---

const TeamView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"details" | "media" | "reviews">(
    "details"
  );
  const [profileData, setProfileData] = useState<Profile | null>(null);

  // Stats State
  const [teamStats, setTeamStats] = useState<Stat[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);

  // Loading & Follower State
  const [isLoading, setIsLoading] = useState(true);
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

  // --- Fetch Profile ---
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const username = localStorage.getItem("viewteamusername");
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

  // --- Handle Profile Data & Fetch Stats ---
  useEffect(() => {
    if (status === "succeeded" && viewedProfile) {
      let processedProfile = viewedProfile;
      if (viewedProfile.user) {
        processedProfile = viewedProfile.user;
      } else if (viewedProfile.data) {
        processedProfile = viewedProfile.data;
      }

      setProfileData(processedProfile);

      setTimeout(() => {
        setIsLoading(false);
      }, 500);

      // Fetch stats if the profile is a team (and has an ID)
      if (processedProfile.role === "team" && processedProfile.id) {
        fetchTeamStats(processedProfile.id);
      }
    } else if (status === "failed") {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  }, [viewedProfile, status]);

  // --- Follow Status ---
  useEffect(() => {
    if (profileData?.id) {
      checkFollowStatus();
      setFollowersCount(profileData.followersCount || 0);
      fetchFollowers(100, followersPage);
    }
    // eslint-disable-next-line
  }, [profileData]);

  // --- API Calls ---

  const fetchTeamStats = async (teamId: string) => {
    setStatsLoading(true);
    try {
      const token = localStorage.getItem("token");
      // Note: Adjust the endpoint if your backend uses 'player' for generic stats or 'team' specifically
      const response = await axios.get(
        `${API_STATS_URL}/player/${teamId}/overall`, // Using 'player' as generic user endpoint, or change to 'team' if specific
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const apiStats = response.data.data || [];
      const mappedStats = mapStatsToDisplay(apiStats);
      setTeamStats(mappedStats);
    } catch (error) {
      console.error("Error fetching team stats:", error);
      const defaultStats = mapStatsToDisplay([]);
      setTeamStats(defaultStats);
    } finally {
      setStatsLoading(false);
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
        }
      );
      setIsFollowing(response.data?.isFollowing || false);
    } catch {
      setIsFollowing(false);
    }
  };

  const fetchFollowers = async (
    limit = followersLimit,
    page = followersPage
  ) => {
    if (!profileData?.id) return;
    setLoadingFollowers(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_FOLLOW_URL}/${profileData.id}/followers?limit=${limit}&page=${page}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFollowers(response.data?.users || []);
      setFollowersCount(response.data?.users.length);
    } catch {
      setFollowers([]);
    } finally {
      setLoadingFollowers(false);
    }
  };

  // --- Handlers ---

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
            <p class="mb-3">Following teams is only available for Premium members.</p>
            <p class="text-sm text-gray-600">Your current plan: <strong>${currentPlanName}</strong></p>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: "Upgrade Now",
        cancelButtonText: "Maybe Later",
        confirmButtonColor: "#3B82F6",
      }).then((result) => {
        if (result.isConfirmed) navigate("/plans");
      });
      return;
    }
    if (!profileData?.id) return;

    setIsFollowLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const displayName = profileData.company || "this team";
      let newFollowStatus;

      if (isFollowing) {
        await axios.patch(
          `${API_FOLLOW_URL}/${profileData.id}/unfollow`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        newFollowStatus = false;
      } else {
        await axios.patch(
          `${API_FOLLOW_URL}/${profileData.id}/follow`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        newFollowStatus = true;
      }
      setIsFollowing(newFollowStatus);
      setFollowersCount((prev) => (newFollowStatus ? prev + 1 : prev - 1));
      Swal.fire({
        icon: "success",
        title: newFollowStatus ? "Following!" : "Unfollowed",
        text: newFollowStatus
          ? `Following ${displayName}`
          : `Unfollowed ${displayName}`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update follow status.",
        timer: 2000,
      });
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleUnfollowWithConfirmation = async () => {
    if (!isFollowing) return;
    const displayName = profileData?.company || "this team";
    Swal.fire({
      title: "Unfollow Team?",
      text: `Are you sure you want to unfollow ${displayName}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, unfollow",
    }).then((result) => {
      if (result.isConfirmed) handleFollow();
    });
  };

  // --- Render Logic ---

  const OVR = calculateOVR(teamStats);
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
          Team Not Found
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-red-600 text-white rounded-md"
        >
          Go Back
        </button>
      </div>
    );
  }

  const displayName =
    profileData.company ||
    profileData.username ||
    `${profileData.firstName || ""} ${profileData.lastName || ""}`.trim() ||
    "Team Profile";

  const location =
    profileData.city && profileData.country
      ? `${profileData.city}, ${profileData.country}`
      : profileData.country || profileData.city || "N/A";

  return (
    <div className="w-full min-h-screen dark:bg-gray-900 px-16 sm:p-6">
      <div className="w-full">
        {/* Back Button */}
        <div
          onClick={() => navigate(-1)}
          className="flex flex-row text-2xl sm:text-4xl font-bold text-start cursor-pointer mb-4"
        >
          ←
        </div>

        {/* Profile Header Section */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-start mt-1 sm:mt-3">
          <img
            src={profileData.photo || profile}
            alt={`${displayName}'s profile`}
            className="rounded-lg w-32 h-32 sm:w-48 sm:h-48 md:w-60 md:h-60 object-cover shadow-md"
          />
          <div className="flex flex-col mt-1 sm:mt-2 w-full gap-2 sm:gap-4">
            <div>
              <h2 className="text-lg sm:text-3xl font-semibold text-gray-900 dark:text-white font-Raleway">
                {displayName}
              </h2>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-gray-600 font-Opensans mt-2 dark:text-gray-300 text-sm sm:text-base">
                <span>Location: {location}</span>
                {profileData.sport && <span>Sport: {profileData.sport}</span>}
                {profileData.role === "team" && (
                  <span className="flex items-center">
                    <FontAwesomeIcon icon={faUsers} className="mr-1" />
                    Team
                  </span>
                )}
                <span>
                  {`Language: `}
                  {Array.isArray(profileData.language) &&
                  profileData.language.length > 0
                    ? profileData.language.join(", ")
                    : "English"}
                </span>
              </div>
            </div>

            {/* Follow Button Section */}
            <div className="mt-2 sm:mt-4">
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
                  <span className="font-semibold text-lg">
                    {followersCount}
                  </span>{" "}
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

            {/* Premium Warning */}
            {localStorage.getItem("role") === "player" &&
              !isUserOnPremiumPlan && (
                <div className="mt-3 sm:mt-4">
                  {!subscriptionLoading && (
                    <div className="w-full max-w-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2 sm:p-3 mb-2 sm:mb-4">
                      <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                        <FontAwesomeIcon icon={faLock} className="mr-2" />
                        Following teams is a <strong>Premium feature</strong>.
                        <button
                          onClick={() => navigate("/plans")}
                          className="ml-2 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                          Upgrade to Premium
                        </button>
                      </p>
                    </div>
                  )}
                </div>
              )}

            {/* Stats Section (Added Back) */}
            {/* {profileData.role === "team" && (
              <Card className="bg-yellow-100 dark:bg-gray-700 p-2 sm:p-3 w-fit mt-3">
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
                    {teamStats.map((stat, index) => (
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
            )} */}

            {/* Rating Section */}
            <div className="flex items-center gap-2 mt-2 sm:mt-4">
              <StarRating avg={avgRating} className="mr-2" />
              <span className="text-gray-500 text-sm sm:text-base">
                {totalReviews} review{totalReviews !== 1 ? "s" : ""}
              </span>
              <span className="text-sm sm:text-base font-semibold">
                ({avgRating.toFixed(1)}/5)
              </span>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-8">
          <div className="flex gap-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto pb-1">
            {(["details", "media", "reviews"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-base sm:text-lg font-medium capitalize transition-all duration-200 px-2 pb-2 border-b-2 ${
                  activeTab === tab
                    ? "text-red-600 border-red-600"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-red-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="mt-6">
            {activeTab === "details" && (
              <TeamProfileDetails teamData={profileData} />
            )}
            {activeTab === "media" && <Mediaview Data={profileData} />}
            {activeTab === "reviews" && <Reviewview Data={profileData} />}
          </div>
        </div>
      </div>

      {/* Followers Modal */}
      {isFollowersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-[95vw] max-w-md p-4 sm:p-6 relative max-h-[85vh] overflow-hidden flex flex-col">
            <button
              onClick={() => setIsFollowersModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-xl z-10"
            >
              ✕
            </button>
            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-center dark:text-white">
              Followers ({followersCount})
            </h3>
            <div className="flex items-center justify-between mb-4 px-1">
              <div>
                <label className="mr-2 font-medium text-sm">Per page:</label>
                <select
                  value={followersLimit}
                  onChange={(e) =>
                    handleFollowersLimitChange(Number(e.target.value))
                  }
                  className="border rounded px-2 py-1 text-sm bg-transparent dark:text-white"
                >
                  {[5, 10, 20, 50].map((val) => (
                    <option key={val} value={val} className="dark:bg-gray-700">
                      {val}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={followersPage === 1 || loadingFollowers}
                  onClick={() => handleFollowersPageChange(followersPage - 1)}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Prev
                </button>
                <span className="text-sm font-medium">{followersPage}</span>
                <button
                  disabled={
                    followers.length < followersLimit || loadingFollowers
                  }
                  onClick={() => handleFollowersPageChange(followersPage + 1)}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Next
                </button>
              </div>
            </div>
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              <FollowersList followers={followers} loading={loadingFollowers} />
            </div>
          </div>
        </div>
      )}
      <style jsx global>{`
        .swal-wide {
          width: 95vw !important;
          max-width: 500px;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.5);
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
};

export default TeamView;
