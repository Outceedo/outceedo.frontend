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

const Sponsordetails: React.FC<ExpertDetailProps> = ({ expertData = {} }) => {
  const dispatch = useAppDispatch();

  // About Me state
  const [aboutMe, setAboutMe] = useState(
    expertData.about ||
      "I am from London, UK. A passionate, versatile expert bringing years of experience to help players improve their skills and reach their potential."
  );
  const [isEditingAbout, setIsEditingAbout] = useState(false);

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

  // Certifications state - initialize from documents
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [tempCertificates, setTempCertificates] = useState<Certificate[]>([]);
  const [isEditingCertifications, setIsEditingCertifications] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // File input refs
  const certificateFileRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Helper function to get auth token
  const getAuthToken = (): string | null => {
    return localStorage.getItem("token");
  };

  // Initialize certificates from documents
  useEffect(() => {
    if (
      expertData &&
      expertData.rawProfile &&
      expertData.rawProfile.documents
    ) {
      // Filter for certificates only
      const docCertificates = expertData.rawProfile.documents
        .filter(
          (doc: any) => doc.type === "certificate" || doc.type === "award"
        )
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

      console.log("Certificates from documents:", docCertificates);
      setCertificates(docCertificates);
      setTempCertificates(docCertificates);
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

  // Update refs when certificates change
  useEffect(() => {
    certificateFileRefs.current = tempCertificates.map(() => null);
  }, [tempCertificates.length]);

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

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";

    try {
      return new Date(dateString).toLocaleDateString();
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

      {/* Sponsorship*/}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sponsorship Section */}
        <Card className="p-6 shadow-sm dark:bg-gray-700 relative">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Sponsorship
          </h3>
             <p><span className="font-medium">Range:</span> $4000-5500</p>
            <p><span className="font-medium">Type:</span> Cash/ Gift</p>
            <p><span className="font-medium">Country Preferred:</span> England</p>

         </Card>
       
      </div>
    </div>
  );
};

export default  Sponsordetails;
