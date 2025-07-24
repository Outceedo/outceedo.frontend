import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faSave, faTimes } from "@fortawesome/free-solid-svg-icons";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAppDispatch } from "../store/hooks";
import { updateProfile } from "../store/profile-slice";
import Swal from "sweetalert2";

const API_BASE_URL = `${import.meta.env.VITE_PORT}/api/v1`;

interface ProfileData {
  id?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  profession?: string;
  subProfession?: string;
  country?: string;
  city?: string;
  address?: string;
  role?: string;
  photo?: string;
  socialLinks?: {
    twitter: string;
    facebook: string;
    linkedin: string;
    instagram: string;
  };
  [key: string]: any;
}

const Fandetails: React.FC<{ profileData?: ProfileData }> = ({
  profileData = {},
}) => {
  const dispatch = useAppDispatch();
  const bioTextRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [isBioLong, setIsBioLong] = useState(false);

  // Set initial bio from profile data or use fallback
  const [aboutMe, setAboutMe] = useState(profileData.bio || null);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if bio text overflows 3 lines
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

    // Check after the component mounts and whenever the bio changes
    checkBioLength();
    window.addEventListener("resize", checkBioLength);

    return () => {
      window.removeEventListener("resize", checkBioLength);
    };
  }, [aboutMe, expanded]);

  // Update state when profileData changes
  useEffect(() => {
    if (profileData) {
      // Update about me text if profileData has bio
      if (profileData.bio) {
        setAboutMe(profileData.bio);
      }
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
    </div>
  );
};

export default Fandetails;
