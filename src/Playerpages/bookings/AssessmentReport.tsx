import React, { useState, useEffect, useRef } from "react";
import { CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Download, Share2, Star } from "lucide-react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import axios from "axios";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

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

  // Function to inject CSS overrides that force safe colors
  const injectSafeCSS = () => {
    const styleId = "pdf-safe-styles";
    let existingStyle = document.getElementById(styleId);

    if (existingStyle) {
      existingStyle.remove();
    }

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      .pdf-safe * {
        color: black !important;
        background-color: transparent !important;
      }
      .pdf-safe .bg-white {
        background-color: #ffffff !important;
      }
      .pdf-safe .bg-amber-100 {
        background-color: #fef3c7 !important;
      }
      .pdf-safe .bg-gray-50 {
        background-color: #f9fafb !important;
      }
      .pdf-safe .bg-gray-200 {
        background-color: #e5e7eb !important;
      }
      .pdf-safe .bg-green-100 {
        background-color: #dcfce7 !important;
      }
      .pdf-safe .text-gray-500 {
        color: #6b7280 !important;
      }
      .pdf-safe .text-gray-700 {
        color: #374151 !important;
      }
      .pdf-safe .text-green-600 {
        color: #16a34a !important;
      }
      .pdf-safe .text-stone-800 {
        color: #292524 !important;
      }
      .pdf-safe button,
      .pdf-safe .pdf-exclude {
        display: none !important;
      }
      .pdf-safe svg {
        fill: currentColor !important;
        color: inherit !important;
      }
      .pdf-safe [class*="bg-"]:not(.bg-white):not(.bg-amber-100):not(.bg-gray-50):not(.bg-gray-200):not(.bg-green-100) {
        background-color: transparent !important;
      }
      .pdf-safe [class*="text-"]:not(.text-gray-500):not(.text-gray-700):not(.text-green-600):not(.text-stone-800) {
        color: black !important;
      }
    `;
    document.head.appendChild(style);
    return style;
  };

  const removeSafeCSS = (style: HTMLStyleElement) => {
    if (style && style.parentNode) {
      style.parentNode.removeChild(style);
    }
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;

    setDownloadLoading(true);
    let injectedStyle: HTMLStyleElement | null = null;

    try {
      const element = reportRef.current;

      // Inject safe CSS
      injectedStyle = injectSafeCSS();

      // Add safe class to element
      element.classList.add("pdf-safe");

      // Wait a bit for styles to apply
      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(element, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        ignoreElements: (element) => {
          return (
            element.tagName === "BUTTON" ||
            element.classList.contains("pdf-exclude") ||
            element.getAttribute("data-exclude-pdf") === "true"
          );
        },
        onclone: (clonedDoc, clonedElement) => {
          // Apply safe styles to cloned document
          const clonedStyle = clonedDoc.createElement("style");
          clonedStyle.textContent = `
            * {
              color: black !important;
              background-color: transparent !important;
            }
            .bg-white { background-color: #ffffff !important; }
            .bg-amber-100 { background-color: #fef3c7 !important; }
            .bg-gray-50 { background-color: #f9fafb !important; }
            .bg-gray-200 { background-color: #e5e7eb !important; }
            .bg-green-100 { background-color: #dcfce7 !important; }
            .text-gray-500 { color: #6b7280 !important; }
            .text-gray-700 { color: #374151 !important; }
            .text-green-600 { color: #16a34a !important; }
            .text-stone-800 { color: #292524 !important; }
            button, .pdf-exclude { display: none !important; }
            svg { fill: currentColor !important; }
          `;
          clonedDoc.head.appendChild(clonedStyle);

          // Remove buttons and problem elements
          const buttonsToHide = clonedElement.querySelectorAll(
            "button, .pdf-exclude"
          );
          buttonsToHide.forEach((btn) => {
            (btn as HTMLElement).style.display = "none";
          });
        },
      });

      // Remove safe class and styles
      element.classList.remove("pdf-safe");
      if (injectedStyle) {
        removeSafeCSS(injectedStyle);
      }

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const availableWidth = pdfWidth - margin * 2;
      const availableHeight = pdfHeight - margin * 2;

      const imgWidth = availableWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (imgHeight <= availableHeight) {
        pdf.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight);
      } else {
        // Multi-page handling
        let yPosition = 0;
        let pageNumber = 1;

        while (yPosition < canvas.height) {
          if (pageNumber > 1) {
            pdf.addPage();
          }

          const sourceY = yPosition;
          const sourceHeight = Math.min(
            (availableHeight * canvas.width) / imgWidth,
            canvas.height - yPosition
          );

          const pageCanvas = document.createElement("canvas");
          const pageCtx = pageCanvas.getContext("2d")!;
          pageCanvas.width = canvas.width;
          pageCanvas.height = sourceHeight;

          pageCtx.drawImage(
            canvas,
            0,
            sourceY,
            canvas.width,
            sourceHeight,
            0,
            0,
            canvas.width,
            sourceHeight
          );

          const pageImgData = pageCanvas.toDataURL("image/png", 1.0);
          const pageImgHeight = (sourceHeight * imgWidth) / canvas.width;

          pdf.addImage(
            pageImgData,
            "PNG",
            margin,
            margin,
            imgWidth,
            pageImgHeight
          );

          yPosition += sourceHeight;
          pageNumber++;
        }
      }

      const playerName = formatFullName(
        reportData[0]?.player?.firstName,
        reportData[0]?.player?.lastName
      );
      const date = new Date().toISOString().split("T")[0];
      const filename = `Assessment_Report_${playerName.replace(
        /\s+/g,
        "_"
      )}_${date}.pdf`;

      pdf.save(filename);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      // Cleanup
      if (reportRef.current) {
        reportRef.current.classList.remove("pdf-safe");
      }
      if (injectedStyle) {
        removeSafeCSS(injectedStyle);
      }
      setDownloadLoading(false);
    }
  };

  const handleShare = async () => {
    if (!reportRef.current) return;

    setShareLoading(true);
    try {
      const shareText = `Assessment Report for ${formatFullName(
        reportData[0]?.player?.firstName,
        reportData[0]?.player?.lastName
      )} - Generated on ${new Date().toLocaleDateString()}`;

      if (navigator.share) {
        await navigator.share({
          title: "Assessment Report",
          text: shareText,
          url: window.location.href,
        });
      } else {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(shareText);
          alert("Report details copied to clipboard!");
        } else {
          alert("Sharing not supported on this device.");
        }
      }
    } catch (error) {
      console.error("Error sharing:", error);
      alert("Unable to share the report.");
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
            title="Share Report"
          >
            <Share2 className="w-4 h-4" />
            {shareLoading ? "Sharing..." : "Share"}
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
                  pathTransition: "stroke-dasharray 0.5s ease 0s" ,
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
