import { useState, useEffect } from "react";
import {
  faInstagram,
  faLinkedinIn,
  faFacebookF,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import follower from "../assets/images/avatar.png";
import Reviews from "./reviews";
import FollowingList from "../components/follower/followerlist";
import Fandetails from "./Fandetails";
import axios from "axios";
import { useAppSelector } from "../store/hooks";

interface Following {
  id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  photo?: string;
  role?: string;
  [key: string]: any;
}

interface currentProfile {
  id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  photo?: string;
  city?: string;
  country?: string;
  interests?: string[];
  socialLinks?: {
    instagram?: string;
    linkedin?: string;
    facebook?: string;
    twitter?: string;
  };
  [key: string]: any;
}

const Fanprofile = () => {
  const [activeTab, setActiveTab] = useState<
    "details" | "reviews" | "Following"
  >("details");

  const [following, setFollowing] = useState<Following[]>([]);
  const [followingCounts, setFollowingCounts] = useState({
    players: 0,
    experts: 0,
    total: 0,
  });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // <--- new

  const { currentProfile } = useAppSelector((state) => state.profile);
  const API_BASE_URL = `${import.meta.env.VITE_PORT}/api/v1/user/profile`;

  // Initial loading state before anything mounts
  useEffect(() => {
    setInitialLoading(true);
    // Simulate a short delay for mount, or replace with: fetch profile async if needed
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 500); // 0.5s delay for smoother experience
    return () => clearTimeout(timer);
  }, []);

  // Properly manage loadingProfile state after profile is available
  useEffect(() => {
    if (currentProfile && currentProfile.id) {
      setLoadingProfile(false);
    } else {
      setLoadingProfile(false); // even if no profile, don't keep loading forever
    }
  }, [currentProfile]);

  useEffect(() => {
    const fetchFollowingData = async () => {
      try {
        setLoadingFollowing(true);
        const token = localStorage.getItem("token");
        const userId = currentProfile?.id;

        if (!userId) {
          setFollowing([]);
          setFollowingCounts({ players: 0, experts: 0, total: 0 });
          setLoadingFollowing(false);
          return;
        }

        const response = await axios.get(
          `${API_BASE_URL}/${userId}/following`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              limit: 100,
              page: 1,
            },
          },
        );

        if (response.data?.users) {
          const followingList = response.data.users;
          setFollowing(followingList);

          const counts = followingList.reduce(
            (acc: any, person: Following) => {
              const role = person.role?.toLowerCase();
              if (role === "player") {
                acc.players++;
              } else if (role === "expert") {
                acc.experts++;
              }
              acc.total++;
              return acc;
            },
            { players: 0, experts: 0, total: 0 },
          );

          setFollowingCounts(counts);
        } else {
          setFollowing([]);
          setFollowingCounts({ players: 0, experts: 0, total: 0 });
        }
      } catch (error) {
        console.error("Error fetching following data:", error);
        setFollowing([]);
        setFollowingCounts({ players: 0, experts: 0, total: 0 });
      } finally {
        setLoadingFollowing(false);
      }
    };

    fetchFollowingData();
  }, [currentProfile, API_BASE_URL]);

  // Get display name
  const getDisplayName = () => {
    if (!currentProfile) return "Fan Profile";
    const fullName = `${currentProfile.firstName || ""} ${
      currentProfile.lastName || ""
    }`.trim();
    return fullName || currentProfile.username || "Fan Profile";
  };

  // Get social media links
  const getSocialIcons = () => {
    const socialLinks = currentProfile?.socialLinks || {};

    return [
      {
        icon: faInstagram,
        link: socialLinks.instagram || "",
        bg: "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600",
      },
      {
        icon: faLinkedinIn,
        link: socialLinks.linkedin || "",
        bg: "bg-blue-700",
      },
      {
        icon: faFacebookF,
        link: socialLinks.facebook || "",
        bg: "bg-blue-600",
      },
      {
        icon: faXTwitter,
        link: socialLinks.twitter || "",
        bg: "bg-black",
      },
    ];
  };

  const icons = getSocialIcons();

  // Show loading before first mount and while profile is loading
  if (initialLoading || loadingProfile) {
    return (
      <div className="w-full min-h-screen dark:bg-gray-900 px-10 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen dark:bg-gray-900 px-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-5">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">
            {getDisplayName()}
          </h1>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm text-gray-600">
            <div>
              <label className="block text-sm text-gray-500 dark:text-white mb-1">
                Country
              </label>
              <span className="font-semibold dark:text-white">
                {currentProfile?.country || "Not specified"}
              </span>
            </div>

            <div>
              <label className="block text-sm text-gray-500 dark:text-white mb-1">
                City
              </label>
              <span className="font-semibold dark:text-white">
                {currentProfile?.city || "Not specified"}
              </span>
            </div>
            <div>
              <label className="block text-sm text-gray-500 dark:text-white mb-1">
                Sports Interest
              </label>
              <span className="font-semibold dark:text-white">
                {currentProfile?.sport || "Not specified"}
              </span>
            </div>
          </div>

          <div className="mt-10 mb-5 flex gap-6">
            {icons.map(({ icon, link, bg }, index) => (
              <a
                key={index}
                href={link || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className={
                  link ? "cursor-pointer" : "cursor-default opacity-50"
                }
              >
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-sm ${bg}`}
                >
                  <FontAwesomeIcon icon={icon} className="w-6 h-6 text-white" />
                </div>
              </a>
            ))}
          </div>

          <div className="mt-10">
            <label className="block text-lg text-gray-800 dark:text-white mb-1">
              Following
            </label>
            <div className="gap-10 flex">
              <span className="font-semibold dark:text-white text-gray-800 text-lg">
                Players: {followingCounts.players}
              </span>
              <span className="font-semibold dark:text-white text-gray-800 gap-30 text-lg">
                Experts: {followingCounts.experts}
              </span>
              <span className="font-semibold dark:text-white text-gray-800 gap-30 text-lg">
                Total: {followingCounts.total}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-md overflow-hidden">
          <img
            src={currentProfile?.photo || follower}
            alt="Profile Photo"
            width={350}
            height={350}
            className="rounded-md object-cover"
          />
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-6">
        <div className="flex gap-4 border-b dark:border-gray-700">
          {(["details", "reviews", "Following"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-md font-medium capitalize transition-all duration-150 px-2 pb-1 border-b-2 ${
                activeTab === tab
                  ? "text-red-600 border-red-600"
                  : "border-transparent text-gray-600 dark:text-gray-300 hover:text-red-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {activeTab === "details" && currentProfile?.bio && (
            <Fandetails profileData={currentProfile} />
          )}
          {activeTab === "reviews" && <Reviews />}
          {activeTab === "Following" && <FollowingList />}
        </div>
      </div>
    </div>
  );
};

export default Fanprofile;
