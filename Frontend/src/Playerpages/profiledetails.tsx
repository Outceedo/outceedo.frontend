import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import { faLinkedin, faInstagram, faFacebook, faTwitter } from "@fortawesome/free-brands-svg-icons";

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

  useEffect(() => {
    const savedCertificates = localStorage.getItem("certificates");
    const savedAwards = localStorage.getItem("awards");
    if (savedCertificates) setCertificates(JSON.parse(savedCertificates));
    if (savedAwards) setAwards(JSON.parse(savedAwards));
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

  return (
    <div className="p-6">
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
      <div className="mt-4 relative border p-4 rounded-lg dark:bg-gray-700 dark:text-white">
        <h3 className="text-lg font-Raleway font-semibold">Socials</h3>
        <div className="flex space-x-4 mt-2">
          <FontAwesomeIcon icon={faLinkedin} className="text-blue-600 text-3xl cursor-pointer" />
          <FontAwesomeIcon icon={faInstagram} className="text-pink-600 text-3xl cursor-pointer" />
          <FontAwesomeIcon icon={faFacebook} className="text-blue-800 text-3xl cursor-pointer" />
          <FontAwesomeIcon icon={faTwitter} className="text-blue-600 text-3xl cursor-pointer" />
        </div>
      </div>
    </div>
  );
};

export default ProfileDetails;



