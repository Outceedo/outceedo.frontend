import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import Swal from "sweetalert2";

interface UploadItem {
  id: number;
  title: string;
  file: File | null;
  preview?: string | null;
  type: "photo" | "video";
  isUploading?: boolean;
  error?: string;
}

const MediaUpload: React.FC<{
  onMediaUpdate: () => void;
  onClose: () => void;
}> = ({ onMediaUpdate, onClose }) => {
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

  // API base URL
  const API_BASE_URL = `${import.meta.env.VITE_PORT}/api/v1`;

  // Get auth token from localStorage
  const getAuthToken = (): string | null => {
    return localStorage.getItem("token");
  };

  useEffect(() => {
    // Initialize with empty uploads for each tab
    setUploads([
      {
        id: Date.now(),
        title: "",
        file: null,
        preview: null,
        type: "photo",
      },
      {
        id: Date.now() + 1,
        title: "",
        file: null,
        preview: null,
        type: "video",
      },
    ]);
  }, []);

  const handleAdd = () => {
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

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setUploads(
        uploads.map((item) =>
          item.id === id
            ? { ...item, error: "File size should not exceed 10MB." }
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
      // Mark this item as uploading
      setUploads(
        uploads.map((u) =>
          u.id === item.id ? { ...u, isUploading: true, error: undefined } : u
        )
      );

      // Create form data with the exact field names from your curl example
      const formData = new FormData();
      formData.append("title", item.title.trim());
      formData.append("type", item.type);
      // Use 'media' as the file field name as shown in your curl example
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

      console.log(`Upload success for ${item.title}:`, response.data);

      // Clean up preview URL
      if (item.preview) {
        URL.revokeObjectURL(item.preview);
      }

      return true;
    } catch (error: any) {
      console.error(`Upload failed for ${item.title}:`, error);

      // Mark the error for this specific item
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

    setIsSubmitting(true);

    try {
      // Check if we have an auth token
      const token = getAuthToken();
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      // Upload files one by one
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

        onMediaUpdate(); // Update parent component
        onClose(); // Close upload dialog
      } else {
        Swal.fire({
          icon: "info",
          title: "Partial Upload",
          text: `Uploaded ${successCount} of ${itemsToUpload.length} ${activeTab}s. Please check for errors.`,
        });
      }
    } catch (error: any) {
      console.error("Upload process failed:", error);
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
    // Clean up any preview URLs
    uploads.forEach((item) => {
      if (item.preview) {
        URL.revokeObjectURL(item.preview);
      }
    });
    onClose();
  };

  return (
    <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg w-[600px] max-h-[80vh] flex flex-col relative">
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

        {/* Tabs */}
        <div className="flex justify-between items-center border-b pb-2 mt-2">
          <div className="flex space-x-4">
            <span
              onClick={() => !isSubmitting && setActiveTab("photo")}
              className={`cursor-pointer ${isSubmitting ? "opacity-60" : ""} ${
                activeTab === "photo"
                  ? "text-red-500 font-semibold border-b-2 border-red-500"
                  : "text-gray-500 dark:text-gray-300"
              }`}
            >
              Photos
            </span>
            <span
              onClick={() => !isSubmitting && setActiveTab("video")}
              className={`cursor-pointer ${isSubmitting ? "opacity-60" : ""} ${
                activeTab === "video"
                  ? "text-red-500 font-semibold border-b-2 border-red-500"
                  : "text-gray-500 dark:text-gray-300"
              }`}
            >
              Videos
            </span>
          </div>
          <button
            onClick={handleAdd}
            disabled={isSubmitting}
            className={`flex items-center bg-yellow-200 hover:bg-yellow-300 text-black px-3 py-2 rounded-md dark:bg-yellow-200 dark:text-black ${
              isSubmitting ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            <FontAwesomeIcon icon={faPlus} className="mr-1" /> Add
          </button>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="overflow-y-auto flex-grow py-2">
        {uploads
          .filter((item) => item.type === activeTab)
          .map((upload) => (
            <div key={upload.id} className="mt-4">
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  placeholder="Title"
                  value={upload.title}
                  onChange={(e) => handleTitleChange(upload.id, e.target.value)}
                  disabled={isSubmitting || upload.isUploading}
                  className={`border p-2 w-full rounded-md dark:bg-gray-600 dark:text-white ${
                    isSubmitting || upload.isUploading
                      ? "opacity-60 cursor-not-allowed"
                      : ""
                  }`}
                />

                <input
                  type="file"
                  accept={activeTab === "photo" ? "image/*" : "video/*"}
                  onChange={(e) =>
                    handleFileChange(upload.id, e.target.files?.[0] || null)
                  }
                  disabled={isSubmitting || upload.isUploading}
                  className={`border p-2 file:bg-white file:rounded-lg file:border-gray-300 file:dark:bg-slate-400 file:dark:text-white rounded-md dark:bg-gray-600 dark:text-white ${
                    isSubmitting || upload.isUploading
                      ? "opacity-60 cursor-not-allowed"
                      : ""
                  }`}
                  placeholder={
                    activeTab == "photo" ? "Max size 2MB" : "Max size 5MB"
                  }
                />

                {uploads.filter((u) => u.type === activeTab).length > 1 && (
                  <button
                    onClick={() => handleRemove(upload.id)}
                    disabled={isSubmitting || upload.isUploading}
                    className={`text-red-500 ${
                      isSubmitting || upload.isUploading
                        ? "opacity-60 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <FontAwesomeIcon icon={faTimes} size="lg" />
                  </button>
                )}
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

              {/* Preview */}
              {upload.preview && (
                <div className="mt-2">
                  {upload.type === "photo" ? (
                    <img
                      src={upload.preview}
                      alt={upload.title}
                      className="w-full h-40 object-cover rounded-md cursor-pointer"
                    />
                  ) : (
                    <video
                      src={upload.preview}
                      controls
                      className="w-full h-40 rounded-md cursor-pointer"
                    />
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
            disabled={isSubmitting}
            className={`bg-red-500 hover:bg-red-600 text-white px-4 py-2 shadow-md rounded-md dark:bg-red-600 ${
              isSubmitting ? "opacity-60 cursor-not-allowed" : ""
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
