import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye, MoreVertical } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import profile from "../../assets/images/avatar.png";

const reviewData = [
  {
    fan: "Fan A",
    reviewer: "John Doe",
    statement: "Amazing team performance and coordination throughout the season!",
  },
  {
    fan: "Fan B",
    reviewer: "Jane Smith",
    statement: "Very impressed with the dedication and sportsmanship shown.",
  },
  {
    fan: "Fan C",
    reviewer: "Rahul Mehta",
    statement: "The team consistently exceeds expectations every game.",
  },
  {
    fan: "Fan D",
    reviewer: "Sara Ali",
    statement: "A pleasure to follow their journey—truly inspirational!",
  },
  {
    fan: "Fan A",
    reviewer: "John Doe",
    statement: "Amazing team performance and coordination throughout the season!",
  },
  {
    fan: "Fan B",
    reviewer: "Jane Smith",
    statement: "Very impressed with the dedication and sportsmanship shown.",
  },
  {
    fan: "Fan C",
    reviewer: "Rahul Mehta",
    statement: "The team consistently exceeds expectations every game.",
  },
  {
    fan: "Fan D",
    reviewer: "Sara Ali",
    statement: "A pleasure to follow their journey—truly inspirational!",
  },
];

const FansReviews: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Fan Reviews</h2>
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader className="bg-red-50 dark:bg-gray-800 text-xl">
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Fans Name</TableHead>
              <TableHead>Reviewer Name</TableHead>
              <TableHead>Review Statement</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviewData.map((review, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Checkbox />
                </TableCell>

                {/* Fan Name with Avatar */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <img
                      src={profile}
                      alt={review.fan}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-blue-700 font-medium">{review.fan}</span>
                  </div>
                </TableCell>

                {/* Reviewer Name with Avatar */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <img
                      src={profile}
                      alt={review.reviewer}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span>{review.reviewer}</span>
                  </div>
                </TableCell>

                <TableCell>
                  <a
                    href="#"
                    className="text-blue-600 hover:underline"
                    title="Click to read full review"
                  >
                    Show Statement
                  </a>
                </TableCell>

                <TableCell className="flex gap-2 justify-center">
                  <Button size="icon" variant="ghost">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <Pencil className="w-4 h-4 text-gray-600 dark:text-white" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <Eye className="w-4 h-4 text-gray-600 dark:text-white" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <MoreVertical className="w-4 h-4 text-gray-600 dark:text-white" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-sm text-gray-500 dark:text-white">
        <div>Showing 1 out of {reviewData.length}</div>
        <div className="flex gap-1">
          <button className="border px-2 rounded">⟨</button>
          <button className="border px-2 rounded bg-gray-200">1</button>
          <button className="border px-2 rounded">2</button>
          <button className="border px-2 rounded">⟩</button>
        </div>
      </div>
    </div>
  );
};

export default FansReviews;
