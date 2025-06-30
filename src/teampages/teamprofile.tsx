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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import teamImage from "../assets/images/avatar.png";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getProfile } from "@/store/profile-slice";
import { useNavigate } from "react-router-dom";
import Mediaedit from "@/Pages/Media/MediaEdit";

const TeamProfile = () => {
  const [activeTab, setActiveTab] = useState<"details" | "media">("details");
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentProfile, status, error } = useAppSelector(
    (state) => state.profile
  );

  // Use the profile that's actively being viewed (could be currentProfile or viewedProfile)
  const profileData = currentProfile;

  // Fallback data for display when profile isn't loaded
  const fallbackData = {
    teamName: "Team Name",
    firstName: "First",
    lastName: "Name",
    profession: "Not specified",
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
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-5">
          {/* Left Section: Info */}
          <div className="w-full md:w-2/3">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold dark:text-white">
                {data?.teamName ||
                  (data?.firstName && data?.lastName
                    ? `${data.firstName} ${data.lastName}`
                    : fallbackData.teamName)}
              </h1>
            </div>

            {/* Sport, Country, City, Type */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm text-gray-600">
              <div>
                <label className="block text-sm text-gray-500 dark:text-white mb-1">
                  Sport
                </label>
                <span className="font-semibold dark:text-white">
                  {data?.sport || fallbackData.profession}
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
                  {data?.profession || fallbackData.profession}
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
            {(["details", "media"] as const).map((tab) => (
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

          <div className="mt-4">
            {activeTab === "details" && <TeamDetails profileData={data} />}
            {activeTab === "media" && <Mediaedit Data={data} />}
          </div>
        </div>
      </>
    );
  }
};

export default TeamProfile;
