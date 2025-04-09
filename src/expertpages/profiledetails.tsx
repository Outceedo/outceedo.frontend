import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLinkedin,
  faInstagram,
  faFacebook,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { Card } from "@/components/ui/card";

interface PlayerData {
  id?: string;
  name?: string;
  aboutMe?: string;
  certificates?: string[];
  awards?: string[];
  socials?: {
    linkedin?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  [key: string]: any; // For other properties
}

interface ProfileDetailsProps {
  playerData?: PlayerData;
  isExpertView?: boolean;
}

const ProfileDetails: React.FC<ProfileDetailsProps> = ({
  playerData = {},
  isExpertView = false,
}) => {
  const {
    aboutMe = "No information available",
    certificates = [],
    awards = [],
    socials = {},
  } = playerData;

  function formatUrl(url: string): string {
    if (!url) return "#"; // fallback to avoid errors
    return url.startsWith("http://") || url.startsWith("https://")
      ? url
      : `https://${url}`;
  }
  

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
          <div className="space-y-2">
            {certificates.length > 0 ? (
              certificates.map((cert, index) => (
                <div
                  key={index}
                  className="p-3 border rounded-lg dark:border-gray-600 dark:bg-gray-600"
                >
                  {cert}
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
          <div className="space-y-2">
            {awards.length > 0 ? (
              awards.map((award, index) => (
                <div
                  key={index}
                  className="p-3 border rounded-lg dark:border-gray-600 dark:bg-gray-600"
                >
                  {award}
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

      <Card className="mt-4 relative border p-4 w-fit rounded-lg dark:bg-gray-700 dark:text-white">
  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
    Social Media
  </h3>

  <div className="flex gap-5">
    {/* LinkedIn */}
    <a
      href={formatUrl(socials.linkedin || "")}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 text-2xl hover:text-blue-800 transition"
    >
      <FontAwesomeIcon icon={faLinkedin} />
    </a>

    {/* Instagram */}
    <a
      href={formatUrl(socials.instagram || "")}
      target="_blank"
      rel="noopener noreferrer"
      className="text-pink-600 text-2xl hover:text-pink-800 transition"
    >
      <FontAwesomeIcon icon={faInstagram} />
    </a>

    {/* Facebook */}
    <a
      href={formatUrl(socials.facebook || "")}
      

      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-800 text-2xl hover:text-blue-900 transition"
    >
      <FontAwesomeIcon icon={faFacebook} />
    </a>

    {/* Twitter */}
    <a
      href={formatUrl(socials.twitter || "")}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-500 text-2xl hover:text-blue-700 transition"
    >
      <FontAwesomeIcon icon={faTwitter} />
    </a>
  </div>
</Card>

     
    </div>
  );
};

export default ProfileDetails;
