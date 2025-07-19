import React from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Eye, Pencil, Trash2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import avatar from "../../assets/images/avatar.png";

const paymentData = [
  {
    bookingId: "BKG-1001",
    expert: "Aarav Kumar",
    player: "Riya Sen",
    service: "Fitness Coaching",
    amount: 1500,
    status: "Paid",
  },
  {
    bookingId: "BKG-1002",
    expert: "Meera Sharma",
    player: "Kabir Mehta",
    service: "Nutrition Plan",
    amount: 1200,
    status: "Pending",
  },
  {
    bookingId: "BKG-1003",
    expert: "Aarav Kumar",
    player: "Riya Sen",
    service: "Strength Training",
    amount: 1800,
    status: "Paid",
  },
   {
    bookingId: "BKG-1001",
    expert: "Aarav Kumar",
    player: "Riya Sen",
    service: "Fitness Coaching",
    amount: 1500,
    status: "Paid",
  },
  {
    bookingId: "BKG-1002",
    expert: "Meera Sharma",
    player: "Kabir Mehta",
    service: "Nutrition Plan",
    amount: 1200,
    status: "Pending",
  },
  {
    bookingId: "BKG-1003",
    expert: "Aarav Kumar",
    player: "Riya Sen",
    service: "Strength Training",
    amount: 1800,
    status: "Paid",
  },
   {
    bookingId: "BKG-1001",
    expert: "Aarav Kumar",
    player: "Riya Sen",
    service: "Fitness Coaching",
    amount: 1500,
    status: "Paid",
  },
  {
    bookingId: "BKG-1002",
    expert: "Meera Sharma",
    player: "Kabir Mehta",
    service: "Nutrition Plan",
    amount: 1200,
    status: "Pending",
  },
  {
    bookingId: "BKG-1003",
    expert: "Aarav Kumar",
    player: "Riya Sen",
    service: "Strength Training",
    amount: 1800,
    status: "Paid",
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Paid":
      return "bg-green-200 text-green-800 w-full p-1.5";
    case "Pending":
      return "bg-yellow-200 text-yellow-800 w-full p-1.5";
    default:
      return "bg-gray-200 text-gray-700";
  }
};

const PaymentClaims: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Payment Claims</h2>
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader className="bg-red-50 dark:bg-gray-800 text-xl">
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Experts</TableHead>
              <TableHead>Players</TableHead>
              <TableHead>Service Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
              <TableHead>Claim</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paymentData.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.bookingId}</TableCell>

                {/* Expert with avatar */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <img
                      src={avatar}
                      alt={item.expert}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <Link
                      to={`/expert/${index + 1}`}
                      className="text-blue-600 hover:underline"
                    >
                      {item.expert}
                    </Link>
                  </div>
                </TableCell>

                {/* Player with avatar */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <img
                      src={avatar}
                      alt={item.player}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <Link
                      to={`/player/${index + 1}`}
                      className="text-blue-600 hover:underline"
                    >
                      {item.player}
                    </Link>
                  </div>
                </TableCell>

                <TableCell>{item.service}</TableCell>
                <TableCell className="font-medium">₹{item.amount}</TableCell>

                <TableCell>
                  <Badge className={`text-xs px-2 ${getStatusBadge(item.status)}`}>
                    {item.status}
                  </Badge>
                </TableCell>

                <TableCell>
                  <div className="flex gap-2 justify-center">
                    <Button size="icon" variant="ghost">
                      <Eye className="w-4 h-4 text-gray-600" />
                    </Button>
                    <Button size="icon" variant="ghost">
                      <Pencil className="w-4 h-4 text-blue-500" />
                    </Button>
                    <Button size="icon" variant="ghost">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                    <Button size="icon" variant="ghost">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>

                <TableCell>
                  <Button size="sm" className="bg-yellow-200 hover:bg-yellow-300 text-black">
                    Claim
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PaymentClaims;
