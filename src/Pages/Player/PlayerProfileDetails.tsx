import React, { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLinkedin,
  faInstagram,
  faFacebook,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { Card } from "@/components/ui/card";

interface DocumentItem {
  id?: string;
  type?: string;
  title?: string;
  issuedBy?: string;
  issuedDate?: string;
  imageUrl?: string;
  description?: string;
}

interface PlayerProfileDetailsProps {
  playerData: any;
}

const PlayerProfileDetails: React.FC<PlayerProfileDetailsProps> = ({
  playerData,
}) => {
  if (!playerData) {
    return (
      <div className="p-4 text-center text-red-500">
        Player data not available
      </div>
    );
  }

  // About Me
  const aboutMe = playerData.bio || "No information available";
  console.log(playerData.socialLinks);
  // See More
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  const aboutTextRef = useRef<HTMLParagraphElement>(null);
  const [showSeeMore, setShowSeeMore] = useState(false);

  // Modal states
  const [modalItem, setModalItem] = useState<DocumentItem | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  // Modal outside click
  useEffect(() => {
    if (!modalItem) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setModalItem(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [modalItem]);

  // About Me line clamp
  useEffect(() => {
    if (aboutTextRef.current) {
      const lineHeight = parseInt(
        window.getComputedStyle(aboutTextRef.current).lineHeight || "24"
      );
      const height = aboutTextRef.current.scrollHeight;
      const isTall = height > lineHeight * 3 + 5;
      setShowSeeMore(isTall);

      if (!isTall) {
        setIsAboutExpanded(true);
      }
    }
  }, [aboutMe]);

  const toggleAboutExpanded = () => setIsAboutExpanded(!isAboutExpanded);

  // Certificates and Awards
  const documents = Array.isArray(playerData.documents)
    ? playerData.documents
    : [];

  const certificates = documents.filter(
    (doc: DocumentItem) =>
      doc.type === "certificate" ||
      (doc.title && doc.title.toLowerCase().includes("certificate")) ||
      (doc.description && doc.description.toLowerCase().includes("certificate"))
  );

  const awards = documents.filter(
    (doc: DocumentItem) =>
      doc.type === "award" ||
      (doc.title && doc.title.toLowerCase().includes("award")) ||
      (doc.description && doc.description.toLowerCase().includes("award"))
  );

  // Social links mapping (robust for your data)
  // Only show if the value is a non-empty string, non-default (not just .com), and really a link
  const rawSocialLinks = playerData.socialLinks || {};
  const socialMap = [
    {
      icon: faLinkedin,
      color: "#0077B5",
      key: "linkedin",
      name: "LinkedIn",
    },
    {
      icon: faFacebook,
      color: "#3b5998",
      key: "facebook",
      name: "Facebook",
    },
    {
      icon: faInstagram,
      color: "#E1306C",
      key: "instagram",
      name: "Instagram",
    },
    {
      icon: faXTwitter,
      color: "#1DA1F2",
      key: "twitter",
      name: "Twitter",
    },
  ];

  // Helper to check if value is a valid, non-empty, non-placeholder URL
  function isValidSocialLink(link: string | undefined) {
    if (link === "") {
      return false;
    }
    return true;
  }

  const validSocialLinks = socialMap
    .map((item) => {
      const val = rawSocialLinks[item.key];
      if (isValidSocialLink(val)) {
        return { ...item, url: val };
      }
      return null;
    })
    .filter(Boolean);

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
        <div className="relative">
          <p
            ref={aboutTextRef}
            className={`text-gray-600 dark:text-gray-300 ${
              showSeeMore && !isAboutExpanded
                ? "line-clamp-3 overflow-hidden"
                : ""
            }`}
            style={{ whiteSpace: "pre-line" }}
          >
            {aboutMe}
          </p>
          {showSeeMore && (
            <button
              onClick={toggleAboutExpanded}
              className="text-blue-500 hover:text-blue-700 font-medium mt-1 focus:outline-none flex justify-center w-full"
            >
              {isAboutExpanded ? "See less" : "read more"}
            </button>
          )}
        </div>
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
                  className="p-4 border rounded-lg dark:border-gray-600 dark:bg-gray-600 cursor-pointer"
                  onClick={() => setModalItem(cert)}
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
                          className="w-full max-h-40 object-cover rounded"
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
                  className="p-4 border rounded-lg dark:border-gray-600 dark:bg-gray-600 cursor-pointer"
                  onClick={() => setModalItem(award)}
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
                          className="w-full max-h-40 object-cover rounded"
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

      {/* Modal for certificate/award details */}
      {modalItem && (
        <div className="fixed inset-0 z-50 flex justify-center items-center">
          <div className="fixed inset-0 bg-blur bg-opacity-50 backdrop-blur-lg"></div>
          <div
            ref={modalRef}
            className="relative bg-white dark:bg-gray-800 p-8 rounded-lg max-w-4xl border-black w-full z-10"
          >
            <button
              className="absolute top-2 right-3 text-2xl text-gray-500 dark:text-gray-300 hover:text-red-600"
              onClick={() => setModalItem(null)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
              {modalItem.title ||
                (modalItem.type === "award" ? "Award" : "Certificate")}
            </h2>
            {modalItem.issuedBy && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                <span className="font-medium">Issued by:</span>{" "}
                {modalItem.issuedBy}
              </p>
            )}
            {modalItem.issuedDate && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                <span className="font-medium">Date:</span>{" "}
                {formatDate(modalItem.issuedDate)}
              </p>
            )}
            {modalItem.imageUrl && (
              <div className="my-4">
                <img
                  src={modalItem.imageUrl}
                  alt={modalItem.title || ""}
                  className="w-full max-h-100 object-contain rounded"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
              </div>
            )}
            {modalItem.description && (
              <p className="text-base mt-2 text-gray-700 dark:text-gray-200 whitespace-pre-line">
                {modalItem.description}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Social Media Section */}
      <Card className="mt-4 relative border p-4 w-fit rounded-lg dark:bg-gray-700 dark:text-white">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Social Media
        </h3>
        {validSocialLinks.length > 0 ? (
          <div className="flex gap-6 mt-4">
            {validSocialLinks.map((item, index) => (
              <a
                key={index}
                href={item.url}
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
            ))}
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

export default PlayerProfileDetails;
