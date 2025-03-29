
import moment from "moment";
import  { useState } from 'react';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLinkedin, faInstagram, faFacebook,faTwitter } from "@fortawesome/free-brands-svg-icons";
import profile2 from "../assets/images/profile2.jpg";
import { faImage, faVideo } from "@fortawesome/free-solid-svg-icons"


import { SidebarProvider } from "@/components/ui/sidebar"
import SideNavbar from "./sideNavbar"
import PlayerHeader from "./playerheader";

interface MediaItem {
    id: number;
    type: "photo" | "video";
    url: string;
    src: string; // Fix: Added missing 'src' property
    title: string; // Fix: Added missing 'title' property
  }
  interface Review {
    id: number;
    name: string;
    date: string; // Store original date as string
    comment: string;
  }
  interface Service {
    id: number;
    name: string;
    description: string;
    price: string;
  }
  
const expertData = {
  name: "Expert Name",
  profession: "Coach & Ex-Soccer Player Defender",
  location: "London, UK",
  responseTime: "40 mins",
  travelLimit: "30 kms",
  certificationLevel: "3rd highest",
  reviews: 120,
  followers: 110,
  assessments: "100+",
  profileImage: "/profile-image.jpg", // Replace with actual image
  backgroundImage: "/background-image.jpg", // Replace with actual image
  socialLinks: [
    { icon: <FontAwesomeIcon icon={faLinkedin} />, link: "#" },
    { icon: <FontAwesomeIcon icon={faInstagram} />, link: "#" },
    { icon: <FontAwesomeIcon icon={faFacebook} />, link: "#" },
    { icon: <FontAwesomeIcon icon={faTwitter} />, link: "#" }

  ],
     
  media: [
    { id: 1, type: "photo", src: "/photo1.jpg", title: "Suit Suits me" },
    { id: 2, type: "photo", src: "/photo2.jpg", title: "Electric guitar" },
    { id: 3, type: "video", src: "/video1.mp4", title: "Training Session" },
  ],
  about: "Experienced soccer coach with a strong background in player development and strategy.",
  skills: ["Leadership", "Tactical Analysis", "Team Management", "Fitness Training"],
  certifications: ["UEFA Pro License", "FIFA Coaching Diploma", "Sports Science Certification"]
};

