import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faImage,
  faFilePdf,
  faEdit,
  faEye,
  faShareAlt,
  faStar as faStarSolid,
  faStarHalfAlt,
  faMapMarkerAlt,
  faCertificate,
  faAward,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { faStar as farStar } from "@fortawesome/free-regular-svg-icons";
import {
  faXTwitter,
  faFacebook,
  faLinkedin,
} from "@fortawesome/free-brands-svg-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import html2canvas from "html2canvas";
import {
  pdf,
  Document as PDFDocument,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import logo from "@/assets/images/outceedologo.png";
import businesscard from "@/assets/images/businesscard.png";

interface ExpertDataType {
  id?: string;
  name: string;
  profession?: string;
  location: string;
  certificationLevel: string;
  profileImage?: string;
  documents?: Array<{ type?: string; title?: string; [key: string]: unknown }>;
  reviewsReceived?: Array<{ rating?: number; [key: string]: unknown }>;
  [key: string]: unknown;
}

interface BusinessCardProps {
  expertData: ExpertDataType;
}

// Star Rating Component
const StarRating: React.FC<{ avg: number; total?: number; size?: string }> = ({
  avg,
  total = 5,
  size = "text-sm",
}) => {
  const fullStars = Math.floor(avg);
  const hasHalfStar = avg - fullStars >= 0.25 && avg - fullStars < 0.75;
  const emptyStars = total - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <span className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <FontAwesomeIcon
          key={`full-${i}`}
          icon={faStarSolid}
          className={`text-yellow-400 ${size}`}
        />
      ))}
      {hasHalfStar && (
        <FontAwesomeIcon
          icon={faStarHalfAlt}
          className={`text-yellow-400 ${size}`}
        />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <FontAwesomeIcon
          key={`empty-${i}`}
          icon={farStar}
          className={`text-yellow-400 ${size}`}
        />
      ))}
    </span>
  );
};

// PDF Styles
const pdfStyles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#1a1a2e",
    padding: 0,
  },
  card: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  content: {
    flex: 1,
    padding: 24,
    position: "relative",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    height: 24,
    objectFit: "contain",
  },
  verifiedBadge: {
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#dc2626",
  },
  profileSection: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  profileImageContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#ffffff",
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#ffffff",
  },
  profileImage: {
    width: 90,
    height: 90,
  },
  profileInitial: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#ffffff",
  },
  initialText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#6b7280",
  },
  ratingBadge: {
    backgroundColor: "#fbbf24",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    marginTop: -8,
  },
  ratingBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1f2937",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 8,
    textAlign: "center",
  },
  profession: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
    textAlign: "center",
  },
  tagsRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  tag: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  tagText: {
    fontSize: 9,
    color: "#ffffff",
  },
  credentialsBox: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 12,
    padding: 16,
    marginTop: "auto",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  credentialTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  certTag: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  certTagText: {
    fontSize: 8,
    color: "#1d4ed8",
  },
  awardTag: {
    backgroundColor: "#fffbeb",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  awardTagText: {
    fontSize: 8,
    color: "#b45309",
  },
  moreTag: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  moreTagText: {
    fontSize: 8,
    color: "#6b7280",
  },
  reviewsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  reviewsText: {
    fontSize: 9,
    color: "#6b7280",
  },
  footer: {
    alignItems: "center",
    marginTop: 12,
  },
  footerText: {
    fontSize: 10,
    color: "rgba(255,255,255,0.8)",
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 10,
  },
});

