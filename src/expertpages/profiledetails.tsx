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

      {/* Social Links - Improved Design */}
      <Card className="p-6 shadow-sm dark:bg-gray-700 dark:text-white">
        <h3 className="text-lg font-semibold mb-4">Social Media</h3>
        <div className="flex flex-wrap gap-5">
          {socials.linkedin ? (
            <a
              href={socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 dark:bg-gray-600 hover:bg-blue-100 dark:hover:bg-gray-500 transition-colors"
            >
              <FontAwesomeIcon
                icon={faLinkedin}
                className="text-blue-600 text-xl"
              />
              <span className="font-medium text-gray-800 dark:text-white">
                LinkedIn
              </span>
            </a>
          ) : null}

          {socials.instagram ? (
            <a
              href={socials.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link flex items-center gap-2 px-4 py-2 rounded-lg bg-pink-50 dark:bg-gray-600 hover:bg-pink-100 dark:hover:bg-gray-500 transition-colors"
            >
              <FontAwesomeIcon
                icon={faInstagram}
                className="text-pink-600 text-xl"
              />
              <span className="font-medium text-gray-800 dark:text-white">
                Instagram
              </span>
            </a>
          ) : null}

          {socials.facebook ? (
            <a
              href={socials.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 dark:bg-gray-600 hover:bg-blue-100 dark:hover:bg-gray-500 transition-colors"
            >
              <FontAwesomeIcon
                icon={faFacebook}
                className="text-blue-800 text-xl"
              />
              <span className="font-medium text-gray-800 dark:text-white">
                Facebook
              </span>
            </a>
          ) : null}

          {socials.twitter ? (
            <a
              href={socials.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 dark:bg-gray-600 hover:bg-blue-100 dark:hover:bg-gray-500 transition-colors"
            >
              <FontAwesomeIcon
                icon={faTwitter}
                className="text-blue-500 text-xl"
              />
              <span className="font-medium text-gray-800 dark:text-white">
                Twitter
              </span>
            </a>
          ) : null}

          {/* If no social links are provided */}
          {!socials.linkedin &&
            !socials.instagram &&
            !socials.facebook &&
            !socials.twitter && (
              <p className="text-gray-500 dark:text-gray-400 italic">
                No social media links available
              </p>
            )}
        </div>
      </Card>
    </div>
  );
};

export default ProfileDetails;
