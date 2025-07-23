import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInstagram,
  faLinkedinIn,
  faFacebookF,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";

import { Card } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import "react-circular-progressbar/dist/styles.css";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Sponsor2 from "../../assets/images/avatar.png";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getProfile } from "@/store/profile-slice";
import Mediaview from "../Media/MediaView";

const Sponsorview: React.FC = () => {
  const dispatch = useAppDispatch();
  const { viewedProfile, status, error } = useAppSelector(
    (state) => state.profile
  );

  const [activeTab, setActiveTab] = useState<"details" | "media">("details");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1); // goes to previous page
  };

  // Fetch profile on component mount
  useEffect(() => {
    const viewSponsorUsername = localStorage.getItem("viewsponsorusername");
    if (viewSponsorUsername) {
      dispatch(getProfile(viewSponsorUsername));
    }
  }, [dispatch]);

  // Update loading state when profile data changes
  useEffect(() => {
    if (status === "succeeded" || status === "failed") {
      setIsLoading(false);
    }
  }, [status]);

  // Prepare sponsor data with fallbacks
  const sponsorData = viewedProfile
    ? {
        name:
          viewedProfile.firstName && viewedProfile.lastName
            ? `${viewedProfile.firstName} ${viewedProfile.lastName}`
            : viewedProfile.company || "Company/Individual Name",
        sportInterest: viewedProfile.profession || "Not specified",
        country: viewedProfile.country || "Not specified",
        city: viewedProfile.city || "Not specified",
        sponsorType: viewedProfile.sponsorType || "Not specified",
        companySite: viewedProfile.companyLink || "Not specified",
        image: viewedProfile.photo || Sponsor2,
        socialLinks: viewedProfile.socialLinks || {
          instagram: "",
          linkedin: "",
          facebook: "",
          twitter: "",
        },
        bio: viewedProfile.bio || "No information available.",
        sponsorshipInfo: {
          range: viewedProfile.budgetRange || "Not specified",
          type: viewedProfile.sponsorshipType || "Not specified",
          country: viewedProfile.sponsorshipCountryPreferred || "Not specified",
        },
        // Use uploads array from viewedProfile
        media: viewedProfile.uploads || [],
      }
    : {
        name: "Company/Individual Name",
        sportInterest: "Football",
        country: "England",
        city: "London",
        sponsorType: "CompanyName",
        companySite: "www.company_site.com",
        image: Sponsor2,
        socialLinks: {
          instagram: "",
          linkedin: "",
          facebook: "",
          twitter: "",
        },
        bio: "We are a top-tier sponsor with global outreach in football development, aiming to support young talent worldwide.",
        sponsorshipInfo: {
          range: "$10,000 - $100,000",
          type: "Monetary & Equipment",
          country: "Worldwide",
        },
        media: [],
      };

  // Create social media icons array
  const icons = [
    {
      icon: faInstagram,
      link: sponsorData.socialLinks.instagram,
      bg: "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600",
    },
    {
      icon: faLinkedinIn,
      link: sponsorData.socialLinks.linkedin,
      bg: "bg-blue-700",
    },
    {
      icon: faFacebookF,
      link: sponsorData.socialLinks.facebook,
      bg: "bg-blue-600",
    },
    {
      icon: faXTwitter,
      link: sponsorData.socialLinks.twitter,
      bg: "bg-black",
    },
  ];

  // Process the bio to remove any code snippets (since the sample data had code in the bio)
  const cleanBio = (bio: string): string => {
    // If bio contains code or import statements, extract just the human-readable part
    if (
      bio.includes("import ") ||
      bio.includes("const ") ||
      bio.includes("function ")
    ) {
      // Try to get the first sentence or paragraph before code starts
      const firstPart = bio.split("import ")[0].trim();
      if (firstPart) return firstPart;

      // If no clear first part, return a default message
      return "No sponsor bio available.";
    }
    return bio;
  };

  // Check if we're still loading the profile
  if (status === "loading") {
    return (
      <div className="w-full min-h-screen dark:bg-gray-900 p-10 flex justify-center items-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-red-600 mx-auto" />
          <p className="mt-4 text-lg dark:text-white">
            Loading sponsor profile...
          </p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (status === "failed" && error) {
    return (
      <div className="w-full min-h-screen dark:bg-gray-900 p-10">
        <div className="bg-red-50 dark:bg-red-900 p-6 rounded-lg text-red-800 dark:text-red-200">
          <h2 className="text-xl font-bold mb-2">Error Loading Profile</h2>
          <p>{error}</p>
          <Button
            className="mt-4 bg-red-600 hover:bg-red-700 text-white"
            onClick={() => {
              const viewSponsorUsername = localStorage.getItem(
                "viewsponsorusername"
              );
              if (viewSponsorUsername) {
                dispatch(getProfile(viewSponsorUsername));
              }
            }}
          >
            Retry
          </Button>
          <Button variant="outline" className="mt-4 ml-2" onClick={goBack}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen dark:bg-gray-900 px-2 sm:px-4 md:px-10">
      <button
        onClick={goBack}
        className="flex items-center text-gray-700 hover:text-black text-sm font-medium mb-4 dark:text-white cursor-pointer"
      >
        <ArrowLeft className="w-5 h-5 mr-1" />
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-0 md:p-5">
        <div className="w-full md:w-3/5">
          <h1 className="text-2xl font-bold dark:text-white">
            {sponsorData.name}
          </h1>
          {/* Responsive grid: sm-2, lg-4 */}
          <div className="mt-6 md:mt-10 grid grid-cols-2  lg:grid-cols-4 gap-6 lg:gap-8 text-sm text-gray-600">
            <div>
              <label className="block text-sm text-gray-500 dark:text-white mb-1">
                Sports Interest
              </label>
              <span className="font-semibold dark:text-white">
                {sponsorData.sportInterest}
              </span>
            </div>
            <div>
              <label className="block text-sm text-gray-500 dark:text-white mb-1">
                Country
              </label>
              <span className="font-semibold dark:text-white">
                {sponsorData.country}
              </span>
            </div>
            <div>
              <label className="block text-sm text-gray-500 dark:text-white mb-1">
                City
              </label>
              <span className="font-semibold dark:text-white">
                {sponsorData.city}
              </span>
            </div>
            <div>
              <label className="block text-sm text-gray-500 dark:text-white mb-1">
                Sponsor Type
              </label>
              <span className="font-semibold dark:text-white capitalize">
                {sponsorData.sponsorType}
              </span>
            </div>
          </div>

          <div className="mt-6 md:mt-10 flex gap-6">
            {icons.map(({ icon, link, bg }, index) => (
              <a
                key={index}
                href={link || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className={!link ? "opacity-50 cursor-not-allowed" : ""}
              >
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-sm ${bg}`}
                >
                  <FontAwesomeIcon icon={icon} className="w-6 h-6 text-white" />
                </div>
              </a>
            ))}
          </div>

          <div className="mt-6 md:mt-10">
            <label className="block text-sm text-gray-500 dark:text-white mb-1">
              Company Site
            </label>
            {sponsorData.companySite &&
            sponsorData.companySite !== "Not specified" ? (
              <Link
                to={
                  sponsorData.companySite.startsWith("http")
                    ? sponsorData.companySite
                    : `https://${sponsorData.companySite}`
                }
                className="font-light text-blue-500 dark:text-blue-400"
                target="_blank"
              >
                {sponsorData.companySite}
              </Link>
            ) : (
              <span className="font-light text-gray-500 dark:text-gray-400">
                Not specified
              </span>
            )}
          </div>
        </div>

        <div className="rounded-md overflow-hidden mt-8 md:mt-0 w-full max-w-xs mx-auto md:mx-0 md:w-[350px]">
          <img
            src={sponsorData.image}
            alt="Sponsor"
            width={350}
            height={350}
            className="rounded-md object-cover w-full h-48 sm:h-60 md:h-[350px]"
            onError={(e) => {
              // Fallback to default image if profile photo fails to load
              e.currentTarget.src = Sponsor2;
            }}
          />
        </div>
      </div>

      <div className="mt-6">
        <div className="flex gap-4 border-b">
          {["details", "media"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as "details" | "media")}
              className={`text-md font-medium capitalize transition-all duration-150 px-2 pb-1 border-b-2 ${
                activeTab === tab
                  ? "text-red-600 border-red-600"
                  : "border-transparent text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "details" && (
          <div className="p-0 sm:p-4 w-full space-y-6">
            <Card className="p-4 sm:p-6 shadow-sm dark:bg-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                About Me
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {cleanBio(sponsorData.bio)}
              </p>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <Card className="p-4 sm:p-6 shadow-sm dark:bg-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Sponsorship
                </h3>
                <p className="dark:text-white">
                  <span className="font-medium">Range:</span>{" "}
                  {sponsorData.sponsorshipInfo.range}
                </p>
                <p className="dark:text-white">
                  <span className="font-medium">Type:</span>{" "}
                  {sponsorData.sponsorshipInfo.type}
                </p>
                <p className="dark:text-white">
                  <span className="font-medium">Country Preferred:</span>{" "}
                  {sponsorData.sponsorshipInfo.country}
                </p>
              </Card>

              {viewedProfile?.address && (
                <Card className="p-4 sm:p-6 shadow-sm dark:bg-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Address
                  </h3>
                  <p className="dark:text-white">{viewedProfile.address}</p>
                </Card>
              )}
            </div>
          </div>
        )}

        {activeTab === "media" && <Mediaview Data={viewedProfile} />}
      </div>
    </div>
  );
};

export default Sponsorview;