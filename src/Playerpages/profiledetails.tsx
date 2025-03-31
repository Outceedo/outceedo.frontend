import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen,faTrash  } from "@fortawesome/free-solid-svg-icons";
import { faLinkedin, faInstagram, faFacebook, faTwitter } from "@fortawesome/free-brands-svg-icons";
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
  const [expanded, setExpanded] = useState(false);
  const [socials, setSocials] = useState({
    linkedin: "",
    instagram: "",
    facebook: "",
    twitter: "",
  });
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingCertificates, setIsEditingCertificates] = useState(false);
  const [isEditingAwards, setIsEditingAwards] = useState(false);
  const [isEditingSocials, setIsEditingSocials] = useState(false);

  useEffect(() => {
    const savedCertificates = localStorage.getItem("certificates");
    const savedAwards = localStorage.getItem("awards");
    const savedSocials = localStorage.getItem("socialLinks");
    if (savedCertificates) setCertificates(JSON.parse(savedCertificates));
    if (savedAwards) setAwards(JSON.parse(savedAwards));
    if (savedSocials) setSocials(JSON.parse(savedSocials));
  }, []);

  const saveAboutMe = () => {
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

  const saveSocialLinks = () => {
    localStorage.setItem("socialLinks", JSON.stringify(socials));
    setIsEditingSocials(false);
  }; 

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const updated = [...certificates];
      updated[index].image = reader.result as string;
      setCertificates(updated);
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = (index: number) => {
    const updated = [...certificates];
    updated.splice(index, 1);
    setCertificates(updated);
  };
  
  const handleAwardImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onloadend = () => {
      const updated = [...awards];
      updated[index].image = reader.result as string;
      setAwards(updated);
    };
    reader.readAsDataURL(file);
  };
  
  const handleDeleteAward = (index: number) => {
    const updated = [...awards];
    updated.splice(index, 1);
    setAwards(updated);
  };
  

  return (
    <div className="p-4 w-full space-y-6">
      {/* About Me Section */}
      <Card className="relative p-4 dark:bg-gray-700 dark:text-white">
        <h3 className="text-lg font-semibold">About Me</h3>
        {isEditing ? (
          <div className="space-y-2 mt-2">
            <Textarea
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value)}
              className="dark:bg-gray-600 min-h-[120px]"
            />
            <Button onClick={saveAboutMe}>Save</Button>
          </div>
        ) : (
          <>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              {aboutMe.length > 180 && !expanded ? `${aboutMe.slice(0, 180)}...` : aboutMe}
            </p>
            {aboutMe.length > 180 && (
              <button
                className="text-sm text-blue-600 mt-1 hover:underline"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? "Read less" : "Read more"}
              </button>
            )}
          </>
        )}
        <FontAwesomeIcon
          icon={faPen}
          className="absolute top-2 right-2 text-gray-500 dark:text-gray-300 cursor-pointer"
          onClick={() => setIsEditing(true)}
        />
      </Card>

      {/* Certificates & Awards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Certificates edit and delete */}
        <Card className="relative p-4 dark:bg-gray-700 dark:text-white flex flex-col justify-between">
      <h3 className="text-lg font-semibold mb-2">Certificates</h3>
      {isEditingCertificates ? (
        <div className="space-y-4">
          {certificates.map((cert, index) => (
            <div key={index} className="flex items-start gap-4">
              <input
                type="text"
                className="p-2 border rounded w-full dark:bg-gray-600"
                value={cert.name}
                onChange={(e) => {
                  const updated = [...certificates];
                  updated[index].name = e.target.value;
                  setCertificates(updated);
                }}
              />
              <div className="flex flex-col items-center gap-2">
                {cert.image ? (
                  <img
                    src={cert.image}
                    alt="cert"
                    className="w-16 h-16 object-cover rounded border"
                  />
                ) : (
                  <label className="text-xs text-blue-600 cursor-pointer">
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, index)}
                      className="hidden"
                    />
                  </label>
                )}
                <FontAwesomeIcon
                  icon={faTrash}
                  className="text-red-500 cursor-pointer text-sm"
                  onClick={() => handleDelete(index)}
                />
              </div>
            </div>
          ))}
          <Button onClick={saveCertificates} className="bg-red-600 text-white mt-2">
            Save
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {certificates.map((cert, index) => (
            <div
              key={index}
              className="flex justify-between items-center bg-gray-200 dark:bg-gray-600 rounded p-2"
            >
              <span>{cert.name}</span>
              {cert.image && (
                <img
                  src={cert.image}
                  alt="cert"
                  className="w-10 h-10 object-cover rounded border"
                />
              )}
            </div>
          ))}
          <FontAwesomeIcon
            icon={faPen}
            className="absolute top-2 right-2 text-gray-500 dark:text-gray-300 cursor-pointer"
            onClick={() => setIsEditingCertificates(true)}
          />
        </div>
      )}
    </Card>
        {/* Awards edit and delete */}
     <Card className="relative p-4 dark:bg-gray-700 dark:text-white flex flex-col justify-between">
  <h3 className="text-lg font-semibold mb-2">Awards</h3>
  {isEditingAwards ? (
    <div className="space-y-4">
      {awards.map((award, index) => (
        <div key={index} className="flex items-start gap-4">
          <input
            type="text"
            className="p-2 border rounded w-full dark:bg-gray-600"
            value={award.name}
            onChange={(e) => {
              const updated = [...awards];
              updated[index].name = e.target.value;
              setAwards(updated);
            }}
          />
          <div className="flex flex-col items-center gap-2">
            {award.image ? (
              <img
                src={award.image}
                alt="award"
                className="w-16 h-16 object-cover rounded border"
              />
            ) : (
              <label className="text-xs text-blue-600 cursor-pointer">
                Upload
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleAwardImageUpload(e, index)}
                  className="hidden"
                />
              </label>
            )}
            <FontAwesomeIcon
              icon={faTrash}
              className="text-red-500 cursor-pointer text-sm"
              onClick={() => handleDeleteAward(index)}
            />
          </div>
        </div>
      ))}
      <Button onClick={saveAwards} className="bg-red-600 text-white mt-2">
        Save
      </Button>
    </div>
  ) : (
    <div className="space-y-2">
      {awards.map((award, index) => (
        <div
          key={index}
          className="flex justify-between items-center bg-gray-200 dark:bg-gray-600 rounded p-2"
        >
          <span>{award.name}</span>
          {award.image && (
            <img
              src={award.image}
              alt="award"
              className="w-10 h-10 object-cover rounded border"
            />
          )}
        </div>
      ))}
      <FontAwesomeIcon
        icon={faPen}
        className="absolute top-2 right-2 text-gray-500 dark:text-gray-300 cursor-pointer"
        onClick={() => setIsEditingAwards(true)}
      />
    </div>
  )}
