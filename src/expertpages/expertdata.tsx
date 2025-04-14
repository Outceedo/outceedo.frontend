import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLinkedin, faInstagram, faFacebook,faTwitter} from "@fortawesome/free-brands-svg-icons";
import profile2 from "../assets/images/profile2.jpg";
import ExpertDetails from "./Expertdetails";
import ExpertReviews from "./Expertreviews";
import ExpertServices from "./Expertservices";
import ExpertMedia from "./expertmedia";
import { faStar } from '@fortawesome/free-solid-svg-icons';


  const icons = [
    { icon: faLinkedin, color: '#0077B5', link: 'https://www.linkedin.com' },
    { icon: faFacebook, color: '#3b5998', link: 'https://www.facebook.com' },
    { icon: faInstagram, color: '#E1306C', link: 'https://www.instagram.com' },
    { icon: faTwitter, color: '#1DA1F2', link: 'https://www.twitter.com' },
  ];

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
  
  media: [
    { id: 1, type: "photo", src: "/photo1.jpg", title: "Suit Suits me" },
    { id: 2, type: "photo", src: "/photo2.jpg", title: "Electric guitar" },
    { id: 3, type: "video", src: "/video1.mp4", title: "Training Session" },
  ],
  about: "Experienced soccer coach with a strong background in player development and strategy.",
  skills: ["Leadership", "Tactical Analysis", "Team Management", "Fitness Training"],
  certifications: ["UEFA Pro License", "FIFA Coaching Diploma", "Sports Science Certification"]
};
const ExpertProfile= () => {
  const [activeTab, setActiveTab] = useState<"details" | "media"| "reviews"|"services" >("details");
  return ( 
     <div className="flex -mt-5">
            {/* Main Content */}
            <main className="flex-1 p-6 dark:bg-gray-900 ml-15">
        <div className="flex justify-between items-center w-full p-4 mx-auto bg-dark:bg-slate-700 ">
  {/* Left - Expert Name */}
      <div>
     <div className="flex  gap-10">
  
  <h1 className="text-4xl font-bold dark:text-white">{expertData.name}</h1>

  <div className="gap-4 ml-32 flex">
      {icons.map((item, index) => (
        <a
          key={index}
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="w-11 h-11 flex items-center justify-center rounded-full text-white text-2xl shadow-lg"
          style={{
            background: item.icon === faInstagram 
              ? 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)' 
              : item.color
          }}
        >
          <FontAwesomeIcon icon={item.icon} />
        </a>
      ))}
    </div>
    </div>


      {/* Expert Info */}
      <div className="flex justify-start gap-40 text-center mt-8">
        <div className="text-left">
        <p className="text-gray-500 dark:text-white">Profession</p>
        <p className="font-semibold  dark:text-white">{expertData.profession}</p>
        </div>
        <div className="text-left">
        <p className="text-gray-500 dark:text-white ">Location</p>
        <p className="font-semibold dark:text-white">{expertData.location}</p>
        </div>
      </div>
      {/* Additional Information */}
      <div className="flex justify-start gap-40 mt-6 text-center">
        <div  className="text-left">
          <p className="text-gray-500 dark:text-white">Response Time</p>
          <p className="font-semibold dark:text-white">{expertData.responseTime}</p>
        </div>
        <div  className="text-left">
          <p className="text-gray-500 dark:text-white">Travel Limit</p>
          <p className="font-semibold dark:text-white">{expertData.travelLimit}</p>
        </div>
        <div  className="text-left">
          <p className="text-gray-500 dark:text-white">Certification Level</p>
          <p className="font-semibold dark:text-white">{expertData.certificationLevel}</p>
        </div>
      </div>
      </div>
  {/* Right - Profile Picture in a Rectangle */}
  <div className="w-80 h-60 bg-gray-200 rounded-lg overflow-hidden mr-20 shadow-md">
    <img
      src={profile2}
      alt="Expert"
      className="w-full h-full "/>
  </div>  
  </div>
      {/* Stats */}
      <div className="border-t border-b py-6 mt-6 text-center">
  <div className="flex justify-around">
    <div className="flex items-center gap-x-2">
      <p className="text-yellow-300 text-3xl"><FontAwesomeIcon icon={faStar}/><FontAwesomeIcon icon={faStar}/><FontAwesomeIcon icon={faStar}/><FontAwesomeIcon icon={faStar}/><FontAwesomeIcon icon={faStar}/> </p>
      <p className="text-gray-500 dark:text-white">{expertData.reviews} reviews</p>
    </div>   
    <div>
      <p className="text-red-500 text-3xl font-bold">{expertData.followers}</p>
      <p className="text-gray-500 dark:text-white">Followers</p>
    </div>
    <div>
      <p className="text-red-500 text-3xl font-bold">{expertData.assessments}</p>
      <p className="text-gray-500 dark:text-white">Assessments Evaluated</p>
    </div>
  </div>
</div>
      {/* Tabs Section */}
      <div className="mt-8">
            <div className="flex gap-4 border-b ">
              {(["details", "media", "reviews", "services"] as const).map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-md font-medium capitalize transition-all duration-150 px-2 pb-1 border-b-2 ${
                      activeTab === tab
                        ? "text-red-600 border-red-600"
                        : "border-transparent text-gray-600 dark:text-white hover:text-red-600"
                    }`}
                  >
                    {tab}
                  </button>
                )
              )}
            </div>

         

            <div className="mt-4">
              {activeTab === "details" && <ExpertDetails />}
              {activeTab === "media" && <ExpertMedia />}
              {activeTab === "reviews" && <ExpertReviews />}
              {activeTab === "services" && <ExpertServices />}
            </div>
        </div>
        </main>
        </div>   
  );
};
export default ExpertProfile;



