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
import profile2 from "../assets/images/profile2.jpg"; // Import a default profile image

// Define interfaces for our data types
interface Service {
  serviceid?: string;
  expertId?: string;
  expertname?: string;
  expertProfileImage?: string;
  name: string;
  description: string;
  price: string;
}

const BookingCalendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<number>(10);
  const [selectedTime, setSelectedTime] = useState<string>("12:30pm");
  const [currentMonth, setCurrentMonth] = useState<string>("April 2025");
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  // API base URL
  const API_BASE_URL = `${import.meta.env.VITE_PORT}/api/v1/booking`;

  // Load service and expert data from localStorage
  useEffect(() => {
    const storedService = localStorage.getItem("selectedService");
    if (storedService) {
      setService(JSON.parse(storedService));
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

  // Convert 12-hour time format to 24-hour format
  const convertTo24HourFormat = (time: string): string => {
    const [hour, minute] = time.slice(0, -2).split(":");
    let hourNum = parseInt(hour, 10);

    if (time.toLowerCase().includes("pm") && hourNum < 12) {
      hourNum += 12;
    } else if (time.toLowerCase().includes("am") && hourNum === 12) {
      hourNum = 0;
    }

    return `${hourNum.toString().padStart(2, "0")}:${minute || "00"}`;
  };

  // Calculate end time (assuming 1 hour duration)
  const calculateEndTime = (startTime: string): string => {
    const [hour, minute] = startTime.split(":").map((num) => parseInt(num, 10));
    let endHour = hour + 1;

    // Handle hour overflow
    if (endHour >= 24) {
      endHour -= 24;
    }

    return `${endHour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
  };

  // Format date as YYYY-MM-DD
  const formatDateForAPI = (): string => {
    const monthMap: { [key: string]: number } = {
      January: 0,
      February: 1,
      March: 2,
      April: 3,
      May: 4,
      June: 5,
      July: 6,
      August: 7,
      September: 8,
      October: 9,
      November: 10,
      December: 11,
    };

    const monthName = currentMonth.split(" ")[0];
    const year = parseInt(currentMonth.split(" ")[1]);
    const month = monthMap[monthName];

    const date = new Date(year, month, selectedDate);

    // Format as YYYY-MM-DD
    return date.toISOString().split("T")[0];
  };

  const handleConfirm = async () => {
    setLoading(true);

    try {
      // Get expertId from localStorage
      const expertId = localStorage.getItem("expertid");

      // Get serviceId from service object or localStorage
      const serviceId = service?.serviceid;

      // Format time for API
      const startTime24H = convertTo24HourFormat(selectedTime);
      const endTime24H = calculateEndTime(startTime24H);
      const formattedDate = formatDateForAPI();

      // Prepare booking data
      const bookingData = {
        expertId: expertId,
        serviceId: serviceId,
        date: formattedDate,
        startTime: startTime24H,
        endTime: endTime24H,
      };

      // Get auth token
      const token = localStorage.getItem("accessToken");

      // Make API call
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Booking failed:", data);
      } else {
        console.log("Booking successful:", data);
      }

      // Navigate to bookings page regardless of success or failure
      navigate("/player/mybooking");
    } catch (error) {
      console.error("Booking error:", error);
    } finally {
      setLoading(false);
    }
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
                {/* Expert Profile Section */}
                {service?.expertname && (
                  <div className="flex flex-col items-center mb-6">
                    <img
                      src={service.expertProfileImage || profile2}
                      alt={service.expertname}
                      className="w-20 h-20 rounded-full object-cover mb-2"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = profile2; // Default image on error
                      }}
                    />
                    <h3 className="text-lg font-semibold text-center">
                      {service.expertname}
                    </h3>
                  </div>
                )}

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

      {/* Confirm button */}
      <div className="absolute bottom-8 right-8">
        <Button
          className="bg-red-500 hover:bg-red-600 text-white px-8"
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? "Processing..." : "Confirm Booking"}
        </Button>
      </div>
    </div>
  );
};

export default BookingCalendar;