</Card>

      </div>

      {/* Social Icons where they can edit the link */}
      <Card className="p-4 dark:bg-gray-700 w-fit dark:text-white relative">
      <h3 className="text-lg font-Raleway font-semibold mb-2">Socials</h3>

      {isEditingSocials ? (
        <div className="space-y-3">
          <Input
            placeholder="LinkedIn URL"
            value={socials.linkedin}
            onChange={(e) => setSocials({ ...socials, linkedin: e.target.value })}
          />
          <Input
            placeholder="Instagram URL"
            value={socials.instagram}
            onChange={(e) => setSocials({ ...socials, instagram: e.target.value })}
          />
          <Input
            placeholder="Facebook URL"
            value={socials.facebook}
            onChange={(e) => setSocials({ ...socials, facebook: e.target.value })}
          />
          <Input
            placeholder="Twitter URL"
            value={socials.twitter}
            onChange={(e) => setSocials({ ...socials, twitter: e.target.value })}
          />
          <Button
            className="mt-2 bg-red-600 hover:bg-red-500 text-white"
            onClick={saveSocialLinks}  >
            Save
          </Button>
        </div>
      ) : (
        <div className="flex space-x-6 mt-3">
          {socials.linkedin && (
            <a href={socials.linkedin} target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faLinkedin} className="text-blue-600 text-3xl" />
            </a>
          )}
          {socials.instagram && (
            <a href={socials.instagram} target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faInstagram} className="text-pink-600 text-3xl" />
            </a>
          )}
          {socials.facebook && (
            <a href={socials.facebook} target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faFacebook} className="text-blue-800 text-3xl" />
            </a>
          )}
          {socials.twitter && (
            <a href={socials.twitter} target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faTwitter} className="text-blue-600 text-3xl" />
            </a>
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
