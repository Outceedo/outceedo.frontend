import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faCamera } from "@fortawesome/free-solid-svg-icons";
import profile2 from "../assets/images/profile2.jpg";

import ExpertMedia from "./expertmedia";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ExpertDetails from "./Expertdetails";
import ExpertReviews from "./Expertreviews";
import ExpertServices from "./Expertservices";

const ExpertProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "details" | "media" | "reviews" | "services"
  >("details");

  // File input reference for profile image
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile data state
  const [profileData, setProfileData] = useState({
    name: localStorage.getItem("expertName") || "Expert Name",
    profession:
      localStorage.getItem("expertProfession") ||
      "Coach & Ex-Soccer Player Defender",
    location: localStorage.getItem("expertLocation") || "London, UK",
    responseTime: localStorage.getItem("expertResponseTime") || "40 mins",
    travelLimit: localStorage.getItem("expertTravelLimit") || "30 kms",
    certificationLevel:
      localStorage.getItem("expertCertificationLevel") || "3rd highest",
    language: localStorage.getItem("expertLanguage") || "English, Spanish",
    profileImage: profile2,
  });

  // Editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempProfileData, setTempProfileData] = useState({ ...profileData });

  // Load saved data from localStorage if available
  useEffect(() => {
    const savedName = localStorage.getItem("expertName");
    if (savedName) {
      const updatedData = {
        ...profileData,
        name: savedName,
        profession:
          localStorage.getItem("expertProfession") || profileData.profession,
        location:
          localStorage.getItem("expertLocation") || profileData.location,
        responseTime:
          localStorage.getItem("expertResponseTime") ||
          profileData.responseTime,
        travelLimit:
          localStorage.getItem("expertTravelLimit") || profileData.travelLimit,
        certificationLevel:
          localStorage.getItem("expertCertificationLevel") ||
          profileData.certificationLevel,
        language:
          localStorage.getItem("expertLanguage") || profileData.language,
      };
      setProfileData(updatedData);
      setTempProfileData(updatedData);
    }
  }, []);

  // Profile photo change handler
  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const updatedProfile = {
          ...profileData,
          profileImage: event.target.result as string,
        };

        setProfileData(updatedProfile);
        setTempProfileData(updatedProfile);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle profile edits
  const handleProfileChange = (field: string, value: any) => {
    setTempProfileData({
      ...tempProfileData,
      [field]: value,
    });
  };

  // Save profile changes
  const saveProfileChanges = () => {
    setProfileData(tempProfileData);
    setIsEditingProfile(false);

    // Save to localStorage
    localStorage.setItem("expertName", tempProfileData.name);
    localStorage.setItem("expertProfession", tempProfileData.profession);
    localStorage.setItem("expertLocation", tempProfileData.location);
    localStorage.setItem("expertResponseTime", tempProfileData.responseTime);
    localStorage.setItem("expertTravelLimit", tempProfileData.travelLimit);
    localStorage.setItem(
      "expertCertificationLevel",
      tempProfileData.certificationLevel
    );
    localStorage.setItem("expertLanguage", tempProfileData.language);
  };

  // Cancel edits
  const cancelProfileEdit = () => {
    setTempProfileData(profileData);
    setIsEditingProfile(false);
  };

  return (
    <div className="flex w-full min-h-screen dark:bg-gray-900">
      <div className="flex-1 p-4">
        <div className="ml-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start mt-4 relative">
            {/* Profile Image with Edit Capability */}
            <div className="relative group">
              <img
                src={profileData.profileImage}
                alt={`${profileData.name}'s profile`}
                className="rounded-lg w-60 h-60 object-cover shadow-md"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
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
                onChange={handleProfilePhotoChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Profile Info */}
            <div className="flex flex-col mt-5 w-full gap-4">
              {!isEditingProfile ? (
                <>
                  <Card className="p-6 shadow-sm dark:bg-gray-700">
                    <div className="relative">
                      <div>
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                          {profileData.name}
                        </h2>
                        <div className="flex flex-wrap gap-8 text-gray-600 mt-2 dark:text-gray-300">
                          <span>{profileData.profession}</span>
                          <span>{profileData.location}</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                              Response Time
                            </p>
                            <p className="font-medium dark:text-white">
                              {profileData.responseTime}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                              Travel Limit
                            </p>
                            <p className="font-medium dark:text-white">
                              {profileData.travelLimit}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                              Certification
                            </p>
                            <p className="font-medium dark:text-white">
                              {profileData.certificationLevel}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                              Languages
                            </p>
                            <p className="font-medium dark:text-white">
                              {profileData.language}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-0 right-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        onClick={() => setIsEditingProfile(true)}
                      >
                        <FontAwesomeIcon icon={faPen} />
                      </Button>
                    </div>
                  </Card>
                </>
              ) : (
                <Card className="p-6 shadow-sm dark:bg-gray-800 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name
                    </label>
                    <Input
                      value={tempProfileData.name}
                      onChange={(e) =>
                        handleProfileChange("name", e.target.value)
                      }
                      className="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Profession
                      </label>
                      <Input
                        value={tempProfileData.profession}
                        onChange={(e) =>
                          handleProfileChange("profession", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Location
                      </label>
                      <Input
                        value={tempProfileData.location}
                        onChange={(e) =>
                          handleProfileChange("location", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Response Time
                      </label>
                      <Input
                        value={tempProfileData.responseTime}
                        onChange={(e) =>
                          handleProfileChange("responseTime", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Travel Limit
                      </label>
                      <Input
                        value={tempProfileData.travelLimit}
                        onChange={(e) =>
                          handleProfileChange("travelLimit", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Certification Level
                      </label>
                      <Input
                        value={tempProfileData.certificationLevel}
                        onChange={(e) =>
                          handleProfileChange(
                            "certificationLevel",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Languages
                      </label>
                      <Input
                        value={tempProfileData.language}
                        onChange={(e) =>
                          handleProfileChange("language", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <Button variant="outline" onClick={cancelProfileEdit}>
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      className="bg-red-600 hover:bg-red-700"
                      onClick={saveProfileChanges}
                    >
                      Save
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Tabs Section */}
          <div className="mt-8">
            <div className="flex gap-4 border-b pb-2">
              {(["details", "media", "reviews", "services"] as const).map(
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
              {activeTab === "details" && <ExpertDetails />}
              {activeTab === "media" && <ExpertMedia />}
              {activeTab === "reviews" && <ExpertReviews />}
              {activeTab === "services" && <ExpertServices />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertProfile;
