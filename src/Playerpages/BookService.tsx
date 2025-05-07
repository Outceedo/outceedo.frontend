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
import profile from "../assets/images/avatar.png"; // Import a default profile image

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

interface CalendarMonth {
  name: string;
  year: number;
  numberOfDays: number;
  firstDayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
}

const BookingCalendar: React.FC = () => {
  const navigate = useNavigate();

  // Current date for comparison
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-indexed (0 = January)
  const currentDay = today.getDate();

  // Calculate initial month and year (current month)
  const initialMonthIndex = today.getMonth();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const [selectedMonthIndex, setSelectedMonthIndex] =
    useState<number>(initialMonthIndex);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedDate, setSelectedDate] = useState<number>(today.getDate());
  const [selectedTime, setSelectedTime] = useState<string>("12:30pm");
  const [displayedMonth, setDisplayedMonth] = useState<CalendarMonth>({
    name: monthNames[initialMonthIndex],
    year: currentYear,
    numberOfDays: new Date(currentYear, initialMonthIndex + 1, 0).getDate(),
    firstDayOfWeek: new Date(currentYear, initialMonthIndex, 1).getDay(),
  });

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // API base URL
  const API_BASE_URL = `${import.meta.env.VITE_PORT}/api/v1/booking`;

  // Load service and expert data from localStorage
  useEffect(() => {
    const storedService = localStorage.getItem("selectedService");
    if (storedService) {
      setService(JSON.parse(storedService));
    }
  }, []);

  // Update displayed month when month or year changes
  useEffect(() => {
    const numberOfDays = new Date(
      selectedYear,
      selectedMonthIndex + 1,
      0
    ).getDate();
    // Get day of week for the first day of month (0 = Sunday, 1 = Monday, etc.)
    // Adjusted to make Monday = 0
    let firstDay = new Date(selectedYear, selectedMonthIndex, 1).getDay() - 1;
    if (firstDay === -1) firstDay = 6; // Convert Sunday from -1 to 6

    setDisplayedMonth({
      name: monthNames[selectedMonthIndex],
      year: selectedYear,
      numberOfDays,
      firstDayOfWeek: firstDay,
    });
  }, [selectedMonthIndex, selectedYear]);

  // Calendar data
  const daysOfWeek = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  // Time slots
  const timeSlots = [
    ["10:30am", "11:30am", "12:30pm", "02:30pm"],
    ["03:30pm", "04:30pm", "05:30pm", "07:30pm"],
  ];

  const handlePrevMonth = () => {
    // Check if we're already at the current month (to disable going back to past months)
    if (selectedYear === currentYear && selectedMonthIndex <= currentMonth) {
      return; // Don't allow going to past months
    }

    if (selectedMonthIndex === 0) {
      // If January, go to December of previous year
      setSelectedMonthIndex(11);
      setSelectedYear((prev) => prev - 1);
    } else {
      // Otherwise just go to previous month
      setSelectedMonthIndex((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonthIndex === 11) {
      // If December, go to January of next year
      setSelectedMonthIndex(0);
      setSelectedYear((prev) => prev + 1);
    } else {
      // Otherwise just go to next month
      setSelectedMonthIndex((prev) => prev + 1);
    }
  };

  const handleDateSelect = (day: number) => {
    // Only allow selecting dates if they're not in the past
    if (
      selectedYear > currentYear ||
      (selectedYear === currentYear && selectedMonthIndex > currentMonth) ||
      (selectedYear === currentYear &&
        selectedMonthIndex === currentMonth &&
        day >= currentDay)
    ) {
      setSelectedDate(day);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  // Convert 12-hour time format to 24-hour format
  const convertTo24HourFormat = (time: string): string => {
    const [hour, minuteWithSuffix] = time.split(":");
    const minute = minuteWithSuffix.substring(0, 2);
    const isPM = minuteWithSuffix.toLowerCase().includes("pm");

    let hourNum = parseInt(hour, 10);

    if (isPM && hourNum !== 12) {
      hourNum += 12;
    } else if (!isPM && hourNum === 12) {
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
    // Create date using the selected date components
    // Ensure we're using the correct month by adding the selectedMonthIndex
    const date = new Date(selectedYear, selectedMonthIndex, selectedDate);

    // Format as YYYY-MM-DD - we use local timezone to avoid date shifts
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
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

      console.log("Booking date being sent:", formattedDate);

      // Prepare booking data
      const bookingData = {
        expertId: expertId,
        serviceId: serviceId,
        date: formattedDate,
        startTime: startTime24H,
        endTime: endTime24H,
      };

      // Get auth token
      const token = localStorage.getItem("token");

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
    const date = new Date(selectedYear, selectedMonthIndex, selectedDate);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Check if a date is in the past
  const isDateInPast = (day: number): boolean => {
    if (selectedYear < currentYear) return true;
    if (selectedYear > currentYear) return false;
    if (selectedMonthIndex < currentMonth) return true;
    if (selectedMonthIndex > currentMonth) return false;
    return day < currentDay;
  };

  // Generate array of days for the current month view
  const generateCalendarDays = () => {
    // Calculate empty cells for alignment
    const emptyCells = Array(displayedMonth.firstDayOfWeek).fill(null);

    // Create array with actual days
    const daysInMonth = Array.from(
      { length: displayedMonth.numberOfDays },
      (_, i) => i + 1
    );

    return [...emptyCells, ...daysInMonth];
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="flex flex-col justify-center items-center">
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
                      src={service.expertProfileImage || profile}
                      alt={service.expertname}
                      className="w-20 h-20 rounded-full object-cover mb-2"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = profile; // Default image on error
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
                  disabled={
                    selectedYear === currentYear &&
                    selectedMonthIndex <= currentMonth
                  }
                  className={`p-2 rounded-full ${
                    selectedYear === currentYear &&
                    selectedMonthIndex <= currentMonth
                      ? "text-gray-300 cursor-not-allowed"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <h3 className="text-lg font-medium">
                  {displayedMonth.name} {displayedMonth.year}
                </h3>

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
                  {calendarDays.map((day, index) => (
                    <div
                      key={index}
                      className="h-10 w-10 flex items-center justify-center"
                    >
                      {day !== null ? (
                        <button
                          onClick={() => handleDateSelect(day)}
                          disabled={isDateInPast(day)}
                          className={`
                            h-10 w-10 rounded-full flex items-center justify-center text-sm
                            ${
                              selectedDate === day &&
                              selectedMonthIndex ===
                                displayedMonth.name.indexOf(
                                  displayedMonth.name
                                ) &&
                              selectedYear === displayedMonth.year
                                ? "bg-red-500 text-white"
                                : isDateInPast(day)
                                ? "text-gray-300 cursor-not-allowed"
                                : "hover:bg-gray-100"
                            }
                          `}
                        >
                          {day}
                        </button>
                      ) : null}
                    </div>
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
      <div className="flex justify-end items-end mt-6 w-4xl mb-4">
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
