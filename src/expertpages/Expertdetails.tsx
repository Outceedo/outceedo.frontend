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
import { Label } from "@/components/ui/label";
import { useAppDispatch } from "../store/hooks";
import { updateProfile } from "../store/profile-slice";
import Swal from "sweetalert2";
import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_PORT}/api/v1`;

interface Certificate {
  id: string;
  title: string;
  issuedBy?: string;
  issuedDate?: string;
  documentId?: string;
  imageUrl?: string;
  type?: string;
  description?: string;
}

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

  // State for See More functionality in About Me section
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  const aboutTextRef = useRef<HTMLParagraphElement>(null);
  const [showSeeMore, setShowSeeMore] = useState(false);

  // Skills state
  const [skills, setSkills] = useState<string[]>(
    expertData.skills && Array.isArray(expertData.skills)
      ? expertData.skills
      : [
          "Leadership",
          "Tactical Analysis",
          "Team Management",
          "Fitness Training",
        ]
  );
  const [tempSkills, setTempSkills] = useState<string[]>([...skills]);
  const [newSkill, setNewSkill] = useState("");
  const [isEditingSkills, setIsEditingSkills] = useState(false);

  // Certifications state
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [tempCertificates, setTempCertificates] = useState<Certificate[]>([]);
  const [isEditingCertifications, setIsEditingCertifications] = useState(false);

  // Awards state
  const [awards, setAwards] = useState<Certificate[]>([]);
  const [tempAwards, setTempAwards] = useState<Certificate[]>([]);
  const [isEditingAwards, setIsEditingAwards] = useState(false);

  // Modal states
  const [modalCertificate, setModalCertificate] = useState<Certificate | null>(
    null
  );
  const [modalAward, setModalAward] = useState<Certificate | null>(null);
  const modalCertificateRef = useRef<HTMLDivElement | null>(null);
  const modalAwardRef = useRef<HTMLDivElement | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // File input refs
  const certificateFileRefs = useRef<(HTMLInputElement | null)[]>([]);
  const awardFileRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Helper function to get auth token
  const getAuthToken = (): string | null => {
    return localStorage.getItem("token");
  };

  // Check if about text is more than 3 lines
  useEffect(() => {
    if (aboutTextRef.current) {
      const lineHeight = parseInt(
        window.getComputedStyle(aboutTextRef.current).lineHeight
      );
      const height = aboutTextRef.current.scrollHeight;

      // Approximately check if the content is more than 3 lines
      // We compare the scrollHeight against 3 times the lineHeight plus some margin
      const isTall = height > lineHeight * 3 + 5;
      setShowSeeMore(isTall);

      // If we've determined it doesn't need "see more", always keep it expanded
      if (!isTall) {
        setIsAboutExpanded(true);
      }
    }
  }, [aboutMe]);

  // Modal outside click for certificate modal
  useEffect(() => {
    if (!modalCertificate) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        modalCertificateRef.current &&
        !modalCertificateRef.current.contains(event.target as Node)
      ) {
        setModalCertificate(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [modalCertificate]);

  // Modal outside click for award modal
  useEffect(() => {
    if (!modalAward) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        modalAwardRef.current &&
        !modalAwardRef.current.contains(event.target as Node)
      ) {
        setModalAward(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [modalAward]);

  // Initialize certificates & awards from documents
  useEffect(() => {
    if (
      expertData &&
      expertData.rawProfile &&
      expertData.rawProfile.documents
    ) {
      // Filter for certificates
      const docCertificates = expertData.rawProfile.documents
        .filter((doc: any) => doc.type === "certificate")
        .map((doc: any) => ({
          id: doc.id,
          title: doc.title,
          issuedBy: doc.issuedBy || "",
          issuedDate: doc.issuedDate || "",
          documentId: doc.id,
          imageUrl: doc.imageUrl,
          description: doc.description || "",
          type: doc.type,
        }));

      // Filter for awards
      const docAwards = expertData.rawProfile.documents
        .filter((doc: any) => doc.type === "award")
        .map((doc: any) => ({
          id: doc.id,
          title: doc.title,
          issuedBy: doc.issuedBy || "",
          issuedDate: doc.issuedDate || "",
          documentId: doc.id,
          imageUrl: doc.imageUrl,
          description: doc.description || "",
          type: doc.type,
        }));

      setCertificates(docCertificates);
      setTempCertificates(docCertificates);

      setAwards(docAwards);
      setTempAwards(docAwards);
    } else if (expertData.certificates) {
      // Fallback to certificates if documents not available
      const formattedCerts = Array.isArray(expertData.certificates)
        ? expertData.certificates.map((cert: any) => {
            if (typeof cert === "string") {
              return {
                id: `cert-${Date.now()}-${Math.random()}`,
                title: cert,
                description: "",
              };
            }
            return cert;
          })
        : [];

      setCertificates(formattedCerts);
      setTempCertificates(formattedCerts);
    }
  }, [expertData]);

  // Update state when expertData changes
  useEffect(() => {
    if (expertData) {
      if (expertData.bio) {
        setAboutMe(expertData.bio);
      } else if (expertData.about) {
        setAboutMe(expertData.about);
      }

      // Reset the expanded state when data changes
      setIsAboutExpanded(false);

      // Properly handle skills update from expertData
      if (expertData.skills) {
        // Make sure we have an array of strings
        let skillsArray: string[] = [];

        if (Array.isArray(expertData.skills)) {
          // Handle case where skills might be array of objects with 'skills' property
          skillsArray = expertData.skills
            .map((skill: any) =>
              typeof skill === "string"
                ? skill
                : skill && typeof skill === "object" && skill.skills
                ? skill.skills
                : ""
            )
            .filter(Boolean);
        }

        if (skillsArray.length > 0) {
          console.log("Setting skills from expertData:", skillsArray);
          setSkills(skillsArray);
          setTempSkills([...skillsArray]);
        }
      }
    }
  }, [expertData]);

  // Update refs when certificates and awards change
  useEffect(() => {
    certificateFileRefs.current = tempCertificates.map(() => null);
  }, [tempCertificates.length]);

  useEffect(() => {
    awardFileRefs.current = tempAwards.map(() => null);
  }, [tempAwards.length]);

  // Toggle See More in About section
  const toggleAboutExpanded = () => {
    setIsAboutExpanded(!isAboutExpanded);
  };

  // Save about me
  const handleSaveAboutMe = async () => {
    setIsSubmitting(true);

    try {
      // Format data for API update
      const updateData = {
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

      // Reset the expanded state when saving new content
      setIsAboutExpanded(false);
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
    setAboutMe(expertData.bio || expertData.about || "");
    setIsEditingAbout(false);
  };

  // Skills Management
  const handleAddSkill = () => {
    if (!newSkill.trim()) {
      // Don't add empty skills
      return;
    }

    // Normalize the skill text (trim and convert to lowercase for comparison)
    const normalizedNewSkill = newSkill.trim();
    const normalizedExistingSkills = tempSkills.map((skill) =>
      skill.toLowerCase()
    );

    // Check if skill already exists (case-insensitive)
    if (!normalizedExistingSkills.includes(normalizedNewSkill.toLowerCase())) {
      setTempSkills((prev) => [...prev, normalizedNewSkill]);
      setNewSkill(""); // Clear input field
    } else {
      // Alert the user or handle duplicate gracefully
      Swal.fire({
        icon: "info",
        title: "Duplicate Skill",
        text: "This skill already exists in your list",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setTempSkills((prev) => prev.filter((skill) => skill !== skillToRemove));
  };

  const handleSaveSkills = async () => {
    setIsSubmitting(true);

    try {
      // Format data for API update - only include skills
      const updateData = {
        skills: tempSkills,
      };

      console.log("Saving skills:", updateData);

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
      console.error("Error saving skills:", error);
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
    setNewSkill(""); // Clear input field
    setIsEditingSkills(false);
  };

  // Handle key press in skills input
  const handleSkillKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  // Certification Management
  const handleAddCertificate = () => {
    setTempCertificates([
      ...tempCertificates,
      {
        id: `cert-${Date.now()}`,
        title: "",
        issuedBy: "",
        issuedDate: new Date().toISOString().split("T")[0],
        description: "",
        type: "certificate",
      },
    ]);
  };

  const handleCertificateChange = (
    index: number,
    field: keyof Certificate,
    value: string
  ) => {
    const newCertificates = [...tempCertificates];
    newCertificates[index] = { ...newCertificates[index], [field]: value };
    setTempCertificates(newCertificates);
  };

  const handleRemoveCertificate = async (index: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this certificate?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const cert = tempCertificates[index];

          // If certificate has a document ID, delete it from the server
          if (cert.documentId) {
            const token = getAuthToken();
            await axios.delete(
              `${API_BASE_URL}/user/document/${cert.documentId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
          }

          // Remove from local state
          const newCertificates = [...tempCertificates];
          newCertificates.splice(index, 1);
          setTempCertificates(newCertificates);

          Swal.fire("Deleted!", "The certificate has been removed.", "success");
        } catch (error) {
          console.error("Error deleting certificate:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to delete the certificate",
          });
        }
      }
    });
  };

  const handleCertificateImageUpload = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // Create form data for document upload
      const formData = new FormData();
      formData.append("image", file);
      formData.append(
        "title",
        tempCertificates[index].title || `Certificate ${index + 1}`
      );
      formData.append("issuedBy", tempCertificates[index].issuedBy || "");
      formData.append(
        "issuedDate",
        tempCertificates[index].issuedDate ||
          new Date().toISOString().split("T")[0]
      );
      formData.append("type", "certificate");
      if (tempCertificates[index].description) {
        formData.append("description", tempCertificates[index].description);
      }

      // Upload document
      const token = getAuthToken();
      const response = await axios.post(
        `${API_BASE_URL}/user/document`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Document upload response:", response.data);

      // Update certificate with document ID and image URL
      const newCertificates = [...tempCertificates];
      newCertificates[index] = {
        ...newCertificates[index],
        documentId: response.data.id || response.data._id,
        imageUrl: response.data.imageUrl || response.data.url,
      };
      setTempCertificates(newCertificates);

      // Show success message
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Certificate image uploaded successfully",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error uploading certificate image:", error);
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: "Failed to upload certificate image",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveCertificates = async () => {
    setIsSubmitting(true);

    try {
      // Validate required fields
      const allValid = tempCertificates.every(
        (cert) => cert.title.trim() !== ""
      );

      if (!allValid) {
        Swal.fire({
          title: "Validation Error",
          text: "All certificates must have a title.",
          icon: "error",
        });
        setIsSubmitting(false);
        return;
      }

      // We don't need to update the profile API for certificates
      // as they're managed through the document API
      // Just update the local state
      setCertificates([...tempCertificates]);

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Certificates updated successfully",
        timer: 2000,
        showConfirmButton: false,
      });

      setIsEditingCertifications(false);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error.message || "Failed to update certificates",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelCertificationsEdit = () => {
    setTempCertificates([...certificates]);
    setIsEditingCertifications(false);
  };

  // Awards Management
  const handleAddAward = () => {
    setTempAwards([
      ...tempAwards,
      {
        id: `award-${Date.now()}`,
        title: "",
        issuedBy: "",
        issuedDate: new Date().toISOString().split("T")[0],
        description: "",
        type: "award",
      },
    ]);
  };

  const handleAwardChange = (
    index: number,
    field: keyof Certificate,
    value: string
  ) => {
    const newAwards = [...tempAwards];
    newAwards[index] = { ...newAwards[index], [field]: value };
    setTempAwards(newAwards);
  };

  const handleRemoveAward = async (index: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this award?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const award = tempAwards[index];

          // If award has a document ID, delete it from the server
          if (award.documentId) {
            const token = getAuthToken();
            await axios.delete(
              `${API_BASE_URL}/user/document/${award.documentId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
          }

          // Remove from local state
          const newAwards = [...tempAwards];
          newAwards.splice(index, 1);
          setTempAwards(newAwards);

          Swal.fire("Deleted!", "The award has been removed.", "success");
        } catch (error) {
          console.error("Error deleting award:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to delete the award",
          });
        }
      }
    });
  };

  const handleAwardImageUpload = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // Create form data for document upload
      const formData = new FormData();
      formData.append("image", file);
      formData.append("title", tempAwards[index].title || `Award ${index + 1}`);
      formData.append("issuedBy", tempAwards[index].issuedBy || "");
      formData.append(
        "issuedDate",
        tempAwards[index].issuedDate || new Date().toISOString().split("T")[0]
      );
      formData.append("type", "award");
      if (tempAwards[index].description) {
        formData.append("description", tempAwards[index].description);
      }

      // Upload document
      const token = getAuthToken();
      const response = await axios.post(
        `${API_BASE_URL}/user/document`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Document upload response:", response.data);

      // Update award with document ID and image URL
      const newAwards = [...tempAwards];
      newAwards[index] = {
        ...newAwards[index],
        documentId: response.data.id || response.data._id,
        imageUrl: response.data.imageUrl || response.data.url,
      };
      setTempAwards(newAwards);

      // Show success message
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Award image uploaded successfully",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error uploading award image:", error);
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: "Failed to upload award image",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveAwards = async () => {
    setIsSubmitting(true);

    try {
      // Validate required fields
      const allValid = tempAwards.every((award) => award.title.trim() !== "");

      if (!allValid) {
        Swal.fire({
          title: "Validation Error",
          text: "All awards must have a title.",
          icon: "error",
        });
        setIsSubmitting(false);
        return;
      }

      // Just update the local state
      setAwards([...tempAwards]);

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Awards updated successfully",
        timer: 2000,
        showConfirmButton: false,
      });

      setIsEditingAwards(false);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error.message || "Failed to update awards",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelAwardsEdit = () => {
    setTempAwards([...awards]);
    setIsEditingAwards(false);
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return dateString;
    }
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
                ref={aboutTextRef}
                className={`text-gray-700 dark:text-gray-300 ${
                  showSeeMore && !isAboutExpanded
                    ? "line-clamp-3 overflow-hidden"
                    : ""
                }`}
                style={{ whiteSpace: "pre-line" }}
              >
                {aboutMe}
              </p>

              {showSeeMore && (
                <button
                  onClick={toggleAboutExpanded}
                  className="text-blue-500 hover:text-blue-700 font-medium mt-1 focus:outline-none flex justify-center w-full"
                >
                  {isAboutExpanded ? "See less" : "read more"}
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
      {/* Skills Section - Now full width below Certificates and Awards */}
      <Card className="p-6 shadow-sm dark:bg-gray-700 relative">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
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
                onKeyPress={handleSkillKeyPress}
                disabled={isSubmitting}
              />
              <Button
                variant="default"
                className="bg-red-600 hover:bg-red-700"
                onClick={handleAddSkill}
                disabled={!newSkill.trim() || isSubmitting}
              >
                <FontAwesomeIcon icon={faPlus} />
              </Button>
            </div>

            <div className="space-y-2 mt-4">
              {tempSkills.length > 0 ? (
                tempSkills.map((skill, index) => (
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
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">
                  No skills added yet. Add your first skill above.
                </p>
              )}
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
              {skills.length > 0 ? (
                skills.map((skill, index) => (
                  <div key={index} className="flex items-center">
                    <span className="px-3 py-2 bg-gray-100 dark:bg-gray-600 rounded-md text-base font-medium text-gray-700 dark:text-gray-200">
                      {skill}
                    </span>
                  </div>
                ))
              ) : (
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

      {/* Certifications & Awards in 2 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Certifications Section */}
        <Card className="p-6 shadow-sm dark:bg-gray-700 relative">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Certifications
          </h3>

          {isEditingCertifications ? (
            <div className="space-y-5">
              {tempCertificates.map((cert, index) => (
                <div
                  key={cert.id || index}
                  className="border dark:border-gray-600 rounded-lg p-4 space-y-3 bg-gray-50 dark:bg-gray-800"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-gray-700 dark:text-gray-300">
                      Certificate #{index + 1}
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleRemoveCertificate(index)}
                      disabled={isUploading || isSubmitting}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={cert.title}
                      onChange={(e) =>
                        handleCertificateChange(index, "title", e.target.value)
                      }
                      placeholder="Certificate title"
                      className="w-full dark:bg-gray-700"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Issued By
                    </Label>
                    <Input
                      value={cert.issuedBy || ""}
                      onChange={(e) =>
                        handleCertificateChange(
                          index,
                          "issuedBy",
                          e.target.value
                        )
                      }
                      placeholder="Organization name"
                      className="w-full dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Issue Date
                    </Label>
                    <Input
                      type="date"
                      value={cert.issuedDate || ""}
                      onChange={(e) =>
                        handleCertificateChange(
                          index,
                          "issuedDate",
                          e.target.value
                        )
                      }
                      className="w-full dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Description (Optional)
                    </Label>
                    <Textarea
                      value={cert.description || ""}
                      onChange={(e) =>
                        handleCertificateChange(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      placeholder="Describe your certificate..."
                      className="w-full min-h-[80px] dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Certificate Image
                    </Label>
                    <div className="flex flex-col space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={(el) => {
                          certificateFileRefs.current[index] = el;
                        }}
                        onChange={(e) => handleCertificateImageUpload(index, e)}
                      />
                      {cert.imageUrl ? (
                        <div className="relative">
                          <img
                            src={cert.imageUrl}
                            alt={cert.title || `Certificate ${index}`}
                            className="w-full h-40 object-cover rounded-md mb-2"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src =
                                "https://via.placeholder.com/400x300?text=Certificate+Image+Not+Found";
                              target.onerror = null; // Prevent infinite loop
                            }}
                          />
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() =>
                            certificateFileRefs.current[index]?.click()
                          }
                          className="flex items-center justify-center border-dashed w-full h-32"
                          disabled={isUploading || isSubmitting}
                        >
                          {isUploading ? (
                            <div className="flex items-center">
                              <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Uploading...
                            </div>
                          ) : (
                            <>
                              <FontAwesomeIcon
                                icon={faImage}
                                className="mr-2"
                              />
                              Upload Image
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={handleAddCertificate}
                disabled={isUploading || isSubmitting}
              >
                <FontAwesomeIcon icon={faPlus} className="mr-1" /> Add New
                Certificate
              </Button>

              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  onClick={cancelCertificationsEdit}
                  disabled={isUploading || isSubmitting}
                >
                  <FontAwesomeIcon icon={faTimes} className="mr-1" /> Cancel
                </Button>
                <Button
                  variant="default"
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handleSaveCertificates}
                  disabled={isUploading || isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </div>
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
              <div className="space-y-4">
                {certificates.length > 0 ? (
                  certificates.map((cert, index) => (
                    <div
                      key={cert.id || index}
                      className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden cursor-pointer"
                      onClick={() => setModalCertificate(cert)}
                    >
                      {/* Image Section */}
                      {cert.imageUrl && (
                        <div className="w-20 h-20 flex-shrink-0">
                          <img
                            src={cert.imageUrl}
                            alt={cert.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src =
                                "https://via.placeholder.com/80x80?text=Image";
                              target.onerror = null; // Prevent infinite loop
                            }}
                          />
                        </div>
                      )}

                      {/* Text Content */}
                      <div className="p-4 flex-grow">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                          {cert.title}
                        </h4>
                        {cert.issuedBy && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Issued by: {cert.issuedBy}
                            {cert.issuedDate &&
                              ` (${formatDate(cert.issuedDate)})`}
                          </p>
                        )}
                        {cert.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {cert.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    No certifications added yet.
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => setIsEditingCertifications(true)}
              >
                <FontAwesomeIcon icon={faPen} />
              </Button>
            </>
          )}
        </Card>

        {/* Awards Section */}
        <Card className="p-6 shadow-sm dark:bg-gray-700 relative">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Awards
          </h3>

          {isEditingAwards ? (
            <div className="space-y-5">
              {tempAwards.map((award, index) => (
                <div
                  key={award.id || index}
                  className="border dark:border-gray-600 rounded-lg p-4 space-y-3 bg-gray-50 dark:bg-gray-800"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-gray-700 dark:text-gray-300">
                      Award #{index + 1}
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleRemoveAward(index)}
                      disabled={isUploading || isSubmitting}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={award.title}
                      onChange={(e) =>
                        handleAwardChange(index, "title", e.target.value)
                      }
                      placeholder="Award title"
                      className="w-full dark:bg-gray-700"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Issued By
                    </Label>
                    <Input
                      value={award.issuedBy || ""}
                      onChange={(e) =>
                        handleAwardChange(index, "issuedBy", e.target.value)
                      }
                      placeholder="Organization name"
                      className="w-full dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Issue Date
                    </Label>
                    <Input
                      type="date"
                      value={award.issuedDate || ""}
                      onChange={(e) =>
                        handleAwardChange(index, "issuedDate", e.target.value)
                      }
                      className="w-full dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Description (Optional)
                    </Label>
                    <Textarea
                      value={award.description || ""}
                      onChange={(e) =>
                        handleAwardChange(index, "description", e.target.value)
                      }
                      placeholder="Describe your award..."
                      className="w-full min-h-[80px] dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Award Image
                    </Label>
                    <div className="flex flex-col space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={(el) => {
                          awardFileRefs.current[index] = el;
                        }}
                        onChange={(e) => handleAwardImageUpload(index, e)}
                      />
                      {award.imageUrl ? (
                        <div className="relative">
                          <img
                            src={award.imageUrl}
                            alt={award.title || `Award ${index}`}
                            className="w-full h-40 object-cover rounded-md mb-2"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src =
                                "https://via.placeholder.com/400x300?text=Award+Image+Not+Found";
                              target.onerror = null;
                            }}
                          />
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => awardFileRefs.current[index]?.click()}
                          className="flex items-center justify-center border-dashed w-full h-32"
                          disabled={isUploading || isSubmitting}
                        >
                          {isUploading ? (
                            <div className="flex items-center">
                              <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Uploading...
                            </div>
                          ) : (
                            <>
                              <FontAwesomeIcon
                                icon={faImage}
                                className="mr-2"
                              />
                              Upload Image
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={handleAddAward}
                disabled={isUploading || isSubmitting}
              >
                <FontAwesomeIcon icon={faPlus} className="mr-1" /> Add New Award
              </Button>

              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  onClick={cancelAwardsEdit}
                  disabled={isUploading || isSubmitting}
                >
                  <FontAwesomeIcon icon={faTimes} className="mr-1" /> Cancel
                </Button>
                <Button
                  variant="default"
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handleSaveAwards}
                  disabled={isUploading || isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </div>
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
              <div className="space-y-4">
                {awards.length > 0 ? (
                  awards.map((award, index) => (
                    <div
                      key={award.id || index}
                      className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden cursor-pointer"
                      onClick={() => setModalAward(award)}
                    >
                      {/* Image Section */}
                      {award.imageUrl && (
                        <div className="w-20 h-20 flex-shrink-0">
                          <img
                            src={award.imageUrl}
                            alt={award.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src =
                                "https://via.placeholder.com/80x80?text=Image";
                              target.onerror = null;
                            }}
                          />
                        </div>
                      )}

                      {/* Text Content */}
                      <div className="p-4 flex-grow">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                          {award.title}
                        </h4>
                        {award.issuedBy && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Issued by: {award.issuedBy}
                            {award.issuedDate &&
                              ` (${formatDate(award.issuedDate)})`}
                          </p>
                        )}
                        {award.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {award.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    No awards added yet.
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => setIsEditingAwards(true)}
              >
                <FontAwesomeIcon icon={faPen} />
              </Button>
            </>
          )}
        </Card>
      </div>

      {/* Certificate Modal */}
      {modalCertificate && (
        <div className="fixed inset-0 z-50 flex justify-center items-center">
          <div className="fixed inset-0 bg-blur bg-opacity-50 backdrop-blur-sm"></div>
          <div
            ref={modalCertificateRef}
            className="relative bg-white dark:bg-gray-800 p-8 rounded-lg max-w-3xl w-full z-10"
          >
            <button
              className="absolute top-2 right-3 text-2xl text-gray-500 dark:text-gray-300 hover:text-red-600"
              onClick={() => setModalCertificate(null)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
              {modalCertificate.title || "Certificate"}
            </h2>
            {modalCertificate.issuedBy && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                <span className="font-medium">Issued by:</span>{" "}
                {modalCertificate.issuedBy}
              </p>
            )}
            {modalCertificate.issuedDate && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                <span className="font-medium">Date:</span>{" "}
                {formatDate(modalCertificate.issuedDate)}
              </p>
            )}
            {modalCertificate.imageUrl && (
              <div className="my-4">
                <img
                  src={modalCertificate.imageUrl}
                  alt={modalCertificate.title || ""}
                  className="w-full max-h-90 object-contain rounded"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
              </div>
            )}
            {modalCertificate.description && (
              <p className="text-base mt-2 text-gray-700 dark:text-gray-200 whitespace-pre-line">
                {modalCertificate.description}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Award Modal */}
      {modalAward && (
        <div className="fixed inset-0 z-50 flex justify-center items-center">
          <div className="fixed inset-0 bg-blur bg-opacity-50 backdrop-blur-sm"></div>
          <div
            ref={modalAwardRef}
            className="relative bg-white dark:bg-gray-800 p-8 rounded-lg max-w-3xl w-full z-10"
          >
            <button
              className="absolute top-2 right-3 text-2xl text-gray-500 dark:text-gray-300 hover:text-red-600"
              onClick={() => setModalAward(null)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
              {modalAward.title || "Award"}
            </h2>
            {modalAward.issuedBy && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                <span className="font-medium">Issued by:</span>{" "}
                {modalAward.issuedBy}
              </p>
            )}
            {modalAward.issuedDate && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                <span className="font-medium">Date:</span>{" "}
                {formatDate(modalAward.issuedDate)}
              </p>
            )}
            {modalAward.imageUrl && (
              <div className="my-4">
                <img
                  src={modalAward.imageUrl}
                  alt={modalAward.title || ""}
                  className="w-full max-h-90 object-contain rounded"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
              </div>
            )}
            {modalAward.description && (
              <p className="text-base mt-2 text-gray-700 dark:text-gray-200 whitespace-pre-line">
                {modalAward.description}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpertDetails;