// PDF Document Component
const BusinessCardPDF: React.FC<{
  data: {
    name: string;
    profession: string;
    location: string;
    certificationLevel: string;
    certificates: string[];
    awards: string[];
    avgRating: number;
    totalReviews: number;
    profileImage: string;
  };
}> = ({ data }) => (
  <PDFDocument>
    <Page size={[350, 600]} style={pdfStyles.page}>
      <View style={pdfStyles.card}>
        {/* Background */}
        <Image src={businesscard} style={pdfStyles.backgroundImage} />
        <View style={pdfStyles.overlay} />

        {/* Content */}
        <View style={pdfStyles.content}>
          {/* Top Row - Logo & Badge */}
          <View style={pdfStyles.topRow}>
            <Image src={logo} style={pdfStyles.logo} />
            <View style={pdfStyles.verifiedBadge}>
              <Text style={pdfStyles.verifiedText}>Verified Expert</Text>
            </View>
          </View>

          {/* Profile Section */}
          <View style={pdfStyles.profileSection}>
            {data.profileImage ? (
              <View style={pdfStyles.profileImageContainer}>
                <Image src={data.profileImage} style={pdfStyles.profileImage} />
              </View>
            ) : (
              <View style={pdfStyles.profileInitial}>
                <Text style={pdfStyles.initialText}>
                  {data.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}

            {data.avgRating > 0 && (
              <View style={pdfStyles.ratingBadge}>
                <Text style={pdfStyles.ratingBadgeText}>
                  {data.avgRating.toFixed(1)}
                </Text>
              </View>
            )}

            <Text style={pdfStyles.name}>{data.name}</Text>
            {data.profession && (
              <Text style={pdfStyles.profession}>{data.profession}</Text>
            )}

            {/* Location & Certification Tags */}
            <View style={pdfStyles.tagsRow}>
              {data.location && (
                <View style={pdfStyles.tag}>
                  <Text style={pdfStyles.tagText}>{data.location}</Text>
                </View>
              )}
              {data.certificationLevel && data.certificationLevel !== "N/A" && (
                <View style={pdfStyles.tag}>
                  <Text style={pdfStyles.tagText}>
                    {data.certificationLevel}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Credentials Box */}
          <View style={pdfStyles.credentialsBox}>
            {/* Certificates */}
            {data.certificates.length > 0 && (
              <View style={{ marginBottom: 10 }}>
                <View style={pdfStyles.sectionHeader}>
                  <Text style={pdfStyles.sectionTitle}>Certificates</Text>
                </View>
                <View style={pdfStyles.credentialTags}>
                  {data.certificates.slice(0, 3).map((cert, index) => (
                    <View key={index} style={pdfStyles.certTag}>
                      <Text style={pdfStyles.certTagText}>{cert}</Text>
                    </View>
                  ))}
                  {data.certificates.length > 3 && (
                    <View style={pdfStyles.moreTag}>
                      <Text style={pdfStyles.moreTagText}>
                        +{data.certificates.length - 3}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Awards */}
            {data.awards.length > 0 && (
              <View>
                <View style={pdfStyles.sectionHeader}>
                  <Text style={pdfStyles.sectionTitle}>Awards</Text>
                </View>
                <View style={pdfStyles.credentialTags}>
                  {data.awards.slice(0, 3).map((award, index) => (
                    <View key={index} style={pdfStyles.awardTag}>
                      <Text style={pdfStyles.awardTagText}>{award}</Text>
                    </View>
                  ))}
                  {data.awards.length > 3 && (
                    <View style={pdfStyles.moreTag}>
                      <Text style={pdfStyles.moreTagText}>
                        +{data.awards.length - 3}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Reviews */}
            {data.totalReviews > 0 && (
              <View style={pdfStyles.reviewsRow}>
                <Text style={pdfStyles.reviewsText}>
                  {data.avgRating.toFixed(1)} / 5.0 ({data.totalReviews}{" "}
                  reviews)
                </Text>
              </View>
            )}
          </View>

          {/* Footer */}
          <View style={pdfStyles.footer}>
            <Text style={pdfStyles.footerText}>outceedo.com</Text>
          </View>
        </View>
      </View>
    </Page>
  </PDFDocument>
);

const BusinessCard: React.FC<BusinessCardProps> = ({ expertData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Extract certificates and awards from documents
  const certificates =
    expertData.documents
      ?.filter((doc) => doc.type === "certificate")
      .map((cert) => cert.title)
      .filter((title): title is string => title !== undefined) || [];

  const awards =
    expertData.documents
      ?.filter((doc) => doc.type === "award")
      .map((award) => award.title)
      .filter((title): title is string => title !== undefined) || [];

  // Calculate average rating
  const reviewsArray = expertData.reviewsReceived || [];
  const totalReviews = reviewsArray.length;
  const avgRating =
    totalReviews === 0
      ? 0
      : reviewsArray.reduce((sum, r) => sum + (r.rating || 0), 0) /
        totalReviews;

  // Editable card data
  const [cardData, setCardData] = useState({
    name: expertData.name,
    profession: expertData.profession || "",
    location: expertData.location,
    certificationLevel: expertData.certificationLevel,
    certificates: certificates,
    awards: awards,
    avgRating: avgRating,
    totalReviews: totalReviews,
    profileImage: expertData.profileImage || "",
    showCertificates: true,
    showAwards: true,
    showRating: true,
  });

  // Update card data when expertData changes
  useEffect(() => {
    const newCertificates =
      expertData.documents
        ?.filter((doc) => doc.type === "certificate")
        .map((cert) => cert.title)
        .filter((title): title is string => title !== undefined) || [];

    const newAwards =
      expertData.documents
        ?.filter((doc) => doc.type === "award")
        .map((award) => award.title)
        .filter((title): title is string => title !== undefined) || [];

    const newReviewsArray = expertData.reviewsReceived || [];
    const newTotalReviews = newReviewsArray.length;
    const newAvgRating =
      newTotalReviews === 0
        ? 0
        : newReviewsArray.reduce((sum, r) => sum + (r.rating || 0), 0) /
          newTotalReviews;

    setCardData((prev) => ({
      ...prev,
      name: expertData.name,
      profession: expertData.profession || "",
      location: expertData.location,
      certificationLevel: expertData.certificationLevel,
      certificates: newCertificates,
      awards: newAwards,
      avgRating: newAvgRating,
      totalReviews: newTotalReviews,
      profileImage: expertData.profileImage || "",
    }));
  }, [expertData]);

  // Hidden ref for PNG download (uses inline styles to avoid oklch)
  const hiddenPngRef = useRef<HTMLDivElement>(null);

  // Download as PNG using hidden element with inline styles
  const downloadAsPNG = async () => {
    if (!hiddenPngRef.current) return;
    setIsExporting(true);

    try {
      const canvas = await html2canvas(hiddenPngRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#1a1a2e",
        logging: false,
        imageTimeout: 15000,
      });

      canvas.toBlob(
        (blob) => {
          if (blob) {
            saveAs(
              blob,
              `${cardData.name.replace(/\s+/g, "_")}_business_card.png`,
            );
          }
        },
        "image/png",
        1.0,
      );
    } catch (error) {
      console.error("Error generating PNG:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // Inline styles for hidden PNG element (avoids oklch color issues)
  const pngStyles = {
    container: {
      position: "fixed" as const,
      left: "-9999px",
      width: "350px",
      height: "600px",
      borderRadius: "16px",
      overflow: "hidden",
      zIndex: -1,
      fontFamily: "system-ui, -apple-system, sans-serif",
    },
    backgroundImage: {
      position: "absolute" as const,
      inset: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover" as const,
    },
    overlay: {
      position: "absolute" as const,
      inset: 0,
      background: "linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.2), rgba(0,0,0,0.5))",
    },
    content: {
      position: "relative" as const,
      height: "100%",
      display: "flex",
      flexDirection: "column" as const,
      padding: "24px",
    },
    topRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    logo: {
      height: "32px",
      objectFit: "contain" as const,
    },
    verifiedBadge: {
      backgroundColor: "#ffffff",
      padding: "4px 12px",
      borderRadius: "9999px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
    verifiedText: {
      fontSize: "12px",
      fontWeight: "700",
      color: "#dc2626",
    },
    profileSection: {
      flex: 1,
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center" as const,
      marginTop: "16px",
    },
    profileImageWrapper: {
      position: "relative" as const,
      marginBottom: "16px",
    },
    profileImage: {
      width: "112px",
      height: "112px",
      borderRadius: "9999px",
      border: "4px solid #ffffff",
      boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
      objectFit: "cover" as const,
      backgroundColor: "#e5e7eb",
    },
    profileInitial: {
      width: "112px",
      height: "112px",
      borderRadius: "9999px",
      border: "4px solid #ffffff",
      boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
      background: "linear-gradient(135deg, #f87171, #dc2626)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    initialText: {
      fontSize: "36px",
      fontWeight: "700",
      color: "#ffffff",
    },
    ratingBadge: {
      position: "absolute" as const,
      bottom: "-8px",
      left: "50%",
      transform: "translateX(-50%)",
      backgroundColor: "#facc15",
      color: "#111827",
      padding: "4px 12px",
      borderRadius: "9999px",
      display: "flex",
      alignItems: "center",
      gap: "4px",
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    },
    ratingText: {
      fontSize: "12px",
      fontWeight: "700",
    },
    name: {
      fontSize: "24px",
      fontWeight: "700",
      color: "#ffffff",
      textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
      margin: 0,
    },
    profession: {
      color: "#ffffff",
      fontSize: "14px",
      marginTop: "4px",
      fontWeight: "600",
      textShadow: "1px 1px 3px rgba(0,0,0,0.8)",
    },
    tagsRow: {
      display: "flex",
      flexWrap: "wrap" as const,
      justifyContent: "center",
      gap: "12px",
      marginTop: "16px",
    },
    tag: {
      backgroundColor: "rgba(0,0,0,0.4)",
      padding: "6px 12px",
      borderRadius: "9999px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      border: "1px solid rgba(255,255,255,0.3)",
    },
    tagText: {
      color: "#ffffff",
      fontSize: "12px",
      fontWeight: "600",
    },
    credentialsBox: {
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      padding: "16px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    },
    sectionHeader: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginBottom: "8px",
    },
    sectionTitle: {
      fontSize: "11px",
      fontWeight: "700",
      color: "#1f2937",
      textTransform: "uppercase" as const,
      letterSpacing: "0.5px",
    },
    credentialTags: {
      display: "flex",
      flexWrap: "wrap" as const,
      gap: "4px",
    },
    certTag: {
      fontSize: "11px",
      backgroundColor: "#dbeafe",
      color: "#1e40af",
      padding: "4px 8px",
      borderRadius: "6px",
      fontWeight: "500",
    },
    awardTag: {
      fontSize: "11px",
      backgroundColor: "#fef3c7",
      color: "#92400e",
      padding: "4px 8px",
      borderRadius: "6px",
      fontWeight: "500",
    },
    moreTag: {
      fontSize: "11px",
      backgroundColor: "#e5e7eb",
      color: "#4b5563",
      padding: "4px 8px",
      borderRadius: "6px",
      fontWeight: "500",
    },
    footer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      marginTop: "12px",
    },
    footerText: {
      color: "#ffffff",
      fontSize: "14px",
      fontWeight: "600",
      letterSpacing: "1px",
      textShadow: "1px 1px 3px rgba(0,0,0,0.8)",
    },
    divider: {
      height: "1px",
      backgroundColor: "#e5e7eb",
      margin: "8px 0",
    },
    iconWhite: {
      color: "#ffffff",
      fontSize: "12px",
    },
    iconBlue: {
      color: "#2563eb",
      fontSize: "14px",
    },
    iconAmber: {
      color: "#f59e0b",
      fontSize: "14px",
    },
    iconYellow: {
      color: "#facc15",
      fontSize: "12px",
    },
  };

  // Convert image URL to base64
  const imageToBase64 = async (url: string): Promise<string> => {
    try {
      const response = await fetch(url, { mode: 'cors' });
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch {
      return "";
    }
  };

  // Download as PDF
  const downloadAsPDF = async () => {
    setIsExporting(true);

    try {
      // Convert profile image to base64 for PDF
      let profileImageBase64 = "";
      if (cardData.profileImage) {
        profileImageBase64 = await imageToBase64(cardData.profileImage);
      }

      const pdfData = {
        ...cardData,
        profileImage: profileImageBase64,
      };

      const blob = await pdf(<BusinessCardPDF data={pdfData} />).toBlob();
      saveAs(blob, `${cardData.name.replace(/\s+/g, "_")}_business_card.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // Generate share URL with card info
  const generateShareText = () => {
    let text = `Check out ${cardData.name}'s profile on Outceedo!`;
    if (cardData.profession) text += ` | ${cardData.profession}`;
    if (cardData.location) text += ` | ${cardData.location}`;
    if (cardData.avgRating > 0)
      text += ` | ${cardData.avgRating.toFixed(1)}/5 rating`;
    return encodeURIComponent(text);
  };

  const shareUrl = encodeURIComponent(
    `${window.location.origin}/expert/${expertData.id}`,
  );

  // Share functions
  const shareOnTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${generateShareText()}&url=${shareUrl}`,
      "_blank",
    );
  };

  const shareOnFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${generateShareText()}`,
      "_blank",
    );
  };

  const shareOnLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
      "_blank",
    );
  };

  return (
    <div className="w-full">
      {/* Mode Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex gap-2">
          <Button
            onClick={() => setShowPreviewModal(true)}
            className={`flex items-center gap-2 ${
              !isEditing
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
            }`}
          >
            <FontAwesomeIcon icon={faEye} />
            Preview
          </Button>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 ${
              isEditing
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
            }`}
          >
            <FontAwesomeIcon icon={faEdit} />
            Edit
          </Button>
        </div>

        {/* Download & Share Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={downloadAsPNG}
            disabled={isExporting}
            className="flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faImage} />
            PNG
          </Button>
          <Button
            variant="outline"
            onClick={downloadAsPDF}
            disabled={isExporting}
            className="flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faFilePdf} />
            PDF
          </Button>

          <div className="flex items-center gap-1 ml-2">
            <span className="text-sm text-gray-500 mr-2">
              <FontAwesomeIcon icon={faShareAlt} />
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={shareOnTwitter}
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Share on X"
            >
              <FontAwesomeIcon icon={faXTwitter} className="text-black" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={shareOnFacebook}
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Share on Facebook"
            >
              <FontAwesomeIcon icon={faFacebook} className="text-blue-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={shareOnLinkedIn}
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Share on LinkedIn"
            >
              <FontAwesomeIcon icon={faLinkedin} className="text-blue-700" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Edit Panel */}
        {isEditing && (
          <div className="w-full lg:w-80 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-lg dark:text-white mb-4">
              Customize Business Card
            </h3>

            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={cardData.name}
                onChange={(e) =>
                  setCardData({ ...cardData, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profession">Profession</Label>
              <Input
                id="profession"
                value={cardData.profession}
                onChange={(e) =>
                  setCardData({ ...cardData, profession: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={cardData.location}
                onChange={(e) =>
                  setCardData({ ...cardData, location: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="certLevel">Certification Level</Label>
              <Input
                id="certLevel"
                value={cardData.certificationLevel}
                onChange={(e) =>
                  setCardData({
                    ...cardData,
                    certificationLevel: e.target.value,
                  })
                }
              />
            </div>

            <div className="pt-4 border-t space-y-3">
              <h4 className="font-medium text-sm dark:text-white">
                Show/Hide Sections
              </h4>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cardData.showCertificates}
                  onChange={(e) =>
                    setCardData({
                      ...cardData,
                      showCertificates: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300"
                />
                <span className="text-sm dark:text-gray-300">
                  Show Certificates
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cardData.showAwards}
                  onChange={(e) =>
                    setCardData({ ...cardData, showAwards: e.target.checked })
                  }
                  className="rounded border-gray-300"
                />
                <span className="text-sm dark:text-gray-300">Show Awards</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cardData.showRating}
                  onChange={(e) =>
                    setCardData({ ...cardData, showRating: e.target.checked })
                  }
                  className="rounded border-gray-300"
                />
                <span className="text-sm dark:text-gray-300">Show Rating</span>
              </label>
            </div>
          </div>
        )}

        {/* Business Card Preview */}
        <div className="flex-1 flex justify-center">
          <div
            ref={cardRef}
            data-card-ref="true"
            className="w-full max-w-md relative rounded-2xl shadow-2xl overflow-hidden"
            style={{ aspectRatio: "9/16", maxHeight: "600px" }}
          >
            {/* Background Image */}
            <img
              src={businesscard}
              alt="Business Card Background"
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Darker overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50" />

            {/* Card Content */}
            <div className="relative h-full flex flex-col p-6">
              {/* Top Section - Logo */}
              <div className="flex justify-between items-start">
                <img src={logo} alt="Outceedo" className="h-8 object-contain" />
                <div className="bg-white px-3 py-1 rounded-full shadow-md">
                  <span className="text-xs font-bold text-red-600">
                    Verified Expert
                  </span>
                </div>
              </div>

              {/* Middle Section - Profile */}
              <div className="flex-1 flex flex-col items-center justify-center text-center mt-4">
                {/* Profile Image */}
                <div className="relative mb-4">
                  {cardData.profileImage ? (
                    <img
                      src={cardData.profileImage}
                      alt={cardData.name}
                      className="w-28 h-28 rounded-full border-4 border-white shadow-xl object-cover bg-gray-200"
                      onError={(e) => {
                        // Fallback to initial if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const parent = target.parentElement;
                        if (parent) {
                          const fallback = document.createElement("div");
                          fallback.className =
                            "w-28 h-28 rounded-full border-4 border-white shadow-xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center";
                          fallback.innerHTML = `<span class="text-4xl font-bold text-white">${cardData.name.charAt(0).toUpperCase()}</span>`;
                          parent.insertBefore(fallback, target);
                        }
                      }}
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-full border-4 border-white shadow-xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                      <span className="text-4xl font-bold text-white">
                        {cardData.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  {/* Rating Badge */}
                  {cardData.showRating && cardData.avgRating > 0 && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                      <FontAwesomeIcon icon={faStarSolid} className="text-xs" />
                      <span className="text-xs font-bold">
                        {cardData.avgRating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Name & Profession - improved visibility */}
                <h2
                  className="text-2xl font-bold text-white"
                  style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
                >
                  {cardData.name}
                </h2>
                {cardData.profession && (
                  <p
                    className="text-white text-sm mt-1 font-semibold"
                    style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.8)" }}
                  >
                    {cardData.profession}
                  </p>
                )}

                {/* Location & Certification - improved visibility */}
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  {cardData.location && (
                    <div className="bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/30">
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        className="text-white text-xs"
                      />
                      <span className="text-white text-xs font-semibold">
                        {cardData.location}
                      </span>
                    </div>
                  )}
                  {cardData.certificationLevel &&
                    cardData.certificationLevel !== "N/A" && (
                      <div className="bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/30">
                        <FontAwesomeIcon
                          icon={faCertificate}
                          className="text-white text-xs"
                        />
                        <span className="text-white text-xs font-semibold">
                          {cardData.certificationLevel}
                        </span>
                      </div>
                    )}
                </div>
              </div>

              {/* Bottom Section - Credentials */}
              <div className="bg-white rounded-xl p-4 space-y-3 shadow-lg">
                {/* Certificates */}
                {cardData.showCertificates &&
                  cardData.certificates.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FontAwesomeIcon
                          icon={faCertificate}
                          className="text-blue-600 text-sm"
                        />
                        <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                          Certificates
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {cardData.certificates.slice(0, 3).map((cert, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-md truncate max-w-[140px] font-medium"
                          >
                            {cert}
                          </span>
                        ))}
                        {cardData.certificates.length > 3 && (
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-md font-medium">
                            +{cardData.certificates.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                {/* Awards */}
                {cardData.showAwards && cardData.awards.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FontAwesomeIcon
                        icon={faAward}
                        className="text-amber-500 text-sm"
                      />
                      <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                        Awards
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {cardData.awards.slice(0, 3).map((award, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-md truncate max-w-[140px] font-medium"
                        >
                          {award}
                        </span>
                      ))}
                      {cardData.awards.length > 3 && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-md font-medium">
                          +{cardData.awards.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Reviews Count */}
                {cardData.showRating && cardData.totalReviews > 0 && (
                  <div className="flex items-center justify-center gap-1 pt-2 border-t border-gray-200">
                    <StarRating avg={cardData.avgRating} size="text-xs" />
                    <span className="text-xs text-gray-600 ml-1 font-medium">
                      ({cardData.totalReviews} reviews)
                    </span>
                  </div>
                )}
              </div>

              {/* Footer Branding - improved visibility */}
              <div className="flex justify-center items-center mt-3">
                <span
                  className="text-white text-sm font-semibold tracking-wider"
                  style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.8)" }}
                >
                  outceedo.com
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-md w-full">
            {/* Close Button */}
            <button
              onClick={() => setShowPreviewModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} className="text-2xl" />
            </button>

            {/* Card Preview */}
            <div
              className="w-full relative rounded-2xl shadow-2xl overflow-hidden"
              style={{ aspectRatio: "9/16" }}
            >
              {/* Background Image */}
              <img
                src={businesscard}
                alt="Business Card Background"
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Darker overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50" />

              {/* Card Content */}
              <div className="relative h-full flex flex-col p-6">
                {/* Top Section - Logo */}
                <div className="flex justify-between items-start">
                  <img
                    src={logo}
                    alt="Outceedo"
                    className="h-8 object-contain"
                  />
                  <div className="bg-white px-3 py-1 rounded-full shadow-md">
                    <span className="text-xs font-bold text-red-600">
                      Verified Expert
                    </span>
                  </div>
                </div>

                {/* Middle Section - Profile */}
                <div className="flex-1 flex flex-col items-center justify-center text-center mt-4">
                  {/* Profile Image */}
                  <div className="relative mb-4">
                    {cardData.profileImage ? (
                      <img
                        src={cardData.profileImage}
                        alt={cardData.name}
                        className="w-28 h-28 rounded-full border-4 border-white shadow-xl object-cover bg-gray-200"
                      />
                    ) : (
                      <div className="w-28 h-28 rounded-full border-4 border-white shadow-xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                        <span className="text-4xl font-bold text-white">
                          {cardData.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    {/* Rating Badge */}
                    {cardData.showRating && cardData.avgRating > 0 && (
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                        <FontAwesomeIcon
                          icon={faStarSolid}
                          className="text-xs"
                        />
                        <span className="text-xs font-bold">
                          {cardData.avgRating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Name & Profession */}
                  <h2
                    className="text-2xl font-bold text-white"
                    style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
                  >
                    {cardData.name}
                  </h2>
                  {cardData.profession && (
                    <p
                      className="text-white text-sm mt-1 font-semibold"
                      style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.8)" }}
                    >
                      {cardData.profession}
                    </p>
                  )}

                  {/* Location & Certification */}
                  <div className="flex flex-wrap justify-center gap-3 mt-4">
                    {cardData.location && (
                      <div className="bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/30">
                        <FontAwesomeIcon
                          icon={faMapMarkerAlt}
                          className="text-white text-xs"
                        />
                        <span className="text-white text-xs font-semibold">
                          {cardData.location}
                        </span>
                      </div>
                    )}
                    {cardData.certificationLevel &&
                      cardData.certificationLevel !== "N/A" && (
                        <div className="bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/30">
                          <FontAwesomeIcon
                            icon={faCertificate}
                            className="text-white text-xs"
                          />
                          <span className="text-white text-xs font-semibold">
                            {cardData.certificationLevel}
                          </span>
                        </div>
                      )}
                  </div>
                </div>

                {/* Bottom Section - Credentials */}
                <div className="bg-white rounded-xl p-4 space-y-3 shadow-lg">
                  {/* Certificates */}
                  {cardData.showCertificates &&
                    cardData.certificates.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <FontAwesomeIcon
                            icon={faCertificate}
                            className="text-blue-600 text-sm"
                          />
                          <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                            Certificates
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {cardData.certificates
                            .slice(0, 3)
                            .map((cert, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-md truncate max-w-[140px] font-medium"
                              >
                                {cert}
                              </span>
                            ))}
                          {cardData.certificates.length > 3 && (
                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-md font-medium">
                              +{cardData.certificates.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                  {/* Awards */}
                  {cardData.showAwards && cardData.awards.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FontAwesomeIcon
                          icon={faAward}
                          className="text-amber-500 text-sm"
                        />
                        <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                          Awards
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {cardData.awards.slice(0, 3).map((award, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-md truncate max-w-[140px] font-medium"
                          >
                            {award}
                          </span>
                        ))}
                        {cardData.awards.length > 3 && (
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-md font-medium">
                            +{cardData.awards.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Reviews Count */}
                  {cardData.showRating && cardData.totalReviews > 0 && (
                    <div className="flex items-center justify-center gap-1 pt-2 border-t border-gray-200">
                      <StarRating avg={cardData.avgRating} size="text-xs" />
                      <span className="text-xs text-gray-600 ml-1 font-medium">
                        ({cardData.totalReviews} reviews)
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer Branding */}
                <div className="flex justify-center items-center mt-3">
                  <span
                    className="text-white text-sm font-semibold tracking-wider"
                    style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.8)" }}
                  >
                    outceedo.com
                  </span>
                </div>
              </div>
            </div>

            {/* Download buttons in modal */}
            <div className="flex justify-center gap-3 mt-4">
              <Button
                variant="default"
                onClick={() => {
                  setShowPreviewModal(false);
                  downloadAsPNG();
                }}
                disabled={isExporting}
                className="flex items-center gap-2 bg-white text-gray-900 hover:bg-gray-100"
              >
                <FontAwesomeIcon icon={faImage} />
                Download PNG
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  setShowPreviewModal(false);
                  downloadAsPDF();
                }}
                disabled={isExporting}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
              >
                <FontAwesomeIcon icon={faFilePdf} />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden element for PNG download with inline styles */}
      <div ref={hiddenPngRef} style={pngStyles.container}>
        <img src={businesscard} alt="" style={pngStyles.backgroundImage} />
        <div style={pngStyles.overlay} />
        <div style={pngStyles.content}>
          <div style={pngStyles.topRow}>
            <img src={logo} alt="Outceedo" style={pngStyles.logo} />
            <div style={pngStyles.verifiedBadge}>
              <span style={pngStyles.verifiedText}>Verified Expert</span>
            </div>
          </div>

          <div style={pngStyles.profileSection}>
            <div style={pngStyles.profileImageWrapper}>
              {cardData.profileImage ? (
                <img
                  src={cardData.profileImage}
                  alt={cardData.name}
                  style={pngStyles.profileImage}
                />
              ) : (
                <div style={pngStyles.profileInitial}>
                  <span style={pngStyles.initialText}>
                    {cardData.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {cardData.showRating && cardData.avgRating > 0 && (
                <div style={pngStyles.ratingBadge}>
                  <FontAwesomeIcon icon={faStarSolid} style={pngStyles.iconYellow} />
                  <span style={pngStyles.ratingText}>
                    {cardData.avgRating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            <h2 style={pngStyles.name}>{cardData.name}</h2>
            {cardData.profession && (
              <p style={pngStyles.profession}>{cardData.profession}</p>
            )}

            <div style={pngStyles.tagsRow}>
              {cardData.location && (
                <div style={pngStyles.tag}>
                  <FontAwesomeIcon icon={faMapMarkerAlt} style={pngStyles.iconWhite} />
                  <span style={pngStyles.tagText}>{cardData.location}</span>
                </div>
              )}
              {cardData.certificationLevel && cardData.certificationLevel !== "N/A" && (
                <div style={pngStyles.tag}>
                  <FontAwesomeIcon icon={faCertificate} style={pngStyles.iconWhite} />
                  <span style={pngStyles.tagText}>{cardData.certificationLevel}</span>
                </div>
              )}
            </div>
          </div>

          <div style={pngStyles.credentialsBox}>
            {cardData.showCertificates && cardData.certificates.length > 0 && (
              <div style={{ marginBottom: "12px" }}>
                <div style={pngStyles.sectionHeader}>
                  <FontAwesomeIcon icon={faCertificate} style={pngStyles.iconBlue} />
                  <span style={pngStyles.sectionTitle}>Certificates</span>
                </div>
                <div style={pngStyles.credentialTags}>
                  {cardData.certificates.slice(0, 3).map((cert, idx) => (
                    <span key={idx} style={pngStyles.certTag}>{cert}</span>
                  ))}
                  {cardData.certificates.length > 3 && (
                    <span style={pngStyles.moreTag}>+{cardData.certificates.length - 3}</span>
                  )}
                </div>
              </div>
            )}

            {cardData.showAwards && cardData.awards.length > 0 && (
              <div>
                <div style={pngStyles.sectionHeader}>
                  <FontAwesomeIcon icon={faAward} style={pngStyles.iconAmber} />
                  <span style={pngStyles.sectionTitle}>Awards</span>
                </div>
                <div style={pngStyles.credentialTags}>
                  {cardData.awards.slice(0, 3).map((award, idx) => (
                    <span key={idx} style={pngStyles.awardTag}>{award}</span>
                  ))}
                  {cardData.awards.length > 3 && (
                    <span style={pngStyles.moreTag}>+{cardData.awards.length - 3}</span>
                  )}
                </div>
              </div>
            )}

            {cardData.showRating && cardData.totalReviews > 0 && (
              <>
                <div style={pngStyles.divider} />
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "4px" }}>
                  {[...Array(5)].map((_, i) => (
                    <FontAwesomeIcon
                      key={i}
                      icon={i < Math.floor(cardData.avgRating) ? faStarSolid : farStar}
                      style={{ color: "#facc15", fontSize: "12px" }}
                    />
                  ))}
                  <span style={{ fontSize: "11px", color: "#4b5563", marginLeft: "4px" }}>
                    ({cardData.totalReviews} reviews)
                  </span>
                </div>
              </>
            )}
          </div>

          <div style={pngStyles.footer}>
            <span style={pngStyles.footerText}>outceedo.com</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Quick download button component for profile header
export const BusinessCardDownloadButton: React.FC<{
  expertData: ExpertDataType;
}> = ({ expertData }) => {
  const [isExporting, setIsExporting] = useState(false);
  const hiddenCardRef = useRef<HTMLDivElement>(null);

  const certificates =
    expertData.documents
      ?.filter((doc) => doc.type === "certificate")
      .map((cert) => cert.title)
      .filter((title): title is string => title !== undefined) || [];

  const awards =
    expertData.documents
      ?.filter((doc) => doc.type === "award")
      .map((award) => award.title)
      .filter((title): title is string => title !== undefined) || [];

  const reviewsArray = expertData.reviewsReceived || [];
  const totalReviews = reviewsArray.length;
  const avgRating =
    totalReviews === 0
      ? 0
      : reviewsArray.reduce((sum, r) => sum + (r.rating || 0), 0) /
        totalReviews;

  const cardData = {
    name: expertData.name,
    profession: expertData.profession || "",
    location: expertData.location,
    certificationLevel: expertData.certificationLevel,
    certificates: certificates,
    awards: awards,
    avgRating: avgRating,
    totalReviews: totalReviews,
    profileImage: expertData.profileImage || "",
  };

  const downloadAsImage = async () => {
    if (!hiddenCardRef.current) return;
    setIsExporting(true);

    try {
      const canvas = await html2canvas(hiddenCardRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#1a1a2e",
        logging: false,
        imageTimeout: 15000,
      });

      canvas.toBlob(
        (blob) => {
          if (blob) {
            saveAs(
              blob,
              `${cardData.name.replace(/\s+/g, "_")}_business_card.png`,
            );
          }
        },
        "image/png",
        1.0,
      );
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // Inline styles to avoid oklch color issues with html2canvas
  const styles = {
    container: {
      position: "fixed" as const,
      left: "-9999px",
      width: "350px",
      height: "600px",
      borderRadius: "16px",
      overflow: "hidden",
      zIndex: -1,
      fontFamily: "system-ui, -apple-system, sans-serif",
    },
    backgroundImage: {
      position: "absolute" as const,
      inset: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover" as const,
    },
    overlay: {
      position: "absolute" as const,
      inset: 0,
      background: "linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.2), rgba(0,0,0,0.5))",
    },
    content: {
      position: "relative" as const,
      height: "100%",
      display: "flex",
      flexDirection: "column" as const,
      padding: "24px",
    },
    topRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    logo: {
      height: "32px",
      objectFit: "contain" as const,
    },
    verifiedBadge: {
      backgroundColor: "#ffffff",
      padding: "4px 12px",
      borderRadius: "9999px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
    verifiedText: {
      fontSize: "12px",
      fontWeight: "700",
      color: "#dc2626",
    },
    profileSection: {
      flex: 1,
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center" as const,
      marginTop: "16px",
    },
    profileImageWrapper: {
      position: "relative" as const,
      marginBottom: "16px",
    },
    profileImage: {
      width: "112px",
      height: "112px",
      borderRadius: "9999px",
      border: "4px solid #ffffff",
      boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
      objectFit: "cover" as const,
      backgroundColor: "#e5e7eb",
    },
    profileInitial: {
      width: "112px",
      height: "112px",
      borderRadius: "9999px",
      border: "4px solid #ffffff",
      boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
      background: "linear-gradient(135deg, #f87171, #dc2626)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    initialText: {
      fontSize: "36px",
      fontWeight: "700",
      color: "#ffffff",
    },
    ratingBadge: {
      position: "absolute" as const,
      bottom: "-8px",
      left: "50%",
      transform: "translateX(-50%)",
      backgroundColor: "#facc15",
      color: "#111827",
      padding: "4px 12px",
      borderRadius: "9999px",
      display: "flex",
      alignItems: "center",
      gap: "4px",
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    },
    ratingText: {
      fontSize: "12px",
      fontWeight: "700",
    },
    name: {
      fontSize: "24px",
      fontWeight: "700",
      color: "#ffffff",
      textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
      margin: 0,
    },
    profession: {
      color: "#ffffff",
      fontSize: "14px",
      marginTop: "4px",
      fontWeight: "600",
      textShadow: "1px 1px 3px rgba(0,0,0,0.8)",
    },
    tagsRow: {
      display: "flex",
      flexWrap: "wrap" as const,
      justifyContent: "center",
      gap: "12px",
      marginTop: "16px",
    },
    tag: {
      backgroundColor: "rgba(0,0,0,0.4)",
      padding: "6px 12px",
      borderRadius: "9999px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      border: "1px solid rgba(255,255,255,0.3)",
    },
    tagText: {
      color: "#ffffff",
      fontSize: "12px",
      fontWeight: "600",
    },
    credentialsBox: {
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      padding: "16px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    },
    sectionHeader: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginBottom: "8px",
    },
    sectionTitle: {
      fontSize: "11px",
      fontWeight: "700",
      color: "#1f2937",
      textTransform: "uppercase" as const,
      letterSpacing: "0.5px",
    },
    credentialTags: {
      display: "flex",
      flexWrap: "wrap" as const,
      gap: "4px",
    },
    certTag: {
      fontSize: "11px",
      backgroundColor: "#dbeafe",
      color: "#1e40af",
      padding: "4px 8px",
      borderRadius: "6px",
      fontWeight: "500",
    },
    awardTag: {
      fontSize: "11px",
      backgroundColor: "#fef3c7",
      color: "#92400e",
      padding: "4px 8px",
      borderRadius: "6px",
      fontWeight: "500",
    },
    moreTag: {
      fontSize: "11px",
      backgroundColor: "#e5e7eb",
      color: "#4b5563",
      padding: "4px 8px",
      borderRadius: "6px",
      fontWeight: "500",
    },
    footer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      marginTop: "12px",
    },
    footerText: {
      color: "#ffffff",
      fontSize: "14px",
      fontWeight: "600",
      letterSpacing: "1px",
      textShadow: "1px 1px 3px rgba(0,0,0,0.8)",
    },
    divider: {
      height: "1px",
      backgroundColor: "#e5e7eb",
      margin: "8px 0",
    },
    iconWhite: {
      color: "#ffffff",
      fontSize: "12px",
    },
    iconBlue: {
      color: "#2563eb",
      fontSize: "14px",
    },
    iconAmber: {
      color: "#f59e0b",
      fontSize: "14px",
    },
    iconYellow: {
      color: "#facc15",
      fontSize: "12px",
    },
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={downloadAsImage}
        disabled={isExporting}
        className="flex items-center gap-2"
      >
        <FontAwesomeIcon icon={faDownload} />
        {isExporting ? "Generating..." : "Business Card"}
      </Button>

      {/* Hidden card for rendering - using inline styles to avoid oklch */}
      <div ref={hiddenCardRef} style={styles.container}>
        {/* Background Image */}
        <img src={businesscard} alt="" style={styles.backgroundImage} />

        {/* Overlay */}
        <div style={styles.overlay} />

        {/* Content */}
        <div style={styles.content}>
          {/* Top Row */}
          <div style={styles.topRow}>
            <img src={logo} alt="Outceedo" style={styles.logo} />
            <div style={styles.verifiedBadge}>
              <span style={styles.verifiedText}>Verified Expert</span>
            </div>
          </div>

          {/* Profile Section */}
          <div style={styles.profileSection}>
            <div style={styles.profileImageWrapper}>
              {cardData.profileImage ? (
                <img
                  src={cardData.profileImage}
                  alt={cardData.name}
                  style={styles.profileImage}
                />
              ) : (
                <div style={styles.profileInitial}>
                  <span style={styles.initialText}>
                    {cardData.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {cardData.avgRating > 0 && (
                <div style={styles.ratingBadge}>
                  <FontAwesomeIcon icon={faStarSolid} style={styles.iconYellow} />
                  <span style={styles.ratingText}>
                    {cardData.avgRating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            <h2 style={styles.name}>{cardData.name}</h2>
            {cardData.profession && (
              <p style={styles.profession}>{cardData.profession}</p>
            )}

            <div style={styles.tagsRow}>
              {cardData.location && (
                <div style={styles.tag}>
                  <FontAwesomeIcon icon={faMapMarkerAlt} style={styles.iconWhite} />
                  <span style={styles.tagText}>{cardData.location}</span>
                </div>
              )}
              {cardData.certificationLevel && cardData.certificationLevel !== "N/A" && (
                <div style={styles.tag}>
                  <FontAwesomeIcon icon={faCertificate} style={styles.iconWhite} />
                  <span style={styles.tagText}>{cardData.certificationLevel}</span>
                </div>
              )}
            </div>
          </div>

          {/* Credentials Box */}
          <div style={styles.credentialsBox}>
            {cardData.certificates.length > 0 && (
              <div style={{ marginBottom: "12px" }}>
                <div style={styles.sectionHeader}>
                  <FontAwesomeIcon icon={faCertificate} style={styles.iconBlue} />
                  <span style={styles.sectionTitle}>Certificates</span>
                </div>
                <div style={styles.credentialTags}>
                  {cardData.certificates.slice(0, 3).map((cert, idx) => (
                    <span key={idx} style={styles.certTag}>{cert}</span>
                  ))}
                  {cardData.certificates.length > 3 && (
                    <span style={styles.moreTag}>+{cardData.certificates.length - 3}</span>
                  )}
                </div>
              </div>
            )}

            {cardData.awards.length > 0 && (
              <div>
                <div style={styles.sectionHeader}>
                  <FontAwesomeIcon icon={faAward} style={styles.iconAmber} />
                  <span style={styles.sectionTitle}>Awards</span>
                </div>
                <div style={styles.credentialTags}>
                  {cardData.awards.slice(0, 3).map((award, idx) => (
                    <span key={idx} style={styles.awardTag}>{award}</span>
                  ))}
                  {cardData.awards.length > 3 && (
                    <span style={styles.moreTag}>+{cardData.awards.length - 3}</span>
                  )}
                </div>
              </div>
            )}

            {cardData.totalReviews > 0 && (
              <>
                <div style={styles.divider} />
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "4px" }}>
                  {[...Array(5)].map((_, i) => (
                    <FontAwesomeIcon
                      key={i}
                      icon={i < Math.floor(cardData.avgRating) ? faStarSolid : farStar}
                      style={{ color: "#facc15", fontSize: "12px" }}
                    />
                  ))}
                  <span style={{ fontSize: "11px", color: "#4b5563", marginLeft: "4px" }}>
                    ({cardData.totalReviews} reviews)
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div style={styles.footer}>
            <span style={styles.footerText}>outceedo.com</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default BusinessCard;
