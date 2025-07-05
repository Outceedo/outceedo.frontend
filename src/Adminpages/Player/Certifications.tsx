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

const awards = [
  { invoice: "#923", date: "Sun Nov 26 2023 11:46", image: profile, player: "Text cell lg", amount: 719.0, showDate: "12-06-2025" },
  { invoice: "#043", date: "Wed Aug 09 2023 15:14", image: profile, player: "Text cell lg", amount: 198.0, showDate: "12-06-2025" },
  { invoice: "#042", date: "Thu Nov 23 2023 10:30", image: profile, player: "Text cell lg", amount: 674.0, showDate: "12-06-2025" },
  { invoice: "#023", date: "Tue Sep 12 2023 02:17", image: profile, player: "Text cell lg", amount: 393.0, showDate: "12-06-2025" },
  { invoice: "#098", date: "Sun Nov 26 2023 07:00", image: profile, player: "Text cell lg", amount: 731.0, showDate: "12-06-2025" },
  { invoice: "#064", date: "Sun Apr 21 2024 21:29", image: profile, player: "Text cell lg", amount: 197.0, showDate: "12-06-2025" },
  { invoice: "#334", date: "Thu Feb 15 2024 01:55", image: profile, player: "Text cell lg", amount: 970.0, showDate: "12-06-2025" },
  { invoice: "#754", date: "Wed Nov 22 2023 06:48", image: profile, player: "Text cell lg", amount: 448.0, showDate: "12-06-2025" },
  { invoice: "#23", date: "Sun Feb 04 2024 10:56", image: profile, player: "Text cell lg", amount: 764.0, showDate: "12-06-2025" },
  { invoice: "#221", date: "Fri Jul 21 2023 19:47:52", image: profile, player: "Text cell lg", amount: 385.0, showDate: "12-06-2025" },
];

const Certificates: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Certificates & Awards</h2>
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader className="bg-red-50 dark:bg-gray-800">
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Invoice</TableHead>
              <TableHead>Player</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {awards.map((award, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Checkbox />
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2 font-medium">
                    <i className="far fa-file-lines text-gray-500 text-sm dark:text-gray-400"></i>
                    <span>Application {award.invoice}</span>
                  </div>
                  <div className="text-sm text-gray-500">{award.date}</div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-3">
                    <img
                      src={award.image}
                      alt={award.player}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{award.player}</span>
                      <div className="text-sm text-gray-500">Secondary info</div>
                    </div>
                  </div>
                </TableCell>

                <TableCell>{award.amount.toFixed(2)}</TableCell>
                <TableCell>{award.showDate}</TableCell>
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

export default Certificates;
