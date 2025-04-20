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

  // Certifications state
  const [certificates, setCertificates] = useState<Certificate[]>(
    Array.isArray(expertData.certifications)
      ? expertData.certifications.map((cert: any) => {
          if (typeof cert === "string") {
            return {
              id: `cert-${Date.now()}-${Math.random()}`,
              title: cert,
              description: "",
            };
          }
          return cert;
        })
      : []
  );
  const [tempCertificates, setTempCertificates] = useState<Certificate[]>([
    ...certificates,
  ]);
  const [isEditingCertifications, setIsEditingCertifications] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // File input refs
  const certificateFileRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Helper function to get auth token
  const getAuthToken = (): string | null => {
    return localStorage.getItem("token");
  };

  // Update state when expertData changes
  useEffect(() => {
    if (expertData) {
      if (expertData.about) {
        setAboutMe(expertData.about);
      }
      if (expertData.skills && expertData.skills.length > 0) {
        setSkills(expertData.skills);
        setTempSkills(expertData.skills);
      }
      if (Array.isArray(expertData.certifications)) {
        const formattedCerts = expertData.certifications.map((cert: any) => {
          if (typeof cert === "string") {
            return {
              id: `cert-${Date.now()}-${Math.random()}`,
              title: cert,
              description: "",
            };
          }
          return cert;
        });
        setCertificates(formattedCerts);
        setTempCertificates(formattedCerts);
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
        imageUrl: response.data.url,
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

      // Format certificates for API - include all certificate data
      const formattedCertificates = tempCertificates.map((cert) => {
        return {
          title: cert.title,
          issuedBy: cert.issuedBy || "",
          issuedDate: cert.issuedDate || "",
          documentId: cert.documentId || "",
          imageUrl: cert.imageUrl || "",
          description: cert.description || "",
        };
      });

      // Format data for API update
      const updateData = {
        ...expertData.rawProfile,
        certificates: formattedCertificates,
      };

      // Save to API
      await dispatch(updateProfile(updateData)).unwrap();

      // Update local state
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

      {/* Skills & Certifications in 2 columns */}
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
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              certificateFileRefs.current[index]?.click()
                            }
                            className="mt-2"
                            disabled={isUploading || isSubmitting}
                          >
                            <FontAwesomeIcon icon={faUpload} className="mr-2" />
                            Change Image
                          </Button>
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
                      className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden"
                    >
                      {/* Image Section */}
                      {cert.imageUrl && (
                        <div className="w-20 h-20 flex-shrink-0">
                          <img
                            src={cert.imageUrl}
                            alt={cert.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Text Content */}
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                          {cert.title}
                        </h4>
                        {cert.issuedBy && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Issued by: {cert.issuedBy}
                            {cert.issuedDate &&
                              ` (${new Date(
                                cert.issuedDate
                              ).toLocaleDateString()})`}
                          </p>
                        )}
                        {cert.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
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
      </div>
    </div>
  );
};

export default ExpertDetails;
