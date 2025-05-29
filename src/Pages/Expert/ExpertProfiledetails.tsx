import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";

interface Certificate {
  id: string;
  title: string;
  issuedBy?: string;
  issuedDate?: string;
  imageUrl?: string;
  type: string;
  description?: string;
}
interface ExpertProfileDetailsProps {
  expertData: any;
}

const ExpertProfiledetails: React.FC<ExpertProfileDetailsProps> = ({
  expertData,
}) => {
  const [readMore, setReadMore] = useState(false);
  const [selectedCertificate, setSelectedCertificate] =
    useState<Certificate | null>(null);
  const [isCertificatePreviewOpen, setIsCertificatePreviewOpen] =
    useState(false);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return dateString;
    }
  };

  const handleCertificateClick = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setIsCertificatePreviewOpen(true);
  };
  const [showButton, setShowButton] = useState(false);
  useEffect(() => {
    const charThreshold = 150;
    setShowButton(expertData.about?.length > charThreshold);
  }, [expertData.about]);
  return (
    <div className="space-y-8">
      {/* About Me Card */}
      <Card className="p-6 relative">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">About Me</h2>
        </div>
        <div className="relative">
          <p
            className={cn(
              "text-gray-700 dark:text-gray-300",
              !readMore && "line-clamp-3"
            )}
            style={{ whiteSpace: "pre-line" }}
          >
            {expertData.about}
          </p>
          {showButton && (
            <Button
              variant="link"
              className="p-0 text-blue-600 hover:underline mt-2 text-center w-full"
              onClick={() => setReadMore(!readMore)}
            >
              {readMore ? "Show less" : "Read more"}
            </Button>
          )}
        </div>
      </Card>
      <Card className="p-6 relative">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-xl font-bold">Skills</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {expertData.skills && expertData.skills.length > 0 ? (
            expertData.skills.map((skill: string, index: number) => (
              <span
                key={index}
                className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-full text-gray-800 dark:text-gray-200"
              >
                {skill}
              </span>
            ))
          ) : (
            <p className="text-gray-500">No skills available</p>
          )}
        </div>
      </Card>

      {/* Certificates & Awards Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Certificates Section */}
        <Card className="p-6 relative">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-bold">Certifications</h2>
          </div>
          <div className="space-y-3">
            {expertData.certificates && expertData.certificates.length > 0 ? (
              expertData.certificates.map((cert: Certificate) => (
                <div
                  key={cert.id}
                  className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden cursor-pointer"
                  onClick={() => handleCertificateClick(cert)}
                >
                  {/* Image thumbnail if available */}
                  {cert.imageUrl && (
                    <div className="w-16 h-16 flex-shrink-0">
                      <img
                        src={cert.imageUrl}
                        alt={cert.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Certificate details */}
                  <div className="p-3 flex-1">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                      {cert.title}
                    </h4>
                    {cert.issuedBy && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Issued by: {cert.issuedBy}
                        {cert.issuedDate && ` (${formatDate(cert.issuedDate)})`}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No certifications available</p>
            )}
          </div>
        </Card>

        {/* Awards Section */}
        <Card className="p-6 relative">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-bold">Awards</h2>
          </div>
          <div className="space-y-3">
            {expertData.awards && expertData.awards.length > 0 ? (
              expertData.awards.map((award: Certificate) => (
                <div
                  key={award.id}
                  className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden cursor-pointer"
                  onClick={() => handleCertificateClick(award)}
                >
                  {/* Image thumbnail if available */}
                  {award.imageUrl && (
                    <div className="w-16 h-16 flex-shrink-0">
                      <img
                        src={award.imageUrl}
                        alt={award.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Award details */}
                  <div className="p-3 flex-1">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                      {award.title}
                    </h4>
                    {award.issuedBy && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Issued by: {award.issuedBy}
                        {award.issuedDate &&
                          ` (${formatDate(award.issuedDate)})`}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No awards available</p>
            )}
          </div>
        </Card>
      </div>
      {selectedCertificate && isCertificatePreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-11/12 max-w-3xl p-4 relative">
            <button
              onClick={() => setIsCertificatePreviewOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl"
            >
              ✕
            </button>
            <h3 className="text-xl font-semibold mb-2 text-center">
              {selectedCertificate.title}
            </h3>

            {selectedCertificate.issuedBy && (
              <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
                Issued by: {selectedCertificate.issuedBy}
                {selectedCertificate.issuedDate &&
                  ` • ${formatDate(selectedCertificate.issuedDate)}`}
              </p>
            )}

            {selectedCertificate.imageUrl ? (
              <img
                src={selectedCertificate.imageUrl}
                alt={selectedCertificate.title}
                className="max-w-full max-h-[60vh] mx-auto object-contain border border-gray-200 dark:border-gray-700 rounded-lg"
              />
            ) : (
              <div className="flex items-center justify-center h-60 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-400 dark:text-gray-500">
                  No image available
                </p>
              </div>
            )}

            {selectedCertificate.description && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                  Description
                </h4>
                <p className="text-gray-700 dark:text-gray-300">
                  {selectedCertificate.description}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpertProfiledetails;
