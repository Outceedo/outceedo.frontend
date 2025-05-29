import React, { useState, useEffect, useRef } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faPen,
  faCheck,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import ProfileDetails from "./profiledetails";
import Reviews from "./reviews";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PlayerMedia from "./media";
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

interface Stat {
  label: string;
  percentage: number;
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

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"details" | "media" | "reviews">(
    "details"
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);
  const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false);
  const [editData, setEditData] = useState<EditableProfileData>({
    age: "",
    height: "",
    weight: "",
    city: "",
    country: "",
    club: "",
    languages: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get profile state from Redux store
  // currentProfile is set by getProfile thunk
  const { currentProfile, status, error } = useAppSelector(
    (state) => state.profile
  );
  const navigate = useNavigate();

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

  // Initialize edit data when profile data is loaded
  useEffect(() => {
    if (currentProfile) {
      setEditData({
        age: currentProfile.age?.toString() || "",
        height: currentProfile.height?.toString() || "",
        weight: currentProfile.weight?.toString() || "",
        city: currentProfile.city || "",
        country: currentProfile.country || "",
        club: currentProfile.club || "",
        languages: Array.isArray(currentProfile.language)
          ? [...currentProfile.language]
          : [],
      });
    }
  }, [currentProfile]);

  // Handle profile photo change
  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size and type before uploading
    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
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
      // Dispatch action to update profile photo using the thunk defined in the slice
      await dispatch(updateProfilePhoto(file)).unwrap();

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Profile photo updated successfully",
        timer: 2000,
        showConfirmButton: false,
      });

      // Refresh profile data
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

      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Format the profile data from the API response for display
  const formatProfileData = () => {
    // Use the profile that was fetched (currentProfile)
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
      };
    }

    // Filter certificates and awards from documents
    const certificates =
      profile.documents?.filter((doc) => doc.type === "certificate") || [];
    const awards =
      profile.documents?.filter((doc) => doc.type === "award") || [];

    // Get media items (photos/videos)
    const mediaItems = profile.uploads || [];

    // Get profile photo
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
      stats: playerStats, // Use local stats
      aboutMe: profile.bio || "",
      certificates: certificates,
      awards: awards,
      socials: profile.socialLinks || {},
      uploads: mediaItems,
      documents: profile.documents || [],
      rawProfile: profile,
      reviewsReceived: profile.reviewsReceived,
    };
  };

  // Get the formatted player data
  const playerData = formatProfileData();
  useEffect(() => {
    // Set a 2-second delay before executing navigation logic
    const navigationTimer = setTimeout(() => {
      // Only proceed with navigation if user is logged in and not already redirecting
      const userRole = localStorage.getItem("role");

      // Check if required profile fields are missing
      const isProfileIncomplete =
        !currentProfile?.age ||
        !currentProfile?.gender ||
        !currentProfile?.height ||
        !currentProfile?.weight;

      console.log("Profile check - isProfileIncomplete:", isProfileIncomplete);
      console.log("Missing fields:", {
        age: !currentProfile?.age,
        gender: !currentProfile?.gender,
        height: !currentProfile?.height,
        weight: !currentProfile?.weight,
      });

      if (isProfileIncomplete) {
        console.log("Profile is incomplete, redirecting to details form");
        navigate("/player/details-form");
      } else {
        if (userRole === "player") {
          console.log("Redirecting to player profile");
          navigate("/player/profile");
        } else if (userRole === "expert") {
          console.log("Redirecting to expert profile");
          navigate("/expert/profile");
        } else {
          // Fallback if role is not recognized
          console.log("Role not recognized, redirecting to details form");
          navigate("/player/details-form");
        }
      }
    }, 2000); // 2000 milliseconds = 2 seconds

    // Cleanup function to clear the timeout if component unmounts before timeout completes
    return () => clearTimeout(navigationTimer);
  }, [navigate, currentProfile]);

  // Handle changes to edit fields
  const handleInputChange = (
    field: keyof EditableProfileData,
    value: string
  ) => {
    setEditData((prev) => ({ ...prev, [field]: value }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle changes to languages (comma-separated)
  const handleLanguagesChange = (value: string) => {
    const languageArray = value
      .split(",")
      .map((lang) => lang.trim())
      .filter((lang) => lang !== "");
    setEditData((prev) => ({ ...prev, languages: languageArray }));

    // Clear error for languages
    if (errors.languages) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.languages;
        return newErrors;
      });
    }
  };

  // Validate form data
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

  // Save changes
  const handleSaveBasicInfo = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Format data for the API
      const updateData = {
        firstName: playerData.rawProfile.firstName || "",
        lastName: playerData.rawProfile.lastName || "",
        bio: playerData.rawProfile.bio || "",
        age: parseInt(editData.age),
        height: parseInt(editData.height),
        weight: parseInt(editData.weight),
        city: editData.city,
        country: editData.country,
        club: editData.club,
        language: editData.languages,
        socialLinks: playerData.rawProfile.socialLinks || {},
      };

      // Dispatch update profile action
      await dispatch(updateProfile(updateData)).unwrap();

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Profile updated successfully",
        timer: 2000,
        showConfirmButton: false,
      });

      // Exit edit mode
      setIsEditingBasicInfo(false);

      // Refresh profile data
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

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditingBasicInfo(false);
    setErrors({});

    // Reset form data to current profile values
    if (currentProfile) {
      setEditData({
        age: currentProfile.age?.toString() || "",
        height: currentProfile.height?.toString() || "",
        weight: currentProfile.weight?.toString() || "",
        city: currentProfile.city || "",
        country: currentProfile.country || "",
        club: currentProfile.club || "",
        languages: Array.isArray(currentProfile.language)
          ? [...currentProfile.language]
          : [],
      });
    }
  };

  // Enter edit mode
  const enterEditMode = () => {
    setIsEditingBasicInfo(true);

    // Set form data to current profile values
    if (currentProfile) {
      setEditData({
        age: currentProfile.age?.toString() || "",
        height: currentProfile.height?.toString() || "",
        weight: currentProfile.weight?.toString() || "",
        city: currentProfile.city || "",
        country: currentProfile.country || "",
        club: currentProfile.club || "",
        languages: Array.isArray(currentProfile.language)
          ? [...currentProfile.language]
          : [],
      });
    }
  };

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
              {playerData.profileImage ? (
                <img
                  src={playerData.profileImage || profile}
                  alt={`${playerData.name || "Player"}'s profile`}
                  className="rounded-lg w-60 h-60 object-cover shadow-md"
                />
              ) : (
                <div className="rounded-lg w-60 h-60 bg-gray-200 flex items-center justify-center shadow-md">
                  {/* <Avatar /> */}
                </div>
              )}

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

              {/* Photo upload loading indicator */}
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
            <div className="relative w-full mt-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white font-Raleway">
                  {playerData.name || "Player Profile"}
                </h2>

                {/* Basic Info Section with Edit Button */}
                <div className="mt-5 relative">
                  <div className="flex justify-between items-start">
                    {!isEditingBasicInfo ? (
                      <div></div>
                    ) : (
                      <div className="flex gap-2">
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

                  {/* Display mode */}
                  {!isEditingBasicInfo ? (
                    <div className="flex flex-wrap gap-x-8 gap-y-2 text-gray-600 font-Opensans dark:text-gray-300">
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
                    /* Edit mode */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
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
                      <div>
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
                          age: parseInt(data.age?.toString() || "0"),
                          height: parseInt(data.height?.toString() || "0"),
                          weight: parseInt(data.weight?.toString() || "0"),
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
                  {activeTab === "media" && <Mediaedit Data={playerData} />}
                  {activeTab === "reviews" && (
                    <Reviewnoedit Data={playerData} />
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
