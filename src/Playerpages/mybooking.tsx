import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  faVideo, faFileAlt, faEye , faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import "react-circular-progressbar/dist/styles.css";
import SideNavbar from "./sideNavbar";
import React, { useState } from "react";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import PlayerHeader from "./playerheader";


interface Booking {
  id: number;
  expertName: string;
  date: string;
  service: string;
  amount: string;
  action: "Accepted" | "Rejected" | "Re-Scheduled";
  bookingStatus: "Paid" | "Not Paid" | "Pending";
}

const initialBookings: Booking[] = [
  { id: 145, expertName: "Cody Fisher", date: "2 Jan 2025", service: "Online Video Assessment", amount: "$20", action: "Accepted", bookingStatus: "Paid" },
  { id: 123, expertName: "Karen", date: "20 Dec 2024", service: "Online Live Assessment", amount: "$50", action: "Rejected", bookingStatus: "Paid" },
  { id: 432, expertName: "Samuel Moore", date: "12 Dec 2024", service: "Online 1 on 1 Advise", amount: "$25", action: "Re-Scheduled", bookingStatus: "Paid" },
  { id: 342, expertName: "Andy", date: "25 Nov 2024", service: "Online Video Assessment", amount: "$10", action: "Accepted", bookingStatus: "Not Paid" },
  { id: 100, expertName: "Miguel Mendes", date: "10 Oct 2024", service: "Online 1 on 1 Advise", amount: "$75", action: "Rejected", bookingStatus: "Pending" },
  { id: 70, expertName: "Jonatan Katalaskajo", date: "15 Sep 2024", service: "Online Video Assessment", amount: "$15", action: "Accepted", bookingStatus: "Pending" },
  { id: 32, expertName: "Michael", date: "2 Aug 2025", service: "Online 1 on 1 Advise", amount: "$150", action: "Re-Scheduled", bookingStatus: "Not Paid" },
];

const MyBooking: React.FC = () => {
  const [bookings] = useState<Booking[]>(initialBookings);
  const [bookingStatus, setBookingStatus] = useState(""); // Default empty (shows all)
  const [isVisible, setIsVisible] = useState(true);
  const [search, setSearch] = useState("");
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Accepted":
        return "bg-green-200 text-green-700";
      case "Rejected":
        return "bg-red-200 text-red-700";
      case "Re-Scheduled":
        return "bg-yellow-200 text-yellow-700";
      default:
        return "";
    }
  };

  const getPaymentColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "text-green-600";
      case "Not Paid":
        return "text-red-600";
      case "Pending":
        return "text-yellow-600";
      default:
        return "";
    }
  };

  const filteredBookings = bookings.filter(
    (booking) =>
      booking.expertName.toLowerCase().includes(search.toLowerCase()) &&
      (bookingStatus === "" || booking.bookingStatus === bookingStatus)
  );
  
    
  
  return (
    <div className="flex">
      <SideNavbar />
         <div className="flex-1 min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
       <PlayerHeader />   
       <main className="mt-16 p-6 bg-white dark:bg-gray-800 rounded-md shadow-md">
       <div className="flex items-center space-x-4 mb-4">
  {/* Search Input with Icon */}
  <div className="relative w-1/3">
    <FontAwesomeIcon
      icon={faSearch}
      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
    />
    <input
      type="text"
      placeholder="Search by Expert Name"
      className="p-2 pl-10 border rounded-md w-full dark:bg-gray-800 dark:text-white"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  </div>

  {/* Booking Status Dropdown */}
  <select
    className="p-2 border rounded-md dark:bg-gray-800 dark:text-white"
    value={bookingStatus}
    onChange={(e) => setBookingStatus(e.target.value)}
  >
    <option value="">Booking Status</option>
    <option value="Paid">Paid</option>
    <option value="Not Paid">Not Paid</option>
    <option value="Pending">Pending</option>
  </select>
</div>

        <div className="overflow-x-auto bg-white rounded-md shadow-md dark:bg-gray-800">
          <table className="w-full border-collapse">
            <thead className="bg-gray-200 dark:bg-gray-700 text-left">
              <tr className="text-gray-700 dark:text-gray-300 h-12">
                <th className="p-3">Booking ID</th>
                <th className="p-3">Expert Name</th>
                <th className="p-3">Date</th>
                <th className="p-3">Service</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Action</th>
                <th className="p-3">Booking Status</th>
                <th className="p-3">Video</th>
                <th className="p-3">Assessment Report</th>
                <th className="p-3">Display/Hide</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="p-3">{booking.id}</td>
                  <td className="p-3 flex items-center gap-2">
                    <img
                      src={`https://i.pravatar.cc/40?u=${booking.id}`} // Placeholder avatar
                      alt="avatar"
                      className="w-8 h-8 rounded-full"
                    />
                    {booking.expertName}
                  </td>
                  <td className="p-3">{booking.date}</td>
                  <td className="p-3">{booking.service}</td>
                  <td className="p-3">{booking.amount}</td>
                  <td className={`p-3 rounded-md text-center ${getStatusColor(booking.action)}`}>
                    {booking.action}
                  </td>
                  <td className={`p-3 font-bold ${getPaymentColor(booking.bookingStatus)}`}>
                    {booking.bookingStatus}
                  </td>
                  <td className="p-3 text-center">
                    <FontAwesomeIcon icon={faVideo} />
                  </td>
                  <td className="p-3 text-center">
                    <FontAwesomeIcon icon={faFileAlt} />
                  </td>
                  <td className="p-3 text-center">
      <FontAwesomeIcon 
        icon={isVisible ? faEye : faEyeSlash} 
        className="cursor-pointer" 
        onClick={() => setIsVisible(!isVisible)} 
      />
    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      
        </main>
        </div>
        </div>
  );
};

export default MyBooking;
