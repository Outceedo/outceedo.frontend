import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faImage,
  faVideo,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface UploadItem {
  id: number;
  title: string;
  file: File | null;
  preview: string;
  type: "photo" | "video";
}

// Create an inline MediaUpload component since the imported one isn't working
const InlineMediaUpload: React.FC<{
  onClose: () => void;
  onMediaUpdate: () => void;
}> = ({ onClose, onMediaUpdate }) => {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [type, setType] = useState<"photo" | "video">("photo");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check file type
    const fileType = selectedFile.type.split("/")[0];
    if (fileType !== "image" && fileType !== "video") {
      setError("Please select an image or video file.");
      return;
    }

    setFile(selectedFile);
    setType(fileType === "image" ? "photo" : "video");

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
    setError(null);
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      setError("Please enter a title.");
      return;
    }

    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    // Get existing media from localStorage
    const existingMedia = JSON.parse(
      localStorage.getItem("savedMedia") || "[]"
    );

    // Create new media item
    const newMedia = {
      id: Date.now(),
      title: title.trim(),
      file: null, // We can't store File objects in localStorage
      preview: preview,
      type: type,
    };

    // Update localStorage
    localStorage.setItem(
      "savedMedia",
      JSON.stringify([...existingMedia, newMedia])
    );

    // Notify parent component
    onMediaUpdate();
    onClose();
  };

  return (
    <div className="w-full max-w-md p-6">
      <h2 className="text-xl font-semibold mb-4">Upload Media</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Title</label>
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a title"
          className="w-full"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">File</label>
        <div className="flex items-center">
          <Input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,video/*"
            className="hidden"
          />
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800"
          >
            Select File
          </Button>
          <span className="ml-2 text-sm text-gray-600">
            {file ? file.name : "No file selected"}
          </span>
        </div>
      </div>

      {preview && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Preview</label>
          <div className="border rounded-lg p-2 bg-gray-100">
            {type === "photo" ? (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-40 object-contain"
              />
            ) : (
              <video src={preview} controls className="w-full h-40" />
            )}
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-2 mt-6">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          className="bg-red-600 hover:bg-red-700 text-white"
          onClick={handleSubmit}
        >
          Upload
        </Button>
      </div>
    </div>
  );
};

const ExpertMedia: React.FC<{ expertId?: string }> = ({ expertId }) => {
  const [activeTab, setActiveTab] = useState<string>("All");
  const [media, setMedia] = useState<UploadItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<number[]>([]);

  // Fetch media from local storage
  useEffect(() => {
    const savedMedia = JSON.parse(localStorage.getItem("savedMedia") || "[]");
    setMedia(savedMedia);
  }, []);

  // Update media when a new item is added
  const handleMediaUpdate = () => {
    const updatedMedia = JSON.parse(localStorage.getItem("savedMedia") || "[]");
    setMedia(updatedMedia);
  };

  // Filter media based on the selected tab
  const filteredMedia =
    activeTab === "All"
      ? media
      : media.filter((item) =>
          activeTab === "Photos" ? item.type === "photo" : item.type === "video"
        );

  // Handle selection for deletion
  const handleSelect = (id: number) => {
    setSelectedMedia((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((mediaId) => mediaId !== id)
        : [...prevSelected, id]
    );
  };

  // Handle deletion of selected items
  const handleDelete = () => {
    const updatedMedia = media.filter(
      (item) => !selectedMedia.includes(item.id)
    );
    setMedia(updatedMedia);
    setSelectedMedia([]);
    localStorage.setItem("savedMedia", JSON.stringify(updatedMedia));
  };

  return (
    <div className="p-4 w-full space-y-6">
      <Card className="p-6 shadow-sm dark:bg-gray-700">
        {/* Tabs for switching between media types */}
        <div className="flex flex-wrap justify-between items-center mb-6">
          <div className="flex space-x-4">
            {[
              { name: "All", icon: null },
              { name: "Photos", icon: faImage },
              { name: "Videos", icon: faVideo },
            ].map((tab) => (
              <Button
                key={tab.name}
                variant={activeTab === tab.name ? "default" : "outline"}
                className={`${
                  activeTab === tab.name
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : ""
                }`}
                onClick={() =>
                  setActiveTab(tab.name as "All" | "Photos" | "Videos")
                }
              >
                {tab.icon && (
                  <FontAwesomeIcon icon={tab.icon} className="mr-2" />
                )}
                {tab.name}
              </Button>
            ))}
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <FontAwesomeIcon icon={faUpload} className="mr-2" />
            Upload
          </Button>
        </div>

        {/* Delete Button (Only if items are selected) */}
        {selectedMedia.length > 0 && (
          <div className="flex justify-between items-center bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-3 rounded-md mb-6">
            <p>{selectedMedia.length} item(s) selected for deletion.</p>
            <Button onClick={handleDelete} variant="destructive">
              <FontAwesomeIcon icon={faTrash} className="mr-2" />
              Delete Selected
            </Button>
          </div>
        )}

        {/* Media Display Section */}
        {filteredMedia.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <FontAwesomeIcon
              icon={faUpload}
              className="text-4xl text-gray-400 mb-3"
            />
            <p className="text-gray-400 dark:text-gray-400">
              No media uploads yet
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              variant="outline"
              className="mt-4"
            >
              Upload your first media
            </Button>
          </div>
        ) : activeTab === "All" ? (
          <>
            {/* Display Photos Section */}
            {media.some((item) => item.type === "photo") && (
              <>
                <h2 className="text-lg font-semibold text-gray-700 dark:text-white mb-3">
                  Photos
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                  {media
                    .filter((item) => item.type === "photo")
                    .map((item) => (
                      <div
                        key={item.id}
                        className={`bg-white dark:bg-gray-800 overflow-hidden rounded-lg shadow-md cursor-pointer transition-all ${
                          selectedMedia.includes(item.id)
                            ? "ring-2 ring-red-500"
                            : "hover:shadow-lg"
                        }`}
                        onClick={() => handleSelect(item.id)}
                      >
                        <div className="h-40 overflow-hidden">
                          <img
                            src={item.preview || ""}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-3">
                          <p className="font-medium text-gray-700 dark:text-white truncate">
                            {item.title}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </>
            )}

            {/* Display Videos Section */}
            {media.some((item) => item.type === "video") && (
              <>
                <h2 className="text-lg font-semibold text-gray-700 dark:text-white mb-3 mt-6">
                  Videos
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {media
                    .filter((item) => item.type === "video")
                    .map((item) => (
                      <div
                        key={item.id}
                        className={`bg-white dark:bg-gray-800 overflow-hidden rounded-lg shadow-md cursor-pointer transition-all ${
                          selectedMedia.includes(item.id)
                            ? "ring-2 ring-red-500"
                            : "hover:shadow-lg"
                        }`}
                        onClick={() => handleSelect(item.id)}
                      >
                        <div className="h-40 overflow-hidden">
                          <video
                            src={item.preview || ""}
                            controls
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-3">
                          <p className="font-medium text-gray-700 dark:text-white truncate">
                            {item.title}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                className={`bg-white dark:bg-gray-800 overflow-hidden rounded-lg shadow-md cursor-pointer transition-all ${
                  selectedMedia.includes(item.id)
                    ? "ring-2 ring-red-500"
                    : "hover:shadow-lg"
                }`}
                onClick={() => handleSelect(item.id)}
              >
                <div className="h-40 overflow-hidden">
                  {item.type === "photo" ? (
                    <img
                      src={item.preview || ""}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={item.preview || ""}
                      controls
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="p-3">
                  <p className="font-medium text-gray-700 dark:text-white truncate">
                    {item.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <Card className="relative bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
            <Button
              variant="ghost"
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setIsModalOpen(false)}
            >
              &times;
            </Button>
            <InlineMediaUpload
              onClose={() => setIsModalOpen(false)}
              onMediaUpdate={handleMediaUpdate}
            />
          </Card>
        </div>
      )}
    </div>
  );
};

export default ExpertMedia;
