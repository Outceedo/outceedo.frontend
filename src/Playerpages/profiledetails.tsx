import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faSave,
  faTimes,
  faTrash,
  faPlus,
  faUpload,
  faImage,
} from "@fortawesome/free-solid-svg-icons";
import { FaLinkedinIn, FaFacebookF, FaInstagram,FaTwitter } from "react-icons/fa";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface AchievementItem {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
}

interface PlayerData {
  id?: string;
  name?: string;
  aboutMe?: string;
  certificates?: AchievementItem[];
  awards?: AchievementItem[];
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

  // File input refs
  const certificateFileRefs = useRef<(HTMLInputElement | null)[]>([]);
  const awardFileRefs = useRef<(HTMLInputElement | null)[]>([]);

  // State for data
  const [aboutMe, setAboutMe] = useState(playerData.aboutMe || "");
  const [certificates, setCertificates] = useState<AchievementItem[]>(
    playerData.certificates || []
  );
  const [awards, setAwards] = useState<AchievementItem[]>(
    playerData.awards || []
  );
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

  // Update refs when certificates or awards change
  useEffect(() => {
    certificateFileRefs.current = certificates.map(() => null);
  }, [certificates.length]);

  useEffect(() => {
    awardFileRefs.current = awards.map(() => null);
  }, [awards.length]);

  // Format URL to ensure it has http/https
  const formatUrl = (url: string): string => {
    if (!url || url === "#") return "#";
    return url.startsWith("http") ? url : `https://${url}`;
  };

  // Save to localStorage functions
  const saveAboutMe = () => {
    localStorage.setItem("aboutMe", aboutMe);
    setIsEditingAbout(false);
  };

  const saveCertificates = () => {
    // Validate required fields
    const allValid = certificates.every((cert) => cert.title.trim() !== "");

    if (!allValid) {
      alert("All certificates must have a title.");
      return;
    }

    localStorage.setItem("certificates", JSON.stringify(certificates));
    setIsEditingCertificates(false);
  };

  const saveAwards = () => {
    // Validate required fields
    const allValid = awards.every((award) => award.title.trim() !== "");

    if (!allValid) {
      alert("All awards must have a title.");
      return;
    }

    localStorage.setItem("awards", JSON.stringify(awards));
    setIsEditingAwards(false);
  };

  const saveSocials = () => {
    // Format URLs before saving
    const formattedSocials = {
      linkedin: socials.linkedin ? formatUrl(socials.linkedin) : "",
      instagram: socials.instagram ? formatUrl(socials.instagram) : "",
      facebook: socials.facebook ? formatUrl(socials.facebook) : "",
      twitter: socials.twitter ? formatUrl(socials.twitter) : "",
    };

    setSocials(formattedSocials);
    localStorage.setItem("socials", JSON.stringify(formattedSocials));
    setIsEditingSocials(false);
  };

  // Handle certificates and awards
  const handleAddCertificate = () => {
    setCertificates([
      ...certificates,
      {
        id: `cert-${Date.now()}`,
        title: "",
        description: "",
      },
    ]);
  };

  const handleAddAward = () => {
    setAwards([
      ...awards,
      {
        id: `award-${Date.now()}`,
        title: "",
        description: "",
      },
    ]);
  };

  const handleCertificateChange = (
    index: number,
    field: keyof AchievementItem,
    value: string
  ) => {
    const newCertificates = [...certificates];
    newCertificates[index] = { ...newCertificates[index], [field]: value };
    setCertificates(newCertificates);
  };

