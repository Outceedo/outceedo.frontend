import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import React, { useState, useEffect } from "react";
import MediaUpload from "../ProfilePage/MediaUpload";

interface UploadItem {
  id: number;
  title: string;
  file: File | null;
  preview: string | null;
  type: "photo" | "video";
}

const ExpertMedia: React.FC = () => {
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
    const updatedMedia = media.filter((item) => !selectedMedia.includes(item.id));
    setMedia(updatedMedia);
    setSelectedMedia([]);
    localStorage.setItem("savedMedia", JSON.stringify(updatedMedia));
  };

  return (
    <div className="p-4">
      {/* Tabs for switching between media types */}
      <div className="flex space-x-4 p-2 ">
                 {["All", "Photos", "Videos"].map((tab) => (
                   <button
                     key={tab}
                     className={`px-4 py-2 rounded-md ${
                       activeTab === tab ? "bg-yellow-200 dark:bg-yellow-400 font-semibold" : "bg-gray-100 dark:bg-gray-700"
                     }`}
                     onClick={() => setActiveTab(tab as "All" | "Photos" | "Videos")}
                   >
                     {tab}
                   </button>
                 ))}
               </div>
       
               {/* Delete Button (Only if items are selected) */}
               {selectedMedia.length > 0 && (
                 <div className="flex justify-between items-center bg-red-100 dark:bg-red-500 text-red-700 p-3 rounded-md mt-4">
                   <p>{selectedMedia.length} item(s) selected for deletion.</p>
                   <button onClick={handleDelete} className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded-md">
                     <FontAwesomeIcon icon={faTrash} className="mr-2" />
                     Delete Selected
                   </button>
                 </div>
               )}
       
               <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-6">
                 {filteredMedia.length === 0 ? (
                   <p className="text-gray-400 text-center">No Media Available</p>
                 ) : (
                   filteredMedia.map((item) => (
                     <div
                       key={item.id}
                       className={`relative bg-white p-4 shadow-md rounded-lg dark:bg-gray-700 cursor-pointer ${
                         selectedMedia.includes(item.id) ? "border-2 border-red-500" : ""
                       }`}
                       onClick={() => handleSelect(item.id)}
                     >
                       <p className="font-semibold text-gray-700 dark:text-white">{item.title}</p>
                       {item.type === "photo" ? (
                         <img src={item.preview || ""} alt={item.title} className="w-full h-40 object-cover rounded-lg mt-2" />
                       ) : (
                         <video src={item.preview || ""} controls className="w-full h-40 rounded-lg mt-2" />
                       )}
                     </div>
                   ))
                 )}
               </div>
       
                   {/* Upload Button */}
                   <div className=" flex justify-end">
               <button
                 onClick={() => setIsModalOpen(true)}
                 className="font-Raleway font-semibold text-xl sm:text-xl bg-[#FE221E] hover:bg-red-500 transition cursor-pointer text-white px-4 py-1 rounded-xl"
               >
                 + Upload
               </button>
             </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-2 right-6 text-gray-600 hover:text-gray-800 text-2xl">
              &times;
            </button>
            <MediaUpload onClose={() => setIsModalOpen(false)} onMediaUpdate={handleMediaUpdate} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpertMedia;
