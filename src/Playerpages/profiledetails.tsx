import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faSave,
  faTimes,
  faTrash,
  faPlus,
  faUpload,
  faImage,
} from "@fortawesome/free-solid-svg-icons";
import {
  FaLinkedinIn,
  FaFacebookF,
  FaInstagram,
  FaTwitter,
} from "react-icons/fa";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  faLinkedin,
  faInstagram,
  faFacebook,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import Swal from "sweetalert2";
import axios from "axios";

const icons = [
  { icon: faLinkedin, color: "#0077B5", link: "linkedin" },
  { icon: faFacebook, color: "#3b5998", link: "facebook" },
  { icon: faInstagram, color: "#E1306C", link: "instagram" },
  { icon: faTwitter, color: "#1DA1F2", link: "twitter" },
];

// API base URL
const API_BASE_URL = `${import.meta.env.VITE_PORT}/api/v1`;

interface DocumentItem {
  id: string;
  title: string;
  issuedBy?: string;
  issuedDate?: string;
  imageUrl?: string;
  description?: string;
  type: "certificate" | "award"; // Add type field to identify document type
}

interface PlayerData {
  id?: string;
  name?: string;
  age?: number | string;
  height?: string | number;
  weight?: string | number;
  location?: string;
  club?: string;
  languages?: string[];
  aboutMe?: string;
  documents?: DocumentItem[]; // Updated to use documents instead of separate arrays
  socials?: {
    linkedin?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  [key: string]: any; // For other properties
}

interface ProfileDetailsProps {
  playerData: PlayerData;
  isExpertView?: boolean;
  onUpdate: (data: PlayerData) => void;
}

const ProfileDetails: React.FC<ProfileDetailsProps> = ({
  playerData = {
    aboutMe: "I am a passionate player dedicated to improving my skills.",
    documents: [],
    socials: {},
  },
  isExpertView = false,
  onUpdate,
}) => {
  // State for editing
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isEditingCertificates, setIsEditingCertificates] = useState(false);
  const [isEditingAwards, setIsEditingAwards] = useState(false);
  const [isEditingSocials, setIsEditingSocials] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // File input refs
  const certificateFileRefs = useRef<(HTMLInputElement | null)[]>([]);
  const awardFileRefs = useRef<(HTMLInputElement | null)[]>([]);

  // State for data
  const [aboutMe, setAboutMe] = useState(playerData.aboutMe || "");
  const [certificates, setCertificates] = useState<DocumentItem[]>([]);
  const [awards, setAwards] = useState<DocumentItem[]>([]);
  const [socials, setSocials] = useState({
    linkedin: playerData.socials?.linkedin || "",
    instagram: playerData.socials?.instagram || "",
    facebook: playerData.socials?.facebook || "",
    twitter: playerData.socials?.twitter || "",
  });

  // Get auth token from localStorage
  const getAuthToken = (): string | null => {
    return localStorage.getItem("token");
  };

  // Update local state when playerData changes
  useEffect(() => {
    setAboutMe(playerData.aboutMe || "");

    // Process documents array to separate certificates and awards
    if (Array.isArray(playerData.documents)) {
      const certificateItems: DocumentItem[] = playerData.documents
        .filter((doc: any) => doc.type === "certificate")
        .map((doc: any) => ({
          id: doc.id,
          title: doc.title,
          issuedBy: doc.issuedBy || "",
          issuedDate: doc.issuedDate || "",
          imageUrl: doc.imageUrl || "",
          description: doc.description || "",
          type: "certificate",
        }));

      const awardItems: DocumentItem[] = playerData.documents
        .filter((doc: any) => doc.type === "award")
        .map((doc: any) => ({
          id: doc.id,
          title: doc.title,
          issuedBy: doc.issuedBy || "",
          issuedDate: doc.issuedDate || "",
          imageUrl: doc.imageUrl || "",
          description: doc.description || "",
          type: "award",
        }));

      setCertificates(certificateItems);
      setAwards(awardItems);
    }

    // Set socials
    setSocials({
      linkedin: playerData.socials?.linkedin || "",
      instagram: playerData.socials?.instagram || "",
      facebook: playerData.socials?.facebook || "",
      twitter: playerData.socials?.twitter || "",
    });
  }, [playerData]);

  // Update refs when certificates or awards change
  useEffect(() => {
    certificateFileRefs.current = certificates.map(() => null);
  }, [certificates.length]);

  useEffect(() => {
    awardFileRefs.current = awards.map(() => null);
  }, [awards.length]);

  // Format URL to ensure it has http/https
  const formatUrl = (url: string): string => {
    if (!url || url === "#") return "";
    return url.startsWith("http") ? url : `https://${url}`;
  };

