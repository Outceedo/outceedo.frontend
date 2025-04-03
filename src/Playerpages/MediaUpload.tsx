import React, { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faVideo, faUpload } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MediaUploadProps {
  onClose: () => void;
  onMediaUpdate: () => void;
}

const MediaUpload: React.FC<MediaUploadProps> = ({
  onClose,
  onMediaUpdate,
}) => {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [type, setType] = useState<"photo" | "video">("photo");
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
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

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Please enter a title.");
      return;
    }

    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    try {
      setIsUploading(true);

      // In a real app, you'd upload to a server here
      // For now, we'll simulate a delay and store in localStorage
      await new Promise((resolve) => setTimeout(resolve, 500));

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
    } catch (err) {
      setError("Failed to upload media. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Upload Media
      </h2>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-500/50 text-red-700 dark:text-red-300 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4 mb-6">
        <div>
          <Label
            htmlFor="title"
            className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
          >
            Title
          </Label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title for your media"
            className="w-full"
          />
        </div>

        <div>
          <Label
            htmlFor="file"
            className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
          >
            Media File
          </Label>
          <div className="flex items-center">
            <Input
              id="file"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,video/*"
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Browse Files
            </Button>
            <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
              {file ? file.name : "No file selected"}
            </span>
          </div>
        </div>

        {preview && (
          <div>
            <Label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Preview
            </Label>
            <div className="border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800">
              {type === "photo" ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-48 object-contain"
                />
              ) : (
                <video
                  src={preview}
                  controls
                  className="w-full h-48 object-contain"
                />
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onClose} disabled={isUploading}>
          Cancel
        </Button>
        <Button
          className="bg-red-600 hover:bg-red-700 text-white"
          onClick={handleSubmit}
          disabled={isUploading || !file || !title.trim()}
        >
          {isUploading ? (
            <span className="flex items-center">
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
            </span>
          ) : (
            <>
              <FontAwesomeIcon icon={faUpload} className="mr-2" />
              Upload
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default MediaUpload;
