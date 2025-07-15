import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTimes,
  faLock,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

interface UploadItem {
  id: number;
  title: string;
  file: File | null;
  preview?: string | null;
  type: "photo" | "video";
  isUploading?: boolean;
  error?: string;
}

interface MediaUploadProps {
  onMediaUpdate: () => void;
  onClose: () => void;
  planLimits: { photos: number; videos: number; planName: string };
  currentCounts: { photos: number; videos: number };
  canUploadPhoto: boolean;
  canUploadVideo: boolean;
}

const MediaUpload: React.FC<MediaUploadProps> = ({
  onMediaUpdate,
  onClose,
  planLimits,
  currentCounts,
  canUploadPhoto,
  canUploadVideo,
}) => {
  const [activeTab, setActiveTab] = useState<"photo" | "video">("photo");
  const [uploads, setUploads] = useState<UploadItem[]>([
    {
      id: Date.now(),
      title: "",
      file: null,
      preview: null,
      type: "photo",
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nav = useNavigate();

  // API base URL
  const API_BASE_URL = `${import.meta.env.VITE_PORT}/api/v1`;

  // Get auth token from localStorage
  const getAuthToken = (): string | null => {
    return localStorage.getItem("token");
  };

  // Check if current tab has upload capacity
  const canUploadCurrentTab =
    activeTab === "photo" ? canUploadPhoto : canUploadVideo;

  // Get remaining upload slots for current tab
  const getRemainingSlots = () => {
    if (activeTab === "photo") {
      return planLimits.photos - currentCounts.photos;
    } else {
      return planLimits.videos - currentCounts.videos;
    }
  };

  // Get current tab uploads
  const getCurrentTabUploads = () =>
    uploads.filter((u) => u.type === activeTab);

  // Check if user can add more uploads for current tab
  const canAddMore = () => {
    const currentTabUploads = getCurrentTabUploads();
    const remainingSlots = getRemainingSlots();
    return remainingSlots > currentTabUploads.length;
  };

  useEffect(() => {
    // Initialize with appropriate uploads based on available slots
    const initialUploads: UploadItem[] = [];

    if (canUploadPhoto) {
      initialUploads.push({
        id: Date.now(),
        title: "",
        file: null,
        preview: null,
        type: "photo",
      });
    }

    if (canUploadVideo) {
      initialUploads.push({
        id: Date.now() + 1,
        title: "",
        file: null,
        preview: null,
        type: "video",
      });
    }

    // If neither can upload, still show one for current tab (will be disabled)
    if (!canUploadPhoto && !canUploadVideo) {
      initialUploads.push({
        id: Date.now(),
        title: "",
        file: null,
        preview: null,
        type: activeTab,
      });
    }

    setUploads(initialUploads);
  }, [canUploadPhoto, canUploadVideo]);

  const handleAdd = () => {
    if (!canAddMore()) {
      Swal.fire({
        icon: "warning",
        title: "Upload Limit Reached",
        html: `
          <div class="text-left">
            <p class="mb-2">You've reached your ${activeTab} upload limit for the <strong>${
          planLimits.planName
        }</strong> plan.</p>
            <p class="text-sm text-gray-600">
              Current: ${
                activeTab === "photo"
                  ? currentCounts.photos
                  : currentCounts.videos
              }/${activeTab === "photo" ? planLimits.photos : planLimits.videos}
            </p>
            ${
              planLimits.planName === "Free"
                ? `
              <div class="mt-3 p-2 bg-blue-50 rounded">
                <p class="text-sm text-blue-700">Upgrade to Premium for more storage!</p>
              </div>
            `
                : ""
            }
          </div>
        `,
        confirmButtonText: "Got it",
        confirmButtonColor: "#3B82F6",
      });
      return;
    }

    const newUpload: UploadItem = {
      id: Date.now(),
      title: "",
      file: null,
      preview: null,
      type: activeTab,
    };
    setUploads((prev) => [...prev, newUpload]);
  };

  const handleRemove = (id: number) => {
    const currentTabUploads = uploads.filter((u) => u.type === activeTab);
    if (currentTabUploads.length <= 1) return; // prevent removing the last item

    const updatedUploads = uploads.filter((item) => item.id !== id);
    setUploads(updatedUploads);
  };

  const handleTitleChange = (id: number, value: string) => {
    setUploads(
      uploads.map((item) => (item.id === id ? { ...item, title: value } : item))
    );
  };

  const handleFileChange = (id: number, file: File | null) => {
    if (!file) return;

    // Check if current tab allows uploads
    if (!canUploadCurrentTab) {
      Swal.fire({
        icon: "warning",
        title: "Upload Not Allowed",
        text: `You've reached your ${activeTab} upload limit. Please upgrade your plan for more storage.`,
        confirmButtonColor: "#3B82F6",
      });
      return;
    }

    // Validate file size based on type
    const maxSize = activeTab === "photo" ? 3 * 1024 * 1024 : 5 * 1024 * 1024; // 3MB for photos, 5MB for videos
    if (file.size > maxSize) {
      const maxSizeText = activeTab === "photo" ? "3MB" : "5MB";
      setUploads(
        uploads.map((item) =>
          item.id === id
            ? { ...item, error: `File size should not exceed ${maxSizeText}.` }
            : item
        )
      );
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setUploads(
      uploads.map((item) =>
        item.id === id
          ? { ...item, file, preview: previewUrl, error: undefined }
          : item
      )
    );
  };

  const uploadSingleFile = async (item: UploadItem): Promise<boolean> => {
    if (!item.file || !item.title.trim()) {
      return false;
    }

    try {
      setUploads(
        uploads.map((u) =>
          u.id === item.id ? { ...u, isUploading: true, error: undefined } : u
        )
      );

      const formData = new FormData();
      formData.append("title", item.title.trim());
      formData.append("type", item.type);
      formData.append("media", item.file);

      const token = getAuthToken();
      const response = await axios.post(
        `${API_BASE_URL}/user/media`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (item.preview) {
        URL.revokeObjectURL(item.preview);
      }

      return true;
    } catch (error: any) {
      setUploads(
        uploads.map((u) =>
          u.id === item.id
            ? {
                ...u,
                isUploading: false,
                error: error.response?.data?.message || "Upload failed",
              }
            : u
        )
      );
      return false;
    }
  };

  const handleUpload = async () => {
    const itemsToUpload = uploads.filter(
      (item) => item.type === activeTab && item.file && item.title.trim()
    );

    if (itemsToUpload.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Nothing to upload",
        text: "Please add title and select files to upload.",
      });
      return;
    }

    // Double-check upload limits
    if (!canUploadCurrentTab) {
      Swal.fire({
        icon: "error",
        title: "Upload Limit Exceeded",
        text: `You've reached your ${activeTab} upload limit for the ${planLimits.planName} plan.`,
      });
      return;
    }

    // Check if trying to upload more than remaining slots
    const remainingSlots = getRemainingSlots();
    if (itemsToUpload.length > remainingSlots) {
      Swal.fire({
        icon: "warning",
        title: "Too Many Files",
        text: `You can only upload ${remainingSlots} more ${activeTab}${
          remainingSlots !== 1 ? "s" : ""
        }.`,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      const results = await Promise.all(
        itemsToUpload.map((item) => uploadSingleFile(item))
      );

      const successCount = results.filter((result) => result).length;

      if (successCount === itemsToUpload.length) {
        Swal.fire({
          icon: "success",
          title: "Upload Complete",
          text: `Successfully uploaded ${successCount} ${activeTab}${
            successCount !== 1 ? "s" : ""
          }.`,
        });

        onMediaUpdate();
        onClose();
      } else {
        Swal.fire({
          icon: "info",
          title: "Partial Upload",
          text: `Uploaded ${successCount} of ${itemsToUpload.length} ${activeTab}s. Please check for errors.`,
        });
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: error.message || "Failed to upload media. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    uploads.forEach((item) => {
      if (item.preview) {
        URL.revokeObjectURL(item.preview);
      }
    });
    onClose();
  };

  const handleTabChange = (tab: "photo" | "video") => {
    if (isSubmitting) return;

    const tabCanUpload = tab === "photo" ? canUploadPhoto : canUploadVideo;
    if (!tabCanUpload) {
      const limit = tab === "photo" ? planLimits.photos : planLimits.videos;
      const current =
        tab === "photo" ? currentCounts.photos : currentCounts.videos;

      Swal.fire({
        icon: "info",
        title: `${
          tab.charAt(0).toUpperCase() + tab.slice(1)
        } Upload Limit Reached`,
        html: `
    <div class="text-left">
      <p class="mb-2">You've reached your ${tab} upload limit.</p>
      <p class="text-sm text-gray-600">Current: ${current}/${limit}</p>
      ${
        planLimits.planName === "Free"
          ? `
        <div class="mt-3 p-2 bg-blue-50 rounded">
          <p class="text-sm text-blue-700">Upgrade to Premium for more storage!</p>
        </div>
      `
          : ""
      }
    </div>
  `,
        showCancelButton: planLimits.planName === "Free",
        confirmButtonText: "Got it",
        cancelButtonText:
          planLimits.planName === "Free" ? "Upgrade Now" : undefined,
        confirmButtonColor: "#3B82F6",
        cancelButtonColor: "#10B981",
      }).then((result) => {
        if (
          result.dismiss === Swal.DismissReason.cancel &&
          planLimits.planName === "Free"
        ) {
          nav("/plans");
        }
      });
      return;
    }

    setActiveTab(tab);
  };

  // File input refs for triggering click on label
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const getFilePlaceholder = () => {
    return activeTab === "photo" ? "(Max size 3MB)" : "(Max size 5MB)";
  };

  const remainingSlots = getRemainingSlots();
  const currentTabUploads = getCurrentTabUploads();

  return (
    <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg md:w-[600px] lg:w-[600px] sm:w-[350px] max-h-[80vh] flex flex-col relative mx-auto">
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 text-gray-600 dark:text-gray-300 z-10"
        disabled={isSubmitting}
      >
        <FontAwesomeIcon icon={faTimes} size="lg" />
      </button>

      {/* Fixed Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-700 pb-2 z-10">
        <h2 className="text-xl font-Raleway font-semibold">Upload Media</h2>

        {/* Plan Info */}
        <div
          className={`text-xs p-2 rounded mb-2 ${
            planLimits.planName === "Free"
              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
              : "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
          }`}
        >
          <p className="font-medium">
            {planLimits.planName} Plan - Photos: {currentCounts.photos}/
            {planLimits.photos}, Videos: {currentCounts.videos}/
            {planLimits.videos}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-between items-center border-b pb-2 mt-2">
          <div className="flex space-x-4">
            <span
              onClick={() => handleTabChange("photo")}
              className={`cursor-pointer flex items-center gap-1 ${
                isSubmitting ? "opacity-60" : ""
              } ${
                activeTab === "photo"
                  ? "text-red-500 font-semibold border-b-2 border-red-500"
                  : "text-gray-500 dark:text-gray-300"
              }`}
            >
              Photos
              {!canUploadPhoto && (
                <FontAwesomeIcon icon={faLock} className="text-xs" />
              )}
              <span className="text-xs bg-gray-200 dark:bg-gray-600 px-1 rounded">
                {currentCounts.photos}/{planLimits.photos}
              </span>
            </span>
            <span
              onClick={() => handleTabChange("video")}
              className={`cursor-pointer flex items-center gap-1 ${
                isSubmitting ? "opacity-60" : ""
              } ${
                activeTab === "video"
                  ? "text-red-500 font-semibold border-b-2 border-red-500"
                  : "text-gray-500 dark:text-gray-300"
              }`}
            >
              Videos
              {!canUploadVideo && (
                <FontAwesomeIcon icon={faLock} className="text-xs" />
              )}
              <span className="text-xs bg-gray-200 dark:bg-gray-600 px-1 rounded">
                {currentCounts.videos}/{planLimits.videos}
              </span>
            </span>
          </div>
          <button
            onClick={handleAdd}
            disabled={isSubmitting || !canUploadCurrentTab || !canAddMore()}
            className={`flex items-center px-3 py-2 rounded-md ${
              !canUploadCurrentTab || !canAddMore() || isSubmitting
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-yellow-200 hover:bg-yellow-300 text-black dark:bg-yellow-200 dark:text-black"
            }`}
          >
            <FontAwesomeIcon
              icon={!canUploadCurrentTab || !canAddMore() ? faLock : faPlus}
              className="mr-1"
            />
            Add
          </button>
        </div>

        {/* Upload status for current tab */}
        {!canUploadCurrentTab && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-2 rounded mt-2 text-sm flex items-center gap-2">
            <FontAwesomeIcon icon={faExclamationTriangle} />
            <span>
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} upload
              limit reached.
              {planLimits.planName === "Free" && (
                <button
                  onClick={() => (window.location.href = "/player/dashboard")}
                  className="ml-2 underline hover:no-underline"
                >
                  Upgrade to Premium
                </button>
              )}
            </span>
          </div>
        )}

        {/* Remaining slots info */}
        {canUploadCurrentTab && remainingSlots > 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-2 rounded mt-2 text-sm">
            You can upload {remainingSlots} more {activeTab}
            {remainingSlots !== 1 ? "s" : ""}.
          </div>
        )}
      </div>

      {/* Scrollable Content Area */}
      <div className="overflow-y-auto flex-grow py-2">
        {currentTabUploads.map((upload, idx, arr) => (
          <div
            key={upload.id}
            className="mt-4 flex flex-col items-center w-full"
          >
            <input
              type="text"
              placeholder="Title"
              value={upload.title}
              onChange={(e) => handleTitleChange(upload.id, e.target.value)}
              disabled={
                isSubmitting || upload.isUploading || !canUploadCurrentTab
              }
              className={`border p-2 w-full rounded-md dark:bg-gray-600 dark:text-white mb-2 ${
                isSubmitting || upload.isUploading || !canUploadCurrentTab
                  ? "opacity-60 cursor-not-allowed"
                  : ""
              }`}
            />

            {/* Custom file input with Browse button and placeholder */}
            <div className="w-full flex items-start">
              <input
                type="file"
                accept={activeTab === "photo" ? "image/*" : "video/*"}
                onChange={(e) =>
                  handleFileChange(upload.id, e.target.files?.[0] || null)
                }
                disabled={
                  isSubmitting || upload.isUploading || !canUploadCurrentTab
                }
                className="hidden py-3 text-sm"
                ref={(el) => (fileInputRefs.current[upload.id] = el)}
                id={`file-input-${upload.id}`}
              />
              <label
                htmlFor={`file-input-${upload.id}`}
                className={`flex-grow border p-2 rounded-md mr-2 bg-white dark:bg-gray-600 text-sm py-2 dark:text-white ${
                  !canUploadCurrentTab
                    ? "opacity-60 cursor-not-allowed"
                    : "cursor-pointer"
                } ${
                  isSubmitting || upload.isUploading
                    ? "opacity-60 cursor-not-allowed"
                    : ""
                }`}
                onClick={(e) => {
                  if (
                    isSubmitting ||
                    upload.isUploading ||
                    !canUploadCurrentTab
                  )
                    e.preventDefault();
                }}
              >
                {upload.file ? upload.file.name : getFilePlaceholder()}
              </label>
              <button
                type="button"
                disabled={
                  isSubmitting || upload.isUploading || !canUploadCurrentTab
                }
                className={`px-2 text-sm py-2 rounded transition-all ${
                  !canUploadCurrentTab
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-yellow-200 hover:bg-yellow-300 dark:bg-gray-500 dark:hover:bg-gray-600"
                } ${
                  isSubmitting || upload.isUploading
                    ? "opacity-60 cursor-not-allowed"
                    : ""
                }`}
                onClick={() => {
                  if (canUploadCurrentTab) {
                    fileInputRefs.current[upload.id]?.click();
                  }
                }}
              >
                {!canUploadCurrentTab ? (
                  <FontAwesomeIcon icon={faLock} />
                ) : (
                  "Browse"
                )}
              </button>
            </div>

            {/* Error message for this item */}
            {upload.error && (
              <div className="text-red-500 text-sm mt-1 ml-1">
                {upload.error}
              </div>
            )}
            {/* Loading indicator for this item */}
            {upload.isUploading && (
              <div className="text-blue-500 text-sm mt-1 ml-1 flex items-center">
                <svg
                  className="animate-spin h-4 w-4 mr-2"
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
            )}
            {/* Preview with cross icon */}
            {upload.preview && (
              <div className="mt-2 w-full flex justify-center relative">
                {upload.type === "photo" ? (
                  <div className="relative inline-block">
                    <img
                      src={upload.preview}
                      alt={upload.title}
                      className="max-w-xs h-40 object-cover rounded-md cursor-pointer border"
                    />
                    {/* Show cross only if more than one for this tab */}
                    {arr.length > 1 && (
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-white bg-opacity-80 hover:bg-red-500 hover:text-white border border-gray-300 rounded-full px-2 transition-colors"
                        onClick={() => handleRemove(upload.id)}
                        disabled={isSubmitting || upload.isUploading}
                        title="Remove"
                      >
                        <FontAwesomeIcon icon={faTimes} size="sm" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="relative inline-block">
                    <video
                      src={upload.preview}
                      controls
                      className="max-w-xs h-40 rounded-md cursor-pointer border"
                    />
                    {arr.length > 1 && (
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-white bg-opacity-80 hover:bg-red-500 hover:text-white border border-gray-300 rounded-full p-1 transition-colors"
                        onClick={() => handleRemove(upload.id)}
                        disabled={isSubmitting || upload.isUploading}
                        title="Remove"
                      >
                        <FontAwesomeIcon icon={faTimes} size="sm" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Fixed Footer */}
      <div className="sticky bottom-0 pt-4 pb-2 bg-white dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 mt-4 z-10">
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleUpload}
            disabled={isSubmitting || !canUploadCurrentTab}
            className={`px-4 py-2 shadow-md rounded-md ${
              !canUploadCurrentTab || isSubmitting
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600 text-white dark:bg-red-600"
            }`}
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
                Uploading...
              </div>
            ) : !canUploadCurrentTab ? (
              <div className="flex items-center">
                <FontAwesomeIcon icon={faLock} className="mr-2" />
                Limit Reached
              </div>
            ) : (
              "Upload"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaUpload;
