import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import {
  faLinkedin,
  faInstagram,
  faFacebook,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Certificate {
  name: string;
  image?: string; // base64 or URL
}
interface Award {
  name: string;
  image?: string;
}

const ProfileDetails: React.FC = () => {
  const [aboutMe, setAboutMe] = useState(
    localStorage.getItem("aboutMe") ||
      "I am from London, UK. A passionate, versatile musician bringing light to classics from Ella Fitzgerald to Guns and Roses. Guaranteed to get the crowd dancing."
  );
  const [isEditing, setIsEditing] = useState(false);

  const [certificates, setCertificates] = useState<string[]>([
    "Fundamentals of Music Theory",
    "Getting Started With Music Theory",
  ]);
  const [awards, setAwards] = useState<string[]>([
    "Fundamentals of Music Theory",
    "Getting Started With Music Theory",
  ]);

  const [isEditingCertificates, setIsEditingCertificates] = useState(false);
  const [isEditingAwards, setIsEditingAwards] = useState(false);
  const [isEditingSocials, setIsEditingSocials] = useState(false);
  const [socials, setSocials] = useState({
    linkedin: "",
    instagram: "",
    facebook: "",
    twitter: "",
  });

  useEffect(() => {
    const savedCertificates = localStorage.getItem("certificates");
    const savedAwards = localStorage.getItem("awards");
    const savedSocials = localStorage.getItem("socials");

    if (savedCertificates) setCertificates(JSON.parse(savedCertificates));
    if (savedAwards) setAwards(JSON.parse(savedAwards));
    if (savedSocials) setSocials(JSON.parse(savedSocials));
  }, []);

  const handleSave = () => {
    localStorage.setItem("aboutMe", aboutMe);
    setIsEditing(false);
  };

  const saveCertificates = () => {
    localStorage.setItem("certificates", JSON.stringify(certificates));
    setIsEditingCertificates(false);
  };

  const saveAwards = () => {
    localStorage.setItem("awards", JSON.stringify(awards));
    setIsEditingAwards(false);
  };

  const saveSocials = () => {
    localStorage.setItem("socials", JSON.stringify(socials));
    setIsEditingSocials(false);
  };

  const handleSocialChange = (
    platform: keyof typeof socials,
    value: string
  ) => {
    setSocials((prev) => ({
      ...prev,
      [platform]: value,
    }));
  };

  return (
    <div className="p-4 w-full space-y-6">
      {/* About Me Section */}
      <div className="mt-4 relative border p-4 rounded-lg dark:bg-gray-700 dark:text-white">
        <h3 className="text-lg font-semibold">About Me</h3>
        {isEditing ? (
          <>
            <textarea
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value)}
              className="w-full p-2 border rounded-lg dark:bg-gray-600 dark:text-white mt-2"
            />
            <button
              onClick={handleSave}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500"
            >
              Save
            </button>
          </>
        ) : (
          <p className="text-gray-600 dark:text-gray-400 mt-2">{aboutMe}</p>
        )}
        <FontAwesomeIcon
          icon={faPen}
          className="absolute top-2 right-2 text-gray-500 dark:text-gray-300 cursor-pointer"
          onClick={() => setIsEditing(true)}
        />
      </div>

      {/* Certificates & Awards */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Certificates */}
        <div className="relative border p-4 rounded-lg dark:bg-gray-700 dark:text-white">
          <h3 className="text-lg font-semibold">Certificates</h3>
          {isEditingCertificates ? (
            <div>
              {certificates.map((cert, index) => (
                <input
                  key={index}
                  type="text"
                  className="p-2 border font-Opensans rounded mt-2 dark:bg-gray-600 w-full"
                  value={cert}
                  onChange={(e) => {
                    const newCertificates = [...certificates];
                    newCertificates[index] = e.target.value;
                    setCertificates(newCertificates);
                  }}
                />
              ))}
              <button
                onClick={saveCertificates}
                className="mt-2 bg-red-600 text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </div>
          ) : (
            <div>
              {certificates.map((cert, index) => (
                <div
                  key={index}
                  className="p-2 border font-Opensans rounded mt-2 dark:bg-gray-600"
                >
                  {cert}
                </div>
              ))}
              <FontAwesomeIcon
                icon={faPen}
                onClick={() => setIsEditingCertificates(true)}
                className="absolute top-2 right-2 text-gray-500 dark:text-gray-300 cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Awards */}
        <div className="relative border p-4 rounded-lg dark:bg-gray-700 dark:text-white">
          <h3 className="text-lg font-semibold">Awards</h3>
          {isEditingAwards ? (
            <div>
              {awards.map((award, index) => (
                <input
                  key={index}
                  type="text"
                  className="p-2 border font-Opensans rounded mt-2 dark:bg-gray-600 w-full"
                  value={award}
                  onChange={(e) => {
                    const newAwards = [...awards];
                    newAwards[index] = e.target.value;
                    setAwards(newAwards);
                  }}
                />
              ))}
              <button
                onClick={saveAwards}
                className="mt-2 bg-red-600 text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </div>
          ) : (
            <div>
              {awards.map((award, index) => (
                <div
                  key={index}
                  className="p-2 border font-Opensans rounded mt-2 dark:bg-gray-600"
                >
                  {award}
                </div>
              ))}
              <FontAwesomeIcon
                icon={faPen}
                onClick={() => setIsEditingAwards(true)}
                className="absolute top-2 right-2 text-gray-500 dark:text-gray-300 cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>

      {/* Social Links */}
      <Card className="mt-4 relative p-4 dark:bg-gray-700 dark:text-white">
        <h3 className="text-lg font-Raleway font-semibold">Socials</h3>

        {isEditingSocials ? (
          <div className="space-y-3 mt-3">
            <div className="flex items-center gap-3">
              <FontAwesomeIcon
                icon={faLinkedin}
                className="text-blue-600 text-2xl"
              />
              <Input
                placeholder="LinkedIn URL"
                value={socials.linkedin}
                onChange={(e) => handleSocialChange("linkedin", e.target.value)}
                className="dark:bg-gray-600"
              />
            </div>

            <div className="flex items-center gap-3">
              <FontAwesomeIcon
                icon={faInstagram}
                className="text-pink-600 text-2xl"
              />
              <Input
                placeholder="Instagram URL"
                value={socials.instagram}
                onChange={(e) =>
                  handleSocialChange("instagram", e.target.value)
                }
                className="dark:bg-gray-600"
              />
            </div>

            <div className="flex items-center gap-3">
              <FontAwesomeIcon
                icon={faFacebook}
                className="text-blue-800 text-2xl"
              />
              <Input
                placeholder="Facebook URL"
                value={socials.facebook}
                onChange={(e) => handleSocialChange("facebook", e.target.value)}
                className="dark:bg-gray-600"
              />
            </div>

            <div className="flex items-center gap-3">
              <FontAwesomeIcon
                icon={faTwitter}
                className="text-blue-600 text-2xl"
              />
              <Input
                placeholder="Twitter URL"
                value={socials.twitter}
                onChange={(e) => handleSocialChange("twitter", e.target.value)}
                className="dark:bg-gray-600"
              />
            </div>

            <Button
              onClick={saveSocials}
              className="mt-3 bg-red-600 hover:bg-red-700 text-white"
            >
              Save
            </Button>
          </div>
        ) : (
          <div className="flex space-x-6 mt-3">
            {socials.linkedin && (
              <a
                href={socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon
                  icon={faLinkedin}
                  className="text-blue-600 text-3xl"
                />
              </a>
            )}
            {socials.instagram && (
              <a
                href={socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon
                  icon={faInstagram}
                  className="text-pink-600 text-3xl"
                />
              </a>
            )}
            {socials.facebook && (
              <a
                href={socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon
                  icon={faFacebook}
                  className="text-blue-800 text-3xl"
                />
              </a>
            )}
            {socials.twitter && (
              <a
                href={socials.twitter}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon
                  icon={faTwitter}
                  className="text-blue-600 text-3xl"
                />
              </a>
            )}
            {/* Show default icons if no URLs are provided */}
            {!socials.linkedin &&
              !socials.instagram &&
              !socials.facebook &&
              !socials.twitter && (
                <>
                  <FontAwesomeIcon
                    icon={faLinkedin}
                    className="text-blue-600 text-3xl opacity-50"
                  />
                  <FontAwesomeIcon
                    icon={faInstagram}
                    className="text-pink-600 text-3xl opacity-50"
                  />
                  <FontAwesomeIcon
                    icon={faFacebook}
                    className="text-blue-800 text-3xl opacity-50"
                  />
                  <FontAwesomeIcon
                    icon={faTwitter}
                    className="text-blue-600 text-3xl opacity-50"
                  />
                </>
              )}
          </div>
        )}

        <FontAwesomeIcon
          icon={faPen}
          onClick={() => setIsEditingSocials(true)}
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-800 cursor-pointer dark:text-gray-300"
        />
      </Card>
    </div>
  );
};

export default ProfileDetails;
