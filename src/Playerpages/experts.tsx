import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLinkedin, faInstagram, faFacebook,faTwitter } from "@fortawesome/free-brands-svg-icons";
import profile2 from "../assets/images/profile2.jpg";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { faCamera, faVideo } from "@fortawesome/free-solid-svg-icons"
import { useNavigate } from "react-router-dom";
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



type TabType = "details" | "media" | "reviews" | "services";
const Experts= () => {
  const [activeTab, setActiveTab] = useState<"details" | "media"| "reviews"|"services" >("details");
  const tabs: TabType[] = ["details", "media", "reviews", "services"];
  const [readMore, setReadMore] = useState(false);
  const shouldClamp = expertData.about?.split(" ").length > 25;
    const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
const [isPreviewOpen, setIsPreviewOpen] = useState(false);

 const navigate= useNavigate();

 // Sample media data
const [mediaItems] = useState<MediaItem[]>([
  {
    id: 1,
    type: "photo",
    url: "/photo1.jpg",
    src: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=500",
    title: "Training Session",
  },
  {
    id: 2,
    type: "photo",
    url: "/photo2.jpg",
    src: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=500",
    title: "Team Building",
  },
  {
    id: 3,
    type: "video",
    url: "/video1.mp4",
    src: "https://www.w3schools.com/html/mov_bbb.mp4",
    title: "Coaching Tips",
  },
]);
// Filter state for media
const [mediaFilter, setMediaFilter] = useState<"all" | "photo" | "video">("all");
 
// Filtered media based on selection
const filteredMedia =
mediaFilter === "all"
  ? mediaItems
  : mediaItems.filter((item) =>
      mediaFilter === "photo"
        ? item.type === "photo"
        : item.type === "video"
    );

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
  const [reviews] = useState<Review[]>([
    {
      id: 1,
      name: "John Doe",
      date: "2024-02-15", // Example date
      comment: "Great service! Highly recommend.teaches very well.He is a good coach.would definatly recommand.",
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

  return ( 
     <div className="flex -mt-5">
            {/* Main Content */}
            <main className="flex-1 p-6 dark:bg-gray-900 ml-15">
        <div className="flex justify-between items-center w-full p-4 mx-auto bg-dark:bg-slate-700 ">
  {/* Left - Expert Name */}
      <div>
     <div className="flex  gap-10">
    <div  onClick={() => navigate(-1)} className=" flex flex-col text-4xl font-bold text-start"> ← </div> 
  <h1 className="text-4xl font-bold dark:text-white">{expertData.name}</h1>
  </div>
          {/* Social Media Icons */}
          <div className="ml-18 justify-center  space-x-5 mt-8">
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
      }`}    >
      {social.icon}
    </a>
  ))}
</div>

      {/* Expert Info */}
      <div className="flex justify-start gap-40 text-center mt-8">
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
      <div className="flex justify-start gap-40 mt-6 text-center">
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
    <div>
      <p className="text-yellow-500 text-3xl">⭐⭐⭐⭐⭐</p>
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
      {/* Media Tabs */}
      <div className="mt-6">
      <div className="flex space-x-6 border-b pb-2">
      {tabs.map((tab) => (
        <Button
          key={tab}
          variant="ghost"
          onClick={() => setActiveTab(tab)}
          className={`pb-2 rounded-none shadow-none text-sm capitalize transition-none ${
            activeTab === tab
              ? "border-b-2 border-red-500 font-Regular font-opensans text-red-500"
              : "text-gray-500 dark:text-white"
          }`}       >
          {tab}
        </Button>
      ))}
    </div>
        {/* details Content */}
        {activeTab === "details" && (
   <div className="mt-6 w-full mx-auto">
   {/* About Me Section */}
   <Card className="dark:bg-gray-700 dark:text-white">
     <CardContent className="p-4">
       <h2 className="text-xl font-semibold mb-2">About Me</h2>
       <p
         className={cn(
           "text-gray-600 dark:text-white transition-all",
           !readMore && shouldClamp && "line-clamp-2"
         )}    >
         {expertData.about}
       </p>
       {shouldClamp && (
         <Button
           variant="ghost"
           className="mt-2 p-0 text-sm text-blue-600 hover:underline"
           onClick={() => setReadMore(!readMore)}     >
           {readMore ? "Show less" : "Read more"}
         </Button>
       )}
     </CardContent>
   </Card>
   {/* Skills Section */}
   <div className="flex justify-between gap-8 w-full mt-6">
     <Card className="w-[48%] bg-white dark:bg-slate-800">
       <CardContent className="p-6">
         <h2 className="text-lg font-semibold mb-2 dark:text-white">Skills</h2>
         <ul className="list-disc pl-4 text-gray-600 dark:text-white">
           {expertData.skills.map((skill: string, index: number) => (
             <li key={index}>{skill}</li>
           ))}
         </ul>
       </CardContent>
     </Card>
   </div>
 </div>
)}
{activeTab === "media" && (
  <div>
    {/* Filter Buttons */}
    <div className="flex gap-4 mb-6 mt-5">
      <Button
        variant="ghost"
        onClick={() => setMediaFilter("all")}
        className={`px-4 py-2 rounded-md ${
          mediaFilter === "all" ? "bg-yellow-200" : "hover:bg-gray-100"
        }`}
      >
        All
      </Button>
      <Button
        variant="ghost"
        onClick={() => setMediaFilter("photo")}
        className={`flex items-center gap-2 px-4 py-2 rounded-md ${
          mediaFilter === "photo" ? "bg-yellow-200" : "hover:bg-gray-100"
        }`}
      >
        <FontAwesomeIcon icon={faCamera} />
        Photos
      </Button>
      <Button
        variant="ghost"
        onClick={() => setMediaFilter("video")}
        className={`flex items-center gap-2 px-4 py-2 rounded-md ${
          mediaFilter === "video" ? "bg-yellow-200" : "hover:bg-gray-100"
        }`}
      >
        <FontAwesomeIcon icon={faVideo} />
        Videos
      </Button>
    </div>

    {/* Media Content */}
    {filteredMedia.length === 0 ? (
      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <FontAwesomeIcon
          icon={mediaFilter === "video" ? faVideo : faCamera}
          className="text-4xl text-gray-400 mb-3"
        />
        <p className="text-gray-500 dark:text-gray-400">
          No{" "}
          {mediaFilter === "all"
            ? "media"
            : mediaFilter === "photo"
            ? "photos"
            : "videos"}{" "}
          available
        </p>
      </div>
    ) : (
      <>
        {mediaFilter === "all" ? (
          <>
            {/* Photos Section */}
            {mediaItems.some((item) => item.type === "photo") && (
              <>
                <h2 className="text-lg font-semibold text-gray-700 dark:text-white mb-3">
                  Photos
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6 w-fit">
                  {mediaItems
                    .filter((item) => item.type === "photo")
                    .map((item) => (
                      <div
                        key={item.id}
                        className="bg-white dark:bg-gray-800 overflow-hidden rounded-lg shadow-md"
                      >
                        <div className="h-40 w-fit">
                          <img
                            src={item.src}
                            alt={item.title}
                            onClick={() => {
                              setSelectedMedia(item);
                              setIsPreviewOpen(true);
                            }}
                            className="w-full h-40 object-cover rounded-md cursor-pointer"
                          />
                        </div>
                        <div className="p-3 flex justify-center ">
                          <p className="font-medium text-gray-700 dark:text-white truncate">
                            {item.title}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </>
            )}

            {/* Videos Section */}
            {mediaItems.some((item) => item.type === "video") && (
              <>
                <h2 className="text-lg font-semibold text-gray-700 dark:text-white mb-3 mt-6">
                  Videos
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-fit">
                  {mediaItems
                    .filter((item) => item.type === "video")
                    .map((item) => (
                      <div
                        key={item.id}
                        className="bg-white dark:bg-gray-800 overflow-hidden rounded-lg shadow-md"
                      >
                        <div className="h-40 w-fit">
                          <video
                            src={item.src}
                            controls
                            onClick={() => {
                              setSelectedMedia(item);
                              setIsPreviewOpen(true);
                            }}
                            className="w-full h-40 object-cover rounded-md cursor-pointer"
                          />
                        </div>
                        <div className="p-3 flex justify-center ">
                          <p className="font-medium  flex item-center justify-center text-gray-700 dark:text-white truncate">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-fit">
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 overflow-hidden rounded-lg shadow-md"
              >
                <div className=" flex h-40 w-fit">
                  {item.type === "photo" ? (
                    <img
                      src={item.src}
                      alt={item.title}
                      onClick={() => {
                        setSelectedMedia(item);
                        setIsPreviewOpen(true);
                      }}
                      className="w-full h-40 object-cover rounded-md cursor-pointer"
                    />
                  ) : (
                    <video
                      src={item.src}
                      controls
                      onClick={() => {
                        setSelectedMedia(item);
                        setIsPreviewOpen(true);
                      }}
                      className="w-full h-40 object-cover rounded-md cursor-pointer"
                    />
                  )}
                </div>
                <div className="p-3 flex justify-center ">
                  <p className="font-medium text-gray-700 dark:text-white truncate">
                    {item.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    )}
  </div>
)}
</div>
{/*preview the photos and videos */}
{selectedMedia && isPreviewOpen && (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center">
    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg max-w-3xl w-full relative">
      <button
        onClick={() => setIsPreviewOpen(false)}
        className="absolute top-2 right-2 text-gray-500 hover:text-red-500"  >
        ✖
      </button>
      <h2 className="text-lg font-semibold text-center mb-4 text-gray-800 dark:text-white">
        {selectedMedia.title}
      </h2>
      {selectedMedia.type === "photo" ? (
        <img
          src={selectedMedia.src}
          alt={selectedMedia.title}
          className="w-full h-auto max-h-[75vh] object-contain rounded-md"
        />
      ) : (
        <video
          src={selectedMedia.src}
          controls
          autoPlay
          className="w-full max-h-[75vh] rounded-md"/>
      )}
    </div>
  </div>
)}

{/* Reviews Section (Only show when "Reviews" tab is active) */}
{activeTab === "reviews" && (
  <div className="w-full mt-6">
    {reviews.length === 0 ? (
      <p className="text-gray-400">No reviews yet.</p>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((review) => {
          const shouldClamp = review.comment.length > 50;

          return (
            <Card key={review.id} className="dark:bg-slate-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <h3 className="text-lg font-semibold text-black dark:text-white">
                  {review.name}
                </h3>
                <span className="text-sm text-black dark:text-white">
                  {moment(review.date).fromNow()}
                </span>
              </CardHeader>

              <CardContent>
                <p
                  className={`text-black dark:text-white transition-all ${
                    shouldClamp ? "line-clamp-2" : ""
                  }`}
                >
                  {review.comment}
                </p>

                {shouldClamp && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="link"
                        className="p-0 text-sm text-blue-600 hover:underline mt-2"
                      >
                        Read more
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg dark:bg-gray-800">
                      <DialogHeader>
                        <DialogTitle className="text-black dark:text-white">
                          {review.name}
                        </DialogTitle>
                        <DialogDescription>
                          {moment(review.date).format("MMMM D, YYYY")}
                        </DialogDescription>
                      </DialogHeader>

                      <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line">
                        {review.comment}
                      </p>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    )}
  </div>
)}

      {/* Services Section (Only show when "Services" tab is active) */}
      {activeTab === "services" && (
  <div className="w-full mt-6">
    {services.length === 0 ? (
      <p className="text-gray-400">No services available.</p>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service) => (
           <Card
                          key={service.id}
                          className="shadow-md dark:bg-gray-700 overflow-hidden"
                        >
                          <div className="px-4">
                            <div className="flex justify-between items-start">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                {service.name}
                              </h3>
                              <span className="text-lg text-red-600 font-semibold">
                                {service.price}
                              </span>
                            </div>
          
                            <p className="text-gray-700 dark:text-gray-300 mb-6">
                              {service.description}
                            </p>
                          </div>
                            <Button
                              onClick={() => navigate("/book") }
                            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition w-fit duration-200 ml-5" >
                              Book Now
                            </Button>
                        
                        </Card>
        ))}
      </div>
    )}
  </div>
)}
      </main>
</div>
  );
};
export default Experts;
