import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faSave,
  faTimes,
  faPlus,
  faTrash,
  faUpload,
  faImage,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAppDispatch } from "../store/hooks";
import { updateProfile } from "../store/profile-slice";
import Swal from "sweetalert2";
import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_PORT}/api/v1`;

interface ProfileData {
  id?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  profession?: string;
  subProfession?: string;
  company?: string;
  companyLink?: string;
  country?: string;
  city?: string;
  address?: string;
  role?: string;
  budgetRange?: string;
  sponsorshipType?: string;
  sponsorshipCountryPreferred?: string;
  sponsorType?: string;
  photo?: string;
  socialLinks?: {
    twitter: string;
    facebook: string;
    linkedin: string;
    instagram: string;
  };
  [key: string]: any;
}

const Sponsordetails: React.FC<{ profileData?: ProfileData }> = ({
  profileData = {},
}) => {
  const dispatch = useAppDispatch();
  const bioTextRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [isBioLong, setIsBioLong] = useState(false);

  const [aboutMe, setAboutMe] = useState(profileData.bio || "");
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isEditingSponsorship, setIsEditingSponsorship] = useState(false);
  const [sponsorshipInfo, setSponsorshipInfo] = useState({
    range: profileData.budgetRange || "$4000-5500",
    type: profileData.sponsorshipType || "Cash/ Gift",
    country: profileData.sponsorshipCountryPreferred || "England",
  });
  const [tempSponsorship, setTempSponsorship] = useState({
    ...sponsorshipInfo,
  });

  useEffect(() => {
    const checkBioLength = () => {
      if (bioTextRef.current) {
        const lineHeight = parseInt(
          window.getComputedStyle(bioTextRef.current).lineHeight
        );
        const height = bioTextRef.current.scrollHeight;
        const lines = height / (lineHeight || 24); // Use 24px as fallback line height
        setIsBioLong(lines > 3);
      }
    };

    checkBioLength();
    window.addEventListener("resize", checkBioLength);

    return () => {
      window.removeEventListener("resize", checkBioLength);
    };
  }, [aboutMe, expanded]);

  useEffect(() => {
    if (profileData) {
      if (profileData.bio) {
        setAboutMe(profileData.bio);
      }

      setSponsorshipInfo({
        range: profileData.budgetRange || "$4000-5500",
        type: profileData.sponsorshipType || "Cash/ Gift",
        country: profileData.sponsorshipCountryPreferred || "England",
      });
      setTempSponsorship({
        range: profileData.budgetRange || "$4000-5500",
        type: profileData.sponsorshipType || "Cash/ Gift",
        country: profileData.sponsorshipCountryPreferred || "England",
      });
    }
  }, [profileData]);

  const handleSaveAboutMe = async () => {
    setIsSubmitting(true);
    try {
      await dispatch(updateProfile({ bio: aboutMe })).unwrap();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "About section updated successfully",
        timer: 2000,
        showConfirmButton: false,
      });
      setIsEditingAbout(false);
      setExpanded(false);
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

  const cancelAboutMe = () => {
    setAboutMe(profileData.bio || "");
    setIsEditingAbout(false);
  };

  const handleSaveSponsorship = async () => {
    setIsSubmitting(true);
    try {
      // Map to the correct field names expected by the API
      const updatedProfile = {
        budgetRange: tempSponsorship.range,
        sponsorshipType: tempSponsorship.type,
        sponsorshipCountryPreferred: tempSponsorship.country,
      };

      await dispatch(updateProfile(updatedProfile)).unwrap();
      setSponsorshipInfo({ ...tempSponsorship });

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Sponsorship details updated successfully",
        timer: 2000,
        showConfirmButton: false,
      });
      setIsEditingSponsorship(false);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to update sponsorship details",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelSponsorshipEdit = () => {
    setTempSponsorship({ ...sponsorshipInfo });
    setIsEditingSponsorship(false);
  };

  // Additional sponsor information
  const sponsorInfo = {
    name:
      profileData.firstName && profileData.lastName
        ? `${profileData.firstName} ${profileData.lastName}`
        : "Not specified",
    sponsorType: profileData.sponsorType || "Not specified",
    company: profileData.company || "Not specified",
    companyLink: profileData.companyLink || "Not specified",
  };

  const toggleBioExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <div className="p-4 w-full space-y-6">
      {/* About Me Section */}
      <Card className="p-6 shadow-sm dark:bg-gray-700 relative">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          About Me
        </h3>
        {isEditingAbout ? (
          <>
            <Textarea
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value)}
              placeholder="Write about yourself..."
              className="min-h-[120px] dark:bg-gray-800"
              disabled={isSubmitting}
            />
            <div className="flex justify-end space-x-2 mt-3">
              <Button
                variant="outline"
                onClick={cancelAboutMe}
                disabled={isSubmitting}
              >
                <FontAwesomeIcon icon={faTimes} className="mr-1" /> Cancel
              </Button>
              <Button
                variant="default"
                className="bg-red-600 hover:bg-red-700"
                onClick={handleSaveAboutMe}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent border-white rounded-full"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSave} className="mr-1" /> Save
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="relative">
              <p
                ref={bioTextRef}
                className={`text-gray-700 dark:text-gray-300 ${
                  !expanded && isBioLong ? "line-clamp-3" : ""
                }`}
                style={{ whiteSpace: "pre-line" }}
              >
                {aboutMe}
              </p>

              {isBioLong && (
                <button
                  onClick={toggleBioExpand}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm mt-1 flex items-center justify-center w-full cursor-pointer text-center"
                >
                  {expanded ? <>Read Less </> : <>Read More </>}
                </button>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={() => setIsEditingAbout(true)}
            >
              <FontAwesomeIcon icon={faPen} />
            </Button>
          </>
        )}
      </Card>

      {/* Sponsorship Section */}
      <Card className="p-6 shadow-sm dark:bg-gray-700 relative">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Sponsorship Details
        </h3>
        {isEditingSponsorship ? (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Budget Range
                </label>
                <Input
                  value={tempSponsorship.range}
                  onChange={(e) =>
                    setTempSponsorship({
                      ...tempSponsorship,
                      range: e.target.value,
                    })
                  }
                  placeholder="e.g. $1000-2000"
                  disabled={isSubmitting}
                  className="dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sponsorship Type
                </label>
                <select
                  value={tempSponsorship.type}
                  onChange={(e) =>
                    setTempSponsorship({
                      ...tempSponsorship,
                      type: e.target.value,
                    })
                  }
                  disabled={isSubmitting}
                  className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Gift">Gift</option>
                  <option value="Professional Fee">Professional Fee</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Preferred Country
                </label>
                <Input
                  value={tempSponsorship.country}
                  onChange={(e) =>
                    setTempSponsorship({
                      ...tempSponsorship,
                      country: e.target.value,
                    })
                  }
                  placeholder="Country Preferred"
                  disabled={isSubmitting}
                  className="dark:bg-gray-800"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <Button
                variant="outline"
                onClick={cancelSponsorshipEdit}
                disabled={isSubmitting}
              >
                <FontAwesomeIcon icon={faTimes} className="mr-1" /> Cancel
              </Button>
              <Button
                variant="default"
                className="bg-red-600 hover:bg-red-700"
                onClick={handleSaveSponsorship}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent border-white rounded-full"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSave} className="mr-1" /> Save
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">
                  Budget Range
                </p>
                <p className="font-medium text-gray-800 dark:text-white">
                  {sponsorshipInfo.range}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">
                  Sponsorship Type
                </p>
                <p className="font-medium text-gray-800 dark:text-white">
                  {sponsorshipInfo.type}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">
                  Preferred Country
                </p>
                <p className="font-medium text-gray-800 dark:text-white">
                  {sponsorshipInfo.country}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={() => setIsEditingSponsorship(true)}
            >
              <FontAwesomeIcon icon={faPen} />
            </Button>
          </>
        )}
      </Card>
    </div>
  );
};

export default Sponsordetails;
