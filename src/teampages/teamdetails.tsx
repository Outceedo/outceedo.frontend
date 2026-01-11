import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faSave,
  faTimes,
  faTrash,
  faPlus,
  faImage,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import axios from "axios";
import { useAppDispatch } from "@/store/hooks";
import { updateProfile } from "@/store/profile-slice";

// API Base URL
const API_BASE_URL = `${import.meta.env.VITE_PORT}/api/v1`;

interface DocumentItem {
  id?: string;
  type?: "certificate" | "award";
  title: string;
  issuedBy?: string;
  issuedDate?: string;
  imageUrl?: string;
  description?: string;
}

interface ProfileData {
  id?: string;
  bio?: string;
  documents?: DocumentItem[];
  [key: string]: any;
}

const TeamDetails: React.FC<{ profileData?: ProfileData }> = ({
  profileData = {},
}) => {
  const dispatch = useAppDispatch();

  // --- States ---
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isEditingCertificates, setIsEditingCertificates] = useState(false);
  const [isEditingAwards, setIsEditingAwards] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  // Force update state to show selected filename immediately
  const [, forceUpdate] = useState({});

  // About Team Text State
  const [aboutTeam, setAboutTeam] = useState(profileData.bio || "");
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  const aboutTextRef = useRef<HTMLParagraphElement>(null);
  const [showSeeMore, setShowSeeMore] = useState(false);

  // Documents State
  const [certificates, setCertificates] = useState<DocumentItem[]>([]);
  const [awards, setAwards] = useState<DocumentItem[]>([]);

  // File Input Refs
  const certificateFileRefs = useRef<(HTMLInputElement | null)[]>([]);
  const awardFileRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Modal State
  const [modalItem, setModalItem] = useState<DocumentItem | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  // --- Effects ---

  // Sync data from props
  useEffect(() => {
    setAboutTeam(profileData.bio || "");

    if (Array.isArray(profileData.documents)) {
      setCertificates(
        profileData.documents.filter((doc) => doc.type === "certificate")
      );
      setAwards(profileData.documents.filter((doc) => doc.type === "award"));
    }
  }, [profileData]);

  // Handle "See More" for bio
  useEffect(() => {
    if (aboutTextRef.current) {
      const lineHeight = parseInt(
        window.getComputedStyle(aboutTextRef.current).lineHeight || "24"
      );
      const height = aboutTextRef.current.scrollHeight;
      const isTall = height > lineHeight * 3 + 5;
      setShowSeeMore(isTall);
      if (!isTall) setIsAboutExpanded(true);
    }
  }, [aboutTeam]);

  // Handle outside click for modal
  useEffect(() => {
    if (!modalItem) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setModalItem(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [modalItem]);

  // Update file refs arrays size
  useEffect(() => {
    certificateFileRefs.current = certificates.map(() => null);
  }, [certificates.length]);

  useEffect(() => {
    awardFileRefs.current = awards.map(() => null);
  }, [awards.length]);

  // --- Helpers ---

  const getAuthToken = () => localStorage.getItem("token");

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

  // --- Handlers: About ---

  const handleSaveAbout = async () => {
    setIsUploading(true);
    try {
      await dispatch(updateProfile({ bio: aboutTeam }));
      setIsEditingAbout(false);
      setExpanded(false);
      Swal.fire({
        icon: "success",
        title: "Saved",
        text: "About Team updated successfully",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update bio",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const toggleBioExpand = () => setIsAboutExpanded(!isAboutExpanded);
  const setExpanded = (val: boolean) => setIsAboutExpanded(val);

  // --- Handlers: Documents (Certificates & Awards) ---

  const handleAddDocument = (type: "certificate" | "award") => {
    const newItem: DocumentItem = {
      id: `${type}-${Date.now()}`,
      title: "",
      issuedBy: "",
      issuedDate: new Date().toISOString().split("T")[0],
      description: "",
      type: type,
    };

    if (type === "certificate") setCertificates([...certificates, newItem]);
    else setAwards([...awards, newItem]);
  };

  const handleDocumentChange = (
    type: "certificate" | "award",
    index: number,
    field: keyof DocumentItem,
    value: string
  ) => {
    if (type === "certificate") {
      const newItems = [...certificates];
      newItems[index] = { ...newItems[index], [field]: value };
      setCertificates(newItems);
    } else {
      const newItems = [...awards];
      newItems[index] = { ...newItems[index], [field]: value };
      setAwards(newItems);
    }
  };

  const handleFileChange = () => {
    // Triggers a re-render so the "Image selected" text appears immediately
    forceUpdate({});
  };

  const handleSaveDocuments = async (type: "certificate" | "award") => {
    setIsUploading(true);

    // Select the correct list and refs based on type
    const currentList = type === "certificate" ? certificates : awards;
    const fileRefs =
      type === "certificate" ? certificateFileRefs : awardFileRefs;

    try {
      const allValid = currentList.every((item) => item.title.trim() !== "");
      if (!allValid) {
        Swal.fire({
          title: "Validation Error",
          text: `All ${type}s must have a title.`,
          icon: "error",
        });
        setIsUploading(false);
        return;
      }

      const updatedList = [...currentList];

      for (let i = 0; i < updatedList.length; i++) {
        const item = updatedList[i];

        // Only save to API if it's a new item (temp ID) OR if a new file is being uploaded for an existing item
        // Note: For simplicity, we check if it has a temp ID 'cert-'/'award-'
        if (!item.id || item.id.startsWith(`${type}-`)) {
          try {
            const token = getAuthToken();
            const formData = new FormData();
            formData.append("title", item.title);
            formData.append("issuedBy", item.issuedBy || "");
            formData.append(
              "issuedDate",
              item.issuedDate || new Date().toISOString().split("T")[0]
            );
            formData.append("type", type);
            formData.append("description", item.description || "");

            // Attach file if selected
            if (fileRefs.current[i]?.files?.length) {
              formData.append("image", fileRefs.current[i]?.files?.[0] as File);
            }

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

            // Update with real ID and URL from server
            updatedList[i] = {
              ...item,
              id: response.data.id || response.data._id,
              imageUrl: response.data.url || item.imageUrl,
            };
            window.location.reload();
          } catch (error) {
            console.error(`Error creating ${type}:`, error);
          }
        }
      }

      // Merge with the OTHER type of documents to preserve them in Redux
      const otherList =
        profileData.documents?.filter((doc) => doc.type !== type) || [];
      const combinedDocs = [...otherList, ...updatedList];

      // Update Redux
      await dispatch(updateProfile({ documents: combinedDocs }));

      // Update Local State with the new IDs/Urls
      if (type === "certificate") setCertificates(updatedList);
      else setAwards(updatedList);

      Swal.fire({
        icon: "success",
        title: "Success",
        text: `${
          type === "certificate" ? "Certificates" : "Awards"
        } saved successfully`,
        timer: 1500,
        showConfirmButton: false,
      });

      if (type === "certificate") setIsEditingCertificates(false);
      else setIsEditingAwards(false);
    } catch (error) {
      console.error(error);
      Swal.fire({ icon: "error", title: "Error", text: "Failed to save data" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveDocument = async (
    type: "certificate" | "award",
    index: number
  ) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this item?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const currentList = type === "certificate" ? certificates : awards;
          const item = currentList[index];

          // Delete from API if it exists on server (doesn't have temp ID)
          if (item.id && !item.id.startsWith(`${type}-`)) {
            const token = getAuthToken();
            await axios.delete(`${API_BASE_URL}/user/document/${item.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
          }

          const newList = [...currentList];
          newList.splice(index, 1);

          if (type === "certificate") setCertificates(newList);
          else setAwards(newList);

          // Update Redux
          const otherList =
            profileData.documents?.filter((doc) => doc.type !== type) || [];
          await dispatch(
            updateProfile({ documents: [...otherList, ...newList] })
          );

          Swal.fire("Deleted!", "The item has been removed.", "success");
          window.location.reload();
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to delete item",
          });
        }
      }
    });
  };

  return (
    <div className="space-y-6 mt-6">
      {/* 1. About Team Section */}
      <Card className="p-6 shadow-sm dark:bg-gray-700 relative">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          About Team
        </h3>

        {isEditingAbout ? (
          <>
            <Textarea
              value={aboutTeam}
              onChange={(e) => setAboutTeam(e.target.value)}
              placeholder="Write about the team..."
              className="min-h-[120px] dark:bg-gray-800"
            />
            <div className="flex justify-end space-x-2 mt-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditingAbout(false);
                  setAboutTeam(profileData.bio || "");
                }}
                disabled={isUploading}
              >
                <FontAwesomeIcon icon={faTimes} className="mr-1" /> Cancel
              </Button>
              <Button
                variant="default"
                className="bg-red-600 hover:bg-red-700"
                onClick={handleSaveAbout}
                disabled={isUploading}
              >
                {isUploading ? (
                  "Saving..."
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
                {aboutTeam || "No team information available."}
              </p>

              {showSeeMore && (
                <button
                  onClick={toggleBioExpand}
                  className="text-blue-500 hover:text-blue-700 font-medium mt-1 focus:outline-none flex justify-center w-full"
                >
                  {isAboutExpanded ? "See less" : "Read more"}
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

      {/* 2. Grid for Certificates & Awards */}
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
                      onClick={() => handleRemoveDocument("certificate", index)}
                      disabled={isUploading}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </div>
                  {/* Inputs */}
                  <div>
                    <Label className="text-sm font-medium mb-1">Title *</Label>
                    <Input
                      value={cert.title}
                      onChange={(e) =>
                        handleDocumentChange(
                          "certificate",
                          index,
                          "title",
                          e.target.value
                        )
                      }
                      placeholder="Certificate Title"
                      className="w-full dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1">
                      Issued By
                    </Label>
                    <Input
                      value={cert.issuedBy || ""}
                      onChange={(e) =>
                        handleDocumentChange(
                          "certificate",
                          index,
                          "issuedBy",
                          e.target.value
                        )
                      }
                      className="w-full dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1">
                      Issue Date
                    </Label>
                    <Input
                      type="date"
                      value={cert.issuedDate || ""}
                      onChange={(e) =>
                        handleDocumentChange(
                          "certificate",
                          index,
                          "issuedDate",
                          e.target.value
                        )
                      }
                      className="w-full dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1">
                      Description
                    </Label>
                    <Textarea
                      value={cert.description || ""}
                      onChange={(e) =>
                        handleDocumentChange(
                          "certificate",
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      className="w-full min-h-[80px] dark:bg-gray-700"
                    />
                  </div>

                  {/* Certificate Image Upload Logic */}

                  <div>
                    <Label className="text-sm font-medium mb-1">
                      Upload Image (Optional)
                    </Label>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                      ref={(el) => {
                        certificateFileRefs.current[index] = el;
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={() =>
                        certificateFileRefs.current[index]?.click()
                      }
                      className="flex items-center justify-center border-dashed w-full h-24"
                      disabled={isUploading}
                    >
                      <FontAwesomeIcon icon={faImage} className="mr-2" />
                      Choose Image
                    </Button>
                    {certificateFileRefs.current[index]?.files?.length ? (
                      <p className="text-xs text-green-600 mt-2">
                        Selected:{" "}
                        {certificateFileRefs.current[index]?.files?.[0].name}
                      </p>
                    ) : null}
                  </div>

                  {cert.imageUrl && (
                    <img
                      src={cert.imageUrl}
                      alt="preview"
                      className="w-full h-32 object-cover rounded mt-2"
                    />
                  )}
                </div>
              ))}

              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => handleAddDocument("certificate")}
                disabled={isUploading}
              >
                <FontAwesomeIcon icon={faPlus} className="mr-1" /> Add
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
                  onClick={() => handleSaveDocuments("certificate")}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    "Saving..."
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
                      onClick={() => setModalItem(cert)}
                    >
                      {cert.imageUrl && (
                        <div className="w-20 h-15 flex-shrink-0">
                          <img
                            src={cert.imageUrl}
                            alt={cert.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                          {cert.title}
                        </h4>
                        {cert.issuedBy && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {cert.issuedBy}{" "}
                            {cert.issuedDate &&
                              `(${new Date(cert.issuedDate).getFullYear()})`}
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
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => setIsEditingCertificates(true)}
              >
                <FontAwesomeIcon icon={faPen} />
              </Button>
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
                      onClick={() => handleRemoveDocument("award", index)}
                      disabled={isUploading}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </div>
                  {/* Inputs */}
                  <div>
                    <Label className="text-sm font-medium mb-1">Title *</Label>
                    <Input
                      value={award.title}
                      onChange={(e) =>
                        handleDocumentChange(
                          "award",
                          index,
                          "title",
                          e.target.value
                        )
                      }
                      placeholder="Award Title"
                      className="w-full dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1">
                      Organizer
                    </Label>
                    <Input
                      value={award.issuedBy || ""}
                      onChange={(e) =>
                        handleDocumentChange(
                          "award",
                          index,
                          "issuedBy",
                          e.target.value
                        )
                      }
                      className="w-full dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1">Date</Label>
                    <Input
                      type="date"
                      value={award.issuedDate || ""}
                      onChange={(e) =>
                        handleDocumentChange(
                          "award",
                          index,
                          "issuedDate",
                          e.target.value
                        )
                      }
                      className="w-full dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1">
                      Description
                    </Label>
                    <Textarea
                      value={award.description || ""}
                      onChange={(e) =>
                        handleDocumentChange(
                          "award",
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      className="w-full min-h-[80px] dark:bg-gray-700"
                    />
                  </div>

                  {/* Award File Upload Logic */}
                  {(!award.id || award.id.startsWith("award-")) && (
                    <div>
                      <Label className="text-sm font-medium mb-1">
                        Upload Image
                      </Label>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                        ref={(el) => {
                          awardFileRefs.current[index] = el;
                        }}
                      />
                      <Button
                        variant="outline"
                        onClick={() => awardFileRefs.current[index]?.click()}
                        className="flex items-center justify-center border-dashed w-full h-24"
                        disabled={isUploading}
                      >
                        <FontAwesomeIcon icon={faImage} className="mr-2" />
                        Choose Image
                      </Button>
                      {awardFileRefs.current[index]?.files?.length ? (
                        <p className="text-xs text-green-600 mt-2">
                          Selected:{" "}
                          {awardFileRefs.current[index]?.files?.[0].name}
                        </p>
                      ) : null}
                    </div>
                  )}
                  {award.imageUrl && (
                    <img
                      src={award.imageUrl}
                      alt="preview"
                      className="w-full h-32 object-cover rounded mt-2"
                    />
                  )}
                </div>
              ))}

              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => handleAddDocument("award")}
                disabled={isUploading}
              >
                <FontAwesomeIcon icon={faPlus} className="mr-1" /> Add Award
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
                  onClick={() => handleSaveDocuments("award")}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    "Saving..."
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
                      onClick={() => setModalItem(award)}
                    >
                      {award.imageUrl && (
                        <div className="w-20 h-15 flex-shrink-0">
                          <img
                            src={award.imageUrl}
                            alt={award.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                          {award.title}
                        </h4>
                        {award.issuedBy && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {award.issuedBy}{" "}
                            {award.issuedDate &&
                              `(${new Date(award.issuedDate).getFullYear()})`}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No awards added yet.</p>
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

      {/* 3. Modal for details */}
      {modalItem && (
        <div className="fixed inset-0 z-50 flex justify-center items-center">
          <div
            className="fixed inset-0 bg-blur bg-opacity-50 backdrop-blur-sm"
            onClick={() => setModalItem(null)}
          ></div>
          <div
            ref={modalRef}
            className="relative bg-white dark:bg-gray-800 p-8 rounded-lg max-w-3xl w-full mx-4 z-10 max-h-[90vh] overflow-y-auto"
          >
            <button
              className="absolute top-3 right-3 text-2xl text-gray-500 hover:text-red-600"
              onClick={() => setModalItem(null)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
              {modalItem.title}
            </h2>
            {modalItem.issuedBy && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                <span className="font-medium">Issued by:</span>{" "}
                {modalItem.issuedBy}
              </p>
            )}
            {modalItem.issuedDate && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                <span className="font-medium">Date:</span>{" "}
                {formatDate(modalItem.issuedDate)}
              </p>
            )}
            {modalItem.imageUrl && (
              <div className="my-4 flex justify-center">
                <img
                  src={modalItem.imageUrl}
                  alt={modalItem.title}
                  className="max-w-full max-h-[60vh] object-contain rounded"
                />
              </div>
            )}
            {modalItem.description && (
              <p className="text-base mt-2 text-gray-700 dark:text-gray-200 whitespace-pre-line">
                {modalItem.description}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamDetails;
