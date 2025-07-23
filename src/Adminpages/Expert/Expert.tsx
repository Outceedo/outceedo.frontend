import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableHeader,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye, MoreVertical } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import profile from "../../assets/images/avatar.png";
import { Link } from "react-router-dom";

const experts = [
  {
    id: 1,
    image: profile,
    name: "User One",
    joined: "18th June 2025",
    Service: "Online Video Assessment",
    fee: "400",
    status: "Inactive",
  },
  {
    id: 2,
    image: profile,
    name: "User Two",
    joined: "18th June 2025",
    Service: "1-on-1 Online Training or advice",
    fee: "500.00",
    status: "Active",
  },
  {
    id: 3,
    image: profile,
    name: "User Three",
    joined: "18th June 2025",
    Service: "1-on-1 Online Training or advice",
    fee: "400",
    status: "Active",
  },
  {
    id: 4,
    image: profile,
    name: "User Four",
    joined: "18th June 2025",
    Service: "Online Video Assessment",
    fee: "500.00",
    status: "Active",
  },
  {
    id: 5,
    image: profile,
    name: "User Five",
    joined: "18th June 2025",
    Service: "On-Field Live Assessment",
    fee: "400",
    status: "Inactive",
  },
  {
    id: 6,
    image: profile,
    name: "User Six",
    joined: "18th June 2025",
    Service: "Online Video Assessment",
    fee: "500.00",
    status: "Active",
  },
  {
    id: 7,
    image: profile,
    name: "User Seven",
    joined: "18th June 2025",
    Service: "On-Field Live Assessment",
    fee: "400",
    status: "Inactive",
  },
  {
    id: 8,
    image: profile,
    name: "User Eight",
    joined: "18th June 2025",
    Service: "Online Video Assessment",
    fee: "500.00",
    status: "Inactive",
  },
  {
    id: 9,
    image: profile,
    name: "User Nine",
    joined: "18th June 2025",
   Service: "On-Field Live Assessment",
    fee: "500.00",
    status: "Active",
  },
  {
    id: 10,
    image: profile,
    name: "User Ten",
    joined: "18th June 2025",
    Service: "Online Video Assessment",
    fee: "500.00",
    status: "Inactive",
  },
];

const expert: React.FC = () => {
  const [months, setMonths] = useState<string[]>([]);
const [currentPage, setCurrentPage] = useState(1);
const pageSize = 10;

const totalPages = Math.ceil(experts.length / pageSize);
const paginatedexperts = experts.slice(
  (currentPage - 1) * pageSize,
  currentPage * pageSize
);
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
  <h2 className="text-xl md:text-2xl font-semibold">Experts Details</h2>

  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
    <div className="relative w-full sm:w-64 dark:bg-slate-600 dark:text-white rounded-lg">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
      <Input
        type="text"
        placeholder="Search by name"
        className="pl-9 w-full dark:bg-slate-700 text-sm sm:text-base"
      />
    </div>

    <select className="border px-3 py-2 rounded-md dark:bg-gray-900 w-full sm:w-auto">
      {months.map((month, index) => (
        <option key={index} value={month}>
          {month}
        </option>
      ))}
    </select>
  </div>
</div>

     <div className="rounded-lg border overflow-x-auto">
      <Table className="min-w-[800px]">
          <TableHeader className="bg-red-50 dark:bg-gray-800 text-xl w-full">
            <TableRow>
              <TableHead className="px-4 py-3" />
              <TableHead className="px-4 py-3">Expert Name</TableHead>
              <TableHead className="px-4 py-3">Registration Date</TableHead>
              <TableHead className="px-4 py-3">Service Type</TableHead>
              <TableHead className="px-4 py-3">Service Fee</TableHead>
              <TableHead className="px-4 py-3">Status</TableHead>
              <TableHead className="px-4 py-3 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedexperts.map((expert, index) => (
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
                    <Link
                      to={`/expert-profile/${expert.id}`}
                      className="text-blue-600 underline" >
                      {expert.name}
                    </Link>
                  </div>
                </TableCell>
                <TableCell>{expert.joined}</TableCell>
                <TableCell>{expert.Service}</TableCell>
                <TableCell className="font-bold">£{Number(expert.fee).toFixed(2)}</TableCell>
               <TableCell>
                  <Badge
                    className={
                      expert.status === "Active"
                        ? "bg-green-200 text-green-800 p-2 w-20"
                        : "bg-yellow-200 text-yellow-800 p-2 w-20"
                    }
                  >
                    {expert.status}
                  </Badge>
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
<div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-2 text-sm text-gray-500 dark:text-white">
  <div>
    Showing {Math.min((currentPage - 1) * pageSize + 1, experts.length)}–{Math.min(currentPage * pageSize, experts.length)} out of {experts.length}
  </div>
  <div className="flex gap-1">
    <button
      className="border px-2 rounded"
      disabled={currentPage === 1}
      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
    >
      ⟨
    </button>
    {Array.from({ length: totalPages }, (_, i) => (
      <button
        key={i}
        className={`border px-2 rounded ${currentPage === i + 1 ? "bg-gray-300" : ""}`}
        onClick={() => setCurrentPage(i + 1)}
      >
        {i + 1}
      </button>
    ))}

    <button
      className="border px-2 rounded"
      disabled={currentPage === totalPages}
      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
    >
      ⟩
    </button>
  </div>
</div>
    </div>
  );
};
export default expert;