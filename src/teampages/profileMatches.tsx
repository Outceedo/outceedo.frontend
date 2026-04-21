import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BookOpen,
  X,
  Loader2,
  AlertCircle,
  RefreshCw,
  Pencil,
} from "lucide-react";

function formatDateDMY(isoDate: string) {
  if (!isoDate) return "";
  const dateObj = new Date(isoDate);
  if (isNaN(dateObj.getTime())) return isoDate;
  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = dateObj.getFullYear();
  return `${day}-${month}-${year}`;
}

interface Match {
  id?: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  type: string;
  status: string;
  result: string;
  goals?: string;
  assists?: string;
  shots?: string;
  shotsOnTarget?: string;
  passes?: string;
  yellowcards?: string;
  redcards?: string;
}

interface ProfileMatchesProps {
  userId: string;
}

const ProfileMatches: React.FC<ProfileMatchesProps> = ({ userId }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");
  const API_BASE_URL = `${import.meta.env.VITE_PORT}/api/v1/user/matches`;

  useEffect(() => {
    if (userId) fetchMatches();
  }, [userId]);

  const fetchMatches = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data?.matches) {
        const sorted = [...response.data.matches].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
        setMatches(sorted);
      } else {
        setMatches([]);
      }
    } catch {
      setError("Failed to load match data.");
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => navigate(`/${role}/matches`)}
          className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
          size="sm"
        >
          <Pencil className="h-4 w-4" />
          Edit Matches
        </Button>
      </div>

      <Card className="w-full dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold dark:text-white">Match History</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchMatches}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-1" /> Refresh
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-red-500" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-md">
              <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <Button variant="outline" onClick={fetchMatches}>
                Try Again
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="dark:bg-gray-800 dark:text-gray-300">
                  <TableRow className="dark:border-gray-700">
                    <TableHead className="dark:text-gray-300">Date</TableHead>
                    <TableHead className="dark:text-gray-300">
                      Home Team
                    </TableHead>
                    <TableHead className="dark:text-gray-300">
                      Away Team
                    </TableHead>
                    <TableHead className="dark:text-gray-300">Type</TableHead>
                    <TableHead className="dark:text-gray-300">Status</TableHead>
                    <TableHead className="dark:text-gray-300">Result</TableHead>
                    <TableHead className="dark:text-gray-300">Stats</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matches.length === 0 ? (
                    <TableRow className="dark:border-gray-700">
                      <TableCell
                        colSpan={7}
                        className="text-center dark:text-gray-300"
                      >
                        No matches found
                      </TableCell>
                    </TableRow>
                  ) : (
                    matches.map((match, index) => (
                      <TableRow
                        key={match.id || index}
                        className={
                          index % 2 === 0
                            ? "bg-white dark:bg-gray-800"
                            : "bg-gray-100 dark:bg-gray-700"
                        }
                      >
                        <TableCell className="font-medium dark:text-gray-300">
                          {formatDateDMY(match.date)}
                        </TableCell>
                        <TableCell className="dark:text-gray-300">
                          {match.homeTeam}
                        </TableCell>
                        <TableCell className="dark:text-gray-300">
                          {match.awayTeam}
                        </TableCell>
                        <TableCell className="dark:text-gray-300">
                          {match.type}
                        </TableCell>
                        <TableCell className="dark:text-gray-300">
                          {match.status}
                        </TableCell>
                        <TableCell className="dark:text-gray-300">
                          {match.result}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setSelectedMatch(match);
                              setStatsModalOpen(true);
                            }}
                            className="dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-gray-700"
                          >
                            <BookOpen className="h-4 w-4" />
                            <span className="sr-only">View Stats</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {statsModalOpen && selectedMatch && (
        <div className="fixed inset-0 z-50 flex justify-center items-center">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setStatsModalOpen(false)}
          />
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md z-50 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
              <h2 className="text-xl font-semibold dark:text-white">
                Match Statistics
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setStatsModalOpen(false)}
                className="dark:text-gray-400 hover:dark:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6">
              <div className="mb-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-medium text-lg dark:text-white mb-2 border-b border-gray-200 dark:border-gray-600 pb-2">
                  {selectedMatch.homeTeam} vs {selectedMatch.awayTeam}
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Date:</p>
                    <p className="font-medium dark:text-white">
                      {formatDateDMY(selectedMatch.date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Type:</p>
                    <p className="font-medium dark:text-white">
                      {selectedMatch.type || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Status:</p>
                    <p className="font-medium dark:text-white">
                      {selectedMatch.status || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Result:</p>
                    <p className="font-medium dark:text-white">
                      {selectedMatch.result || "-"}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium dark:text-white mb-4 text-lg border-b border-gray-200 dark:border-gray-600 pb-2">
                  Performance Statistics
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {(
                    [
                      { label: "Goals", value: selectedMatch.goals },
                      { label: "Assists", value: selectedMatch.assists },
                      { label: "Shots", value: selectedMatch.shots },
                      {
                        label: "Shots on Target",
                        value: selectedMatch.shotsOnTarget,
                      },
                      { label: "Passes", value: selectedMatch.passes },
                    ] as const
                  ).map(({ label, value }) => (
                    <div
                      key={label}
                      className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
                    >
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        {label}
                      </p>
                      <p className="text-2xl font-bold dark:text-white">
                        {value || "0"}
                      </p>
                    </div>
                  ))}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                          Yellow Cards
                        </p>
                        <p className="text-2xl font-bold dark:text-white">
                          {selectedMatch.yellowcards || "0"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                          Red Cards
                        </p>
                        <p className="text-2xl font-bold dark:text-white">
                          {selectedMatch.redcards || "0"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() => setStatsModalOpen(false)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMatches;
