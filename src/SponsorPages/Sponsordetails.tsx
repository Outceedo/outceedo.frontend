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

const Sponsordetails: React.FC<{ expertData?: any }> = ({ expertData = {} }) => {
  const dispatch = useAppDispatch();

  const [aboutMe, setAboutMe] = useState(
    expertData.about ||
      "I am from London, UK. A passionate, versatile expert bringing years of experience to help players improve their skills and reach their potential."
  );
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sponsorship State
  const [isEditingSponsorship, setIsEditingSponsorship] = useState(false);
  const [sponsorshipInfo, setSponsorshipInfo] = useState({
    range: "$4000-5500",
    type: "Cash/ Gift",
    country: "England",
  });
  const [tempSponsorship, setTempSponsorship] = useState({ ...sponsorshipInfo });

  // Sync sponsorship info if expertData provides it
  useEffect(() => {
    if (expertData.sponsorship) {
      setSponsorshipInfo(expertData.sponsorship);
      setTempSponsorship(expertData.sponsorship);
    }
  }, [expertData]);

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
    setAboutMe(expertData.bio || expertData.about || "");
    setIsEditingAbout(false);
  };

  const handleSaveSponsorship = async () => {
    setIsSubmitting(true);
    try {
      // You can send this to backend with dispatch(updateProfile({ sponsorship: tempSponsorship }))
      setSponsorshipInfo({ ...tempSponsorship });
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Sponsorship details updated successfully",
        timer: 2000,
        showConfirmButton: false,
      });
      setIsEditingSponsorship(false);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update sponsorship details",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelSponsorshipEdit = () => {
    setTempSponsorship({ ...sponsorshipInfo });
    setIsEditingSponsorship(false);
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
              <Button variant="outline" onClick={cancelAboutMe} disabled={isSubmitting}>
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
            <p className="text-gray-700 dark:text-gray-300">{aboutMe}</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 shadow-sm dark:bg-gray-700 relative">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Sponsorship
          </h3>
          {isEditingSponsorship ? (
            <>
              <div className="space-y-2">
                <Input
                  value={tempSponsorship.range}
                  onChange={(e) =>
                    setTempSponsorship({ ...tempSponsorship, range: e.target.value })
                  }
                  placeholder="Sponsorship Range"
                  disabled={isSubmitting}
                />
                <Input
                  value={tempSponsorship.type}
                  onChange={(e) =>
                    setTempSponsorship({ ...tempSponsorship, type: e.target.value })
                  }
                  placeholder="Type"
                  disabled={isSubmitting}
                />
                <Input
                  value={tempSponsorship.country}
                  onChange={(e) =>
                    setTempSponsorship({ ...tempSponsorship, country: e.target.value })
                  }
                  placeholder="Country Preferred"
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex justify-end space-x-2 mt-3">
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
              <p>
                <span className="font-medium">Range:</span> {sponsorshipInfo.range}
              </p>
              <p>
                <span className="font-medium">Type:</span> {sponsorshipInfo.type}
              </p>
              <p>
                <span className="font-medium">Country Preferred:</span>{" "}
                {sponsorshipInfo.country}
              </p>
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
    </div>
  );
};

export default Sponsordetails;
