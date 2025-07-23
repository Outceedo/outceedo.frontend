import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import avatar from "../../assets/images/avatar.png"; // ✅ Make sure this path is correct

const applications = [
  {
    applicationId: "APP-001",
    date: "01 Jul 2025",
    sponsor: "Sponsor A",
    player: "Player X",
    type: "Full",
    amount: "₹50,000",
    appliedDate: "02 Jul 2025",
    status: "Approved",
  },
  {
    applicationId: "APP-002",
    date: "05 Jul 2025",
    sponsor: "Sponsor B",
    player: "Player Y",
    type: "Partial",
    amount: "₹30,000",
    appliedDate: "06 Jul 2025",
    status: "Pending",
  },
  {
    applicationId: "APP-003",
    date: "10 Jul 2025",
    sponsor: "Sponsor C",
    player: "Player Z",
    type: "Event",
    amount: "₹10,000",
    appliedDate: "11 Jul 2025",
    status: "Rejected",
  },
  {
    applicationId: "APP-001",
    date: "01 Jul 2025",
    sponsor: "Sponsor A",
    player: "Player X",
    type: "Full",
    amount: "₹50,000",
    appliedDate: "02 Jul 2025",
    status: "Approved",
  },
  {
    applicationId: "APP-002",
    date: "05 Jul 2025",
    sponsor: "Sponsor B",
    player: "Player Y",
    type: "Partial",
    amount: "₹30,000",
    appliedDate: "06 Jul 2025",
    status: "Pending",
  },
  {
    applicationId: "APP-003",
    date: "10 Jul 2025",
    sponsor: "Sponsor C",
    player: "Player Z",
    type: "Event",
    amount: "₹10,000",
    appliedDate: "11 Jul 2025",
    status: "Rejected",
  },
  {
    applicationId: "APP-001",
    date: "01 Jul 2025",
    sponsor: "Sponsor A",
    player: "Player X",
    type: "Full",
    amount: "₹50,000",
    appliedDate: "02 Jul 2025",
    status: "Approved",
  },
  {
    applicationId: "APP-002",
    date: "05 Jul 2025",
    sponsor: "Sponsor B",
    player: "Player Y",
    type: "Partial",
    amount: "₹30,000",
    appliedDate: "06 Jul 2025",
    status: "Pending",
  },
  {
    applicationId: "APP-003",
    date: "10 Jul 2025",
    sponsor: "Sponsor C",
    player: "Player Z",
    type: "Event",
    amount: "₹10,000",
    appliedDate: "11 Jul 2025",
    status: "Rejected",
  },
];

const SponsorApplications: React.FC = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Sponsor Applications</h2>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader className="bg-red-50 dark:bg-gray-800 text-xl">
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Application ID</TableHead>
              <TableHead>Sponsors</TableHead>
              <TableHead>Players</TableHead>
              <TableHead>Sponsors Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Request Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {applications.map((app, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Checkbox />
                </TableCell>

                <TableCell>
                  <a href="#" className="text-blue-600 hover:underline">
                    {app.applicationId}
                  </a>
                  <div className="text-xs text-gray-500">{app.date}</div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <img
                      src={avatar}
                      alt={app.sponsor}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <a href="#" className="text-blue-600 hover:underline">
                      {app.sponsor}
                    </a>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <img
                      src={avatar}
                      alt={app.player}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <a href="#" className="text-blue-600 hover:underline">
                      {app.player}
                    </a>
                  </div>
                </TableCell>

                <TableCell>{app.type}</TableCell>
                <TableCell>{app.amount}</TableCell>
                <TableCell>{app.appliedDate}</TableCell>

                <TableCell>
                  <Badge
                    className={
                      app.status === "Approved"
                        ? "bg-green-200 text-green-800 p-2 w-20"
                        : app.status === "Rejected"
                        ? "bg-red-200 text-red-800 p-2 w-20"
                        : "bg-yellow-200 text-yellow-800 p-2 w-20"
                    }
                  >
                    {app.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SponsorApplications;