const Experts= ({ children }: { children?: React.ReactNode }) => {
  const [activeTab, setActiveTab] = useState<"details" | "media"| "reviews"|"services" >("details");
  const [media] = useState<MediaItem[]>([]); 
  const[filter,setFilter]= useState<"all"|"photo"|"video">("all");
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Sample Services Data
  const services: Service[] = [
    {
      id: 1,
      name: "Online Video Assessment",
      description: ["Video Assessment.", "Report."].join(" "),
      price: "$50/h",
    },
    {
      id: 2,
      name: "On-Field Assessment",
      description: ["Live Assessment.","Report"].join(" "),
      price: "$30/h",
    },
    {
      id: 3,
      name: "1-1 Training",
      description: ["1 on 1 advise.","doubts"].join(" "),
      price: "$80/h",
    },
  ];
  const handleBookService = (service: Service) => {
    setSelectedService(service);
    alert(`You have booked: ${service.name}`);
  };

  const [reviews] = useState<Review[]>([
    {
      id: 1,
      name: "John Doe",
      date: "2024-02-15", // Example date
      comment: "Great service! Highly recommend.",
    },
    {
      id: 2,
      name: "Alice Johnson",
      date: "2024-02-10",
      comment: "The experience was amazing. Will come again!",
    },
    {
      id: 3,
      name: "Michael Smith",
      date: "2024-01-25",
      comment: "Good quality, but the waiting time was a bit long.",
    },
    {
        id: 4,
        name: "Michael Smith",
        date: "2024-01-25",
        comment: "Good quality, but the waiting time was a bit long.",
      },  ]);

  // Filtered media based on selection
  const filteredMedia = media.filter((item) =>
    filter === "all" ? true : item.type === filter
  );
  return ( 
    <div>
    <SidebarProvider>
      <div className="flex w-full  dark:bg-gray-900 ">
        <SideNavbar />
        <div className="flex w-full">
          {/* Player Header */}
          <PlayerHeader />

          {/* Page Content */}
          <div className="w-full px-6 pt-4 pb-10 mt-20 ml-20 bg-white dark:bg-slate-800">
            {/* Render children if any */}
            {children}
            

   <div className="max-w-7xl mx-auto bg-white shadow-md rounded-lg p-10 dark:bg-slate-700">
      <div className="flex justify-between items-center w-full p-4">
  {/* Left - Expert Name */}
  <div>
    <div className="flex justify-center gap-20">
  <h1 className="text-2xl font-bold dark:text-white">{expertData.name}</h1>
          {/* Social Media Icons */}
          <div className="flex justify-center space-x-4 mt-3">
  {expertData.socialLinks.map((social, index) => (
    <a
      key={index}
      href={social.link}
      className={`text-xl transition-colors duration-300 ${
        index === 0 ? "text-blue-700 hover:text-blue-900" : // Facebook
        index === 1 ? "text-blue-600 hover:text-blue-800" : // LinkedIn
        index === 2 ? "text-pink-500 hover:text-pink-700" : // Instagram
        index === 3 ? "text-blue-500 hover:text-blue-900" : // Twitter
        "text-gray-500 hover:text-gray-700" // Default
      }`}
    >
      {social.icon}
    </a>
  ))}
</div>
</div>
      {/* Expert Info */}
      <div className="flex justify-start gap-20 text-center mt-6">
        <div >
      <p className="text-gray-500 dark:text-white">Profession</p>
        <p className="font-semibold dark:text-white">{expertData.profession}</p>
        </div>
        <div>
        <p className="text-gray-500 dark:text-white ">Location</p>
        <p className="font-semibold dark:text-white">{expertData.location}</p>
        </div>

      </div>

      {/* Additional Information */}
      <div className="flex justify-start gap-20 mt-6 text-center">
        <div>
          <p className="text-gray-500 dark:text-white">Response Time</p>
          <p className="font-semibold dark:text-white">{expertData.responseTime}</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-white">Travel Limit</p>
          <p className="font-semibold dark:text-white">{expertData.travelLimit}</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-white">Certification Level</p>
          <p className="font-semibold dark:text-white">{expertData.certificationLevel}</p>
        </div>
      </div>
      </div>
  {/* Right - Profile Picture in a Rectangle */}
  <div className="w-60 h-40 bg-gray-200 rounded-lg overflow-hidden shadow-md">
    <img
      src={profile2}
      alt="Expert"
      className="w-full h-full "/>
  </div>  
  </div>

      {/* Stats */}
      <div className="flex justify-around mt-6 text-center">
        <div>
          <p className="text-yellow-500 text-xl">⭐⭐⭐⭐⭐ </p>
          <p className="text-yellow-500 text-xl"> {expertData.reviews}   reviews</p>
        </div>
        <div>
          <p className="text-red-500 text-xl font-semibold">{expertData.followers}</p>
          <p className="text-red-500 text-xl font-semibold"> Followers</p>
        </div>
        <div>
          <p className="text-red-500 text-xl font-semibold">{expertData.assessments}</p>
          <p className="text-red-500 text-xl font-semibold">Assessments Evaluated</p>
        </div>
      </div>

      {/* Media Tabs */}
      <div className="mt-6">
        <div className="flex space-x-6 border-b pb-2">
          <button
            onClick={() => setActiveTab("details")}
            className={`pb-2 ${activeTab === "details" ? "border-b-2 border-red-500 font-semibold  text-red-500" : "text-gray-500  dark:text-white"}`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab("media")}
            className={`pb-2 ${activeTab === "media" ? "border-b-2 border-red-500 font-semibold text-red-500" : "text-gray-500  dark:text-white"}`}
          >
            Media
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-2 ${activeTab === "reviews" ? "border-b-2 border-red-500 font-semibold text-red-500" : "text-gray-500  dark:text-white"}`}
          >
          Reviews
          </button>
          <button
            onClick={() => setActiveTab("services")}
            className={`pb-2 ${activeTab === "services" ? "border-b-2 border-red-500 font-semibold text-red-500" : "text-gray-500  dark:text-white"}`}
          >
        Services
          </button>
        </div>

        {/* details Content */}
        {activeTab === "details" && (
  <div className="mt-6 w-full max-w-5xl mx-auto">
    
    {/* About the Person - Full Width */}
<div className="bg-white p-6 shadow-md rounded-lg w-full dark:bg-slate-800 relative">
  <h2 className="text-xl font-semibold mb-2 dark:text-white">About the Person</h2>
  <p className="text-gray-600 dark:text-white">{expertData.about}</p>
 
 </div>
   
     {/* Container for Skills & Certifications */}

     <div className="flex justify-between gap-8 w-full mt-6">
  {/* Skills - Expanded Width */}
  <div className="bg-white p-6 shadow-md rounded-lg w-[48%] dark:bg-slate-800 relative">
    <h2 className="text-lg font-semibold mb-2 dark:text-white">Skills</h2>
    <ul className="list-disc pl-4 text-gray-600 dark:text-white">
      {expertData.skills.map((skill, index) => (
        <li key={index}>{skill}</li>
      ))}
    </ul>
  </div>    
     {/* Container for Skills & Certifications */}

     <div className="flex justify-between gap-8 w-full mt-6">
  {/* Skills - Expanded Width */}
  <div className="bg-white p-6 shadow-md rounded-lg w-[48%] dark:bg-slate-800 relative">
    <h2 className="text-lg font-semibold mb-2 dark:text-white">Skills</h2>
    <ul className="list-disc pl-4 text-gray-600 dark:text-white">
      {expertData.skills.map((skill, index) => (
        <li key={index}>{skill}</li>
      ))}
    </ul>

  </div>
</div>
  </div>
  </div>
)}
{/* Upload Button */}
{activeTab === "media" && (
    <>
         {/* Filter Buttons */}
 <div className="flex gap-4 mb-6 mt-5">
        <button
          onClick={() => setFilter("all")}
          className={`py-2 px-4 rounded-md ${filter === "all" ? "bg-yellow-200" : "bg-white-700"} transition duration-200`}>
         All
        </button>
        <button
          onClick={() => setFilter("photo")}
          className={`py-2 px-4 rounded-md flex items-center gap-2 ${ filter === "photo" ? "bg-yellow-200" : "bg-white-700" } transition duration-200`}>
            <FontAwesomeIcon icon={faImage} className="text-blue-600" />
          Photos
        </button>
        <button
          onClick={() => setFilter("video")}
          className={`py-2 px-4 rounded-md flex items-center gap-2 ${filter === "video" ? "bg-yellow-200" : "bg-white-700"} transition duration-200`}>
          <FontAwesomeIcon icon={faVideo} className="text-blue-600" />
          Videos
        </button>
      </div>
      {/* Display Uploaded Media Based on Filter */}
      <div className="flex flex-col items-center gap-6 w-full max-w-3xl ">
            {filteredMedia.length === 0 ? (
              <p className="text-gray-400 dark:text-white">No {filter === "all" ? "media" : filter === "photo" ? "photos" : "videos"} available.</p>
            ) : (
              <>
        {/* All Photos Section (Conditionally Rendered) */}
        {(filter === "all" || filter === "photo") &&
          media.some((item) => item.type === "photo") && (
            <div className="w-full text-left">
              <h2 className="bg-red-500 text-white py-2 px-4 rounded-md mb-3">
                All Photos
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {media
                  .filter((item) => item.type === "photo")
                  .map((photo: MediaItem) => (
                    <div key={photo.id} className="text-center">
                      <img
                        src={photo.src}
                        alt={photo.title}
                        className="w-24 h-24 object-cover rounded-md"
                      />
                      <p className="text-xs mt-1">{photo.title}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

        {/* All Videos Section (Conditionally Rendered) */}
        {(filter === "all" || filter === "video") &&
          media.some((item) => item.type === "video") && (
            <div className="w-full text-left">
              <h2 className="bg-red-500 text-white py-2 px-4 rounded-md mb-3 dark:text-white">
                All Videos
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {media
                  .filter((item) => item.type === "video")
                  .map((video: MediaItem) => (
                    <div key={video.id} className="text-center">
                      <video
                        src={video.src}
                        controls
                        className="w-32 h-24 rounded-md"
                      />
                      <p className="text-xs mt-1">{video.title}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}
</>
  )}     
    </div>
    </>
)}
</div>
{/* Reviews Section (Only show when "Reviews" tab is active) */}
{activeTab === "reviews" && (
        <div className="flex justify-between gap-8 w-full mt-6 ">
                   {/* If there are no reviews */}
          {reviews.length === 0 ? (
            <p className="text-gray-400 ">No reviews yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-white p-4 rounded-lg shadow-md dark:bg-slate-800">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-black dark:text-white">{review.name}</h3>
              <span className="text-sm text-black dark:text-white">
                {moment(review.date).fromNow()}
              </span>
            </div>
            <p className="text-black dark:text-white">{review.comment}</p>
          </div>
        ))}
      </div>
    )}
  </div>
)}
      {/* Services Section (Only show when "Services" tab is active) */}
      {activeTab === "services" && (
        <div className="flex justify-between gap-8 w-full mt-6">
            {/* If there are no services available */}
          {services.length === 0 ? (
            <p className="text-gray-400">No services available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white p-4 rounded-lg mb-4 w-full shadow-md flex relative dark:bg-slate-800">
                <p className="text-red-400 font-semibold absolute top-2 right-2 mt-2 dark:text-white">{service.price}</p>
                <div className="">
                  <h3 className="text-lg font-semibold dark:text-white">{service.name}</h3>
                  <p className="text-black dark:text-white">{service.description}</p>
                </div>
                <button
                  onClick={() => handleBookService(service)}
                  className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition mx-auto justify-center items-center duration-200 mt-20">
                  Book Now
                </button>
              </div>
            ))}
        </div>
      )}
</div>
      )}
      {/* Booking Confirmation */}
      {selectedService && (
        <div className="fixed top-20 bg-gray-800 p-6 rounded-lg shadow-lg text-white">
          <h3 className="text-lg font-semibold mb-2">
            Booking Confirmed: {selectedService.name}
          </h3>
          <p className="text-gray-300">{selectedService.description}</p>
          <button
            onClick={() => setSelectedService(null)}
            className="mt-4 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md" >
            Close
          </button>
        </div>
      )}
      </div>
      </div>

      </div>
      </div>
      </SidebarProvider>
      
</div>
  );
};
export default Experts;
