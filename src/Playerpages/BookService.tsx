import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Clock,
  Video,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import profile from "../assets/images/avatar.png";
import Swal from "sweetalert2";

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

interface AvailabilityData {
  [date: string]: boolean;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
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
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookingDescription, setBookingDescription] = useState<string>("");
  const [bookingLocation, setBookingLocation] = useState<string>("");
  const [displayedMonth, setDisplayedMonth] = useState<CalendarMonth>({
    name: monthNames[initialMonthIndex],
    year: currentYear,
    numberOfDays: new Date(currentYear, initialMonthIndex + 1, 0).getDate(),
    firstDayOfWeek: new Date(currentYear, initialMonthIndex, 1).getDay(),
  });

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingAvailability, setLoadingAvailability] =
    useState<boolean>(false);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState<boolean>(false);
  const [availabilityData, setAvailabilityData] = useState<AvailabilityData>(
    {}
  );
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);

  // API base URLs
  const API_BASE_URL = `${import.meta.env.VITE_PORT}/api/v1/booking`;

  // Check if service is ON GROUND ASSESSMENT
  const isOnGroundAssessment = service?.name?.includes("ON GROUND ASSESSMENT");

  // Load service and expert data from localStorage
  useEffect(() => {
    const storedService = localStorage.getItem("selectedService");
    if (storedService) {
      setService(JSON.parse(storedService));
    }
  }, []);

  // Fetch monthly availability when month, year, or expert changes
  useEffect(() => {
    const fetchExpertAvailability = async () => {
      if (!service?.expertId) return;

      setLoadingAvailability(true);
      try {
        // Get auth token
        const token = localStorage.getItem("token");

        // Fetch availability data for the selected month and year
        const API_AV = `${import.meta.env.VITE_PORT}/api/v1/user/availability/${
          service.expertId
        }/monthly?month=${selectedMonthIndex + 1}&year=${selectedYear}`;

        const response = await fetch(API_AV, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch expert availability");
        }

        const data = await response.json();
        setAvailabilityData(data);

        // Reset selected date if it's no longer available in the new month
        if (selectedDate) {
          const formattedDate = formatDateString(
            selectedYear,
            selectedMonthIndex,
            selectedDate
          );
          if (!data[formattedDate]) {
            setSelectedDate(null);
            setSelectedTime(null);
            setAvailableTimeSlots([]);
          }
        }
      } catch (error) {
        console.error("Error fetching expert availability:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load expert's availability. Please try again.",
          timer: 3000,
          showConfirmButton: false,
        });
      } finally {
        setLoadingAvailability(false);
      }
    };

    fetchExpertAvailability();
  }, [selectedMonthIndex, selectedYear, service?.expertId]);

  // Fetch time slots when a date is selected
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!selectedDate || !service?.expertId) {
        setAvailableTimeSlots([]);
        return;
      }

      setLoadingTimeSlots(true);
      try {
        // Get auth token
        const token = localStorage.getItem("token");

        // Format date for API
        const formattedDate = formatDateString(
          selectedYear,
          selectedMonthIndex,
          selectedDate
        );

        // Fetch available time slots for the selected date
        const API_AV = `${import.meta.env.VITE_PORT}/api/v1/user/availability/${
          service.expertId
        }/slots?date=${formattedDate}`;

        const response = await fetch(API_AV, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch time slots");
        }

        const data: TimeSlot[] = await response.json();

        // Filter only available slots
        const availableSlots = data.filter((slot) => slot.available);
        setAvailableTimeSlots(availableSlots);

        // Reset selected time if it's no longer available
        if (selectedTime) {
          const [hour, minute] = selectedTime.split(":");
          const selectedTimeFormatted = `${hour}:${minute}`;

          const isTimeAvailable = availableSlots.some(
            (slot) => slot.startTime === selectedTimeFormatted
          );

          if (!isTimeAvailable) {
            setSelectedTime(null);
          }
        }
      } catch (error) {
        console.error("Error fetching time slots:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load available time slots. Please try again.",
          timer: 3000,
          showConfirmButton: false,
        });
      } finally {
        setLoadingTimeSlots(false);
      }
    };

    fetchTimeSlots();
  }, [selectedDate, service?.expertId, selectedMonthIndex, selectedYear]);

  // Update displayed month when month or year changes
  useEffect(() => {
    const numberOfDays = new Date(
      selectedYear,
      selectedMonthIndex + 1,
      0
    ).getDate();
    let firstDay = new Date(selectedYear, selectedMonthIndex, 1).getDay() - 1;
    if (firstDay === -1) firstDay = 6; // Convert Sunday from -1 to 6

    setDisplayedMonth({
      name: monthNames[selectedMonthIndex],
      year: selectedYear,
      numberOfDays,
      firstDayOfWeek: firstDay,
    });
  }, [selectedMonthIndex, selectedYear]);

  // Format date as YYYY-MM-DD for API comparison
  const formatDateString = (
    year: number,
    month: number,
    day: number
  ): string => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
  };

  // Format time from 24-hour to 12-hour format
  const formatTime = (time: string): string => {
    const [hour, minute] = time.split(":");
    const hourNum = parseInt(hour, 10);

    if (hourNum === 0) {
      return `12:${minute}am`;
    } else if (hourNum === 12) {
      return `12:${minute}pm`;
    } else if (hourNum > 12) {
      return `${hourNum - 12}:${minute}pm`;
    } else {
      return `${hourNum}:${minute}am`;
    }
  };

  // Check if a date is available based on expert's availability
  const isDateAvailable = (day: number): boolean => {
    const dateString = formatDateString(selectedYear, selectedMonthIndex, day);
    return availabilityData[dateString] === true;
  };

  // Calendar data
  const daysOfWeek = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  // Organize time slots into rows for display
  const organizeTimeSlotsIntoRows = () => {
    const rows = [];
    const slotsPerRow = 4;

    for (let i = 0; i < availableTimeSlots.length; i += slotsPerRow) {
      rows.push(availableTimeSlots.slice(i, i + slotsPerRow));
    }

    return rows;
  };

  const timeSlotRows = organizeTimeSlotsIntoRows();

  const handlePrevMonth = () => {
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
    // Only allow selecting dates if they're available and not in the past
    if (isDateAvailable(day) && !isDateInPast(day)) {
      setSelectedDate(day);
      setSelectedTime(null); // Reset time selection when date changes
    }
  };

  const handleTimeSelect = (slot: TimeSlot) => {
    setSelectedTime(slot.startTime);
  };

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  // Handle description change
  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setBookingDescription(e.target.value);
  };

  // Handle location input change
  const handleLocationInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setBookingLocation(e.target.value);
  };

  // Calculate end time
  const calculateEndTime = (startTime: string): string => {
    const [hour, minute] = startTime.split(":").map((num) => parseInt(num, 10));

    // Find the matching time slot to get the actual end time
    const selectedSlot = availableTimeSlots.find(
      (slot) => slot.startTime === startTime
    );
    if (selectedSlot) {
      return selectedSlot.endTime;
    }

    // Fallback: calculate end time as start time + 30 minutes
    let endHour = hour;
    let endMinute = minute + 30;

    if (endMinute >= 60) {
      endHour += 1;
      endMinute -= 60;
    }

    if (endHour >= 24) {
      endHour -= 24;
    }

    return `${endHour.toString().padStart(2, "0")}:${endMinute
      .toString()
      .padStart(2, "0")}`;
  };

  // Format date as YYYY-MM-DD
  const formatDateForAPI = (): string => {
    if (!selectedDate) return "";

    const date = new Date(selectedYear, selectedMonthIndex, selectedDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const handleConfirm = async () => {
    // Validate selected date
    if (!selectedDate) {
      Swal.fire({
        icon: "error",
        title: "Please Select a Date",
        text: "You must select an available date to continue.",
        timer: 3000,
        showConfirmButton: false,
      });
      return;
    }

    // Validate selected time
    if (!selectedTime) {
      Swal.fire({
        icon: "error",
        title: "Please Select a Time",
        text: "You must select an available time slot to continue.",
        timer: 3000,
        showConfirmButton: false,
      });
      return;
    }

    // For ON GROUND ASSESSMENT, validate location first
    if (isOnGroundAssessment && !bookingLocation.trim()) {
      Swal.fire({
        icon: "error",
        title: "Please Enter Location",
        text: "Enter your location for On Ground Assessment.",
        timer: 3000,
        showConfirmButton: false,
      });
      return;
    }

    setLoading(true);

    try {
      // Get expertId from service or localStorage
      const expertId = service?.expertId || localStorage.getItem("expertid");

      // Get serviceId from service object or localStorage
      const serviceId = service?.serviceid;

      // Get start and end time
      const startTime = selectedTime;
      const endTime = calculateEndTime(selectedTime);
      const formattedDate = formatDateForAPI();

      console.log("Booking date being sent:", formattedDate);
      console.log("Booking time being sent:", startTime, "to", endTime);

      // Prepare booking data
      const bookingData = {
        expertId: expertId,
        serviceId: serviceId,
        date: formattedDate,
        startTime: startTime,
        endTime: endTime,
        location: bookingLocation,
        description: bookingDescription,
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
        Swal.fire({
          icon: "error",
          title: "Booking Failed",
          text: data.message || "Unknown error occurred",
          timer: 3000,
          showConfirmButton: false,
        });
      } else {
        console.log("Booking successful:", data);
        Swal.fire({
          icon: "success",
          title: "Booking Successful!",
          text: "Redirecting to Bookings Page",
          timer: 3000,
          showConfirmButton: false,
        }).then(() => {
          // Navigate after the alert is closed or timer expires
          navigate("/player/mybooking");
        });
      }
    } catch (error) {
      console.error("Booking error:", error);
      Swal.fire({
        icon: "error",
        title: "Booking Error",
        text: "An error occurred during booking. Please try again.",
        timer: 3000,
        showConfirmButton: false,
      });
    } finally {
      setLoading(false);
    }
  };

  // Format the selected date
  const getFormattedDate = () => {
    if (!selectedDate) return "Select a date";

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
    const emptyCells = Array(displayedMonth.firstDayOfWeek).fill(null);

    const daysInMonth = Array.from(
      { length: displayedMonth.numberOfDays },
      (_, i) => i + 1
    );

    return [...emptyCells, ...daysInMonth];
  };

  const calendarDays = generateCalendarDays();

  // Get class name for calendar day
  const getDayClassName = (day: number) => {
    if (day === null) return "";

    const isSelected =
      selectedDate === day &&
      selectedMonthIndex === monthNames.indexOf(displayedMonth.name) &&
      selectedYear === displayedMonth.year;

    const isPast = isDateInPast(day);
    const isAvailable = isDateAvailable(day);

    if (isSelected) {
      return "bg-red-500 text-white font-medium shadow-md";
    } else if (isPast || !isAvailable) {
      return "text-gray-300 cursor-not-allowed bg-gray-50";
    } else {
      return "hover:bg-gray-100 text-gray-800";
    }
  };

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
                  <span className="text-gray-600">30 mins per session</span>
                </div>

                <div className="flex items-start gap-3">
                  <Video className="h-5 w-5 text-gray-500 mt-1" />
                  <span className="text-gray-600">
                    {service?.name?.includes("Video")
                      ? "Video call details provided upon confirmation"
                      : service?.name?.includes("GROUND")
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

              {/* Calendar with loading state */}
              <div className="mb-6">
                {loadingAvailability ? (
                  <div className="flex justify-center items-center h-[240px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                  </div>
                ) : (
                  <>
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
                              disabled={
                                isDateInPast(day) || !isDateAvailable(day)
                              }
                              className={`
                                h-10 w-10 rounded-full flex items-center justify-center text-sm
                                ${getDayClassName(day)}
                              `}
                            >
                              {day}
                            </button>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Selected date */}
              <div className="mb-6">
                <p className="text-gray-700 font-medium">
                  {getFormattedDate()}
                </p>
              </div>

              {/* Time slots with loading state */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Available Time Slots
                </h3>

                {!selectedDate ? (
                  <p className="text-gray-500 text-sm italic">
                    Select a date to view available time slots
                  </p>
                ) : loadingTimeSlots ? (
                  <div className="flex justify-center items-center h-[100px]">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
                  </div>
                ) : availableTimeSlots.length === 0 ? (
                  <p className="text-gray-500 text-sm italic">
                    No available time slots for this date
                  </p>
                ) : (
                  <div className="space-y-3">
                    {timeSlotRows.map((row, rowIndex) => (
                      <div key={rowIndex} className="grid grid-cols-4 gap-2">
                        {row.map((slot) => (
                          <button
                            key={slot.startTime}
                            onClick={() => handleTimeSelect(slot)}
                            className={`
                              py-2 px-3 border rounded-md text-sm
                              ${
                                selectedTime === slot.startTime
                                  ? "border-red-500 bg-red-50 text-red-500"
                                  : "border-gray-200 hover:border-gray-300 text-gray-800"
                              }
                            `}
                          >
                            {formatTime(slot.startTime)}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Simple Location field - Only for ON GROUND ASSESSMENT */}
              {isOnGroundAssessment && (
                <div className="mt-6 mb-4">
                  <Label
                    htmlFor="booking-location"
                    className="text-sm font-medium text-gray-700 mb-2 block flex items-center"
                  >
                    <MapPin className="h-4 w-4 mr-1 text-red-500" />
                    Location <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="booking-location"
                    placeholder="Enter your location (stadiums, schools, parks, etc.)"
                    value={bookingLocation}
                    onChange={handleLocationInputChange}
                    className="w-full border-gray-200 rounded-md focus:border-red-500 focus:ring focus:ring-red-200"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter any location including stadiums, fields, schools,
                    parks, community centers, etc.
                  </p>
                </div>
              )}

              {/* Description field - Added below the calendar and time slots */}
              <div className="mt-6">
                <Label
                  htmlFor="booking-description"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  Additional Information
                </Label>
                <Textarea
                  id="booking-description"
                  placeholder="Add any special requests or details about your booking..."
                  value={bookingDescription}
                  onChange={handleDescriptionChange}
                  className="w-full min-h-[120px] border-gray-200 rounded-md resize-none focus:border-red-500 focus:ring focus:ring-red-200"
                />
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
          disabled={loading || !selectedDate || !selectedTime}
        >
          {loading ? "Processing..." : "Confirm Booking"}
        </Button>
      </div>
    </div>
  );
};

export default BookingCalendar;
