import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Clock,
  User,
  Video,
  DollarSign,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

// Define interfaces for our data types
interface Service {
  id: number;
  name: string;
  description: string;
  price: string;
}

interface Expert {
  name: string;
  rating: number;
  profilePic: string;
  reviews: number;
  verified: boolean;
}

interface Booking {
  id: number;
  expertName: string;
  date: string;
  service: string;
  amount: string;
  action: "Accepted" | "Rejected" | "Re-Scheduled";
  bookingStatus: "Paid" | "Not Paid" | "Pending";
}

const AppointmentScheduler: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<number>(10);
  const [selectedTime, setSelectedTime] = useState<string>("12:30pm");
  const [currentMonth, setCurrentMonth] = useState<string>("April 2025");
  const [service, setService] = useState<Service | null>(null);
  const [expert, setExpert] = useState<Expert | null>(null);
  const navigate = useNavigate();

  // Load service and expert data from localStorage
  useEffect(() => {
    const storedService = localStorage.getItem("selectedService");
    const storedExpert = localStorage.getItem("serviceExpert");

    if (storedService) {
      setService(JSON.parse(storedService));
    }

    if (storedExpert) {
      setExpert(JSON.parse(storedExpert));
    }
  }, []);

  // Calendar data
  const daysOfWeek = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  // Time slots
  const timeSlots = [
    ["10:30am", "11:30am", "12:30pm", "02:30pm"],
    ["03:30pm", "04:30pm", "05:30pm", "07:30pm"],
  ];

  const handlePrevMonth = () => {
    setCurrentMonth("March 2025");
  };

  const handleNextMonth = () => {
    setCurrentMonth("May 2025");
  };

  const handleDateSelect = (day: number) => {
    setSelectedDate(day);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  const handleNext = () => {
    // Format the date for display
    const formattedDate = `${selectedDate} ${currentMonth.split(" ")[0]} 2025`;

    // Create a new booking object
    const newBooking: Booking = {
      id: Math.floor(Math.random() * 1000) + 1, // Generate a random ID
      expertName: expert?.name || "Expert",
      date: formattedDate,
      service: service?.name || "Service",
      amount: service?.price || "$0",
      action: "Accepted", // Default action
      bookingStatus: "Pending", // Default status
    };

    // Get existing bookings or create an empty array
    const existingBookings = JSON.parse(
      localStorage.getItem("myBookings") || "[]"
    );

    // Add the new booking to the array
    existingBookings.push(newBooking);

    // Store the updated bookings array in localStorage
    localStorage.setItem("myBookings", JSON.stringify(existingBookings));

    // Store appointment details for reference
    localStorage.setItem(
      "appointmentDate",
      `${currentMonth} ${selectedDate}, 2025`
    );
    localStorage.setItem("appointmentTime", selectedTime);

    // Navigate to confirmation or payment page
    navigate("/player/mybooking");
  };

  // Format the selected date
  const getFormattedDate = () => {
    const date = new Date(
      2025,
      currentMonth === "April 2025" ? 3 : currentMonth === "March 2025" ? 2 : 4,
      selectedDate
    );
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-amber-50">
      <Card className="w-full max-w-4xl shadow-lg">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Left sidebar */}
            <div className="p-6 border-r border-gray-100 w-full md:w-1/3 bg-white">
              <Button
                variant="ghost"
                size="icon"
                className="mb-6"
                onClick={handleBack}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>

              <div className="space-y-6">
                {/* Service Name */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {service?.name || "Service"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {service?.description || "Service description"}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-600">
                    {expert?.name || "Expert"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-600">60 mins</span>
                </div>

                <div className="flex items-start gap-3">
                  <Video className="h-5 w-5 text-gray-500 mt-1" />
                  <span className="text-gray-600">
                    {service?.name?.includes("Video")
                      ? "Video call details provided upon confirmation"
                      : service?.name?.includes("Field")
                      ? "Address details will be shared after booking"
                      : "Session details provided upon booking confirmation"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-600">
                    Fees: {service?.price || "$25/h"}
                  </span>
                </div>
              </div>
            </div>

            {/* Right content */}
            <div className="p-6 w-full md:w-2/3 bg-white">
              <h2 className="text-xl font-medium text-center mb-6">
                Select Date and Time
              </h2>

              {/* Month navigation */}
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <h3 className="text-lg font-medium">{currentMonth}</h3>

                <button
                  onClick={handleNextMonth}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              {/* Calendar */}
              <div className="mb-6">
                {/* Days of week */}
                <div className="grid grid-cols-7 text-center mb-2">
                  {daysOfWeek.map((day) => (
                    <div
                      key={day}
                      className="text-sm font-medium text-gray-500"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-2">
                  {/* Empty cells for alignment (if month doesn't start on Monday) */}
                  {currentMonth === "April 2025" &&
                    Array(0)
                      .fill(null)
                      .map((_, index) => (
                        <div key={`empty-${index}`} className="h-10 w-10"></div>
                      ))}

                  {daysInMonth.map((day) => (
                    <button
                      key={day}
                      onClick={() => handleDateSelect(day)}
                      className={`
                        h-10 w-10 rounded-full flex items-center justify-center text-sm
                        ${
                          selectedDate === day
                            ? "bg-red-500 text-white"
                            : "hover:bg-gray-100"
                        }
                      `}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected date */}
              <div className="mb-6">
                <p className="text-gray-700">{getFormattedDate()}</p>
              </div>

              {/* Time slots */}
              <div className="space-y-3">
                {timeSlots.map((row, rowIndex) => (
                  <div key={rowIndex} className="grid grid-cols-4 gap-2">
                    {row.map((time) => (
                      <button
                        key={time}
                        onClick={() => handleTimeSelect(time)}
                        className={`
                          py-2 px-3 border rounded-md text-sm
                          ${
                            selectedTime === time
                              ? "border-red-500 bg-red-50 text-red-500"
                              : "border-gray-200 hover:border-gray-300"
                          }
                        `}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next button */}
      <div className="absolute bottom-8 right-8">
        <Button
          className="bg-red-500 hover:bg-red-600 text-white px-8"
          onClick={handleNext}
        >
          Book now
        </Button>
      </div>
    </div>
  );
};

export default AppointmentScheduler;
