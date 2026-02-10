import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import TeamDetails from "./teamdetails";

import { Loader2 } from "lucide-react";
import {
  faInstagram,
  faLinkedinIn,
  faFacebookF,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";
import {
  faExclamationTriangle,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import teamImage from "../assets/images/avatar.png";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getProfile } from "@/store/profile-slice";
import { useNavigate } from "react-router-dom";
import Mediaedit from "@/Pages/Media/MediaEdit";
import Settings from "./settings";

const TeamProfile = () => {
  const [activeTab, setActiveTab] = useState<"details" | "media" | "account">(
    "details",
  );
  const [showIncompleteNotice, setShowIncompleteNotice] = useState(true);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentProfile, status, error } = useAppSelector(
    (state) => state.profile,
  );

  // Use the profile that's actively being viewed (could be currentProfile or viewedProfile)
  const profileData = currentProfile;

  // Fallback data for display when profile isn't loaded
  const fallbackData = {
    teamName: "Team Name",
    firstName: "First",
    lastName: "Name",
    teamType: "Not specified",
    country: "Not specified",
    city: "Not specified",
    club: "Not specified",
    bio: "",
    socialLinks: {
      instagram: "#",
      linkedin: "#",
      facebook: "#",
      twitter: "#",
    },
    email: "",
    phone: "",
    countryCode: "",
    photo: teamImage,
  };

  // Map social links to icons
  const socialIcons = [
    {
      icon: faInstagram,
      link:
        profileData?.socialLinks?.instagram ||
        fallbackData.socialLinks.instagram,
      bg: "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600",
    },
    {
      icon: faLinkedinIn,
      link:
        profileData?.socialLinks?.linkedin || fallbackData.socialLinks.linkedin,
      bg: "bg-blue-700",
    },
    {
      icon: faFacebookF,
      link:
        profileData?.socialLinks?.facebook || fallbackData.socialLinks.facebook,
      bg: "bg-blue-600",
    },
    {
      icon: faXTwitter,
      link:
        profileData?.socialLinks?.twitter || fallbackData.socialLinks.twitter,
      bg: "bg-black",
    },
  ];

  const username = localStorage.getItem("username");

  useEffect(() => {
    if (username) {
      dispatch(getProfile(username));
    } else {
      console.error("No username found in localStorage");
    }
  }, [dispatch, username]);

  // Check for missing profile fields
  const getMissingFields = () => {
    if (!currentProfile) return [];

    const missingFields: string[] = [];

    if (!currentProfile.photo) {
      missingFields.push("Profile Picture");
    }
    if (!currentProfile.bio) {
      missingFields.push("Bio");
    }
    if (!currentProfile.sport) {
      missingFields.push("Sport");
    }
    if (!currentProfile.country) {
      missingFields.push("Country");
    }
    if (!currentProfile.city) {
      missingFields.push("City");
    }
    if (!currentProfile.teamType) {
      missingFields.push("Type");
    }
    if (!currentProfile.club) {
      missingFields.push("Club");
    }
    if (!currentProfile.teamCategory) {
      missingFields.push("Team Category");
    }

    return missingFields;
  };

  const missingFields = getMissingFields();
  const isProfileIncomplete = missingFields.length > 0;

  // Even in loading or error states, we'll show the UI with fallback values
  if (status === "loading") {
    return (
      <div className="w-full min-h-screen dark:bg-gray-900 p-10">
        <div className="flex justify-center items-center mb-6">
          <Loader2 className="h-8 w-8 animate-spin text-red-500" />
          <p className="ml-2 text-lg">Loading profile...</p>
        </div>
        {renderProfileContent(fallbackData)}
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="w-full min-h-screen dark:bg-gray-900 p-10">
        <div className="bg-red-50 p-4 rounded-md text-red-700 mb-6">
          <h2 className="text-lg font-semibold">Error Loading Profile</h2>
          <p>{error || "Failed to load profile. Please try again later."}</p>
          <Button
            className="mt-2 bg-red-600 hover:bg-red-700"
            onClick={() => dispatch(getProfile(username || ""))}
          >
            Retry
          </Button>
        </div>
        {renderProfileContent(fallbackData)}
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen dark:bg-gray-900 px-10">
      {renderProfileContent(profileData || fallbackData)}
    </div>
  );

  // Helper function to render profile content
  function renderProfileContent(data: any) {
    return (
      <>
        {/* Profile Incomplete Notice */}
        {isProfileIncomplete && showIncompleteNotice && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-4 relative">
            <button
              onClick={() => setShowIncompleteNotice(false)}
              className="absolute top-2 right-2 text-amber-600 hover:text-amber-800 p-1"
              aria-label="Dismiss notice"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <div className="flex items-start gap-3">
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                className="text-amber-600 mt-1 flex-shrink-0"
              />
              <div className="flex-1 pr-6">
                <h3 className="font-semibold text-amber-800 mb-1">
                  Profile Incomplete
                </h3>
                <p className="text-sm text-amber-700 mb-2">
                  Complete your team profile to attract more players and sponsors.
                  The following fields are missing:
                </p>
                <div className="flex flex-wrap gap-2">
                  {missingFields.map((field, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded"
                    >
                      {field}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => navigate("/team/details-form")}
                  className="mt-3 inline-flex items-center px-3 py-1.5 bg-amber-600 text-white text-sm font-medium rounded hover:bg-amber-700 transition-colors"
                >
                  Complete Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-5">
          {/* Left Section: Info */}
          <div className="w-full md:w-2/3">
            <div className="flex flex-col gap-3">
              <h1 className="text-2xl font-bold dark:text-white">
                {data?.teamName}
              </h1>
              <h2 className="text-lg sm:text-sm font-semibold text-gray-900 dark:text-white font-Raleway mb-3">
                Managed by{" "}
                {data.firstName?.trim() + " " + data.lastName?.trim()}
              </h2>
            </div>

            {/* Sport, Country, City, Type */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm text-gray-600">
              <div>
                <label className="block text-sm text-gray-500 dark:text-white mb-1">
                  Sport
                </label>
                <span className="font-semibold dark:text-white">
                  {data?.sport || fallbackData.teamType}
                </span>
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-white mb-1">
                  Country
                </label>
                <span className="font-semibold dark:text-white">
                  {data?.country || fallbackData.country}
                </span>
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-white mb-1">
                  City
                </label>
                <span className="font-semibold dark:text-white">
                  {data?.city || fallbackData.city}
                </span>
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-white mb-1">
                  Type
                </label>
                <span className="font-semibold dark:text-white">
                  {data?.teamType || fallbackData.teamType}
                </span>
              </div>
            </div>

            {/* Club */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm text-gray-600">
              <div>
                <label className="block text-sm text-gray-500 dark:text-white mb-1">
                  Club
                </label>
                <span className="font-semibold dark:text-white">
                  {data?.club || fallbackData.club}
                </span>
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-white mb-1">
                  Team Category
                </label>
                <span className="font-semibold dark:text-white">
                  {data?.teamCategory || fallbackData.teamType}
                </span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="mt-6 mb-5 flex flex-wrap gap-4">
              {socialIcons.map(({ icon, link, bg }, index) => (
                <a
                  key={index}
                  href={link !== "#" ? link : undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={
                    link === "#" ? "opacity-50 cursor-not-allowed" : ""
                  }
                >
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-sm ${bg}`}
                  >
                    <FontAwesomeIcon
                      icon={icon}
                      className="w-6 h-6 text-white"
                    />
                  </div>
                </a>
              ))}
            </div>

            {/* Contact Info */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {data?.email && (
                <div>
                  <label className="block text-sm text-gray-500 dark:text-white mb-1">
                    Email
                  </label>
                  <span className="font-semibold dark:text-white">
                    {data.email}
                  </span>
                </div>
              )}
              {data?.phone && (
                <div>
                  <label className="block text-sm text-gray-500 dark:text-white mb-1">
                    Phone
                  </label>
                  <span className="font-semibold dark:text-white">
                    {data.countryCode && `${data.countryCode} `}
                    {data.phone}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Section: Photo */}
          <div className="rounded-md overflow-hidden mt-6 md:mt-0 md:ml-8 w-full md:w-1/3 max-w-xs">
            <img
              src={data?.photo || fallbackData.photo}
              alt="Team Photo"
              width={350}
              height={350}
              className="rounded-md object-cover w-full h-auto"
              onError={(e) => {
                e.currentTarget.src = teamImage;
              }}
            />
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-6">
          <div className="flex gap-4 border-b overflow-x-auto">
            {(["details", "media", "account"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-md font-medium capitalize transition-all duration-150 px-2 pb-1 border-b-2 ${
                  activeTab === tab
                    ? "text-red-600 border-red-600"
                    : "border-transparent text-gray-600 hover:text-red-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="mt-5">
            {activeTab === "details" && <TeamDetails profileData={data} />}
            {activeTab === "media" && <Mediaedit Data={data} />}
            {activeTab === "account" && <Settings />}
          </div>
        </div>
      </>
    );
  }
};

export default TeamProfile;
