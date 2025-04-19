import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faSave,
  faTimes,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAppDispatch } from "../store/hooks";
import { updateProfile } from "../store/profile-slice";
import Swal from "sweetalert2";

interface ExpertDetailProps {
  expertData?: any;
}

const ExpertDetails: React.FC<ExpertDetailProps> = ({ expertData = {} }) => {
  const dispatch = useAppDispatch();

  // About Me state
  const [aboutMe, setAboutMe] = useState(
    expertData.about ||
      "I am from London, UK. A passionate, versatile expert bringing years of experience to help players improve their skills and reach their potential."
  );
  const [isEditingAbout, setIsEditingAbout] = useState(false);

  // Skills state
  const [skills, setSkills] = useState<string[]>(
    expertData.skills || [
      "Leadership",
      "Tactical Analysis",
      "Team Management",
      "Fitness Training",
    ]
  );
  const [tempSkills, setTempSkills] = useState<string[]>([...skills]);
  const [newSkill, setNewSkill] = useState("");
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update state when expertData changes (e.g., after initial API load)
  useEffect(() => {
    if (expertData) {
      if (expertData.about) {
        setAboutMe(expertData.about);
      }
      if (expertData.skills && expertData.skills.length > 0) {
        setSkills(expertData.skills);
        setTempSkills(expertData.skills);
      }
    }
  }, [expertData]);

  // Save about me
  const handleSaveAboutMe = async () => {
    setIsSubmitting(true);

    try {
      // Format data for API update
      const updateData = {
        ...expertData.rawProfile,
        bio: aboutMe,
      };

      // Save to API
      await dispatch(updateProfile(updateData)).unwrap();

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

  // Cancel about me edit
  const cancelAboutMe = () => {
    setAboutMe(expertData.about || "");
    setIsEditingAbout(false);
  };

  // Skills Management
  const handleAddSkill = () => {
    if (newSkill.trim() && !tempSkills.includes(newSkill.trim())) {
      setTempSkills([...tempSkills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setTempSkills(tempSkills.filter((skill) => skill !== skillToRemove));
  };

  const handleSaveSkills = async () => {
    setIsSubmitting(true);

    try {
      // Format data for API update
      const updateData = {
        ...expertData.rawProfile,
        skills: tempSkills,
      };

      // Save to API
      await dispatch(updateProfile(updateData)).unwrap();

      // Update local state
      setSkills([...tempSkills]);

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Skills updated successfully",
        timer: 2000,
        showConfirmButton: false,
      });

      setIsEditingSkills(false);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error.message || "Failed to update skills",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelSkillsEdit = () => {
    setTempSkills([...skills]);
    setIsEditingSkills(false);
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

      {/* Skills & Socials in 2 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skills Section */}
        <Card className="p-6 shadow-sm dark:bg-gray-700 relative">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Skills
          </h3>

          {isEditingSkills ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add new skill"
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddSkill();
                  }}
                  disabled={isSubmitting}
                />
                <Button
                  variant="default"
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handleAddSkill}
                  disabled={isSubmitting}
                >
                  <FontAwesomeIcon icon={faPlus} />
                </Button>
              </div>

              <div className="space-y-2 mt-4">
                {tempSkills.map((skill, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 dark:bg-gray-600 p-2 rounded-md"
                  >
                    <span className="text-gray-700 dark:text-gray-200">
                      {skill}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleRemoveSkill(skill)}
                      disabled={isSubmitting}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  onClick={cancelSkillsEdit}
                  disabled={isSubmitting}
                >
                  <FontAwesomeIcon icon={faTimes} className="mr-1" /> Cancel
                </Button>
                <Button
                  variant="default"
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handleSaveSkills}
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
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-600 rounded-full text-sm text-gray-700 dark:text-gray-200"
                  >
                    {skill}
                  </span>
                ))}
                {skills.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400">
                    No skills listed
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => setIsEditingSkills(true)}
              >
                <FontAwesomeIcon icon={faPen} />
              </Button>
            </>
          )}
        </Card>

        {/* Certifications Section */}
        <Card className="p-6 shadow-sm dark:bg-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Certifications
          </h3>
          <div className="space-y-2">
            {expertData.certifications &&
            expertData.certifications.length > 0 ? (
              expertData.certifications.map((cert: string, index: number) => (
                <div
                  key={index}
                  className="flex items-center bg-gray-50 dark:bg-gray-600 p-2 rounded-md"
                >
                  <span className="text-gray-700 dark:text-gray-200">
                    {cert}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No certifications available
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ExpertDetails;
