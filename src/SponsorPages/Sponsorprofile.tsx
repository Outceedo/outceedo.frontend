import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Sponsordetails from "./Sponsordetails"
import Sponsormedia from "./Sponsormedia"
import { Pencil } from "lucide-react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Sponsor2 from "../assets/images/sponsor2.jpg";
import { faInstagram, faLinkedinIn, faFacebookF, faXTwitter } from '@fortawesome/free-brands-svg-icons';
import { Link } from "react-router-dom";


const Sponsorprofile = () => {
  const [activeTab, setActiveTab] = useState<"details" | "media">("details");

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
    <div className=" w-full min-h-screen dark:bg-gray-900 p-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 ">
        <div>
          <h1 className="text-2xl font-bold">Company/Individual Name</h1>
          <div className="mt-10  grid grid-cols-1 sm:grid-cols-4 gap-30 text-sm text-gray-600">
            <div>
            <label className="block text-sm text-gray-500 dark:text-white mb-1">
             Sports Interest
             </label>
              <span className="font-semibold dark:text-white">Foodball</span>
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
             Sponsor Type
             </label>
              <span className="font-semibold dark:text-white">CompanyName</span>
            </div>
          </div>
          <div className="mt-10 flex gap-6">
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
        <FontAwesomeIcon icon={icon} className="w-8 h-8 text-white" />
      </div>
    </a>
  ))}
</div>
 <div className="mt-10">
            <label className="block text-sm text-gray-500 dark:text-white mb-1">
             Company Site
             </label>
              <Link className="font-light text-blue-500 dark:text-white"> www.company_site.com</Link>
            </div>

        </div>

        <div className="rounded-md overflow-hidden">
          <img
            src={Sponsor2}
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
          {activeTab === "details" && <Sponsordetails />}
          {activeTab === "media" && <Sponsormedia />}
        </div>
      </div>
    </div>
  );
};

export default Sponsorprofile;
