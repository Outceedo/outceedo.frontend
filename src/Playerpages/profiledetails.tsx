import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faSave,
  faTimes,
  faTrash,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import {
  faLinkedin,
  faInstagram,
  faFacebook,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
  playerData = {
    aboutMe: "I am a passionate player dedicated to improving my skills.",
    certificates: [],
    awards: [],
    socials: {},
  },
  isExpertView = false,
}) => {
  // State for editing
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isEditingCertificates, setIsEditingCertificates] = useState(false);
  const [isEditingAwards, setIsEditingAwards] = useState(false);
  const [isEditingSocials, setIsEditingSocials] = useState(false);

  // State for data
  const [aboutMe, setAboutMe] = useState(playerData.aboutMe || "");
  const [certificates, setCertificates] = useState<string[]>(
    playerData.certificates || []
  );
  const [awards, setAwards] = useState<string[]>(playerData.awards || []);
  const [socials, setSocials] = useState({
    linkedin: playerData.socials?.linkedin || "",
    instagram: playerData.socials?.instagram || "",
    facebook: playerData.socials?.facebook || "",
    twitter: playerData.socials?.twitter || "",
  });

  // Load data from localStorage if available
  useEffect(() => {
    const savedAboutMe = localStorage.getItem("aboutMe");
    const savedCertificates = localStorage.getItem("certificates");
    const savedAwards = localStorage.getItem("awards");
    const savedSocials = localStorage.getItem("socials");

    if (savedAboutMe) setAboutMe(savedAboutMe);
    if (savedCertificates) setCertificates(JSON.parse(savedCertificates));
    if (savedAwards) setAwards(JSON.parse(savedAwards));
    if (savedSocials) setSocials(JSON.parse(savedSocials));
  }, []);

  // Save to localStorage functions
  const saveAboutMe = () => {
    localStorage.setItem("aboutMe", aboutMe);
    setIsEditingAbout(false);
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

  // Handle certificates and awards
  const handleAddCertificate = () => {
    setCertificates([...certificates, ""]);
  };

  const handleAddAward = () => {
    setAwards([...awards, ""]);
  };

  const handleCertificateChange = (index: number, value: string) => {
    const newCertificates = [...certificates];
    newCertificates[index] = value;
    setCertificates(newCertificates);
  };

  const handleAwardChange = (index: number, value: string) => {
    const newAwards = [...awards];
    newAwards[index] = value;
    setAwards(newAwards);
  };

  const handleRemoveCertificate = (index: number) => {
    const newCertificates = [...certificates];
    newCertificates.splice(index, 1);
    setCertificates(newCertificates);
  };

  const handleRemoveAward = (index: number) => {
    const newAwards = [...awards];
    newAwards.splice(index, 1);
    setAwards(newAwards);
  };

  // Handle social media changes
  const handleSocialChange = (
    platform: keyof typeof socials,
    value: string
  ) => {
    setSocials({ ...socials, [platform]: value });
  };

  return (
    <div className="p-4 w-full space-y-6">
      {/* About Me Section */}
      <Card className="p-6 shadow-sm dark:bg-gray-700 relative">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          About Me
        </h3>

        {isEditingAbout ? (
          <>
            <Textarea
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value)}
              placeholder="Write about yourself..."
              className="min-h-[120px] dark:bg-gray-800"
            />
            <div className="flex justify-end space-x-2 mt-3">
              <Button
                variant="outline"
                onClick={() => setIsEditingAbout(false)}
              >
                <FontAwesomeIcon icon={faTimes} className="mr-1" /> Cancel
              </Button>
              <Button
                variant="default"
                className="bg-red-600 hover:bg-red-700"
                onClick={saveAboutMe}
              >
                <FontAwesomeIcon icon={faSave} className="mr-1" /> Save
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-700 dark:text-gray-300">{aboutMe}</p>
            {!isExpertView && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => setIsEditingAbout(true)}
              >
                <FontAwesomeIcon icon={faPen} />
              </Button>
            )}
          </>
        )}
      </Card>

      {/* Certificates & Awards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Certificates */}
        <Card className="p-6 shadow-sm dark:bg-gray-700 relative">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Certificates
          </h3>

          {isEditingCertificates ? (
            <div className="space-y-3">
              {certificates.map((cert, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={cert}
                    onChange={(e) =>
                      handleCertificateChange(index, e.target.value)
                    }
                    placeholder="Certificate name"
                    className="flex-1 dark:bg-gray-800"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleRemoveCertificate(index)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </Button>
                </div>
              ))}

              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={handleAddCertificate}
              >
                <FontAwesomeIcon icon={faPlus} className="mr-1" /> Add
                Certificate
              </Button>

              <div className="flex justify-end space-x-2 mt-3">
                <Button
                  variant="outline"
                  onClick={() => setIsEditingCertificates(false)}
                >
                  <FontAwesomeIcon icon={faTimes} className="mr-1" /> Cancel
                </Button>
                <Button
                  variant="default"
                  className="bg-red-600 hover:bg-red-700"
                  onClick={saveCertificates}
                >
                  <FontAwesomeIcon icon={faSave} className="mr-1" /> Save
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {certificates.length > 0 ? (
                  certificates.map((cert, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 border border-gray-100 rounded-lg dark:bg-gray-600 dark:border-gray-600 dark:text-gray-100"
                    >
                      {cert}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    No certificates added yet
                  </p>
                )}
              </div>

              {!isExpertView && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={() => setIsEditingCertificates(true)}
                >
                  <FontAwesomeIcon icon={faPen} />
                </Button>
              )}
            </>
          )}
        </Card>

        {/* Awards */}
        <Card className="p-6 shadow-sm dark:bg-gray-700 relative">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Awards
          </h3>

          {isEditingAwards ? (
            <div className="space-y-3">
              {awards.map((award, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={award}
                    onChange={(e) => handleAwardChange(index, e.target.value)}
                    placeholder="Award name"
                    className="flex-1 dark:bg-gray-800"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleRemoveAward(index)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </Button>
                </div>
              ))}

              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={handleAddAward}
              >
                <FontAwesomeIcon icon={faPlus} className="mr-1" /> Add Award
              </Button>

              <div className="flex justify-end space-x-2 mt-3">
                <Button
                  variant="outline"
                  onClick={() => setIsEditingAwards(false)}
                >
                  <FontAwesomeIcon icon={faTimes} className="mr-1" /> Cancel
                </Button>
                <Button
                  variant="default"
                  className="bg-red-600 hover:bg-red-700"
                  onClick={saveAwards}
                >
                  <FontAwesomeIcon icon={faSave} className="mr-1" /> Save
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {awards.length > 0 ? (
                  awards.map((award, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 border border-gray-100 rounded-lg dark:bg-gray-600 dark:border-gray-600 dark:text-gray-100"
                    >
                      {award}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    No awards added yet
                  </p>
                )}
              </div>

              {!isExpertView && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={() => setIsEditingAwards(true)}
                >
                  <FontAwesomeIcon icon={faPen} />
                </Button>
              )}
            </>
          )}
        </Card>
      </div>

      {/* Social Links - Enhanced Design */}
      <Card className="p-6 shadow-sm dark:bg-gray-700 relative">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Social Media
        </h3>

        {isEditingSocials ? (
          <div className="space-y-3">
            {/* LinkedIn */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
                <FontAwesomeIcon
                  icon={faLinkedin}
                  className="text-blue-600 text-xl"
                />
              </div>
              <Input
                placeholder="LinkedIn URL"
                value={socials.linkedin}
                onChange={(e) => handleSocialChange("linkedin", e.target.value)}
                className="flex-1 dark:bg-gray-800"
              />
            </div>

            {/* Instagram */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-pink-50 dark:bg-pink-900/20">
                <FontAwesomeIcon
                  icon={faInstagram}
                  className="text-pink-600 text-xl"
                />
              </div>
              <Input
                placeholder="Instagram URL"
                value={socials.instagram}
                onChange={(e) =>
                  handleSocialChange("instagram", e.target.value)
                }
                className="flex-1 dark:bg-gray-800"
              />
            </div>

            {/* Facebook */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
                <FontAwesomeIcon
                  icon={faFacebook}
                  className="text-blue-800 text-xl"
                />
              </div>
              <Input
                placeholder="Facebook URL"
                value={socials.facebook}
                onChange={(e) => handleSocialChange("facebook", e.target.value)}
                className="flex-1 dark:bg-gray-800"
              />
            </div>

            {/* Twitter */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
                <FontAwesomeIcon
                  icon={faTwitter}
                  className="text-blue-500 text-xl"
                />
              </div>
              <Input
                placeholder="Twitter URL"
                value={socials.twitter}
                onChange={(e) => handleSocialChange("twitter", e.target.value)}
                className="flex-1 dark:bg-gray-800"
              />
            </div>

            <div className="flex justify-end space-x-2 mt-3">
              <Button
                variant="outline"
                onClick={() => setIsEditingSocials(false)}
              >
                <FontAwesomeIcon icon={faTimes} className="mr-1" /> Cancel
              </Button>
              <Button
                variant="default"
                className="bg-red-600 hover:bg-red-700"
                onClick={saveSocials}
              >
                <FontAwesomeIcon icon={faSave} className="mr-1" /> Save
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* LinkedIn */}
              {socials.linkedin ? (
                <a
                  href={socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center p-4 bg-white hover:bg-gray-50 shadow-sm rounded-xl border border-gray-100 transition-all duration-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700"
                >
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-50 mb-3 group-hover:bg-blue-100 dark:bg-blue-900/20 dark:group-hover:bg-blue-900/30">
                    <FontAwesomeIcon
                      icon={faLinkedin}
                      className="text-blue-600 text-2xl"
                    />
                  </div>
                  <span className="text-gray-800 dark:text-gray-100 font-medium text-sm">
                    LinkedIn
                  </span>
                </a>
              ) : (
                !isExpertView && (
                  <button
                    onClick={() => setIsEditingSocials(true)}
                    className="flex flex-col items-center p-4 bg-white hover:bg-gray-50 shadow-sm rounded-xl border border-gray-100 border-dashed transition-all duration-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700"
                  >
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-50 mb-3 dark:bg-gray-700">
                      <FontAwesomeIcon
                        icon={faLinkedin}
                        className="text-gray-400 text-2xl"
                      />
                    </div>
                    <span className="text-gray-400 font-medium text-sm">
                      Add LinkedIn
                    </span>
                  </button>
                )
              )}

              {/* Instagram */}
              {socials.instagram ? (
                <a
                  href={socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center p-4 bg-white hover:bg-gray-50 shadow-sm rounded-xl border border-gray-100 transition-all duration-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700"
                >
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-pink-50 mb-3 group-hover:bg-pink-100 dark:bg-pink-900/20 dark:group-hover:bg-pink-900/30">
                    <FontAwesomeIcon
                      icon={faInstagram}
                      className="text-pink-600 text-2xl"
                    />
                  </div>
                  <span className="text-gray-800 dark:text-gray-100 font-medium text-sm">
                    Instagram
                  </span>
                </a>
              ) : (
                !isExpertView && (
                  <button
                    onClick={() => setIsEditingSocials(true)}
                    className="flex flex-col items-center p-4 bg-white hover:bg-gray-50 shadow-sm rounded-xl border border-gray-100 border-dashed transition-all duration-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700"
                  >
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-50 mb-3 dark:bg-gray-700">
                      <FontAwesomeIcon
                        icon={faInstagram}
                        className="text-gray-400 text-2xl"
                      />
                    </div>
                    <span className="text-gray-400 font-medium text-sm">
                      Add Instagram
                    </span>
                  </button>
                )
              )}

              {/* Facebook */}
              {socials.facebook ? (
                <a
                  href={socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center p-4 bg-white hover:bg-gray-50 shadow-sm rounded-xl border border-gray-100 transition-all duration-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700"
                >
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-50 mb-3 group-hover:bg-blue-100 dark:bg-blue-900/20 dark:group-hover:bg-blue-900/30">
                    <FontAwesomeIcon
                      icon={faFacebook}
                      className="text-blue-800 text-2xl"
                    />
                  </div>
                  <span className="text-gray-800 dark:text-gray-100 font-medium text-sm">
                    Facebook
                  </span>
                </a>
              ) : (
                !isExpertView && (
                  <button
                    onClick={() => setIsEditingSocials(true)}
                    className="flex flex-col items-center p-4 bg-white hover:bg-gray-50 shadow-sm rounded-xl border border-gray-100 border-dashed transition-all duration-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700"
                  >
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-50 mb-3 dark:bg-gray-700">
                      <FontAwesomeIcon
                        icon={faFacebook}
                        className="text-gray-400 text-2xl"
                      />
                    </div>
                    <span className="text-gray-400 font-medium text-sm">
                      Add Facebook
                    </span>
                  </button>
                )
              )}

              {/* Twitter */}
              {socials.twitter ? (
                <a
                  href={socials.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center p-4 bg-white hover:bg-gray-50 shadow-sm rounded-xl border border-gray-100 transition-all duration-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700"
                >
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-50 mb-3 group-hover:bg-blue-100 dark:bg-blue-900/20 dark:group-hover:bg-blue-900/30">
                    <FontAwesomeIcon
                      icon={faTwitter}
                      className="text-blue-500 text-2xl"
                    />
                  </div>
                  <span className="text-gray-800 dark:text-gray-100 font-medium text-sm">
                    Twitter
                  </span>
                </a>
              ) : (
                !isExpertView && (
                  <button
                    onClick={() => setIsEditingSocials(true)}
                    className="flex flex-col items-center p-4 bg-white hover:bg-gray-50 shadow-sm rounded-xl border border-gray-100 border-dashed transition-all duration-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700"
                  >
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-50 mb-3 dark:bg-gray-700">
                      <FontAwesomeIcon
                        icon={faTwitter}
                        className="text-gray-400 text-2xl"
                      />
                    </div>
                    <span className="text-gray-400 font-medium text-sm">
                      Add Twitter
                    </span>
                  </button>
                )
              )}
            </div>

            {/* Only show edit button if not expert view and there's at least one social */}
            {!isExpertView &&
              (socials.linkedin ||
                socials.instagram ||
                socials.facebook ||
                socials.twitter) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={() => setIsEditingSocials(true)}
                >
                  <FontAwesomeIcon icon={faPen} />
                </Button>
              )}
          </>
        )}
      </Card>
    </div>
  );
};

export default ProfileDetails;
