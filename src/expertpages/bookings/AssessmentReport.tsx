import React, { useState, useEffect, useRef } from "react";
import { CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Download, Share2, Star } from "lucide-react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import axios from "axios";
import {
  pdf,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Circle,
  Path,
} from "@react-pdf/renderer";
import { saveAs } from "file-saver";

interface ReportData {
  category: {
    id: string;
    name: string;
    description: string;
  };
  id: string;
  bookingId: string;
  attributes: Record<string, any>;
  overallScore: number;
  assessedAt: string;
  player: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    photo: string;
  };
  expert: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    photo: string;
  };
}

interface ReviewData {
  playerId: string;
  bookingId: string;
  strengths: string;
  improvements: string;
  verdict: string;
  rating: number;
}

interface AssessmentReportProps {
  bookingId: string;
  reportData: ReportData[];
}

interface Stat {
  label: string;
  percentage: number;
  color: string;
  subskills: Record<string, number>;
}

const defaultColors: Record<string, string> = {
  Pace: "#E63946",
  Shooting: "#D62828",
  Passing: "#4CAF50",
  Dribbling: "#68A357",
  Defending: "#2D6A4F",
  Physical: "#F4A261",
};

// Simplified SVG Semicircle Component for PDF
const SemicircleProgress: React.FC<{
  percentage: number;
  color: string;
  size: number;
}> = ({ percentage, color, size }) => {
  const radius = size / 2 - 6;
  const centerX = size / 2;
  const centerY = size / 2;

  // Calculate the angle for the progress (semicircle is 180 degrees)
  const angle = (percentage / 100) * 180;
  const radians = (angle * Math.PI) / 180;

  // Calculate end point for the progress arc
  const endX = centerX + radius * Math.cos(radians - Math.PI);
  const endY = centerY + radius * Math.sin(radians - Math.PI);

  // Large arc flag (1 if angle > 180, 0 otherwise)
  const largeArcFlag = angle > 180 ? 1 : 0;

  return (
    <Svg
      width={size}
      height={size / 2 + 10}
      viewBox={`0 0 ${size} ${size / 2 + 10}`}
    >
      {/* Background semicircle */}
      <Path
        d={`M 6 ${centerY} A ${radius} ${radius} 0 0 1 ${size - 6} ${centerY}`}
        stroke="#e5e7eb"
        strokeWidth="6"
        fill="none"
      />
      {/* Progress arc - only show if percentage > 0 */}
      {percentage > 0 && (
        <Path
          d={`M 6 ${centerY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`}
          stroke={color}
          strokeWidth="6"
          fill="none"
        />
      )}
    </Svg>
  );
};

