import React from "react";
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

const reports = [
  { invoice: "#923", date: "Sun Nov 26 2023 11:46", expert: "Text cell lg", image: profile, player: "Text cell lg", assessment: "Online Video Assessment", showDate: "12-06-2025" },
  { invoice: "#043", date: "Wed Aug 09 2023 15:14", expert: "Text cell lg", image: profile, player: "Text cell lg", assessment: "1-on-1 Online Training or advice", showDate: "12-06-2025" },
  { invoice: "#042", date: "Thu Nov 23 2023 18:00", expert: "Text cell lg", image: profile, player: "Text cell lg", assessment: "Online Video Assessment", showDate: "12-06-2025" },
  { invoice: "#023", date: "Tue Sep 12 2023 02:17", expert: "Text cell lg", image: profile, player: "Text cell lg", assessment: "On-Field Live Assessment", showDate: "12-06-2025" },
  { invoice: "#098", date: "Sun Nov 26 2023 07:03", expert: "Text cell lg", image: profile, player: "Text cell lg", assessment: "1-on-1 Online Training or advice", showDate: "12-06-2025" },
  { invoice: "#064", date: "Sun Apr 21 2024 21:29", expert: "Text cell lg", image: profile, player: "Text cell lg", assessment: "Online Video Assessment", showDate: "12-06-2025" },
  { invoice: "#334", date: "Thu Feb 15 2024 01:55", expert: "Text cell lg", image: profile, player: "Text cell lg", assessment: "1-on-1 Online Training or advice", showDate: "12-06-2025" },
  { invoice: "#754", date: "Wed Nov 22 2023 06:48", expert: "Text cell lg", image: profile, player: "Text cell lg", assessment: "On-Field Live Assessment", showDate: "12-06-2025" },
  { invoice: "#23", date: "Sun Feb 04 2024 10:55:56", expert: "Text cell lg", image: profile, player: "Text cell lg", assessment: "Online Video Assessment", showDate: "12-06-2025" },
  { invoice: "#221", date: "Fri Jul 21 2023 19:47:52", expert: "Text cell lg", image: profile, player: "Text cell lg", assessment: "On-Field Live Assessment", showDate: "12-06-2025" },
];

const ExportReports: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Reports</h2>
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader className="bg-red-50 dark:bg-gray-800">
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Invoice</TableHead>
              <TableHead>Expert</TableHead>
              <TableHead>Player</TableHead>
              <TableHead>Assessment</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {reports.map((report, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Checkbox />
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2 font-medium">
                    <i className="far fa-file-lines text-gray-500 text-sm dark:text-gray-400"></i>
                    <span>Report {report.invoice}</span>
                  </div>
                  <div className="text-sm text-gray-500">{report.date}</div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-3">
                    <img
                      src={report.image}
                      alt={report.expert}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{report.expert}</span>
                      <div className="text-sm text-gray-500">Secondary info</div>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-3">
                    <img
                      src={report.image}
                      alt={report.player}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{report.player}</span>
                      <div className="text-sm text-gray-500">Secondary info</div>
                    </div>
                  </div>
                </TableCell>

                <TableCell>{report.assessment}</TableCell>
                <TableCell>{report.showDate}</TableCell>
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

export default ExportReports;
