import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";

interface UploadItem {
  id: number;
  title: string;
  file: File | null;
  preview?: string | null;
  type: "video";
}

const Upload: React.FC<{ onMediaUpdate: () => void; onClose: () => void }> = ({
  onMediaUpdate,
  onClose,
}) => {
  const [uploads, setUploads] = useState<UploadItem[]>([
    {
      id: Date.now(),
      title: "",
      file: null,
      preview: null,
      type: "video",
    },
  ]);

  useEffect(() => {
    const savedMedia = JSON.parse(localStorage.getItem("savedMedia") || "[]");
    if (savedMedia.length > 0) {
      setUploads(
        savedMedia.filter((item: UploadItem) => item.type === "video")
      );
    }
  }, []);

  const handleAdd = () => {
    const newUpload: UploadItem = {
      id: Date.now(),
      title: "",
      file: null,
      preview: null,
      type: "video",
    };
    setUploads((prev) => [...prev, newUpload]);
  };

  const handleRemove = (id: number) => {
    if (uploads.length <= 1) return;
    const updatedUploads = uploads.filter((item) => item.id !== id);
    setUploads(updatedUploads);
    localStorage.setItem("savedMedia", JSON.stringify(updatedUploads));
    onMediaUpdate();
  };

  const handleTitleChange = (id: number, value: string) => {
    setUploads(
      uploads.map((item) => (item.id === id ? { ...item, title: value } : item))
    );
  };

  const handleFileChange = (id: number, file: File | null) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setUploads(
      uploads.map((item) =>
        item.id === id ? { ...item, file, preview: previewUrl } : item
      )
    );
  };

  const handleupload = () => {
    localStorage.setItem("savedMedia", JSON.stringify(uploads));
    alert("Video(s) saved successfully!");
    onMediaUpdate();
    onClose();
  };

  return (
    <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg w-[600px] relative">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-600 dark:text-gray-300"
      >
        <FontAwesomeIcon icon={faTimes} size="lg" />
      </button>

      <h2 className="text-xl font-Raleway font-semibold mb-4">Upload Videos</h2>

      <div className="flex justify-end mb-3">
        <button
          onClick={handleAdd}
          className="flex items-center bg-yellow-200 hover:bg-yellow-300 text-black px-3 py-2 rounded-md dark:bg-yellow-200 dark:text-black"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-1" /> Add
        </button>
      </div>

      {/* Upload Fields */}
      {uploads.map((upload) => (
        <div key={upload.id} className="flex items-center space-x-3 mt-2">
          <input
            type="text"
            placeholder="Title"
            value={upload.title}
            onChange={(e) => handleTitleChange(upload.id, e.target.value)}
            className="border p-2 w-full rounded-md dark:bg-gray-600 dark:text-white"
          />

          <input
            type="file"
            accept="video/*"
            onChange={(e) =>
              handleFileChange(upload.id, e.target.files?.[0] || null)
            }
            className="border p-2 file:bg-white file:rounded-lg file:border-gray-300 file:dark:bg-slate-400 file:dark:text-white rounded-md dark:bg-gray-600 dark:text-white"
          />

          {uploads.length > 1 && (
            <button
              onClick={() => handleRemove(upload.id)}
              className="text-red-500"
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>
          )}
        </div>
      ))}

      {/* Preview */}
      <div className="mt-4">
        {uploads
          .filter((item) => item.preview)
          .map((item) => (
            <div key={item.id} className="mt-2">
              <video
                src={item.preview!}
                controls
                className="w-full h-40 rounded-md cursor-pointer"
              />
            </div>
          ))}
      </div>

      {/* Upload Button */}
      <div className="flex justify-end space-x-3 mt-4">
        <button
          onClick={handleupload}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 shadow-md rounded-md dark:bg-red-600"
        >
          Upload
        </button>
      </div>
    </div>
  );
};

export default Upload;
