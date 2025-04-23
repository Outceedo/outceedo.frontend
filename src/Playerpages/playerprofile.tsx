import React, { useState, useEffect, useRef } from "react";
import profile1 from "../assets/images/profile1.jpg";
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

      // Store raw profile data
      rawProfile: profile,
    };
  };

  // Get the formatted player data
  const playerData = formatProfileData();

  // Initialize edit data when entering edit mode
  const handleEditBasicInfo = () => {
    const locationParts = playerData.location.split(", ");

    setEditData({
      age: playerData.age.toString(),
      height: playerData.height.replace("cm", ""),
      weight: playerData.weight.replace("kg", ""),
      city: locationParts[0] || "",
      country: locationParts[1] || "",
      club: playerData.club,
      languages: [...playerData.languages],
    });

    setIsEditingBasicInfo(true);
  };

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
        company: editData.club,
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
  };

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
                  {playerData.name}
                </h2>

                {/* Basic Info Section with Edit Button */}
                <div className="mt-5 relative">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                      Profile
                    </h3>
                    {!isEditingBasicInfo ? (
                      <Button
                        onClick={handleEditBasicInfo}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-blue-600"
                      >
                        <FontAwesomeIcon icon={faPen} className="text-xs" />
                        <span>Edit</span>
                      </Button>
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
                      <span>Age: {playerData.age}</span>
                      <span>Height: {playerData.height}</span>
                      <span>Weight: {playerData.weight}</span>
                      <span>Location: {playerData.location}</span>
                      <span>Club: {playerData.club}</span>
                      <span>Languages: {playerData.languages.join(", ")}</span>
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
