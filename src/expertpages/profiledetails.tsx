import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLinkedin,
  faInstagram,
  faFacebook,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { Card } from "@/components/ui/card";

// Define document structure based on provided JSON
interface DocumentItem {
  id: string;
  title: string;
  issuedBy?: string;
  issuedDate?: string;
  imageUrl?: string;
  type: "certificate" | "award" | string;
  description?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface PlayerData {
  id?: string;
  bio?: string;
  documents?: DocumentItem[];
  uploads?: any[];
  socialLinks?: {
    linkedin?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  [key: string]: any;
}

interface ProfileDetailsProps {
  playerData?: PlayerData;
  isExpertView?: boolean;
}

const ProfileDetails: React.FC<ProfileDetailsProps> = ({
  playerData = {},
  isExpertView = false,
}) => {
  // Get bio data
  const aboutMe = playerData.bio || "No information available";

  // Get certificates and awards from documents array
  const certificates =
    playerData.documents?.filter((doc) => doc.type === "certificate") || [];
  const awards =
    playerData.documents?.filter((doc) => doc.type === "award") || [];

  // Handle social links
  const socialLinks = playerData.socialLinks || {
    linkedin: "",
    instagram: "",
    facebook: "",
    twitter: "",
  };

  // Create social media configuration
  const socialConfig = [
    {
      icon: faLinkedin,
      color: "#0077B5",
      link: socialLinks.linkedin || "https://www.linkedin.com",
      name: "LinkedIn",
    },
    {
      icon: faFacebook,
      color: "#3b5998",
      link: socialLinks.facebook || "https://www.facebook.com",
      name: "Facebook",
    },
    {
      icon: faInstagram,
      color: "#E1306C",
      link: socialLinks.instagram || "https://www.instagram.com",
      name: "Instagram",
    },
    {
      icon: faTwitter,
      color: "#1DA1F2",
      link: socialLinks.twitter || "https://www.twitter.com",
      name: "Twitter",
    },
  ];

  // Check if social links have valid values
  const hasSocialLinks = () => {
    if (!socialLinks) return false;

    return Object.values(socialLinks).some(
      (link) =>
        link &&
        typeof link === "string" &&
        link.length > 0 &&
        !link.endsWith(".com")
    );
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  console.log("ProfileDetails received documents:", playerData.documents);

  return (
    <div className="p-4 w-full space-y-6">
      {/* About Me Section */}
      <Card className="p-6 shadow-sm dark:bg-gray-700 dark:text-white">
        <h3 className="text-lg font-semibold mb-3">About Me</h3>
        <p className="text-gray-600 dark:text-gray-300">{aboutMe}</p>
      </Card>

      {/* Certificates & Awards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Certificates */}
        <Card className="p-6 shadow-sm dark:bg-gray-700 dark:text-white">
          <h3 className="text-lg font-semibold mb-3">Certificates</h3>
          <div className="space-y-4">
            {certificates.length > 0 ? (
              certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="p-4 border rounded-lg dark:border-gray-600 dark:bg-gray-600"
                >
                  <h4 className="font-medium text-base">
                    {cert.title || "Certificate"}
                  </h4>

                  {cert.issuedBy && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <span className="font-medium">Issued by:</span>{" "}
                      {cert.issuedBy}
                    </p>
                  )}

                  {cert.issuedDate && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-medium">Date:</span>{" "}
                      {formatDate(cert.issuedDate)}
                    </p>
                  )}

                  {cert.imageUrl && (
                    <div className="mt-3 relative">
                      <img
                        src={cert.imageUrl}
                        alt={cert.title}
                        className="w-full max-h-40 object-cover rounded cursor-pointer"
                        onClick={() => window.open(cert.imageUrl, "_blank")}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  {cert.description && (
                    <p className="text-sm mt-2 text-gray-600 dark:text-gray-300">
                      {cert.description}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic">
                No certificates available
              </p>
            )}
          </div>
        </Card>

        {/* Awards */}
        <Card className="p-6 shadow-sm dark:bg-gray-700 dark:text-white">
          <h3 className="text-lg font-semibold mb-3">Awards</h3>
          <div className="space-y-4">
            {awards.length > 0 ? (
              awards.map((award) => (
                <div
                  key={award.id}
                  className="p-4 border rounded-lg dark:border-gray-600 dark:bg-gray-600"
                >
                  <h4 className="font-medium text-base">
                    {award.title || "Award"}
                  </h4>

                  {award.issuedBy && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <span className="font-medium">Issued by:</span>{" "}
                      {award.issuedBy}
                    </p>
                  )}

                  {award.issuedDate && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-medium">Date:</span>{" "}
                      {formatDate(award.issuedDate)}
                    </p>
                  )}

                  {award.imageUrl && (
                    <div className="mt-3 relative">
                      <img
                        src={award.imageUrl}
                        alt={award.title}
                        className="w-full max-h-40 object-cover rounded cursor-pointer"
                        onClick={() => window.open(award.imageUrl, "_blank")}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  {award.description && (
                    <p className="text-sm mt-2 text-gray-600 dark:text-gray-300">
                      {award.description}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic">
                No awards available
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Social Media Section */}
      <Card className="mt-4 relative border p-4 w-fit rounded-lg dark:bg-gray-700 dark:text-white">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Social Media
        </h3>
        {hasSocialLinks() ? (
          <div className="flex justify-center gap-6 mt-4">
            {socialConfig.map((item, index) => {
              const linkValue = item.link || "";
              const isDefault =
                !linkValue ||
                linkValue === "" ||
                (linkValue.endsWith(".com") && !linkValue.includes("/"));

              if (isDefault) return null;

              return (
                <a
                  key={index}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 flex items-center justify-center rounded-full text-white text-2xl shadow-lg"
                  title={item.name}
                  style={{
                    background:
                      item.icon === faInstagram
                        ? "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)"
                        : item.color,
                  }}
                >
                  <FontAwesomeIcon icon={item.icon} />
                </a>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 italic">
            No social media links available
          </p>
        )}
      </Card>
    </div>
  );
};

export default ProfileDetails;
