import { useState } from "react";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  faPen } from "@fortawesome/free-solid-svg-icons";
import { faLinkedin, faInstagram, faFacebook,faTwitter } from "@fortawesome/free-brands-svg-icons";
import ExpertNavbar from "./expertNavbar"; // Corrected import
import profile2 from "../assets/images/profile2.jpg";
import ExpertHeader from "./expertheader";
import ExpertMedia from "./expertmedia";

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
 };

const ExpertData :React.FC = () => {
  const [activeTab, setActiveTab] = useState<"details" | "media"| "reviews"|"services" >("details");
  const [media, setMedia] = useState<MediaItem[]>([]); 
  const[filter,setFilter]= useState<"all"|"photo"|"video">("all");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
   const [aboutMe, setAboutMe] = useState(localStorage.getItem("aboutMe") || "I am from London, UK. A passionate, versatile musician bringing light to classics from Ella Fitzgerald to Guns and Roses. Guaranteed to get the crowd dancing.");
    const [isEditing, setIsEditing] = useState(false);
 
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

  const [reviews, setReviews] = useState<Review[]>([
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
      },
      {
        id: 5,
        name: "Michael Smith",
        date: "2024-01-25",
        comment: "Good quality, but the waiting time was a bit long.",
      },  ]);

  // Filtered media based on selection
  const filteredMedia = media.filter((item) =>
    filter === "all" ? true : item.type === filter
  );

  const handleSave = () => {
    localStorage.setItem("aboutMe", aboutMe);
    setIsEditing(false);
  };  

  return (

     <div className="flex">
                <ExpertNavbar /> {/* Sidebar, applying dark mode */}
                 {/* Main Content */}
                 <main className="ml-[250px] flex-1 p-6 min-h-screen bg-white dark:bg-gray-900">
                             <ExpertHeader />

                             <div className="max-w-7xl mx-auto bg-white shadow-md rounded-lg p-10 dark:bg-slate-700">
                             <div className="flex justify-between items-center w-full p-4">
  {/* Left - Expert Name */}
  <div >
    <div className="flex justify-center gap-20">
  <h1 className="text-2xl font-bold">{expertData.name}</h1>
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
        <p className="text-gray-500 dark:text-white">Location</p>
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
        <div>
          <p className="text-gray-500 dark:text-white">language</p>
          <p className="font-semibold dark:text-white">English,spanish</p>
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
      {/* Media Tabs */}
      <div className="mt-6">
        <div className="flex space-x-6 border-b pb-2">
          <button
            onClick={() => setActiveTab("details")}
            className={`pb-2 ${activeTab === "details" ? "border-b-2 border-red-500 font-semibold text-red-500" : "text-gray-500 dark:text-white"}`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab("media")}
            className={`pb-2 ${activeTab === "media" ? "border-b-2 border-red-500 font-semibold text-red-500" : "text-gray-500 dark:text-white"}`}
          >
            Media
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-2 ${activeTab === "reviews" ? "border-b-2 border-red-500 font-semibold text-red-500" : "text-gray-500 dark:text-white"}`}
          >
          Reviews
          </button>
          <button
            onClick={() => setActiveTab("services")}
            className={`pb-2 ${activeTab === "services" ? "border-b-2 border-red-500 font-semibold text-red-500" : "text-gray-500 dark:text-white"}`}
          >
        Services
          </button>
        </div>

        {/* details Content */}
        {activeTab === "details" && (
  <div className="mt-8 w-full max-w-5xl mx-auto">
    
   
     {/* About Me Section */}
              <div className="mt-4 relative border p-4 rounded-lg dark:bg-gray-600 dark:text-white">
                <h3 className="text-lg font-semibold dark:text-white">About Me</h3>
                {isEditing ? (
                  <>
                    <textarea
                      value={aboutMe}
                      onChange={(e) => setAboutMe(e.target.value)}
                      className="w-full p-2 border rounded-lg dark:bg-gray-600 dark:text-white"
                    ></textarea>
                    <button
                      onClick={handleSave}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Save
                    </button>
                  </>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{aboutMe}</p>
                )}
                <FontAwesomeIcon
                  icon={faPen}
                  className="absolute top-2 right-2 text-gray-500 dark:text-gray-300 cursor-pointer"
                  onClick={() => setIsEditing(true)}
                />
              </div>
     {/* Container for Skills  */}
    <div className="flex justify-between gap-8 w-full mt-8 ">
      {/* Skills - Expanded Width */}
      <div className="bg-white p-6 shadow-md rounded-lg w-[48%] relative dark:bg-slate-600">
        <h2 className="text-lg font-semibold mb-2 dark:text-white">Skills</h2>
        <ul className="list-disc pl-4 text-gray-600 dark:text-white">
          {expertData.skills.map((skill, index) => (
                  <li key={index}>{skill}</li>
          ))}
        </ul>
        <FontAwesomeIcon icon={faPen} className="absolute top-2 right-2 text-gray-500 dark:text-gray-300 cursor-pointer" />
      </div>  
    </div>
  </div>
)}


{/* Upload Button */}
{activeTab === "media" && <ExpertMedia/>}

{/* Reviews Section (Only show when "Reviews" tab is active) */}
{activeTab === "reviews" && (
        <div className="flex justify-between gap-8 w-full mt-6 ">
                   {/* If there are no reviews */}
          {reviews.length === 0 ? (
            <p className="text-gray-400 dark:text-white">No reviews yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 dark:text-white">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-white p-4 rounded-lg shadow-md dark:bg-slate-600">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-black dark:text-white">{review.name}</h3>
              <span className="text-sm text-black dark:text-white ">
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
                className="bg-white p-4 rounded-lg mb-4 w-full shadow-md flex relative dark:bg-slate-600">
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
      </main>
       </div>  
  );
};
export default ExpertData ;