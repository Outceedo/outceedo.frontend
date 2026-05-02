import React, { useEffect, useState } from "react";
import axios from "axios";
import { Eye, X } from "lucide-react";
import AssessmentReport from "@/Pages/common/AssessmentReport";
import avatar from "../../assets/images/avatar.png";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

interface ReportData {
  category: { id: string; name: string; description: string };
  id: string;
  bookingId: string;
  attributes: Record<string, any>;
  overallScore: number;
  assessedAt: string;
  player: { id: string; firstName: string; lastName: string; username: string; photo: string };
  expert: { id: string; firstName: string; lastName: string; username: string; photo: string };
}

interface ReportGroup {
  bookingId: string;
  reports: ReportData[];
  message?: string;
}

interface AllReportsProps {
  userId: string;
}

const AllReports: React.FC<AllReportsProps> = ({ userId }) => {
  const [groups, setGroups] = useState<ReportGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [selectedReportData, setSelectedReportData] = useState<ReportData[]>([]);
  const [reportLoading, setReportLoading] = useState(false);

  const navigate = useNavigate();
  const API = `${import.meta.env.VITE_PORT}/api/v1/user/reports`;

  const fetchGroups = async (p = page) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/user/${userId}?page=${p}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroups(res.data.groups || []);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchGroups();
  }, [userId, page]);

  const fetchReportData = async (bookingId: string) => {
    setReportLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/booking/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(res.data) && res.data.length > 0) {
        setSelectedReportData(res.data);
        return true;
      }
      return false;
    } catch (err: any) {
      if (err?.response?.status === 403) {
        Swal.fire({
          icon: "info",
          title: "Access Restricted",
          text: "You do not have permission to view this report.",
        });
      }
      return false;
    } finally {
      setReportLoading(false);
    }
  };

  const handleView = async (bookingId: string) => {
    setSelectedBookingId(bookingId);
    const found = await fetchReportData(bookingId);
    if (found) setIsReportOpen(true);
    else if (!reportLoading) {
      Swal.fire({ icon: "info", title: "No Report", text: "No assessment report available yet." });
    }
  };

  const closeModal = () => {
    setIsReportOpen(false);
    setSelectedBookingId("");
    setSelectedReportData([]);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  const avgScore = (reports: ReportData[]) => {
    if (!reports.length) return 0;
    return Math.round(reports.reduce((s, r) => s + r.overallScore, 0) / reports.length);
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-500";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-600" />
      </div>
    );
  }

  if (!groups.length) {
    return (
      <div className="text-center py-16 text-gray-500 dark:text-gray-400">
        No assessment reports found for this player.
      </div>
    );
  }

  return (
    <>
      {isReportOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-semibold">Assessment Report</h2>
            <button onClick={closeModal}>
              <X className="w-6 h-6 cursor-pointer text-gray-800 hover:text-black" />
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4">
            {reportLoading ? (
              <div className="text-center py-8">Loading report...</div>
            ) : (
              <AssessmentReport bookingId={selectedBookingId} reportData={selectedReportData} />
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group) => {
          const first = group.reports[0];
          if (!first) return null;
          const expert = first.expert;
          const score = avgScore(group.reports);
          const date = formatDate(first.assessedAt);
          const categories = group.reports.map((r) => r.category.name).join(", ");

          return (
            <div
              key={group.bookingId}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 flex flex-col gap-3"
            >
              <div className="flex items-center gap-3">
                <img
                  src={expert?.photo || avatar}
                  alt={expert?.username}
                  onError={(e) => { (e.target as HTMLImageElement).src = avatar; }}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-semibold dark:text-white">
                    {expert?.firstName} {expert?.lastName}
                  </p>
                  <p className="text-xs text-gray-400">@{expert?.username}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Overall Score</span>
                <span className={`text-2xl font-bold ${scoreColor(score)}`}>{score}%</span>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={categories}>
                <span className="font-medium text-gray-700 dark:text-gray-300">Categories: </span>
                {categories}
              </p>

              <p className="text-xs text-gray-400">{date}</p>

              <button
                onClick={() => handleView(group.bookingId)}
                className="mt-auto flex items-center gap-2 self-end px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4" />
                View Report
              </button>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 text-sm border rounded disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 text-sm border rounded disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
};

export default AllReports;
