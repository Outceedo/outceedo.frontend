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
  certificates: [],
  awards: [],
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
  // viewedProfile is set by getProfile thunk
  const { currentProfile, viewedProfile, status, error } = useAppSelector(
    (state) => state.profile
  );

  // Local state for player stats which might not be directly part of the API response
  const [playerStats, setPlayerStats] = useState(initialStats);

  // Fetch profile data on component mount
  useEffect(() => {
    // Get username from localStorage as set in the slice code
    const username = localStorage.getItem("username");
    console.log(username);
    if (username) {
      // Dispatch the getProfile action with the username
      dispatch(getProfile(username));
    }
  }, [dispatch]);

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

    // Dispatch action to update profile photo using the thunk defined in the slice
    dispatch(updateProfilePhoto(file));

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Format the profile data from the API response for display
  const formatProfileData = () => {
    // Use the profile that was fetched (viewedProfile)
    const profile = viewedProfile;
    console.log("Profile data:", profile);

    if (!profile) return fallbackPlayerData;

    // Filter certificates and awards from documents
    const certificates =
      profile.documents?.filter((doc) => doc.type === "certificate") || [];
    const awards =
      profile.documents?.filter((doc) => doc.type === "award") || [];

    // Get media items (photos/videos)
    const mediaItems = profile.uploads || [];

    // Get profile photo from uploads if available
    let profileImage = fallbackPlayerData.profileImage;
    if (profile.photo) {
      profileImage = profile.photo;
    } else if (mediaItems.length > 0) {
      const profilePhoto = mediaItems.find((item) => item.type === "photo");
      if (profilePhoto) {
        profileImage = profilePhoto.url;
      }
    }

    return {
      id: profile.id || fallbackPlayerData.id,
      name:
        `${profile.firstName || ""} ${profile.lastName || ""}`.trim() ||
        fallbackPlayerData.name,
      age: profile.age || fallbackPlayerData.age,
      height: profile.height
        ? `${profile.height}cm`
        : fallbackPlayerData.height,
      weight: profile.weight
        ? `${profile.weight}kg`
        : fallbackPlayerData.weight,
      location:
        profile.city && profile.country
          ? `${profile.city}, ${profile.country}`
          : fallbackPlayerData.location,
      club: profile.company || fallbackPlayerData.club,
      languages:
        Array.isArray(profile.language) && profile.language.length > 0
          ? profile.language
          : fallbackPlayerData.languages,
      profileImage: profileImage,
      stats: playerStats, // Use local stats if not provided by API
      aboutMe: profile.bio || fallbackPlayerData.aboutMe,

      // Process certificates from documents array
      certificates:
        certificates.length > 0
          ? certificates
          : fallbackPlayerData.certificates,

      // Process awards from documents array
      awards: awards.length > 0 ? awards : fallbackPlayerData.awards,

      // Handle social links
      socials: profile.socialLinks || fallbackPlayerData.socials,

      // Store original uploads data for media tab
      uploads: mediaItems,

      // Store original documents data for certificates and awards tabs
      documents: profile.documents || [],
    };
  };

  // Get the formatted player data
  const playerData = formatProfileData();

  // Calculate OVR score
  const ovrScore = calculateOVR(playerData.stats);

  // Show loading state
  if (status === "loading" && !viewedProfile) {
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
            onClick={() => {
              const username = localStorage.getItem("username");
              if (username) {
                dispatch(getProfile(username));
              }
            }}
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
                      onUpdate={(data) => {
                        // Format data for update according to the backend schema
                        const updateData = {
                          firstName: data.name?.split(" ")[0] || "",
                          lastName: data.name?.split(" ")[1] || "",
                          bio: data.aboutMe,
                          age: parseInt(data.age.toString()),
                          height: parseInt(data.height.toString()),
                          weight: parseInt(data.weight.toString()),
                          city: data.location?.split(", ")[0] || "",
                          country: data.location?.split(", ")[1] || "",
                          company: data.club,
                          language: data.languages,
                          socialLinks: data.socials,
                        };

                        // Dispatch update profile action with the formatted data
                        dispatch(updateProfile(updateData));
                      }}
                    />
                  )}
                  {activeTab === "media" && (
                    <PlayerMedia
                      playerId={playerData.id}
                      isExpertView={false}
                      playerdata={playerData}
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
