import React, { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLinkedin,
  faInstagram,
  faFacebook,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { Card } from "@/components/ui/card";
// import { Profile, DocumentItem } from "../types/Profile";

interface ProfileDetailsProps {
  playerData: Profile;
  isExpertView?: boolean;
}

const ProfileDetails: React.FC<ProfileDetailsProps> = ({
  playerData,
  isExpertView = false,
}) => {
  // Get player info
  const aboutMe = playerData.bio || "No information available";

  // Extract certificates and awards from documents array with debug logging
  const documents = Array.isArray(playerData.documents)
    ? playerData.documents
    : [];

  // Debug log for documents
  useEffect(() => {
    console.log("All documents:", documents);
    if (documents.length > 0) {
      console.log(
        "First document structure:",
        JSON.stringify(documents[0], null, 2)
      );
      console.log(
        "Document types:",
        documents.map((doc) => doc.type)
      );
    }
  }, [documents]);

  // More robust type checking for certificates and awards
  const certificates = documents.filter(
    (doc) =>
      doc.type === "certificate" ||
      (doc.title && doc.title.toLowerCase().includes("certificate")) ||
      (doc.description && doc.description.toLowerCase().includes("certificate"))
  );

  const awards = documents.filter(
    (doc) =>
      doc.type === "award" ||
      (doc.title && doc.title.toLowerCase().includes("award")) ||
      (doc.description && doc.description.toLowerCase().includes("award"))
  );

  // Debug log for filtered documents
  useEffect(() => {
    console.log("Certificates found:", certificates.length);
    console.log("Awards found:", awards.length);
  }, [certificates, awards]);

  // Handle social links
  const socialLinks = playerData.socialLinks || {};

  // Function to determine if any valid social links exist
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

  // Create social media configuration for display
  const socialConfig = [
    {
      icon: faLinkedin,
      color: "#0077B5",
      link: socialLinks.linkedin || "",
      name: "LinkedIn",
    },
    {
      icon: faFacebook,
      color: "#3b5998",
      link: socialLinks.facebook || "",
      name: "Facebook",
    },
    {
      icon: faInstagram,
      color: "#E1306C",
      link: socialLinks.instagram || "",
      name: "Instagram",
    },
    {
      icon: faXTwitter,
      color: "#1DA1F2",
      link: socialLinks.twitter || "",
      name: "Twitter",
    },
  ];

  // Format dates to readable format
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

  return (
    <div className="p-4 w-full space-y-6">
      {/* About Me Section */}
      <Card className="p-6 shadow-sm dark:bg-gray-700 dark:text-white">
        <h3 className="text-lg font-semibold mb-3">About Me</h3>
        <p
          className="text-gray-600 dark:text-gray-300"
          style={{ whiteSpace: "pre-line" }}
        >
          {aboutMe}
        </p>
      </Card>

      {/* Certificates & Awards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Certificates */}
        <Card className="p-6 shadow-sm dark:bg-gray-700 dark:text-white">
          <h3 className="text-lg font-semibold mb-3">Certificates</h3>
          <div className="space-y-4">
            {certificates.length > 0 ? (
              certificates.map((cert: DocumentItem, index) => (
                <div
                  key={cert.id || index}
                  className="p-4 border rounded-lg dark:border-gray-600 dark:bg-gray-600"
                >
                  <div>
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
                          alt={cert.title || "Certificate"}
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
              awards.map((award: DocumentItem, index) => (
                <div
                  key={award.id || index}
                  className="p-4 border rounded-lg dark:border-gray-600 dark:bg-gray-600"
                >
                  <div>
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
                          alt={award.title || "Award"}
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
              // Only show icons for links that are specified and not just default domains
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
