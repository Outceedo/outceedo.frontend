
import React, { useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import profile from "../../assets/images/avatar.png";

const expert = [
  { image: profile, name: "User name", joined: "18th June 2025", header: "Inactive" },
  { image: profile, name: "User name", joined: "18th June 2025",  header: "Active" },
  { image: profile, name: "User name", joined: "18th June 2025",  header: "Active" },
  { image: profile, name: "User name", joined: "18th June 2025", header: "Active" },
  { image: profile, name: "User name", joined: "18th June 2025",  header: "Inactive" },
  { image: profile, name: "User name", joined: "18th June 2025",  header: "Active" },
  { image: profile, name: "User name", joined: "18th June 2025",  header: "Inactive" },
  { image: profile, name: "User name", joined: "18th June 2025",  header: "Inactive" },
  { image: profile, name: "User name", joined: "18th June 2025",  header: "Active" },
  { image: profile, name: "User name", joined: "18th June 2025", header: "Inactive" },
];

const Expert: React.FC = () => {
  const [months, setMonths] = useState<string[]>([]);

  useEffect(() => {
    const fetchMonths = () => {
      const monthList = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      setTimeout(() => {
        setMonths(monthList);
      }, 500);
    };

    fetchMonths();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Expert Details</h2>
        <select className="border px-3 py-2 rounded-md dark:bg-gray-900">
          {months.map((month, index) => (
            <option key={index} value={month}>
              {month}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader className="bg-red-50 dark:bg-gray-800">
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Expert Names</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Header</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {expert.map((expert, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Checkbox />
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-3">
                    <img
                      src={expert.image}
                      alt={expert.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span>{expert.name}</span>
                  </div>
                </TableCell>

                <TableCell>{expert.joined}</TableCell>
                

                <TableCell>
                  <Badge
                    className={
                      expert.header === "Active"
                        ? "bg-green-200 text-green-800 p-1 w-16"
                        : "bg-yellow-200 text-yellow-800 p-1 w-16"
                    }
                  >
                    {expert.header}
                  </Badge>
                </TableCell>

                <TableCell className="flex gap-2 justify-end">
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

      <div className="flex items-center justify-between mt-4 text-sm text-gray-500 dark:text-white">
        <div>Showing 1 out 100</div>
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

export default Expert;
