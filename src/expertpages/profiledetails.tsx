import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLinkedin,
  faInstagram,
  faFacebook,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { Card } from "@/components/ui/card";


const icons = [
  { icon: faLinkedin, color: '#0077B5', link: 'https://www.linkedin.com' },
  { icon: faFacebook, color: '#3b5998', link: 'https://www.facebook.com' },
  { icon: faInstagram, color: '#E1306C', link: 'https://www.instagram.com' },
  { icon: faTwitter, color: '#1DA1F2', link: 'https://www.twitter.com' },
];

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

}) => {
  const {
    aboutMe = "No information available",
    certificates = [],
    awards = [],
  
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

      <Card className="mt-4 relative border p-4 w-fit rounded-lg dark:bg-gray-700 dark:text-white">
  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
    Social Media
  </h3>
  <div className="flex justify-center gap-6 mt-4">
      {icons.map((item, index) => (
        <a
          key={index}
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="w-11 h-11 flex items-center justify-center rounded-full text-white text-2xl shadow-lg"
          style={{
            background: item.icon === faInstagram 
              ? 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)' 
              : item.color
          }}
        >
          <FontAwesomeIcon icon={item.icon} />
        </a>
      ))}
    </div>
  
</Card>

     
    </div>
  );
};

export default ProfileDetails;
