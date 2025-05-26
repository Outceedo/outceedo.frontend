import "react-circular-progressbar/dist/styles.css";
import { useState } from "react";
import CommonForm from "../common/Commonform";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, BookOpen, X, AlertTriangle } from "lucide-react";

interface Match {
  id: number;
  date: string;
  homeTeam: string;
  awayTeam: string;
  type: string;
  status: string;
  result: string;
  // Stats fields
  goals?: string;
  assists?: string;
  shots?: string;
  shotsontarget?: string;
  passes?: string;
  yellowcards?: string;
  redcards?: string;
}

const Matches: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([
    {
      id: 1,
      date: "2025-02-14",
      homeTeam: "ByeWind",
      awayTeam: "ByeWind",
      type: "State",
      status: "won",
      result: "2 - 0",
      goals: "2",
      assists: "1",
      shots: "8",
      shotsontarget: "5",
      passes: "245",
      yellowcards: "1",
      redcards: "0",
    },
    {
      id: 2,
      date: "2025-02-10",
      homeTeam: "Natali Craig",
      awayTeam: "Natali Craig",
      type: "Inter university",
      status: "won",
      result: "1 - 0",
      goals: "1",
      assists: "1",
      shots: "6",
      shotsontarget: "3",
      passes: "198",
      yellowcards: "2",
      redcards: "0",
    },
    {
      id: 3,
      date: "2025-01-20",
      homeTeam: "Drew Cano",
      awayTeam: "Drew Cano",
      type: "International",
      status: "won",
      result: "1 - 0",
      goals: "1",
      assists: "0",
      shots: "4",
      shotsontarget: "2",
      passes: "178",
      yellowcards: "0",
      redcards: "0",
    },
    {
      id: 4,
      date: "2024-12-15",
      homeTeam: "Orlando Diggs",
      awayTeam: "Orlando Diggs",
      type: "State",
      status: "won",
      result: "2 - 0",
      goals: "2",
      assists: "2",
      shots: "7",
      shotsontarget: "4",
      passes: "210",
      yellowcards: "1",
      redcards: "0",
    },
    {
      id: 5,
      date: "2024-11-25",
      homeTeam: "Andi Lane",
      awayTeam: "Andi Lane",
      type: "State",
      status: "won",
      result: "3 - 0",
      goals: "3",
      assists: "2",
      shots: "9",
      shotsontarget: "6",
      passes: "260",
      yellowcards: "0",
      redcards: "0",
    },
  ]);

  const [formData, setFormData] = useState<Match>({
    id: 0,
    date: "",
    homeTeam: "",
    awayTeam: "",
    type: "",
    status: "",
    result: "",
    goals: "",
    assists: "",
    shots: "",
    shotsontarget: "",
    passes: "",
    yellowcards: "",
    redcards: "",
  });

  const [editingId, setEditingId] = useState<number | null>(null);

  // State for the stats modal
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  // State for the delete confirmation modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId !== null) {
      setMatches(
        (prevMatches) =>
          prevMatches
            .map((match) =>
              match.id === editingId ? { ...formData, id: editingId } : match
            )
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            ) // Sort matches by date
      );
      setEditingId(null);
    } else {
      setMatches(
        (prevMatches) =>
          [...prevMatches, { ...formData, id: prevMatches.length + 1 }].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          ) // Sort matches by date
      );
    }

    setFormData({
      id: 0,
      date: "",
      homeTeam: "",
      awayTeam: "",
      type: "",
      status: "",
      result: "",
      goals: "",
      assists: "",
      shots: "",
      shotsontarget: "",
      passes: "",
      yellowcards: "",
      redcards: "",
    });
  };

  const handleEdit = (id: number) => {
    const matchToEdit = matches.find((match) => match.id === id);
    if (matchToEdit) {
      setFormData(matchToEdit);
      setEditingId(id);
    }
  };

  // Updated to show confirmation modal
  const handleDeleteClick = (id: number) => {
    setMatchToDelete(id);
    setDeleteModalOpen(true);
  };

  // Actual delete function
  const confirmDelete = () => {
    if (matchToDelete !== null) {
      setMatches(matches.filter((match) => match.id !== matchToDelete));
      setDeleteModalOpen(false);
      setMatchToDelete(null);
    }
  };

  const handleViewStats = (match: Match) => {
    setSelectedMatch(match);
    setStatsModalOpen(true);
  };

  const formControls = [
    { name: "date", label: "Date", componentType: "input", type: "date" },
    {
      name: "homeTeam",
      label: "Home Team",
      componentType: "input",
      type: "text",
    },
    {
      name: "awayTeam",
      label: "Away Team",
      componentType: "input",
      type: "text",
    },
    { name: "type", label: "Type", componentType: "input", type: "text" },
    { name: "status", label: "Status", componentType: "input", type: "text" },
    { name: "result", label: "Result", componentType: "textarea" },
    { name: "goals", label: "Goals", componentType: "input", type: "text" },
    { name: "assists", label: "Assists", componentType: "input", type: "text" },
    { name: "shots", label: "Shots", componentType: "input", type: "text" },
    {
      name: "shotsontarget",
      label: "Shots on Target",
      componentType: "input",
      type: "text",
    },
    { name: "passes", label: "Passes", componentType: "input", type: "text" },
    {
      name: "yellowcards",
      label: "Yellow Cards",
      componentType: "input",
      type: "text",
    },
    {
      name: "redcards",
      label: "Red Cards",
      componentType: "input",
      type: "text",
    },
  ];

  // Get match details by ID
  const getMatchDetails = (id: number | null): Match | undefined => {
    if (id === null) return undefined;
    return matches.find((match) => match.id === id);
  };

  const matchToDeleteDetails = getMatchDetails(matchToDelete);

  return (
    <div className="container mx-auto p-4 space-y-6 dark:bg-gray-900">
      <div className="grid grid-cols-1 gap-6">
        {/* Match Form */}
        <Card className="w-full dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="dark:text-gray-200">
            <CommonForm
              formControls={formControls}
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
              buttonText={editingId !== null ? "Update" : "Submit"}
              isBtnDisabled={false}
              onCancel={() => {
                setFormData({
                  id: 0,
                  date: "",
                  homeTeam: "",
                  awayTeam: "",
                  type: "",
                  status: "",
                  result: "",
                  goals: "",
                  assists: "",
                  shots: "",
                  shotsontarget: "",
                  passes: "",
                  yellowcards: "",
                  redcards: "",
                });
                setEditingId(null);
              }}
            />
          </CardContent>
        </Card>

        {/* Match Table */}
        <Card className="w-full dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="dark:border-gray-700" />
          <CardContent>
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
                    <TableHead className="dark:text-gray-300">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matches.length === 0 ? (
                    <TableRow className="dark:border-gray-700">
                      <TableCell
                        colSpan={8}
                        className="text-center dark:text-gray-300"
                      >
                        No matches found
                      </TableCell>
                    </TableRow>
                  ) : (
                    matches.map((match, index) => (
                      <TableRow
                        key={match.id}
                        className={
                          index % 2 === 0
                            ? "bg-white dark:bg-gray-800"
                            : "bg-gray-100 dark:bg-gray-700"
                        }
                      >
                        <TableCell className="font-medium dark:text-gray-300">
                          {match.date}
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
                            onClick={() => handleViewStats(match)}
                            className="dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-gray-700"
                          >
                            <BookOpen className="h-4 w-4" />
                            <span className="sr-only">View Stats</span>
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEdit(match.id)}
                              className="dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDeleteClick(match.id)}
                              className="text-destructive dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-gray-700"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Modal */}
      {statsModalOpen && selectedMatch && (
        <div className="fixed inset-0 z-50 flex justify-center items-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm"></div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md z-50">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
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
              <div className="mb-4">
                <h3 className="font-medium text-lg dark:text-white mb-2">
                  {selectedMatch.homeTeam} vs {selectedMatch.awayTeam}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedMatch.date} • {selectedMatch.type} •{" "}
                  {selectedMatch.status}
                </p>
                <p className="text-lg font-bold mt-1 dark:text-white">
                  Result: {selectedMatch.result}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <h4 className="font-medium dark:text-white mb-2">
                    Performance Statistics
                  </h4>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Goals
                  </p>
                  <p className="text-xl font-bold dark:text-white">
                    {selectedMatch.goals || "0"}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Assists
                  </p>
                  <p className="text-xl font-bold dark:text-white">
                    {selectedMatch.assists || "0"}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Shots
                  </p>
                  <p className="text-xl font-bold dark:text-white">
                    {selectedMatch.shots || "0"}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Shots on Target
                  </p>
                  <p className="text-xl font-bold dark:text-white">
                    {selectedMatch.shotsontarget || "0"}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Passes
                  </p>
                  <p className="text-xl font-bold dark:text-white">
                    {selectedMatch.passes || "0"}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg flex justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Yellow Cards
                    </p>
                    <p className="text-xl font-bold dark:text-white">
                      {selectedMatch.yellowcards || "0"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Red Cards
                    </p>
                    <p className="text-xl font-bold dark:text-white">
                      {selectedMatch.redcards || "0"}
                    </p>
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

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && matchToDeleteDetails && (
        <div className="fixed inset-0 z-50 flex justify-center items-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm"></div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md z-50">
            <div className="flex items-center p-4 border-b dark:border-gray-700">
              <div className="flex justify-center items-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 mr-3">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold dark:text-white">
                Confirm Delete
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteModalOpen(false)}
                className="ml-auto dark:text-gray-400 hover:dark:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6">
              <div className="mb-6 text-center">
                <p className="text-gray-700 dark:text-gray-200 mb-4">
                  Are you sure you want to delete this match record?
                </p>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                  <p className="font-medium dark:text-white">
                    {matchToDeleteDetails.homeTeam} vs{" "}
                    {matchToDeleteDetails.awayTeam}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {matchToDeleteDetails.date} • {matchToDeleteDetails.type}
                  </p>
                  <p className="text-sm font-bold mt-1 dark:text-gray-300">
                    Result: {matchToDeleteDetails.result}
                  </p>
                </div>
                <p className="text-red-500 dark:text-red-400 text-sm">
                  This action cannot be undone.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDeleteModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Matches;