  const handleAwardChange = (
    index: number,
    field: keyof AchievementItem,
    value: string
  ) => {
    const newAwards = [...awards];
    newAwards[index] = { ...newAwards[index], [field]: value };
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

  // Handle image upload for certificates and awards
  const handleCertificateImageUpload = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const newCertificates = [...certificates];
        newCertificates[index] = {
          ...newCertificates[index],
          imageUrl: event.target.result as string,
        };
        setCertificates(newCertificates);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAwardImageUpload = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const newAwards = [...awards];
        newAwards[index] = {
          ...newAwards[index],
          imageUrl: event.target.result as string,
        };
        setAwards(newAwards);
      }
    };
    reader.readAsDataURL(file);
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
            <div className="space-y-5">
              {certificates.map((cert, index) => (
                <div
                  key={cert.id || index}
                  className="border dark:border-gray-600 rounded-lg p-4 space-y-3 bg-gray-50 dark:bg-gray-800"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-gray-700 dark:text-gray-300">
                      Certificate #{index + 1}
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleRemoveCertificate(index)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={cert.title}
                      onChange={(e) =>
                        handleCertificateChange(index, "title", e.target.value)
                      }
                      placeholder="Certificate title"
                      className="w-full dark:bg-gray-700"
                      required
                    />
                  </div>


                  <input
  type="file"
  accept="image/*"
  className="hidden"
  ref={(el) => {
    certificateFileRefs.current[index] = el;
  }}
  onChange={(e) => handleCertificateImageUpload(index, e)}
/>

                  <div>
                    <Label className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Description (Optional)
                    </Label>
                    <Textarea
                      value={cert.description || ""}
                      onChange={(e) =>
                        handleCertificateChange(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      placeholder="Describe your certificate..."
                      className="w-full min-h-[80px] dark:bg-gray-700"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Image (Optional)
                    </Label>
                    <div className="flex flex-col space-y-2">
                    <input
                     type="file"
                      accept="image/*"
                      className="hidden"
                       ref={(el) => {
                        certificateFileRefs.current[index] = el;
                      }}
                     onChange={(e) => handleCertificateImageUpload(index, e)}
                     />


                      {cert.imageUrl ? (
                        <div className="relative">
                          <img
                            src={cert.imageUrl}
                            alt={cert.title || `Certificate ${index}`}
                            className="w-full h-40 object-cover rounded-md mb-2"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              certificateFileRefs.current[index]?.click()
                            }
                            className="mt-2"
                          >
                            <FontAwesomeIcon icon={faUpload} className="mr-2" />
                            Change Image
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() =>
                            certificateFileRefs.current[index]?.click()
                          }
                          className="flex items-center justify-center border-dashed w-full h-32"
                        >
                          <FontAwesomeIcon icon={faImage} className="mr-2" />
                          Upload Image
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={handleAddCertificate}
              >
                <FontAwesomeIcon icon={faPlus} className="mr-1" /> Add New
                Certificate
              </Button>

              <div className="flex justify-end space-x-2 mt-4">
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
              <div className="space-y-4">
                {certificates.length > 0 ? (
                  certificates.map((cert, index) => (
                    <div
                      key={cert.id || index}
                      className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm"
                    >
                      {cert.imageUrl && (
                        <div className="w-full h-32 overflow-hidden">
                          <img
                            src={cert.imageUrl}
                            alt={cert.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                          {cert.title}
                        </h4>
                        {cert.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {cert.description}
                          </p>
                        )}
                      </div>
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
            <div className="space-y-5">
              {awards.map((award, index) => (
                <div
                  key={award.id || index}
                  className="border dark:border-gray-600 rounded-lg p-4 space-y-3 bg-gray-50 dark:bg-gray-800"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-gray-700 dark:text-gray-300">
                      Award #{index + 1}
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleRemoveAward(index)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={award.title}
                      onChange={(e) =>
                        handleAwardChange(index, "title", e.target.value)
                      }
                      placeholder="Award title"
                      className="w-full dark:bg-gray-700"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Description (Optional)
                    </Label>
                    <Textarea
                      value={award.description || ""}
                      onChange={(e) =>
                        handleAwardChange(index, "description", e.target.value)
                      }
                      placeholder="Describe your award..."
                      className="w-full min-h-[80px] dark:bg-gray-700"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Image (Optional)
                    </Label>
                    <div className="flex flex-col space-y-2">
                    <input
                      type="file"
                       accept="image/*"
                      className="hidden"
                        ref={(el) => {
                       awardFileRefs.current[index] = el;
                      }}
                        onChange={(e) => handleAwardImageUpload(index, e)}
                       />


                      {award.imageUrl ? (
                        <div className="relative">
                          <img
                            src={award.imageUrl}
                            alt={award.title || `Award ${index}`}
                            className="w-full h-40 object-cover rounded-md mb-2"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              awardFileRefs.current[index]?.click()
                            }
                            className="mt-2"
                          >
                            <FontAwesomeIcon icon={faUpload} className="mr-2" />
                            Change Image
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => awardFileRefs.current[index]?.click()}
                          className="flex items-center justify-center border-dashed w-full h-32"
                        >
                          <FontAwesomeIcon icon={faImage} className="mr-2" />
                          Upload Image
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={handleAddAward}
              >
                <FontAwesomeIcon icon={faPlus} className="mr-1" /> Add New Award
              </Button>

              <div className="flex justify-end space-x-2 mt-4">
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
              <div className="space-y-4">
                {awards.length > 0 ? (
                  awards.map((award, index) => (
                    <div
                      key={award.id || index}
                      className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm"
                    >
                      {award.imageUrl && (
                        <div className="w-full h-32 overflow-hidden">
                          <img
                            src={award.imageUrl}
                            alt={award.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                          {award.title}
                        </h4>
                        {award.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {award.description}
                          </p>
                        )}
                      </div>
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
      <Card className="mt-4 relative border p-6 w-1/3 rounded-lg dark:bg-gray-700 dark:text-white">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Social Media
        </h3>

        {isEditingSocials ? (
          <div className="space-y-3">
            {/* LinkedIn */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
              <FaLinkedinIn size={20} />
              </div>
              <Input
                placeholder="LinkedIn URL (e.g. linkedin.com/in/username)"
                value={socials.linkedin}
                onChange={(e) => handleSocialChange("linkedin", e.target.value)}
                className="flex-1 dark:bg-gray-800"
              />
            </div>

            {/* Instagram */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-pink-50 dark:bg-pink-900/20">
              <FaInstagram size={20} />
              </div>
              <Input
                placeholder="Instagram URL (e.g. instagram.com/username)"
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
              <FaFacebookF size={20} />
              </div>
              <Input
                placeholder="Facebook URL (e.g. facebook.com/username)"
                value={socials.facebook}
                onChange={(e) => handleSocialChange("facebook", e.target.value)}
                className="flex-1 dark:bg-gray-800"
              />
            </div>

            {/* Twitter */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
         <FaTwitter size={20} />
              </div>
              <Input
                placeholder="Twitter URL (e.g. twitter.com/username)"
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
            <div className="flex gap-5">
              {/* LinkedIn */}
              {socials.linkedin ? (
                <a
                  href={formatUrl(socials.linkedin)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-800 text-2xl" >
          <FaLinkedinIn size={20} />
                          </a>
              ) : (
                !isExpertView && (
                  <button
                    onClick={() => setIsEditingSocials(true)}
                    className="flex flex-col items-center p-4 bg-white hover:bg-gray-50 shadow-sm rounded-xl border border-gray-100 border-dashed transition-all duration-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700"
                  >
                  <FaLinkedinIn size={20} />
                  </button>
                )
              )}

              {/* Instagram */}
              {socials.instagram ? (
                <a
                  href={formatUrl(socials.instagram)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-600 text-2xl" >
                <FaInstagram/>
                 </a>
              ) : (
                !isExpertView && (
                  <button
                    onClick={() => setIsEditingSocials(true)}
                    className="flex flex-col items-center p-4 bg-white hover:bg-gray-50 shadow-sm rounded-xl border border-gray-100 border-dashed transition-all duration-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700"
                  >
                      <FaInstagram 
                        className="text-gray-400 text-2xl"/>
                  </button>
                )
              )}

              {/* Facebook */}
              {socials.facebook ? (
                <a
                  href={formatUrl(socials.facebook)}
                  target="_blank"
                  rel="noopener noreferrer"
                className="text-blue-800 text-2xl" >
                   <FaFacebookF className="text-blue-800 text-2xl" />
              </a>
              ) : (
                !isExpertView && (
                  <button
                    onClick={() => setIsEditingSocials(true)}
                    className="flex flex-col items-center p-4 bg-white hover:bg-gray-50 shadow-sm rounded-xl border border-gray-100 border-dashed transition-all duration-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700"
                  >
                       <FaFacebookF className="text-gray-400 text-2xl" />
            </button>
                )
              )}
              {/* Twitter */}
              {socials.twitter ? (
                <a
                  href={formatUrl(socials.twitter)}
                  target="_blank"
                  rel="noopener noreferrer"
                   className="text-blue-500 text-2xl hover:text-blue-600 transition">
                 <FaTwitter />
                    </a>
              ) : (
                !isExpertView && (
                  <button
                    onClick={() => setIsEditingSocials(true)}
                    className="flex flex-col items-center p-4 bg-white hover:bg-gray-50 shadow-sm rounded-xl border border-gray-100 border-dashed transition-all duration-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700"
                  >
              <FaTwitter />
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
