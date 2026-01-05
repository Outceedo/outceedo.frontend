import React, { useState, useEffect, useRef } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faCheck,
  faTimes,
  faStar as faStarSolid,
  faStarHalfAlt,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import ProfileDetails from "./profiledetails";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  getProfile,
  updateProfile,
  updateProfilePhoto,
} from "../store/profile-slice";
import Swal from "sweetalert2";
import profile from "../assets/images/avatar.png";
import { useNavigate } from "react-router-dom";
import Mediaedit from "@/Pages/Media/MediaEdit";
import Reviewnoedit from "@/Pages/Reviews/Reviewprofilenoedit";

import FollowList from "../components/follower/followerlist";
import axios from "axios";
import Settings from "./settings";

interface Stat {
  name: string;
  averageScore: number;
  color: string;
}

interface EditableProfileData {
  age: string;
  height: string;
  weight: string;
  city: string;
  country: string;
  club: string;
  languages: string[];
  firstName: string;
  lastName: string;
  bio: string[];
  socialLinks: string[];
}

const calculateOVR = (stats: Stat[]) => {
  if (!stats.length) return 0;
  const total = stats.reduce((sum, stat) => sum + stat.averageScore, 0);
  return Math.round(total / stats.length);
};

// Function to map API stats to display stats with colors and labels
const mapStatsToDisplay = (apiStats: any[]): Stat[] => {
  const statMapping: Record<string, { label: string; color: string }> = {
    pace: { label: "Pace", color: "#E63946" },
    shooting: { label: "Shooting", color: "#D62828" },
    passing: { label: "Passing", color: "#4CAF50" },
    dribbling: { label: "Dribbling", color: "#68A357" },
    defending: { label: "Defending", color: "#2D6A4F" },
    physical: { label: "Physical", color: "#F4A261" },
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
      (stat) => stat.name.toLowerCase() === defaultStat.name.toLowerCase()
    );

    return {
      name: defaultStat.name,
      averageScore: apiStat ? apiStat.averageScore : 0,
      color: defaultStat.color,
      label: statMapping[defaultStat.name]?.label || defaultStat.name,
    };
  });

  return mappedStats;
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
          icon={faStarRegular}
          className="text-yellow-400 text-xl"
        />
      ))}
    </span>
  );
};

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "details" | "media" | "reviews" | "account"
  >("details");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);
  const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false);
  const [editData, setEditData] = useState<EditableProfileData>({
    age: "",
    firstName: "",
    lastName: "",
    bio: [],
    socialLinks: [],
    height: "",
    weight: "",
    city: "",
    country: "",
    club: "",
    languages: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [followers, setFollowers] = useState<any[]>([]);
  const [followersLimit, setFollowersLimit] = useState(10);
  const [followersPage, setFollowersPage] = useState(1);
  const [followersLoading, setFollowersLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [isFollowersDialogOpen, setIsFollowersDialogOpen] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  const { currentProfile, status, error } = useAppSelector(
    (state) => state.profile
  );
  const {
    isActive,
    planName,
    loading: subscriptionLoading,
  } = useAppSelector((state) => state.subscription);
  const navigate = useNavigate();
  const isUserOnPremiumPlan =
    isActive && planName && planName.toLowerCase() !== "free";
  const [playerStats, setPlayerStats] = useState<Stat[]>([]);
  const API_FOLLOW_URL = `${import.meta.env.VITE_PORT}/api/v1/user/profile`;
  const API_STATS_URL = `${import.meta.env.VITE_PORT}/api/v1/user/reports`;

  useEffect(() => {
    const username = localStorage.getItem("username");
    if (username) {
      dispatch(getProfile(username));
    }
  }, [dispatch]);

  useEffect(() => {
    const savedStats = localStorage.getItem("playerStats");
    if (savedStats) {
      const parsedStats = JSON.parse(savedStats);
      const mappedStats = mapStatsToDisplay(parsedStats);
      setPlayerStats(mappedStats);
    }
  }, []);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: "error",
        title: "File too large",
        text: "Profile photo must be less than 5MB",
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      Swal.fire({
        icon: "error",
        title: "Invalid file type",
        text: "Please select an image file",
      });
      return;
    }

    setIsUpdatingPhoto(true);

    try {
      await dispatch(updateProfilePhoto(file)).unwrap();

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Profile photo updated successfully",
        timer: 2000,
        showConfirmButton: false,
      });

      const username = localStorage.getItem("username");
      if (username) {
        dispatch(getProfile(username));
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: error.message || "Failed to update profile photo",
      });
    } finally {
      setIsUpdatingPhoto(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const formatProfileData = () => {
    const profile = currentProfile;

    if (!profile) {
      return {
        id: "",
        name: "",
        age: 0,
        height: "",
        weight: "",
        location: "",
        club: "",
        languages: [],
        profileImage: "",
        stats: playerStats,
        aboutMe: "",
        certificates: [],
        awards: [],
        socials: {},
        uploads: [],
        documents: [],
        rawProfile: {},
        reviewsReceived: [],
      };
    }

    const certificates =
      profile.documents?.filter((doc) => doc.type === "certificate") || [];
    const awards =
      profile.documents?.filter((doc) => doc.type === "award") || [];
    const mediaItems = profile.uploads || [];

    let profileImage = "";
    if (profile.photo) {
      profileImage = profile.photo;
    } else if (mediaItems.length > 0) {
      const profilePhoto = mediaItems.find((item) => item.type === "photo");
      if (profilePhoto) {
        profileImage = profilePhoto.url;
      }
    }

    return {
      id: profile.id || "",
      name: `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "",
      age: profile.age || 0,
      height: profile.height ? `${profile.height}cm` : "",
      weight: profile.weight ? `${profile.weight}kg` : "",
      location:
        profile.city && profile.country
          ? `${profile.city}, ${profile.country}`
          : "",
      club: profile.club || "",
      languages:
        Array.isArray(profile.language) && profile.language.length > 0
          ? profile.language
          : [],
      profileImage: profileImage,
      stats: playerStats,
      aboutMe: profile.bio || "",
      certificates: certificates,
      awards: awards,
      socials: profile.socialLinks || {},
      uploads: mediaItems,
      documents: profile.documents || [],
      rawProfile: profile,
      reviewsReceived: profile.reviewsReceived || [],
    };
  };

  const playerData = formatProfileData();

  useEffect(() => {
    const navigationTimer = setTimeout(async () => {
      const userRole = localStorage.getItem("role");

      const isProfileIncomplete = false;

      if (isProfileIncomplete) {
        await Swal.fire({
          icon: "warning",
          title: "Please enter the Profile details",
          text: "Redirecting to Details form",
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true,
        });
        navigate("/player/details-form");
      } else {
        if (userRole === "player") {
          navigate("/player/profile");
        } else if (userRole === "expert") {
          navigate("/expert/profile");
        } else {
          navigate("/player/details-form");
        }
      }
    }, 9000);

    return () => clearTimeout(navigationTimer);
  }, [navigate, currentProfile]);

  useEffect(() => {
    if (currentProfile?.id) {
      fetchFollowers();
      fetchStats();
    }
  }, [currentProfile?.id]);

  const handleInputChange = (
    field: keyof EditableProfileData,
    value: string
  ) => {
    setEditData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleLanguagesChange = (value: string) => {
    const languageArray = value
      .split(",")
      .map((lang) => lang.trim())
      .filter((lang) => lang !== "");
    setEditData((prev) => ({ ...prev, languages: languageArray }));

    if (errors.languages) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.languages;
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (
      !editData.age ||
      isNaN(Number(editData.age)) ||
      Number(editData.age) <= 0
    ) {
      newErrors.age = "Age must be a positive number";
    }

    if (
      !editData.height ||
      isNaN(Number(editData.height)) ||
      Number(editData.height) <= 0
    ) {
      newErrors.height = "Height must be a positive number";
    }

    if (
      !editData.weight ||
      isNaN(Number(editData.weight)) ||
      Number(editData.weight) <= 0
    ) {
      newErrors.weight = "Weight must be a positive number";
    }

    if (!editData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!editData.country.trim()) {
      newErrors.country = "Country is required";
    }

    if (!editData.club.trim()) {
      newErrors.club = "Club is required";
    }

    if (editData.languages.length === 0) {
      newErrors.languages = "At least one language is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveBasicInfo = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await dispatch(updateProfile(updateData)).unwrap();

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Profile updated successfully",
        timer: 2000,
        showConfirmButton: false,
      });

      setIsEditingBasicInfo(false);

      const username = localStorage.getItem("username");
      if (username) {
        dispatch(getProfile(username));
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error.message || "Failed to update profile",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingBasicInfo(false);
    setErrors({});
  };

  const fetchFollowers = async (
    limit = followersLimit,
    page = followersPage
  ) => {
    if (!currentProfile?.id) return;
    setFollowersLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_FOLLOW_URL}/${currentProfile.id}/followers?limit=${limit}&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setFollowers(data?.users || []);
      setFollowersCount(data?.users.length || 0);
    } catch (error) {
      setFollowers([]);
      setFollowersCount(0);
    } finally {
      setFollowersLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!currentProfile?.id) return;
    setStatsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_STATS_URL}/player/${currentProfile.id}/overall`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Map the API response to the correct format
      const apiStats = response.data.data || [];
      const mappedStats = mapStatsToDisplay(apiStats);

      setPlayerStats(mappedStats);

      // Save to localStorage for persistence
      localStorage.setItem("playerStats", JSON.stringify(apiStats));
    } catch (error) {
      console.error("Error fetching stats:", error);
      // Set default stats if API fails
      const defaultStats = mapStatsToDisplay([]);
      setPlayerStats(defaultStats);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleFollowersOpen = () => {
    setIsFollowersDialogOpen(true);
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

  const ovrScore = calculateOVR(playerData.stats);

  // Calculate review stats
  const reviewsArray = playerData.reviewsReceived || [];
  const totalReviews = reviewsArray.length;
  const avgRating =
    totalReviews === 0
      ? 0
      : reviewsArray.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) /
        totalReviews;

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
      <div className="flex-1 p-2 sm:p-4">
        <div className="w-full">
          {/* Hybrid responsive layout for profile image + info */}
          <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start justify-center lg:justify-start mt-4 relative w-full">
            {/* Profile Image */}
            <div className="relative group w-full max-w-[240px] sm:w-60 flex justify-center lg:block">
              {playerData.profileImage ? (
                <img
                  src={playerData.profileImage || profile}
                  alt={`${playerData.name || "Player"}'s profile`}
                  className="rounded-lg w-full h-60 sm:w-60 sm:h-60 object-cover shadow-md"
                />
              ) : (
                <div className="rounded-lg w-full h-60 bg-gray-200 flex items-center justify-center shadow-md"></div>
              )}
              {/* Photo edit overlay */}
              <div
                onClick={handlePhotoClick}
                className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-lg cursor-pointer"
              >
                <div className="text-white text-center">
                  <FontAwesomeIcon icon={faCamera} size="2x" className="mb-2" />
                  <p className="text-sm font-medium">
                    {playerData.profileImage ? "Change Photo" : "Add Photo"}
                  </p>
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                accept="image/*"
                className="hidden"
              />
              {isUpdatingPhoto && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white mx-auto"></div>
                    <p className="mt-2 text-sm">Uploading...</p>
                  </div>
                </div>
              )}
            </div>
            {/* Profile Info */}
            <div className="relative w-full mt-4 lg:mt-0">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white font-Raleway break-words">
                  {playerData.name || "Player Profile"}
                </h2>
                {/* Basic Info Section with Edit Button */}
                <div className="mt-5">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    {!isEditingBasicInfo ? null : (
                      <div className="flex gap-2 ml-auto">
                        <Button
                          onClick={handleCancelEdit}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1 text-red-600"
                          disabled={isSubmitting}
                        >
                          <FontAwesomeIcon icon={faTimes} className="text-xs" />
                          <span>Cancel</span>
                        </Button>
                        <Button
                          onClick={handleSaveBasicInfo}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1 text-green-600"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin h-4 w-4 mr-1 border-2 border-t-transparent border-green-600 rounded-full"></div>
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <FontAwesomeIcon
                                icon={faCheck}
                                className="text-xs"
                              />
                              <span>Save</span>
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                  {!isEditingBasicInfo ? (
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-gray-600 font-Opensans dark:text-gray-300 mt-2">
                      <span>Age: {playerData.age || "Not specified"}</span>
                      <span>
                        Height: {playerData.height || "Not specified"}
                      </span>
                      <span>
                        Weight: {playerData.weight || "Not specified"}
                      </span>
                      <span>
                        Location: {playerData.location || "Not specified"}
                      </span>
                      <span>Club: {playerData.club || "Not specified"}</span>
                      <span>
                        Languages:{" "}
                        {playerData.languages && playerData.languages.length > 0
                          ? playerData.languages.join(", ")
                          : "Not specified"}
                      </span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                      {/* Age */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Age
                        </label>
                        <Input
                          type="number"
                          value={editData.age}
                          onChange={(e) =>
                            handleInputChange("age", e.target.value)
                          }
                          placeholder="Enter age"
                          className={`w-full ${
                            errors.age ? "border-red-500" : ""
                          }`}
                          disabled={isSubmitting}
                        />
                        {errors.age && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.age}
                          </p>
                        )}
                      </div>
                      {/* Height */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Height (cm)
                        </label>
                        <Input
                          type="number"
                          value={editData.height}
                          onChange={(e) =>
                            handleInputChange("height", e.target.value)
                          }
                          placeholder="Enter height in cm"
                          className={`w-full ${
                            errors.height ? "border-red-500" : ""
                          }`}
                          disabled={isSubmitting}
                        />
                        {errors.height && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.height}
                          </p>
                        )}
                      </div>
                      {/* Weight */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Weight (kg)
                        </label>
                        <Input
                          type="number"
                          value={editData.weight}
                          onChange={(e) =>
                            handleInputChange("weight", e.target.value)
                          }
                          placeholder="Enter weight in kg"
                          className={`w-full ${
                            errors.weight ? "border-red-500" : ""
                          }`}
                          disabled={isSubmitting}
                        />
                        {errors.weight && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.weight}
                          </p>
                        )}
                      </div>
                      {/* City */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          City
                        </label>
                        <Input
                          type="text"
                          value={editData.city}
                          onChange={(e) =>
                            handleInputChange("city", e.target.value)
                          }
                          placeholder="Enter city"
                          className={`w-full ${
                            errors.city ? "border-red-500" : ""
                          }`}
                          disabled={isSubmitting}
                        />
                        {errors.city && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.city}
                          </p>
                        )}
                      </div>
                      {/* Country */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Country
                        </label>
                        <Input
                          type="text"
                          value={editData.country}
                          onChange={(e) =>
                            handleInputChange("country", e.target.value)
                          }
                          placeholder="Enter country"
                          className={`w-full ${
                            errors.country ? "border-red-500" : ""
                          }`}
                          disabled={isSubmitting}
                        />
                        {errors.country && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.country}
                          </p>
                        )}
                      </div>
                      {/* Club */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Club
                        </label>
                        <Input
                          type="text"
                          value={editData.club}
                          onChange={(e) =>
                            handleInputChange("club", e.target.value)
                          }
                          placeholder="Enter club name"
                          className={`w-full ${
                            errors.club ? "border-red-500" : ""
                          }`}
                          disabled={isSubmitting}
                        />
                        {errors.club && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.club}
                          </p>
                        )}
                      </div>
                      {/* Languages */}
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Languages (comma-separated)
                        </label>
                        <Input
                          type="text"
                          value={editData.languages.join(", ")}
                          onChange={(e) =>
                            handleLanguagesChange(e.target.value)
                          }
                          placeholder="Enter languages (e.g. English, Spanish)"
                          className={`w-full ${
                            errors.languages ? "border-red-500" : ""
                          }`}
                          disabled={isSubmitting}
                        />
                        {errors.languages && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.languages}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* OVR Section */}
              <Card className="bg-yellow-100 dark:bg-gray-700 p-3 w-fit mt-8 relative overflow-x-auto">
                {statsLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
                    <span className="ml-2">Loading stats...</span>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-4 md:gap-6 items-center">
                    <div>
                      <h2 className="text-xl ml-1 md:ml-5 text-gray-800 dark:text-white">
                        <span className="block font-bold font-opensans text-2xl md:text-3xl">
                          {ovrScore}
                        </span>
                        <span className="text-lg font-opensans">OVR</span>
                      </h2>
                    </div>
                    {playerData.stats.map((stat, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div
                          className="w-16 h-16 md:w-20 md:h-20 relative"
                          style={{ transform: "rotate(-90deg)" }}
                        >
                          <CircularProgressbar
                            value={stat.averageScore}
                            styles={buildStyles({
                              textSize: "26px",
                              pathColor: stat.color,
                              trailColor: "#ddd",
                              strokeLinecap: "round",
                            })}
                            circleRatio={0.5}
                          />
                          <div
                            className="absolute inset-0 flex items-center justify-center text-xs md:text-sm ml-2 md:ml-3 font-semibold font-opensans text-stone-800 dark:text-white"
                            style={{ transform: "rotate(90deg)" }}
                          >
                            {Math.round(stat.averageScore)}
                          </div>
                        </div>
                        <p className="text-xs md:text-sm -mt-6 md:-mt-8 font-opensans text-gray-700 dark:text-white capitalize">
                          {stat.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
              {/* Review stars and count, Followers */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <StarRating avg={avgRating} className="mr-2" />
                  <span className="text-gray-500">
                    {totalReviews} review{totalReviews !== 1 ? "s" : ""}
                  </span>
                  {totalReviews > 0 && (
                    <span className="ml-2 text-gray-600 text-sm">
                      ({avgRating.toFixed(1)} avg)
                    </span>
                  )}
                </div>
                {/* Followers dialog */}
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={handleFollowersOpen}
                >
                  <p className="text-red-500 font-bold">{followersCount}</p>
                  <p className="text-gray-500 dark:text-white">Followers</p>
                </div>
              </div>
            </div>
          </div>
          {!subscriptionLoading && (
            <div
              className={`rounded-lg p-3 mb-4 mt-2 ${
                isUserOnPremiumPlan
                  ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                  : "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
              }`}
            >
              <p
                className={`text-sm ${
                  isUserOnPremiumPlan
                    ? "text-green-700 dark:text-green-300"
                    : "text-blue-700 dark:text-blue-300"
                }`}
              >
                {isUserOnPremiumPlan ? (
                  <>
                    ✨ You're on the <strong>{planName}</strong> plan! Access to
                    all services is available.
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faLock} className="mr-2" />
                    You're on the <strong>{planName || "Free"}</strong> plan.
                    Only <strong>Recorded Video Assessment</strong> is
                    available.
                    <button
                      onClick={() => navigate("/plans")}
                      className="ml-2 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      Upgrade to Premium
                    </button>{" "}
                    for access to all services.
                  </>
                )}
              </p>
            </div>
          )}

          {/* Tabs Section */}
          <div className="mt-8">
            <div className="flex gap-5 sm:gap-4 border-b overflow-x-auto">
              {(["details", "media", "reviews", "account"] as const).map(
                (tab) => (
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
                )
              )}
            </div>
            <div className="mt-4">
              {playerData && (
                <>
                  {activeTab === "details" && (
                    <ProfileDetails
                      playerData={playerData}
                      isExpertView={false}
                      onUpdate={(data) => {
                        const updateData = {
                          firstName: data.name?.split(" ")[0] || "",
                          lastName: data.name?.split(" ")[1] || "",
                          bio: data.aboutMe,
                          age: parseInt(data.age?.toString() || "0"),
                          height: parseInt(data.height?.toString() || "0"),
                          weight: parseInt(data.weight?.toString() || "0"),
                          city: data.location?.split(", ")[0] || "",
                          country: data.location?.split(", ")[1] || "",
                          company: data.club,
                          language: data.languages,
                          socialLinks: data.socials,
                        };
                        dispatch(updateProfile(updateData));
                      }}
                    />
                  )}
                  {activeTab === "media" && <Mediaedit Data={playerData} />}
                  {activeTab === "reviews" && (
                    <Reviewnoedit Data={playerData} />
                  )}
                  {activeTab === "account" && <Settings />}
                </>
              )}
            </div>
          </div>
        </div>
        {isFollowersDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-[95vw] max-w-md p-6 relative max-h-[80vh] overflow-hidden">
              <button
                onClick={() => setIsFollowersDialogOpen(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl z-10"
              >
                ✕
              </button>
              <h3 className="text-lg font-semibold mb-4 text-center dark:text-white">
                Followers ({followersCount})
              </h3>
              {/* Pagination and limit controls */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <label className="mr-2 font-medium">
                    Followers per page:
                  </label>
                  <select
                    value={followersLimit}
                    onChange={(e) =>
                      handleFollowersLimitChange(Number(e.target.value))
                    }
                    className="border rounded px-2 py-1"
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
                    disabled={followersPage === 1 || followersLoading}
                    onClick={() => handleFollowersPageChange(followersPage - 1)}
                    className="px-2 py-1 border rounded mr-2"
                  >
                    Prev
                  </button>
                  <span>Page {followersPage}</span>
                  <button
                    disabled={
                      followers.length < followersLimit || followersLoading
                    }
                    onClick={() => handleFollowersPageChange(followersPage + 1)}
                    className="px-2 py-1 border rounded ml-2"
                  >
                    Next
                  </button>
                </div>
              </div>
              <div className="overflow-y-auto max-h-96">
                <FollowList followers={followers} loading={followersLoading} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
