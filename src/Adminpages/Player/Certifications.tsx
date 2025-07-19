import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import profile from "../../assets/images/avatar.png";
import {
  Trash2,
  FileText,
  Pencil,
  Eye,
  MoreVertical,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const awards = [
  { expert: "Aarav Kumar", image: profile },
  { expert: "Meera Sharma", image: profile },
  { expert: "Ravi Desai", image: profile },
  { expert: "Sneha Verma", image: profile },
  { expert: "Karan Patel", image: profile },
  { expert: "Isha Nair", image: profile },
  { expert: "Rahul Mehta", image: profile },
  { expert: "Anjali Reddy", image: profile },
  { expert: "Devansh Rao", image: profile },
  { expert: "Pooja Iyer", image: profile },
];

const Cetification: React.FC = () => {
  const [selectedCertificate, setSelectedCertificate] = useState<string | null>(null);

  return (
    <div className="p-6 relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Certificates & Awards</h2>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader className="bg-red-50 dark:bg-gray-800 text-xl">
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Players</TableHead>
              <TableHead>Certificate</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {awards.map((award, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Checkbox />
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <img
                      src={award.image}
                      alt={award.expert}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <Link
                      to={`/expert-profile/${index + 1}`}
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      {award.expert}
                    </Link>
                  </div>
                </TableCell>

                <TableCell>
                  <button
                    onClick={() => setSelectedCertificate(award.image)}
                    className="flex items-center gap-1 text-sm text-fuchsia-800 hover:text-fuchsia-900 bg-fuchsia-100 p-1.5 rounded-xl cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    Certificate
                  </button>
                </TableCell>

                <TableCell className="flex gap-2 justify-center">
                  <Button size="icon" variant="ghost" title="View">
                    <Eye className="w-4 h-4 text-gray-600" />
                  </Button>
                  <Button size="icon" variant="ghost" title="Edit">
                    <Pencil className="w-4 h-4 text-blue-500" />
                  </Button>
                  <Button size="icon" variant="ghost" title="Delete">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                  <Button size="icon" variant="ghost" title="More">
                    <MoreVertical className="w-4 h-4 text-gray-600" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal popup for certificate */}
      {selectedCertificate && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="relative bg-white p-4 rounded-lg shadow-lg max-w-lg w-full dark:bg-gray-900">
            <button
              onClick={() => setSelectedCertificate(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold mb-3 text-center">
              Certificate Preview
            </h3>
            <img
              src={selectedCertificate}
              alt="Certificate"
              className="rounded border w-full object-contain"
            />
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-sm text-gray-500 dark:text-white">
        <div>Showing 1 out of 10</div>
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

export default Cetification;
