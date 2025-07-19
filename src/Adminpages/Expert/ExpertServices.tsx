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
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";
import profile from "../../assets/images/avatar.png"; // Replace with your actual image

const expertData = [
  {
    id: 1,
    name: "Aarav Kumar",
    image: profile,
    services: [
      { name: "Fitness Coaching", amount: 1500 },
      { name: "Diet Consultation", amount: 1000 },
    ],
    availableSlots: ["10:00 AM", "2:00 PM", "6:00 PM"],
  },
  {
    id: 2,
    name: "Meera Sharma",
    image: profile,
    services: [
      { name: "Yoga Session", amount: 1200 },
      { name: "Mental Wellness", amount: 900 },
    ],
    availableSlots: ["9:30 AM", "1:00 PM", "5:30 PM"],
  },
  {
    id: 1,
    name: "Aarav Kumar",
    image: profile,
    services: [
      { name: "Fitness Coaching", amount: 1500 },
      { name: "Diet Consultation", amount: 1000 },
    ],
    availableSlots: ["10:00 AM", "2:00 PM", "6:00 PM"],
  },
  {
    id: 2,
    name: "Meera Sharma",
    image: profile,
    services: [
      { name: "Yoga Session", amount: 1200 },
      { name: "Mental Wellness", amount: 900 },
    ],
    availableSlots: ["9:30 AM", "1:00 PM", "5:30 PM"],
  },
  {
    id: 1,
    name: "Aarav Kumar",
    image: profile,
    services: [
      { name: "Fitness Coaching", amount: 1500 },
      { name: "Diet Consultation", amount: 1000 },
    ],
    availableSlots: ["10:00 AM", "2:00 PM", "6:00 PM"],
  },
  {
    id: 2,
    name: "Meera Sharma",
    image: profile,
    services: [
      { name: "Yoga Session", amount: 1200 },
      { name: "Mental Wellness", amount: 900 },
    ],
    availableSlots: ["9:30 AM", "1:00 PM", "5:30 PM"],
  },
  {
    id: 1,
    name: "Aarav Kumar",
    image: profile,
    services: [
      { name: "Fitness Coaching", amount: 1500 },
      { name: "Diet Consultation", amount: 1000 },
    ],
    availableSlots: ["10:00 AM", "2:00 PM", "6:00 PM"],
  },
  {
    id: 2,
    name: "Meera Sharma",
    image: profile,
    services: [
      { name: "Yoga Session", amount: 1200 },
      { name: "Mental Wellness", amount: 900 },
    ],
    availableSlots: ["9:30 AM", "1:00 PM", "5:30 PM"],
  },
];

const ExpertServices: React.FC = () => {
  return (
    <div className="p-6 overflow-x-auto">
      <h2 className="text-2xl font-semibold mb-4">Expert Services</h2>

      <Table>
        <TableHeader className="bg-red-50 dark:bg-gray-800 text-xl">
          <TableRow>
            <TableHead></TableHead>
            <TableHead>Experts</TableHead>
            <TableHead>Services with Amount</TableHead>
            <TableHead className="text-center">Calendar Time Slots</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {expertData.map((expert) => (
            <TableRow key={expert.id}>
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
                    to={`/expert/${expert.id}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {expert.name}
                  </Link>
                </div>
              </TableCell>

              <TableCell>
                <ul className="list-disc pl-5 space-y-1">
                  {expert.services.map((service, idx) => (
                    <li key={idx}>
                      {service.name} – ₹{service.amount}
                    </li>
                  ))}
                </ul>
              </TableCell>

              <TableCell className="text-center">
                <div className="flex flex-wrap gap-2 justify-center">
                  {expert.availableSlots.map((slot, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      className="bg-gray-100 dark:bg-gray-800"
                    >
                      <CalendarDays className="w-4 h-4 mr-1" />
                      {slot}
                    </Button>
                  ))}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ExpertServices;
