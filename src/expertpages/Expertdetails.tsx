import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faSave,
  faTimes,
  faPlus,
  faTrash,
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

interface SocialLink {
  icon: any;
  link: string;
  platform: string;
}

const ExpertDetails: React.FC = () => {
  // About Me state
  const [aboutMe, setAboutMe] = useState(
    localStorage.getItem("aboutMe") ||
      "I am from London, UK. A passionate, versatile expert bringing years of experience to help players improve their skills and reach their potential."
  );
  const [isEditingAbout, setIsEditingAbout] = useState(false);

  // Skills state
  const [skills, setSkills] = useState<string[]>(
    JSON.parse(
      localStorage.getItem("expertSkills") ||
        JSON.stringify([
          "Leadership",
          "Tactical Analysis",
          "Team Management",
          "Fitness Training",
        ])
    )
  );
  const [tempSkills, setTempSkills] = useState<string[]>([...skills]);
  const [newSkill, setNewSkill] = useState("");
  const [isEditingSkills, setIsEditingSkills] = useState(false);

  // Social links state
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    {
      icon: <FontAwesomeIcon icon={faLinkedin} />,
      link: localStorage.getItem("expertLinkedIn") || "#",
      platform: "LinkedIn",
    },
    {
      icon: <FontAwesomeIcon icon={faInstagram} />,
      link: localStorage.getItem("expertInstagram") || "#",
      platform: "Instagram",
    },
    {
      icon: <FontAwesomeIcon icon={faFacebook} />,
      link: localStorage.getItem("expertFacebook") || "#",
      platform: "Facebook",
    },
    {
      icon: <FontAwesomeIcon icon={faTwitter} />,
      link: localStorage.getItem("expertTwitter") || "#",
      platform: "Twitter",
    },
  ]);
  const [tempSocialLinks, setTempSocialLinks] = useState<SocialLink[]>([
    ...socialLinks,
  ]);
  const [isEditingSocials, setIsEditingSocials] = useState(false);

  // Format URL to ensure it has http/https
  const formatUrl = (url: string): string => {
    if (url === "#") return "#";
    return url.startsWith("http") ? url : `https://${url}`;
  };

  // Save about me
  const handleSaveAboutMe = () => {
    localStorage.setItem("aboutMe", aboutMe);
    setIsEditingAbout(false);
  };

  // Cancel about me edit
  const cancelAboutMe = () => {
    setAboutMe(localStorage.getItem("aboutMe") || "");
    setIsEditingAbout(false);
  };

  // Skills Management
  const handleAddSkill = () => {
    if (newSkill.trim() && !tempSkills.includes(newSkill.trim())) {
      setTempSkills([...tempSkills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setTempSkills(tempSkills.filter((skill) => skill !== skillToRemove));
  };

  const handleSaveSkills = () => {
    setSkills([...tempSkills]);
    localStorage.setItem("expertSkills", JSON.stringify(tempSkills));
    setIsEditingSkills(false);
  };

  const cancelSkillsEdit = () => {
    setTempSkills([...skills]);
    setIsEditingSkills(false);
  };

  // Social Links Management
  const handleUpdateSocialLink = (index: number, value: string) => {
    const updatedLinks = [...tempSocialLinks];
    updatedLinks[index] = { ...updatedLinks[index], link: value };
    setTempSocialLinks(updatedLinks);
  };

  const handleSaveSocialLinks = () => {
    // Ensure links have proper protocol
    const formattedLinks = tempSocialLinks.map((link) => {
      if (link.link && link.link !== "#") {
        return { ...link, link: formatUrl(link.link) };
      }
      return link;
    });

    setSocialLinks([...formattedLinks]);
    localStorage.setItem("expertLinkedIn", formattedLinks[0].link);
    localStorage.setItem("expertInstagram", formattedLinks[1].link);
    localStorage.setItem("expertFacebook", formattedLinks[2].link);
    localStorage.setItem("expertTwitter", formattedLinks[3].link);
    setIsEditingSocials(false);
  };

  const cancelSocialsEdit = () => {
    setTempSocialLinks([...socialLinks]);
    setIsEditingSocials(false);
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
              <Button variant="outline" onClick={cancelAboutMe}>
                <FontAwesomeIcon icon={faTimes} className="mr-1" /> Cancel
              </Button>
              <Button
                variant="default"
                className="bg-red-600 hover:bg-red-700"
                onClick={handleSaveAboutMe}
              >
                <FontAwesomeIcon icon={faSave} className="mr-1" /> Save
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-700 dark:text-gray-300">{aboutMe}</p>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={() => setIsEditingAbout(true)}
            >
              <FontAwesomeIcon icon={faPen} />
            </Button>
          </>
        )}
      </Card>

      {/* Skills & Socials in 2 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skills Section */}
        <Card className="p-6 shadow-sm dark:bg-gray-700 relative">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Skills
          </h3>

          {isEditingSkills ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add new skill"
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddSkill();
                  }}
                />
                <Button
                  variant="default"
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handleAddSkill}
                >
                  <FontAwesomeIcon icon={faPlus} />
                </Button>
              </div>

              <div className="space-y-2 mt-4">
                {tempSkills.map((skill, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 dark:bg-gray-600 p-2 rounded-md"
                  >
                    <span className="text-gray-700 dark:text-gray-200">
                      {skill}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleRemoveSkill(skill)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={cancelSkillsEdit}>
                  <FontAwesomeIcon icon={faTimes} className="mr-1" /> Cancel
                </Button>
                <Button
                  variant="default"
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handleSaveSkills}
                >
                  <FontAwesomeIcon icon={faSave} className="mr-1" /> Save
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-600 rounded-full text-sm text-gray-700 dark:text-gray-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => setIsEditingSkills(true)}
              >
                <FontAwesomeIcon icon={faPen} />
              </Button>
            </>
          )}
        </Card>

        {/* Social Media Links - Matching Player Profile */}
        <Card className="p-6 shadow-sm dark:bg-gray-700 relative">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
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
                  placeholder="LinkedIn URL (e.g. linkedin.com/in/username)"
                  value={
                    tempSocialLinks[0].link === "#"
                      ? ""
                      : tempSocialLinks[0].link
                  }
                  onChange={(e) =>
                    handleUpdateSocialLink(0, e.target.value || "#")
                  }
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
                  placeholder="Instagram URL (e.g. instagram.com/username)"
                  value={
                    tempSocialLinks[1].link === "#"
                      ? ""
                      : tempSocialLinks[1].link
                  }
                  onChange={(e) =>
                    handleUpdateSocialLink(1, e.target.value || "#")
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
                  placeholder="Facebook URL (e.g. facebook.com/username)"
                  value={
                    tempSocialLinks[2].link === "#"
                      ? ""
                      : tempSocialLinks[2].link
                  }
                  onChange={(e) =>
                    handleUpdateSocialLink(2, e.target.value || "#")
                  }
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
                  placeholder="Twitter URL (e.g. twitter.com/username)"
                  value={
                    tempSocialLinks[3].link === "#"
                      ? ""
                      : tempSocialLinks[3].link
                  }
                  onChange={(e) =>
                    handleUpdateSocialLink(3, e.target.value || "#")
                  }
                  className="flex-1 dark:bg-gray-800"
                />
              </div>

              <div className="flex justify-end space-x-2 mt-3">
                <Button variant="outline" onClick={cancelSocialsEdit}>
                  <FontAwesomeIcon icon={faTimes} className="mr-1" /> Cancel
                </Button>
                <Button
                  variant="default"
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handleSaveSocialLinks}
                >
                  <FontAwesomeIcon icon={faSave} className="mr-1" /> Save
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* LinkedIn */}
                {socialLinks[0].link && socialLinks[0].link !== "#" ? (
                  <a
                    href={formatUrl(socialLinks[0].link)}
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
                )}

                {/* Instagram */}
                {socialLinks[1].link && socialLinks[1].link !== "#" ? (
                  <a
                    href={formatUrl(socialLinks[1].link)}
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
                )}

                {/* Facebook */}
                {socialLinks[2].link && socialLinks[2].link !== "#" ? (
                  <a
                    href={formatUrl(socialLinks[2].link)}
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
                )}

                {/* Twitter */}
                {socialLinks[3].link && socialLinks[3].link !== "#" ? (
                  <a
                    href={formatUrl(socialLinks[3].link)}
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
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => setIsEditingSocials(true)}
              >
                <FontAwesomeIcon icon={faPen} />
              </Button>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ExpertDetails;
