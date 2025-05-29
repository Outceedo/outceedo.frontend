import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "react-circular-progressbar/dist/styles.css";

import { useAppDispatch, useAppSelector } from "../store/hooks";
import { getProfile } from "../store/profile-slice";

import Playerview from "@/Pages/Player/Playerview";

const PlayerInfo: React.FC = () => {
  const [profileData, setProfileData] = useState<Profile | null>(null);

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
    } else if (status === "failed") {
      setIsLoading(false);
    }
  }, [viewedProfile, status]);

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

  return <Playerview />;
};

export default PlayerInfo;
