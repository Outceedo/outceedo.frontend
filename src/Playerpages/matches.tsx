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
import { Pencil, Trash2 } from "lucide-react";

interface Match {
  id: number;
  date: string;
  homeTeam: string;
  awayTeam: string;
  type: string;
  status: string;
  result: string;
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
    },
    {
      id: 2,
      date: "2025-02-10",
      homeTeam: "Natali Craig",
      awayTeam: "Natali Craig",
      type: "Inter university",
      status: "won",
      result: "1 - 0",
    },
    {
      id: 3,
      date: "2025-01-20",
      homeTeam: "Drew Cano",
      awayTeam: "Drew Cano",
      type: "International",
      status: "won",
      result: "1 - 0",
    },
    {
      id: 4,
      date: "2024-12-15",
      homeTeam: "Orlando Diggs",
      awayTeam: "Orlando Diggs",
      type: "State",
      status: "won",
      result: "2 - 0",
    },
    {
      id: 5,
      date: "2024-11-25",
      homeTeam: "Andi Lane",
      awayTeam: "Andi Lane",
      type: "State",
      status: "won",
      result: "3 - 0",
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
  });

  const [editingId, setEditingId] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId !== null) {
      setMatches(
        matches.map((match) =>
          match.id === editingId ? { ...formData, id: editingId } : match
        )
      );
      setEditingId(null);
    } else {
      setMatches([...matches, { ...formData, id: matches.length + 1 }]);
    }

    setFormData({
      id: 0,
      date: "",
      homeTeam: "",
      awayTeam: "",
      type: "",
      status: "",
      result: "",
    });
  };

  const handleEdit = (id: number) => {
    const matchToEdit = matches.find((match) => match.id === id);
    if (matchToEdit) {
      setFormData(matchToEdit);
      setEditingId(id);
    }
  };

  const handleDelete = (id: number) => {
    setMatches(matches.filter((match) => match.id !== id));
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
  ];

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {/* Match Form */}
        <Card className="w-full">
          <CardContent>
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
                });
                setEditingId(null);
              }}
            />
          </CardContent>
        </Card>

        {/* Match Table */}
        <Card className="w-full">
          <CardHeader />
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Home Team</TableHead>
                    <TableHead>Away Team</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matches.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        No matches found
                      </TableCell>
                    </TableRow>
                  ) : (
                    matches.map((match, index) => (
                      <TableRow
                        key={match.id}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
                      >
                        <TableCell className="font-medium">
                          {match.date}
                        </TableCell>
                        <TableCell>{match.homeTeam}</TableCell>
                        <TableCell>{match.awayTeam}</TableCell>
                        <TableCell>{match.type}</TableCell>
                        <TableCell>{match.status}</TableCell>
                        <TableCell>{match.result}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEdit(match.id)}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDelete(match.id)}
                              className="text-destructive"
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
    </div>
  );
};

export default Matches;