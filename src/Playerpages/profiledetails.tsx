import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLinkedin,
  faInstagram,
  faFacebook,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";

interface ProfileDetailsProps {
  playerData?: any; // You can replace with your proper type
  isExpertView?: boolean; // Flag to determine if it's expert view
}

const ProfileDetails: React.FC<ProfileDetailsProps> = ({
  playerData,
  isExpertView = false,
}) => {
  // Use static data as fallback when playerData is not provided
  const aboutMe =
    playerData?.aboutMe ||
    "I am from London, UK. A passionate, versatile musician bringing light to classics from Ella Fitzgerald to Guns and Roses. Guaranteed to get the crowd dancing.";

  const certificates = playerData?.certificates || [
    "Fundamentals of Music Theory",
    "Getting Started With Music Theory",
  ];

  const awards = playerData?.awards || [
    "Fundamentals of Music Theory",
    "Getting Started With Music Theory",
  ];

  return (
    <div className="p-6">
      {/* About Me Section */}
      <div className="mt-4 border p-4 rounded-lg dark:bg-gray-700 dark:text-white">
        <h3 className="text-lg font-semibold">About Me</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{aboutMe}</p>
      </div>

      {/* Certificates & Awards */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Certificates */}
        <div className="border p-4 rounded-lg dark:bg-gray-700 dark:text-white">
          <h3 className="text-lg font-semibold">Certificates</h3>
          <div>
            {certificates.map((cert: string, index: number) => (
              <div
                key={index}
                className="p-2 border font-Opensans rounded mt-2 dark:bg-gray-600"
              >
                {cert}
              </div>
            ))}
          </div>
        </div>

        {/* Awards */}
        <div className="border p-4 rounded-lg dark:bg-gray-700 dark:text-white">
          <h3 className="text-lg font-semibold">Awards</h3>
          <div>
            {awards.map((award: string, index: number) => (
              <div
                key={index}
                className="p-2 border font-Opensans rounded mt-2 dark:bg-gray-600"
              >
                {award}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="mt-4 border p-4 rounded-lg dark:bg-gray-700 dark:text-white">
        <h3 className="text-lg font-Raleway font-semibold">Socials</h3>
        <div className="flex space-x-4 mt-2">
          <FontAwesomeIcon
            icon={faLinkedin}
            className="text-blue-600 text-3xl cursor-pointer"
          />
          <FontAwesomeIcon
            icon={faInstagram}
            className="text-pink-600 text-3xl cursor-pointer"
          />
          <FontAwesomeIcon
            icon={faFacebook}
            className="text-blue-800 text-3xl cursor-pointer"
          />
          <FontAwesomeIcon
            icon={faTwitter}
            className="text-blue-600 text-3xl cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileDetails;