// Star component for PDF
const StarIcon: React.FC<{ filled: boolean; size: number }> = ({
  filled,
  size,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      fill={filled ? "#FACC15" : "none"}
      stroke="#FACC15"
      strokeWidth="1"
    />
  </Svg>
);

// Simple progress bar component for subskills
const ProgressBar: React.FC<{
  percentage: number;
  width: number;
  height: number;
}> = ({ percentage, width, height }) => (
  <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
    {/* Background */}
    <rect x="0" y="0" width={width} height={height} fill="#dcfce7" />
    {/* Progress */}
    <rect
      x="0"
      y="0"
      width={(width * percentage) / 100}
      height={height}
      fill="#16a34a"
    />
  </Svg>
);

// PDF Document Component with exact design match
const PDFDocument: React.FC<{
  reportData: ReportData[];
  reviewData: ReviewData | null;
  overallScore: number;
  transformedAttributes: Stat[];
}> = ({ reportData, reviewData, overallScore, transformedAttributes }) => {
  const playerInfo = reportData[0]?.player;
  const expertInfo = reportData[0]?.expert;
  const assessmentDate = reportData[0]?.assessedAt;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatFullName = (firstName?: string, lastName?: string) => {
    return `${firstName || ""} ${lastName || ""}`.trim() || "Unknown";
  };

  const getPerformanceLevel = (
    score: number
  ): { level: string; color: string } => {
    if (score >= 90) return { level: "Excellent", color: "#16a34a" };
    if (score >= 80) return { level: "Very Good", color: "#65a30d" };
    if (score >= 70) return { level: "Good", color: "#ca8a04" };
    if (score >= 60) return { level: "Average", color: "#ea580c" };
    return { level: "Needs Improvement", color: "#dc2626" };
  };

  const performanceLevel = getPerformanceLevel(overallScore);

  const styles = StyleSheet.create({
    page: {
      flexDirection: "column",
      backgroundColor: "#ffffff",
      padding: 30,
      fontFamily: "Helvetica",
    },
    header: {
      fontSize: 24,
      textAlign: "center",
      marginBottom: 40,
      fontWeight: "bold",
      color: "#000000",
    },
    infoSection: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 30,
      paddingBottom: 20,
    },
    infoItem: {
      flexDirection: "column",
      alignItems: "flex-start",
    },
    infoLabel: {
      fontSize: 10,
      color: "#9ca3af",
      marginBottom: 8,
      textTransform: "uppercase",
      fontWeight: "normal",
    },
    infoValue: {
      fontSize: 14,
      fontWeight: "bold",
      color: "#000000",
    },
    attributeSection: {
      backgroundColor: "#fef3c7",
      padding: 25,
      marginBottom: 25,
      borderRadius: 12,
    },
    attributeTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 25,
      color: "#000000",
    },
    attributeContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      flexWrap: "wrap",
    },
    attributeItem: {
      width: "18%",
      alignItems: "center",
      marginBottom: 20,
    },
    semicircleContainer: {
      alignItems: "center",
      marginBottom: 15,
      position: "relative",
    },
    percentageText: {
      position: "absolute",
      top: 30,
      fontSize: 14,
      fontWeight: "bold",
      color: "#000000",
    },
    attributeName: {
      fontSize: 12,
      fontWeight: "bold",
      marginBottom: 15,
      textAlign: "center",
      color: "#374151",
    },
    subskillContainer: {
      width: "100%",
    },
    subskillItem: {
      marginBottom: 6,
    },
    subskillRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 2,
      alignItems: "center",
    },
    subskillName: {
      fontSize: 8,
      color: "#374151",
      flex: 1,
    },
    subskillScore: {
      fontSize: 8,
      fontWeight: "bold",
      color: "#16a34a",
    },
    overallSection: {
      backgroundColor: "#f9fafb",
      padding: 30,
      marginBottom: 25,
      borderRadius: 12,
      alignItems: "center",
    },
    overallTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 30,
      textAlign: "center",
      color: "#000000",
    },
    overallScoreContainer: {
      alignItems: "center",
      marginBottom: 20,
      position: "relative",
    },
    overallScoreText: {
      position: "absolute",
      top: 50,
      fontSize: 32,
      fontWeight: "bold",
      color: "#dc2626",
    },
    overallScoreLabel: {
      position: "absolute",
      top: 85,
      fontSize: 10,
      color: "#6b7280",
    },
    performanceLevel: {
      fontSize: 16,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 15,
      color: "#dc2626",
    },
    performanceDescription: {
      fontSize: 10,
      textAlign: "center",
      color: "#6b7280",
      marginBottom: 20,
      maxWidth: 300,
      lineHeight: 1.4,
    },
    breakdownTitle: {
      fontSize: 12,
      fontWeight: "bold",
      marginBottom: 15,
      textAlign: "center",
      color: "#374151",
    },
    breakdownGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      width: "100%",
    },
    breakdownItem: {
      flexDirection: "row",
      width: "45%",
      justifyContent: "space-between",
      marginBottom: 5,
      paddingHorizontal: 10,
    },
    breakdownLabel: {
      fontSize: 9,
      color: "#6b7280",
    },
    breakdownValue: {
      fontSize: 9,
      fontWeight: "bold",
    },
    ratingSection: {
      marginBottom: 25,
    },
    ratingTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 15,
      color: "#000000",
    },
    ratingContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
    },
    ratingValue: {
      fontSize: 32,
      fontWeight: "bold",
      marginRight: 15,
      color: "#000000",
    },
    starsContainer: {
      flexDirection: "row",
    },
    reviewSection: {
      marginBottom: 20,
    },
    reviewTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 15,
      color: "#000000",
    },
    reviewItem: {
      marginBottom: 12,
    },
    reviewLabel: {
      fontSize: 12,
      fontWeight: "bold",
      color: "#000000",
    },
    reviewText: {
      fontSize: 11,
      marginTop: 3,
      color: "#374151",
      lineHeight: 1.3,
    },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <Text style={styles.header}>Assessment Report</Text>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>EXPERT NAME</Text>
            <Text style={styles.infoValue}>
              {formatFullName(expertInfo?.firstName, expertInfo?.lastName)}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>PLAYER NAME</Text>
            <Text style={styles.infoValue}>
              {formatFullName(playerInfo?.firstName, playerInfo?.lastName)}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>DATE</Text>
            <Text style={styles.infoValue}>{formatDate(assessmentDate)}</Text>
          </View>
        </View>

        {/* Attribute Details */}
        <View style={styles.attributeSection}>
          <Text style={styles.attributeTitle}>Attribute Details</Text>
          <View style={styles.attributeContainer}>
            {transformedAttributes.map((attr, index) => (
              <View key={index} style={styles.attributeItem}>
                <View style={styles.semicircleContainer}>
                  <SemicircleProgress
                    percentage={attr.percentage}
                    color={attr.color}
                    size={70}
                  />
                  <Text style={styles.percentageText}>{attr.percentage}%</Text>
                </View>
                <Text style={styles.attributeName}>{attr.label}</Text>
                <View style={styles.subskillContainer}>
                  {Object.entries(attr.subskills).map(
                    ([skillName, skillValue], idx) => (
                      <View key={idx} style={styles.subskillItem}>
                        <View style={styles.subskillRow}>
                          <Text style={styles.subskillName}>{skillName}</Text>
                          <Text style={styles.subskillScore}>
                            {skillValue}%
                          </Text>
                        </View>
                        <ProgressBar
                          percentage={Number(skillValue)}
                          width={80}
                          height={3}
                        />
                      </View>
                    )
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Overall Score */}
        <View style={styles.overallSection}>
          <Text style={styles.overallTitle}>Overall Performance Score</Text>
          <View style={styles.overallScoreContainer}>
            <SemicircleProgress
              percentage={overallScore}
              color={performanceLevel.color}
              size={160}
            />
            <Text
              style={[
                styles.overallScoreText,
                { color: performanceLevel.color },
              ]}
            >
              {overallScore}%
            </Text>
            <Text style={styles.overallScoreLabel}>Overall Score</Text>
          </View>
          <Text
            style={[styles.performanceLevel, { color: performanceLevel.color }]}
          >
            {performanceLevel.level}
          </Text>
          <Text style={styles.performanceDescription}>
            Based on the average of all category assessments, this player
            demonstrates{" "}
            <Text style={{ fontWeight: "bold", color: performanceLevel.color }}>
              {performanceLevel.level.toLowerCase()}
            </Text>{" "}
            performance across all evaluated attributes.
          </Text>

          <Text style={styles.breakdownTitle}>Category Breakdown</Text>
          <View style={styles.breakdownGrid}>
            {transformedAttributes.map((attr, index) => (
              <View key={index} style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>{attr.label}:</Text>
                <Text style={[styles.breakdownValue, { color: attr.color }]}>
                  {attr.percentage}%
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Rating */}
        {reviewData && (
          <View style={styles.ratingSection}>
            <Text style={styles.ratingTitle}>Rating</Text>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingValue}>{reviewData.rating} / 5</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <StarIcon
                    key={i}
                    filled={i <= Math.floor(reviewData.rating)}
                    size={20}
                  />
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Review */}
        {reviewData && (
          <View style={styles.reviewSection}>
            <Text style={styles.reviewTitle}>Review</Text>
            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Strengths:</Text>
              <Text style={styles.reviewText}>{reviewData.strengths}</Text>
            </View>
            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Areas for Improvement:</Text>
              <Text style={styles.reviewText}>{reviewData.improvements}</Text>
            </View>
            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Verdict:</Text>
              <Text style={styles.reviewText}>{reviewData.verdict}</Text>
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
};

const AssessmentReport: React.FC<AssessmentReportProps> = ({
  bookingId,
  reportData,
}) => {
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchReviewData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${
            import.meta.env.VITE_PORT
          }/api/v1/user/reports/review/booking/${bookingId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200 && response.data) {
          setReviewData(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch review data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchReviewData();
    }
  }, [bookingId]);

  // Calculate overall score from all categories
  const calculateOverallScore = (): number => {
    if (!reportData || reportData.length === 0) return 0;

    const totalScore = reportData.reduce(
      (sum, item) => sum + item.overallScore,
      0
    );
    const averageScore = totalScore / reportData.length;
    return Math.round(averageScore);
  };

  const overallScore = calculateOverallScore();

  // Function to get performance level based on score
  const getPerformanceLevel = (
    score: number
  ): { level: string; color: string } => {
    if (score >= 90) return { level: "Excellent", color: "#16a34a" };
    if (score >= 80) return { level: "Very Good", color: "#65a30d" };
    if (score >= 70) return { level: "Good", color: "#ca8a04" };
    if (score >= 60) return { level: "Average", color: "#ea580c" };
    return { level: "Needs Improvement", color: "#dc2626" };
  };

  const performanceLevel = getPerformanceLevel(overallScore);

  // Function to generate PDF blob (shared between download and share)
  const generatePDFBlob = async (): Promise<Blob> => {
    return await pdf(
      <PDFDocument
        reportData={reportData}
        reviewData={reviewData}
        overallScore={overallScore}
        transformedAttributes={transformedAttributes}
      />
    ).toBlob();
  };

  // Function to generate filename
  const generateFilename = (): string => {
    const playerName = formatFullName(
      reportData[0]?.player?.firstName,
      reportData[0]?.player?.lastName
    );
    const date = new Date().toISOString().split("T")[0];
    return `Assessment_Report_${playerName.replace(/\s+/g, "_")}_${date}.pdf`;
  };

  const handleDownloadPDF = async () => {
    setDownloadLoading(true);
    try {
      const blob = await generatePDFBlob();
      const filename = generateFilename();
      saveAs(blob, filename);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleShare = async () => {
    setShareLoading(true);
    try {
      const playerName = formatFullName(
        reportData[0]?.player?.firstName,
        reportData[0]?.player?.lastName
      );
      const filename = generateFilename();

      // Check if Web Share API is supported and can share files
      if (navigator.share && navigator.canShare) {
        try {
          // Generate PDF blob
          const blob = await generatePDFBlob();

          // Create a File object from the blob
          const file = new File([blob], filename, { type: "application/pdf" });

          // Check if files can be shared
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: `Assessment Report - ${playerName}`,
              text: `Assessment Report for ${playerName} - Generated on ${new Date().toLocaleDateString()}`,
              files: [file],
            });
            return;
          }
        } catch (shareError) {
          console.log(
            "File sharing failed, falling back to other methods:",
            shareError
          );
        }
      }

      // Fallback 1: Try Web Share API without files
      if (navigator.share) {
        try {
          await navigator.share({
            title: `Assessment Report - ${playerName}`,
            text: `Assessment Report for ${playerName} - Generated on ${new Date().toLocaleDateString()}. Please request the PDF file separately.`,
            url: window.location.href,
          });
          return;
        } catch (shareError) {
          console.log(
            "Web Share API failed, falling back to clipboard:",
            shareError
          );
        }
      }

      // Fallback 2: Copy to clipboard and offer download
      const shareText = `Assessment Report for ${playerName} - Generated on ${new Date().toLocaleDateString()}`;

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);

        // Also trigger PDF download as an alternative
        const blob = await generatePDFBlob();
        saveAs(blob, filename);

        alert(
          "Report details copied to clipboard and PDF downloaded! You can now share the PDF file manually."
        );
      } else {
        // Fallback 3: Just download the PDF
        const blob = await generatePDFBlob();
        saveAs(blob, filename);
        alert(
          "PDF downloaded! You can now share this file manually through your preferred method."
        );
      }
    } catch (error) {
      console.error("Error sharing:", error);
      alert("Unable to share the report. The PDF will be downloaded instead.");

      // Final fallback: just download
      try {
        const blob = await generatePDFBlob();
        const filename = generateFilename();
        saveAs(blob, filename);
      } catch (downloadError) {
        console.error("Download also failed:", downloadError);
        alert("Failed to download PDF. Please try again.");
      }
    } finally {
      setShareLoading(false);
    }
  };

  const transformedAttributes: Stat[] = reportData.map((item) => ({
    label: item.category.name,
    percentage: item.overallScore,
    color: defaultColors[item.category.name] || "#808080",
    subskills: item.attributes || {},
  }));

  const playerInfo = reportData[0]?.player;
  const expertInfo = reportData[0]?.expert;
  const assessmentDate = reportData[0]?.assessedAt;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatFullName = (firstName?: string, lastName?: string) => {
    return `${firstName || ""} ${lastName || ""}`.trim() || "Unknown";
  };

  if (!reportData || reportData.length === 0) {
    return (
      <div className="text-center py-8">
        <p>No assessment data available for this booking.</p>
      </div>
    );
  }

  return (
    <div ref={reportRef} className="p-6 bg-white space-y-6">
      <div className="flex justify-center items-center mb-14">
        <h2 className="text-2xl font-semibold">Assessment Report</h2>
      </div>

      <div className="flex justify-between text-sm mb-6">
        <div className="flex flex-col">
          <span className="text-gray-500">EXPERT NAME</span>
          <div className="flex items-center gap-2">
            {expertInfo?.photo ? (
              <img
                src={expertInfo.photo}
                alt="Expert"
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xs">👤</span>
              </div>
            )}
            <span className="font-medium">
              {formatFullName(expertInfo?.firstName, expertInfo?.lastName)}
            </span>
          </div>
        </div>

        <div className="flex flex-col">
          <span className="text-gray-500">PLAYER NAME</span>
          <div className="flex items-center gap-2">
            {playerInfo?.photo ? (
              <img
                src={playerInfo.photo}
                alt="Player"
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xs">👤</span>
              </div>
            )}
            <span className="font-medium">
              {formatFullName(playerInfo?.firstName, playerInfo?.lastName)}
            </span>
          </div>
        </div>

        <div className="flex flex-col">
          <span className="text-gray-500">DATE</span>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-xs">📅</span>
            </div>
            <span className="font-medium">{formatDate(assessmentDate)}</span>
          </div>
        </div>

        <div className="flex gap-4 justify-end items-end pdf-exclude">
          <button
            onClick={handleDownloadPDF}
            disabled={downloadLoading}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Download as PDF"
          >
            <Download className="w-4 h-4" />
            {downloadLoading ? "Generating..." : "PDF"}
          </button>
          <button
            onClick={handleShare}
            disabled={shareLoading}
            className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Share PDF Report"
          >
            <Share2 className="w-4 h-4" />
            {shareLoading ? "Sharing..." : "Share PDF"}
          </button>
        </div>
      </div>

      <CardContent className="bg-amber-100 mx-auto rounded-xl shadow-md">
        <div className="py-6">
          <h3 className="text-lg font-semibold mb-6">Attribute Details</h3>

          <div className="flex overflow-x-auto divide-x divide-gray-300">
            {transformedAttributes.map((attr, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-64 px-6 flex flex-col items-center"
              >
                <div
                  className="w-20 h-20 relative"
                  style={{ transform: "rotate(-90deg)" }}
                >
                  <CircularProgressbar
                    value={attr.percentage}
                    styles={buildStyles({
                      textSize: "26px",
                      pathColor: attr.color,
                      trailColor: "#ddd",
                      strokeLinecap: "round",
                    })}
                    circleRatio={0.5}
                  />
                  <div
                    className="absolute inset-0 flex items-center justify-center text-sm ml-3 font-semibold text-stone-800"
                    style={{ transform: "rotate(90deg)" }}
                  >
                    {attr.percentage}%
                  </div>
                </div>

                <p className="text-sm mt-2 text-gray-700 font-semibold">
                  {attr.label}
                </p>

                <div className="mt-4 mb-10 space-y-2">
                  {Object.entries(attr.subskills).map(
                    ([skillName, skillValue], idx) => (
                      <div key={idx}>
                        <div className="text-sm flex justify-between gap-4">
                          <span>{skillName}</span>
                          <span className="text-green-600 font-semibold">
                            {skillValue}%
                          </span>
                        </div>
                        <Progress
                          value={Number(skillValue)}
                          className="h-1 bg-green-100 [&>div]:bg-green-500"
                        />
                      </div>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      {/* Overall Score Section */}
      <div className="bg-gray-50 rounded-xl shadow-md p-8 mx-auto">
        <h3 className="text-xl font-semibold text-center mb-16">
          Overall Performance Score
        </h3>

        <div className="flex flex-col items-center">
          {/* Semicircle Progress Bar */}
          <div className="relative w-48 h-24 mb-6 mr-24">
            <div
              className="w-48 h-24 relative"
              style={{ transform: "rotate(-90deg)" }}
            >
              <CircularProgressbar
                value={overallScore}
                styles={buildStyles({
                  textSize: "0px", // Hide default text as we'll add custom
                  pathColor: performanceLevel.color,
                  trailColor: "#e5e7eb",
                  strokeLinecap: "round",
                  pathTransition: "stroke-dasharray 0.5s ease 0s",
                })}
                circleRatio={0.5} // Creates semicircle
              />
            </div>

            {/* Custom text overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-lg font-semibold text-stone-800 ml-22">
              <div
                className="text-4xl font-bold"
                style={{ color: performanceLevel.color }}
              >
                {overallScore}%
              </div>
              <div className="text-sm font-medium text-gray-600 mt-1">
                Overall Score
              </div>
            </div>
          </div>

          {/* Performance Level */}
          <div className="text-center">
            <div
              className="text-lg font-semibold mb-2"
              style={{ color: performanceLevel.color }}
            >
              {performanceLevel.level}
            </div>
            <div className="text-sm text-gray-600 max-w-md">
              Based on the average of all category assessments, this player
              demonstrates{" "}
              <span
                className="font-medium"
                style={{ color: performanceLevel.color }}
              >
                {performanceLevel.level.toLowerCase()}
              </span>{" "}
              performance across all evaluated attributes.
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="mt-6 w-full max-w-md">
            <div className="text-sm font-medium text-gray-700 mb-3 text-center">
              Category Breakdown
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {transformedAttributes.map((attr, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-1"
                >
                  <span className="text-gray-600">{attr.label}:</span>
                  <span className="font-medium" style={{ color: attr.color }}>
                    {attr.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {reviewData && (
        <div className="justify-start">
          <div className="text-xl font-bold">Rating</div>
          <div className="flex justify-start ml-8 mt-5 items-center gap-2">
            <span className="text-3xl font-bold">{reviewData.rating} / 5</span>
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                fill={
                  i <= Math.floor(reviewData.rating)
                    ? "#FACC15"
                    : i - 0.5 === reviewData.rating
                    ? "#FACC15"
                    : "none"
                }
                stroke="#FACC15"
                className="w-7 h-7"
              />
            ))}
          </div>
        </div>
      )}

      {reviewData && (
        <div className="space-y-2">
          <h3 className="font-extrabold text-xl">Review</h3>
          <p>
            <strong>Strengths:</strong> {reviewData.strengths}
          </p>
          <p>
            <strong>Areas for Improvement:</strong> {reviewData.improvements}
          </p>
          <p>
            <strong>Verdict:</strong> {reviewData.verdict}
          </p>
        </div>
      )}

      {loading && (
        <div className="text-center py-4">
          <p>Loading review data...</p>
        </div>
      )}
    </div>
  );
};

export default AssessmentReport;
