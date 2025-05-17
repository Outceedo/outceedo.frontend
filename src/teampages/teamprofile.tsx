import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TeamDetails from "./teamdetails";
import TeamMedia from "./teammedia";
import { Pencil } from "lucide-react";
import {
  faLinkedin,
  faInstagram,
  faFacebook,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import teamImage from "../assets/images/team.jpg";

const TeamProfile = () => {
  const [activeTab, setActiveTab] = useState<"details" | "media">("details");

  const icons = [
    { icon: faLinkedin, color: "#0077B5", link: "" },
    { icon: faFacebook, color: "#3b5998", link: "" },
    { icon: faInstagram, color: "#E1306C", link: "" },
    { icon: faXTwitter, color: "#1DA1F2", link: "" },
  ];

  return (
    <div className=" w-full min-h-screen dark:bg-gray-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center  ">
        <div>
          <h1 className="text-2xl font-bold">Team Name</h1>
          <div className="mt-4  grid grid-cols-1 sm:grid-cols-4 gap-30 text-sm text-gray-600">
            <div>
            <label className="block text-sm text-gray-500 dark:text-white mb-1">
             Type
             </label>
              <span className="font-semibold dark:text-white">Club</span>
            </div>
            <div>
            <label className=" block text-sm text-gray-500 dark:text-white mb-1">
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
             Language
             </label>
              <span className="font-semibold dark:text-white">English,spanish</span>
            </div>
          </div>
          <div className="mt-6 flex gap-6">
            {icons.map(({ icon, link }, index) => (
              <a
                key={index}
                href={link || "#"}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="icon">
                  <FontAwesomeIcon icon={icon} className="w-4 h-4" />
                </Button>
              </a>
            ))}
          </div>
        </div>

        <div className="rounded-md overflow-hidden">
          <img
            src={teamImage}
            alt="Team Photo"
            width={300}
            height={300}
            className="rounded-md object-cover"
          />
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-6">
        <div className="flex gap-4 border-b">
          {(["details", "media"] as const).map((tab) => (
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
          {activeTab === "details" && <TeamDetails />}
          {activeTab === "media" && <TeamMedia />}
        </div>
      </div>
    </div>
  );
};

export default TeamProfile;