  // Save functions
  const saveAboutMe = () => {
    onUpdate({
      ...playerData,
      aboutMe: aboutMe,
    });
    setIsEditingAbout(false);
  };

  const saveCertificates = async () => {
    setIsUploading(true);

    try {
      // Validate required fields
      const allValid = certificates.every((cert) => cert.title.trim() !== "");

      if (!allValid) {
        Swal.fire({
          title: "Validation Error",
          text: "All certificates must have a title.",
          icon: "error",
        });
        return;
      }

      // Merge certificates with existing documents (replace certificates only)
      const existingAwards =
        playerData.documents?.filter((doc) => doc.type === "award") || [];
      const updatedDocuments = [...existingAwards, ...certificates];

      onUpdate({
        ...playerData,
        documents: updatedDocuments,
      });
    } catch (error) {
      console.error("Error saving certificates:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save certificates",
      });
    } finally {
      setIsUploading(false);
      setIsEditingCertificates(false);
    }
  };

  const saveAwards = async () => {
    setIsUploading(true);

    try {
      // Validate required fields
      const allValid = awards.every((award) => award.title.trim() !== "");

      if (!allValid) {
        Swal.fire({
          title: "Validation Error",
          text: "All awards must have a title.",
          icon: "error",
        });
        return;
      }

      // Merge awards with existing documents (replace awards only)
      const existingCertificates =
        playerData.documents?.filter((doc) => doc.type === "certificate") || [];
      const updatedDocuments = [...existingCertificates, ...awards];

      onUpdate({
        ...playerData,
        documents: updatedDocuments,
      });
    } catch (error) {
      console.error("Error saving awards:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save awards",
      });
    } finally {
      setIsUploading(false);
      setIsEditingAwards(false);
    }
  };

  const saveSocials = () => {
    // Format URLs before saving
    const formattedSocials = {
      linkedin: socials.linkedin ? formatUrl(socials.linkedin) : "",
      instagram: socials.instagram ? formatUrl(socials.instagram) : "",
      facebook: socials.facebook ? formatUrl(socials.facebook) : "",
      twitter: socials.twitter ? formatUrl(socials.twitter) : "",
    };

    setSocials(formattedSocials);

    onUpdate({
      ...playerData,
      socials: formattedSocials,
    });

    setIsEditingSocials(false);
  };

  // Handle certificates and awards
  const handleAddCertificate = () => {
    setCertificates([
      ...certificates,
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

  const handleAddAward = () => {
    setAwards([
      ...awards,
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

  const handleCertificateChange = (
    index: number,
    field: keyof DocumentItem,
    value: string
  ) => {
    const newCertificates = [...certificates];
    newCertificates[index] = { ...newCertificates[index], [field]: value };
    setCertificates(newCertificates);
  };

  const handleAwardChange = (
    index: number,
    field: keyof DocumentItem,
    value: string
  ) => {
    const newAwards = [...awards];
    newAwards[index] = { ...newAwards[index], [field]: value };
    setAwards(newAwards);
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
          const cert = certificates[index];

          // If certificate has an ID, delete it from the server
          if (cert.id) {
            const token = getAuthToken();
            await axios.delete(`${API_BASE_URL}/user/document/${cert.id}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
          }

          // Remove from local state
          const newCertificates = [...certificates];
          newCertificates.splice(index, 1);
          setCertificates(newCertificates);

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
          const award = awards[index];

          // If award has an ID, delete it from the server
          if (award.id) {
            const token = getAuthToken();
            await axios.delete(`${API_BASE_URL}/user/document/${award.id}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
          }

          // Remove from local state
          const newAwards = [...awards];
          newAwards.splice(index, 1);
          setAwards(newAwards);

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

  // Handle image upload for certificates and awards
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
        certificates[index].title || `Certificate ${index + 1}`
      );
      formData.append("issuedBy", certificates[index].issuedBy || "");
      formData.append(
        "issuedDate",
        certificates[index].issuedDate || new Date().toISOString().split("T")[0]
      );
      formData.append("type", "certificate");
      if (certificates[index].description) {
        formData.append("description", certificates[index].description);
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
      const newCertificates = [...certificates];
      newCertificates[index] = {
        ...newCertificates[index],
        id: response.data.id || response.data._id,
        imageUrl: response.data.url,
      };
      setCertificates(newCertificates);

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
      formData.append("title", awards[index].title || `Award ${index + 1}`);
      formData.append("issuedBy", awards[index].issuedBy || "");
      formData.append(
        "issuedDate",
        awards[index].issuedDate || new Date().toISOString().split("T")[0]
      );
      formData.append("type", "award");
      if (awards[index].description) {
        formData.append("description", awards[index].description);
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
      const newAwards = [...awards];
      newAwards[index] = {
        ...newAwards[index],
        id: response.data.id || response.data._id,
        imageUrl: response.data.url,
      };
      setAwards(newAwards);

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

  // Handle social media changes
  const handleSocialChange = (
    platform: keyof typeof socials,
    value: string
  ) => {
    setSocials({ ...socials, [platform]: value });
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
            />
            <div className="flex justify-end space-x-2 mt-3">
              <Button
                variant="outline"
                onClick={() => setIsEditingAbout(false)}
              >
                <FontAwesomeIcon icon={faTimes} className="mr-1" /> Cancel
              </Button>
              <Button
                variant="default"
                className="bg-red-600 hover:bg-red-700"
                onClick={saveAboutMe}
              >
                <FontAwesomeIcon icon={faSave} className="mr-1" /> Save
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-700 dark:text-gray-300">{aboutMe}</p>
            {!isExpertView && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => setIsEditingAbout(true)}
              >
                <FontAwesomeIcon icon={faPen} />
              </Button>
            )}
          </>
        )}
      </Card>

      {/* Certificates & Awards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Certificates */}
        <Card className="p-6 shadow-sm dark:bg-gray-700 relative">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Certificates
          </h3>
          {isEditingCertificates ? (
            <div className="space-y-5">
              {certificates.map((cert, index) => (
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
                      disabled={isUploading}
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
                            disabled={isUploading}
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
                          disabled={isUploading}
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
                disabled={isUploading}
              >
                <FontAwesomeIcon icon={faPlus} className="mr-1" /> Add New
                Certificate
              </Button>

              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditingCertificates(false)}
                  disabled={isUploading}
                >
                  <FontAwesomeIcon icon={faTimes} className="mr-1" /> Cancel
                </Button>
                <Button
                  variant="default"
                  className="bg-red-600 hover:bg-red-700"
                  onClick={saveCertificates}
                  disabled={isUploading}
                >
                  {isUploading ? (
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
                        <div className="w-20 h-15 flex-shrink-0">
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
                  <p className="text-gray-500 italic">
                    No certificates added yet.
                  </p>
                )}
              </div>

              {!isExpertView && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={() => setIsEditingCertificates(true)}
                >
                  <FontAwesomeIcon icon={faPen} />
                </Button>
              )}
            </>
          )}
        </Card>

        {/* Awards */}
        <Card className="p-6 shadow-sm dark:bg-gray-700 relative">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Awards
          </h3>

          {isEditingAwards ? (
            <div className="space-y-5">
              {awards.map((award, index) => (
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
                      disabled={isUploading}
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
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              awardFileRefs.current[index]?.click()
                            }
                            className="mt-2"
                            disabled={isUploading}
                          >
                            <FontAwesomeIcon icon={faUpload} className="mr-2" />
                            Change Image
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => awardFileRefs.current[index]?.click()}
                          className="flex items-center justify-center border-dashed w-full h-32"
                          disabled={isUploading}
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
                disabled={isUploading}
              >
                <FontAwesomeIcon icon={faPlus} className="mr-1" /> Add New Award
              </Button>

              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditingAwards(false)}
                  disabled={isUploading}
                >
                  <FontAwesomeIcon icon={faTimes} className="mr-1" /> Cancel
                </Button>
                <Button
                  variant="default"
                  className="bg-red-600 hover:bg-red-700"
                  onClick={saveAwards}
                  disabled={isUploading}
                >
                  {isUploading ? (
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
                      className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden"
                    >
                      {/* Image Section */}
                      {award.imageUrl && (
                        <div className="w-20 h-15 flex-shrink-0">
                          <img
                            src={award.imageUrl}
                            alt={award.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Text Content */}
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                          {award.title}
                        </h4>
                        {award.issuedBy && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Issued by: {award.issuedBy}
                            {award.issuedDate &&
                              ` (${new Date(
                                award.issuedDate
                              ).toLocaleDateString()})`}
                          </p>
                        )}
                        {award.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
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

              {!isExpertView && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={() => setIsEditingAwards(true)}
                >
                  <FontAwesomeIcon icon={faPen} />
                </Button>
              )}
            </>
          )}
        </Card>
      </div>

      {/* Social Links - Enhanced Design */}
      <Card className="mt-4 relative border p-6 w-1/3 rounded-lg dark:bg-gray-700 dark:text-white">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Social Media
        </h3>

        {isEditingSocials ? (
          <div className="space-y-3">
            {/* LinkedIn */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
                <FaLinkedinIn size={20} />
              </div>
              <Input
                placeholder="LinkedIn URL (e.g. linkedin.com/in/username)"
                value={socials.linkedin}
                onChange={(e) => handleSocialChange("linkedin", e.target.value)}
                className="flex-1 dark:bg-gray-800"
              />
            </div>

            {/* Instagram */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-pink-50 dark:bg-pink-900/20">
                <FaInstagram size={20} />
              </div>
              <Input
                placeholder="Instagram URL (e.g. instagram.com/username)"
                value={socials.instagram}
                onChange={(e) =>
                  handleSocialChange("instagram", e.target.value)
                }
                className="flex-1 dark:bg-gray-800"
              />
            </div>

            {/* Facebook */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
                <FaFacebookF size={20} />
              </div>
              <Input
                placeholder="Facebook URL (e.g. facebook.com/username)"
                value={socials.facebook}
                onChange={(e) => handleSocialChange("facebook", e.target.value)}
                className="flex-1 dark:bg-gray-800"
              />
            </div>

            {/* Twitter */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
                <FaTwitter size={20} />
              </div>
              <Input
                placeholder="Twitter URL (e.g. twitter.com/username)"
                value={socials.twitter}
                onChange={(e) => handleSocialChange("twitter", e.target.value)}
                className="flex-1 dark:bg-gray-800"
              />
            </div>

            <div className="flex justify-end space-x-2 mt-3">
              <Button
                variant="outline"
                onClick={() => setIsEditingSocials(false)}
              >
                <FontAwesomeIcon icon={faTimes} className="mr-1" /> Cancel
              </Button>
              <Button
                variant="default"
                className="bg-red-600 hover:bg-red-700"
                onClick={saveSocials}
              >
                <FontAwesomeIcon icon={faSave} className="mr-1" /> Save
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex gap-5">
              <div className="flex gap-5">
                <div className="flex gap-5">
                  <div className="flex justify-center gap-6 mt-4">
                    {icons
                      .map((item, index) => {
                        // Get the social media platform identifier (linkedin, facebook, etc.)
                        const platform = item.link;

                        // Get the user-provided handle/URL from socials object
                        const userInput =
                          socials[platform as keyof typeof socials];

                        // Skip rendering if no value provided
                        if (
                          !userInput ||
                          userInput === "#" ||
                          userInput.trim() === ""
                        ) {
                          return null; // Don't render this social icon at all
                        }

                        // Build the correct URL based on the platform
                        let properUrl;

                        // Extract just the username/handle/ID by removing common prefixes
                        let cleanedInput = userInput
                          .trim()
                          .replace(/^(https?:\/\/)?(www\.)?/, "") // Remove protocol and www
                          .replace(/\/$/, ""); // Remove trailing slash

                        // Remove the platform name from the beginning if it exists
                        cleanedInput = cleanedInput
                          .replace(new RegExp(`^${platform}\\.com\\/`), "")
                          .replace(new RegExp(`^${platform}\\.`), "");

                        // Build proper URL based on platform
                        switch (platform) {
                          case "linkedin":
                            // Check if it's a full profile URL or just a username
                            properUrl = cleanedInput.includes("linkedin.com")
                              ? `https://${cleanedInput}`
                              : `https://www.linkedin.com/in/${cleanedInput}`;
                            break;
                          case "facebook":
                            properUrl = cleanedInput.includes("facebook.com")
                              ? `https://${cleanedInput}`
                              : `https://www.facebook.com/${cleanedInput}`;
                            break;
                          case "instagram":
                            properUrl = cleanedInput.includes("instagram.com")
                              ? `https://${cleanedInput}`
                              : `https://www.instagram.com/${cleanedInput}`;
                            break;
                          case "twitter":
                            properUrl = cleanedInput.includes("twitter.com")
                              ? `https://${cleanedInput}`
                              : `https://twitter.com/${cleanedInput}`;
                            break;
                          default:
                            // For any other platforms, just make sure there's a protocol
                            properUrl = cleanedInput.match(/^https?:\/\//i)
                              ? cleanedInput
                              : `https://${cleanedInput}`;
                        }

                        return (
                          <a
                            key={index}
                            href={properUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-11 h-11 flex items-center justify-center rounded-full text-white text-2xl shadow-lg"
                            style={{
                              background:
                                item.icon === faInstagram
                                  ? "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)"
                                  : item.color,
                            }}
                          >
                            <FontAwesomeIcon icon={item.icon} />
                          </a>
                        );
                      })
                      .filter(Boolean)}{" "}
                    {/* Filter out null values */}
                  </div>
                </div>
              </div>
            </div>

            {!isExpertView && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => setIsEditingSocials(true)}
              >
                <FontAwesomeIcon icon={faPen} />
              </Button>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default ProfileDetails;
