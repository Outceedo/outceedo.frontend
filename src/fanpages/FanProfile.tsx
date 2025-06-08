import { useState } from "react";
import {
  faInstagram,
  faLinkedinIn,
  faFacebookF,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import follower from "../assets/images/avatar.png";
import Reviews from "./reviews";
import Followers from "./Following";
import Fandetails from "./Fandetails";

const Fanprofile = () => {
  const [activeTab, setActiveTab] = useState<
    "details" | "reviews" | "Following"
  >("details");

  const icons = [
    {
      icon: faInstagram,
      link: "",
      bg: "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600",
    },
    {
      icon: faLinkedinIn,
      link: "",
      bg: "bg-blue-700",
    },
    {
      icon: faFacebookF,
      link: "",
      bg: "bg-blue-600",
    },
    {
      icon: faXTwitter,
      link: "",
      bg: "bg-black",
    },
  ];

  return (
    <div className=" w-full min-h-screen dark:bg-gray-900 p-10 ">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 ">
        <div>
          <h1 className="text-2xl font-bold">Fans/fan Name</h1>
          <div className="mt-10  grid grid-cols-1 sm:grid-cols-4 gap-30 text-sm text-gray-600">
            <div>
              <label className="block text-sm text-gray-500 dark:text-white mb-1">
                Country
              </label>
              <span className="font-semibold dark:text-white">England</span>
            </div>

            <div>
              <label className="block text-sm text-gray-500 dark:text-white mb-1">
                City
              </label>
              <span className="font-semibold dark:text-white">London</span>
            </div>
            <div>
              <label className="block text-sm text-gray-500 dark:text-white mb-1">
                Sports Interest
              </label>
              <span className="font-semibold dark:text-white">Hockey</span>
            </div>
          </div>
          <div className="mt-10 mb-5 flex gap-6">
            {icons.map(({ icon, link, bg }, index) => (
              <a
                key={index}
                href={link || "#"}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-sm ${bg}`}
                >
                  <FontAwesomeIcon icon={icon} className="w-6 h-6 text-white" />
                </div>
              </a>
            ))}
          </div>
          <div className="mt-10">
            <label className="block text-lg text-gray-800 dark:text-white mb-1">
              Sports Interest
            </label>
            <div className="gap-10 flex">
              <span className="font-semibold dark:text-white text-gray-800  text-lg">
                Players:23
              </span>
              <span className="font-semibold dark:text-white text-gray-800 gap-30 text-lg">
                Experts:41
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-md overflow-hidden">
          <img
            src={follower}
            alt="Team Photo"
            width={350}
            height={350}
            className="rounded-md object-cover"
          />
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-6">
        <div className="flex gap-4 border-b">
          {(["details", "reviews", "Following"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-md font-medium capitalize transition-all duration-150 px-2 pb-1 border-b-2 ${
                activeTab === tab
                  ? "text-red-600 border-red-600"
                  : "border-transparent text-gray-600 hover:text-red-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {activeTab === "details" && <Fandetails />}
          {activeTab === "reviews" && <Reviews />}
          {activeTab === "Following" && <Followers />}
        </div>
      </div>
    </div>
  );
};

export default Fanprofile;
