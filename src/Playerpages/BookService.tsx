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
  firstDayOfWeek: number;
}

interface AvailabilityData {
  [date: string]: boolean;
}

interface SlotApiResponse {
  expertTimeZone: string;
  slots: Array<{
    displayStartTime: string;
    date: string;
    startTime: string;
    isAvailable: boolean;
  }>;
}

const BookingCalendar: React.FC = () => {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const navigate = useNavigate();
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();
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
  const [selectedStartTime, setSelectedStartTime] = useState<string | null>(
    null
  );
  const [selectedEndTime, setSelectedEndTime] = useState<string | null>(null);
  const [finalPrice, setFinalPrice] = useState<number>(0);
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
  // For new API, we store slots as array of slot objects
  const [availableSlots, setAvailableSlots] = useState<
    Array<{
      displayStartTime: string;
      date: string;
      startTime: string;
      isAvailable: boolean;
    }>
  >([]);

  const API_BASE_URL = `${import.meta.env.VITE_PORT}/api/v1/booking`;
  const BLOCK_API_URL = `${
    import.meta.env.VITE_PORT
  }/api/v1/user/availability/block`;
  const daysOfWeek = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  const isOnGroundAssessment = service?.name?.includes("ON GROUND ASSESSMENT");

  // Enhanced price parsing with comprehensive test case handling
  const parsePrice = (priceString: string | undefined | null): number => {
    if (!priceString || priceString.trim() === "") {
      return 25.0;
    }

    const cleanInput = String(priceString).trim();

    if (cleanInput === "0" || cleanInput === "$0" || cleanInput === "0.00") {
      return 25.0;
    }

    const numericString = cleanInput.replace(/[^0-9.]/g, "");
    const decimalParts = numericString.split(".");
    const cleanedPrice =
      decimalParts.length > 1
        ? `${decimalParts[0]}.${decimalParts.slice(1).join("")}`
        : numericString;

    const parsed = parseFloat(cleanedPrice);

    if (isNaN(parsed) || parsed <= 0 || parsed > 9999.99) {
      return 25.0;
    }

    return Math.round(parsed * 100) / 100;
  };

  // Calculate price based on duration between start and end time
  const calculatePriceForTimeRange = (
    startTime: string,
    endTime: string
  ): number => {
    const duration = calculateDurationInMinutes(startTime, endTime);
    const basePrice = parsePrice(service?.price);
    const hours = duration / 60;
    return Math.round(basePrice * hours * 100) / 100;
  };

  // Calculate duration in minutes between two times
  const calculateDurationInMinutes = (
    startTime: string,
    endTime: string
  ): number => {
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const startTotalMinutes = startHour * 60 + startMinute;
    let endTotalMinutes = endHour * 60 + endMinute;

    // Handle overnight sessions
    if (endTotalMinutes <= startTotalMinutes) {
      endTotalMinutes += 24 * 60;
    }

    return endTotalMinutes - startTotalMinutes;
  };

  // Format price as string with dollar sign
  const formatPrice = (price: number): string => {
    if (isNaN(price) || price < 0) {
      return "$25.00";
    }
    return `$${price.toFixed(2)}`;
  };

  // Get all unique time slots for selection (from API: all available start times)
  const getAllTimeSlots = (): string[] => {
    const times = availableSlots
      .filter((slot) => slot.isAvailable)
      .map((slot) => slot.startTime);
    // Ensure sorted
    return [...new Set(times)].sort();
  };

  // Check if a time slot is selectable for end time
  const isValidEndTime = (time: string): boolean => {
    if (!selectedStartTime) return false;
    const duration = calculateDurationInMinutes(selectedStartTime, time);
    return duration >= 60 && duration <= 120; // 1-2 hours
  };

  // Check if a time slot is available
  const isTimeSlotAvailable = (time: string): boolean => {
    return availableSlots.some(
      (slot) => slot.startTime === time && slot.isAvailable
    );
  };

  // Update price when start or end time changes
  useEffect(() => {
    if (selectedStartTime && selectedEndTime) {
      const price = calculatePriceForTimeRange(
        selectedStartTime,
        selectedEndTime
      );
      setFinalPrice(price);
    } else if (service) {
      const basePrice = parsePrice(service?.price);
      setFinalPrice(basePrice);
    }
  }, [selectedStartTime, selectedEndTime, service]);

  // 1. Load service from localStorage on mount
  useEffect(() => {
    const storedService = localStorage.getItem("selectedService");
    if (storedService) {
      const parsedService = JSON.parse(storedService);
      setService(parsedService);
      const basePrice = parsePrice(parsedService?.price);
      setFinalPrice(basePrice);
    }
  }, []);

  // 2. Fetch monthly availability after service loads or month/year change
  useEffect(() => {
    if (!service || !service.expertId) return;

    const fetchExpertAvailability = async () => {
      setLoadingAvailability(true);
      try {
        const token = localStorage.getItem("token");
        const API_AV = `${import.meta.env.VITE_PORT}/api/v1/user/availability/${
          service.expertId
        }/monthly?month=${
          selectedMonthIndex + 1
        }&year=${selectedYear}&timezone=${userTimeZone}`;
        const response = await fetch(API_AV, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok)
          throw new Error("Failed to fetch expert availability");

        const data = await response.json();
        setAvailabilityData(data);

        if (selectedDate) {
          const formattedDate = formatDateString(
            selectedYear,
            selectedMonthIndex,
            selectedDate
          );
          if (!data[formattedDate]) {
            setSelectedDate(null);
            setSelectedStartTime(null);
            setSelectedEndTime(null);
            setAvailableSlots([]);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service, selectedMonthIndex, selectedYear]);

  // 3. Fetch time slots after service loads and a date is selected
  useEffect(() => {
    if (!service || !service.expertId || !selectedDate) {
      setAvailableSlots([]);
      return;
    }

    const fetchTimeSlots = async () => {
      setLoadingTimeSlots(true);
      try {
        const token = localStorage.getItem("token");
        const formattedDate = formatDateString(
          selectedYear,
          selectedMonthIndex,
          selectedDate
        );
        const API_AV = `${import.meta.env.VITE_PORT}/api/v1/user/availability/${
          service.expertId
        }/slots?date=${formattedDate}&timezone=${userTimeZone}`;
        const response = await fetch(API_AV, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch time slots");

        const data: SlotApiResponse = await response.json();
        // Only keep available slots
        const available = (data.slots || []).filter((slot) => slot.isAvailable);
        setAvailableSlots(available);

        // Reset selections if they're no longer valid
        if (
          selectedStartTime &&
          !available.some((slot) => slot.startTime === selectedStartTime)
        ) {
          setSelectedStartTime(null);
          setSelectedEndTime(null);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service, selectedDate, selectedMonthIndex, selectedYear]);

  useEffect(() => {
    const numberOfDays = new Date(
      selectedYear,
      selectedMonthIndex + 1,
      0
    ).getDate();
    let firstDay = new Date(selectedYear, selectedMonthIndex, 1).getDay() - 1;
    if (firstDay === -1) firstDay = 6;

    setDisplayedMonth({
      name: monthNames[selectedMonthIndex],
      year: selectedYear,
      numberOfDays,
      firstDayOfWeek: firstDay,
    });
  }, [selectedMonthIndex, selectedYear]);

  const formatDateString = (
    year: number,
    month: number,
    day: number
  ): string => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
  };

  const formatTime = (time: string): string => {
    const [hour, minute] = time.split(":");
    const hourNum = parseInt(hour, 10);
    if (hourNum === 0) return `12:${minute}am`;
    if (hourNum === 12) return `12:${minute}pm`;
    if (hourNum > 12) return `${hourNum - 12}:${minute}pm`;
    return `${hourNum}:${minute}am`;
  };

  const isDateAvailable = (day: number): boolean => {
    const dateString = formatDateString(selectedYear, selectedMonthIndex, day);
    return availabilityData[dateString] === true;
  };

  const organizeTimeSlotsIntoRows = (timeSlots: string[]) => {
    const rows = [];
    const slotsPerRow = 4;
    for (let i = 0; i < timeSlots.length; i += slotsPerRow) {
      rows.push(timeSlots.slice(i, i + slotsPerRow));
    }
    return rows;
  };

  const handlePrevMonth = () => {
    if (selectedYear === currentYear && selectedMonthIndex <= currentMonth)
      return;
    if (selectedMonthIndex === 0) {
      setSelectedMonthIndex(11);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonthIndex((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonthIndex === 11) {
      setSelectedMonthIndex(0);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonthIndex((prev) => prev + 1);
    }
  };

  const handleDateSelect = (day: number) => {
    if (isDateAvailable(day) && !isDateInPast(day)) {
      setSelectedDate(day);
      setSelectedStartTime(null);
      setSelectedEndTime(null);
    }
  };

  const handleStartTimeSelect = (time: string) => {
    setSelectedStartTime(time);
    setSelectedEndTime(null); // Reset end time when start time changes
  };

  const handleEndTimeSelect = (time: string) => {
    if (isValidEndTime(time)) {
      setSelectedEndTime(time);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setBookingDescription(e.target.value);
  };

  const handleLocationInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setBookingLocation(e.target.value);
  };

  const formatDateForAPI = (): string => {
    if (!selectedDate) return "";
    const date = new Date(selectedYear, selectedMonthIndex, selectedDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getDurationLabel = (): string => {
    if (!selectedStartTime || !selectedEndTime) return "";
    const duration = calculateDurationInMinutes(
      selectedStartTime,
      selectedEndTime
    );
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;

    if (minutes === 0) {
      return `${hours} Hour${hours > 1 ? "s" : ""}`;
    } else {
      return `${hours}h ${minutes}m`;
    }
  };

  const validatePrice = (price: number): boolean => {
    return !isNaN(price) && price > 0 && price <= 9999.99;
  };

  const handleConfirm = async () => {
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
    if (!selectedStartTime) {
      Swal.fire({
        icon: "error",
        title: "Please Select Start Time",
        text: "You must select a start time to continue.",
        timer: 3000,
        showConfirmButton: false,
      });
      return;
    }
    if (!selectedEndTime) {
      Swal.fire({
        icon: "error",
        title: "Please Select End Time",
        text: "You must select an end time to continue.",
        timer: 3000,
        showConfirmButton: false,
      });
      return;
    }

    const duration = calculateDurationInMinutes(
      selectedStartTime,
      selectedEndTime
    );
    if (duration < 60 || duration > 120) {
      Swal.fire({
        icon: "error",
        title: "Invalid Duration",
        text: "Session duration must be between 1 and 2 hours.",
        timer: 3000,
        showConfirmButton: false,
      });
      return;
    }

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

    if (!validatePrice(finalPrice)) {
      Swal.fire({
        icon: "error",
        title: "Price Error",
        text: "Invalid booking price. Please refresh and try again.",
        timer: 3000,
        showConfirmButton: false,
      });
      return;
    }

    setLoading(true);

    try {
      const expertId = service?.expertId || localStorage.getItem("expertid");
      const serviceId = service?.serviceid;
      const formattedDate = formatDateForAPI();
      const duration = calculateDurationInMinutes(
        selectedStartTime,
        selectedEndTime
      );

      const bookingData = {
        expertId: expertId,
        serviceId: serviceId,
        date: formattedDate,
        startTime: selectedStartTime,
        endTime: selectedEndTime,
        duration: duration,
        location: bookingLocation,
        description: bookingDescription,
        price: finalPrice,
        timezone: userTimeZone,
      };

      console.log("Booking data being sent:", bookingData);

      const token = localStorage.getItem("token");

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

        // Check if the error is about expert being already booked
        if (data.error && data.error.includes("already booked")) {
          Swal.fire({
            icon: "info",
            title: "Time Slot Not Available",
            html: `
              <div class="text-center">
                <p class="mb-3">${data.error}</p>
                <p class="text-gray-600">Please select another time slot as the expert is already booked during this time.</p>
              </div>
            `,
            confirmButtonText: "Choose Another Slot",
            confirmButtonColor: "#3085d6",
            allowOutsideClick: false,
          }).then(() => {
            // Reset time selections to allow user to pick different times
            setSelectedStartTime(null);
            setSelectedEndTime(null);
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Booking Failed",
            text: data.message || "Unknown error occurred",
            timer: 3000,
            showConfirmButton: false,
          });
        }
      } else {
        try {
          await fetch(BLOCK_API_URL, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              date: formattedDate,
              startTime: selectedStartTime,
              endTime: selectedEndTime,
              reason: "Booked by player",
            }),
          });
        } catch (blockError) {
          console.error("Failed to block slot after booking", blockError);
        }

        Swal.fire({
          icon: "success",
          title: "Booking Successful!",
          text: "Redirecting to Bookings Page",
          timer: 3000,
          showConfirmButton: false,
        }).then(() => {
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

  const isDateInPast = (day: number): boolean => {
    if (selectedYear < currentYear) return true;
    if (selectedYear > currentYear) return false;
    if (selectedMonthIndex < currentMonth) return true;
    if (selectedMonthIndex > currentMonth) return false;
    return day < currentDay;
  };

  const generateCalendarDays = () => {
    const emptyCells = Array(displayedMonth.firstDayOfWeek).fill(null);
    const daysInMonth = Array.from(
      { length: displayedMonth.numberOfDays },
      (_, i) => i + 1
    );
    return [...emptyCells, ...daysInMonth];
  };

  const calendarDays = generateCalendarDays();

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

  // Get time slots for start time selection (all available slots)
  const startTimeSlotRows = organizeTimeSlotsIntoRows(getAllTimeSlots());

  // Get time slots for end time selection (must be after start time, duration 1-2h, and available)
  const getValidEndTimes = () => {
    if (!selectedStartTime) return [];
    const allTimes = getAllTimeSlots();
    return allTimes.filter(
      (time) =>
        isTimeSlotAvailable(time) &&
        isValidEndTime(time) &&
        calculateDurationInMinutes(selectedStartTime, time) > 0
    );
  };

  const endTimeSlotRows = organizeTimeSlotsIntoRows(getValidEndTimes());

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
                {service?.expertname && (
                  <div className="flex flex-col items-center mb-6">
                    <img
                      src={service.expertProfileImage || profile}
                      alt={service.expertname}
                      className="w-20 h-20 rounded-full object-cover mb-2"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = profile;
                      }}
                    />
                    <h3 className="text-lg font-semibold text-center">
                      {service.expertname}
                    </h3>
                  </div>
                )}
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
                  <span className="text-gray-600">
                    {selectedStartTime && selectedEndTime
                      ? `${getDurationLabel()} session`
                      : "Select time range for your session"}
                  </span>
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
                    {selectedStartTime && selectedEndTime ? (
                      <>
                        Fees: {formatPrice(finalPrice)}
                        <span className="text-xs text-gray-500 block">
                          ({getDurationLabel()} session)
                        </span>
                      </>
                    ) : (
                      `Fees: ${formatPrice(parsePrice(service?.price))}/h`
                    )}
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
              {/* Selected date and time */}
              <div className="mb-6">
                <p className="text-gray-700 font-medium mb-3">
                  {getFormattedDate()}
                </p>
                {selectedStartTime && selectedEndTime ? (
                  <div className="space-y-2">
                    <span className="bg-red-500 p-2 rounded-lg text-white inline-block">
                      {formatTime(selectedStartTime)} -{" "}
                      {formatTime(selectedEndTime)}
                    </span>
                    <p className="text-sm text-gray-600">
                      Duration: {getDurationLabel()}
                    </p>
                  </div>
                ) : selectedStartTime ? (
                  <div className="space-y-2">
                    <span className="bg-red-500 p-2 rounded-lg text-white inline-block">
                      Start: {formatTime(selectedStartTime)}
                    </span>
                    <p className="text-sm text-gray-600">
                      Please select an end time
                    </p>
                  </div>
                ) : null}
              </div>

              {/* Start Time Slots */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Available Start Times
                </h3>
                {!selectedDate ? (
                  <p className="text-gray-500 text-sm italic">
                    Select a date to view available time slots
                  </p>
                ) : loadingTimeSlots ? (
                  <div className="flex justify-center items-center h-[100px]">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <p className="text-gray-500 text-sm italic">
                    No available time slots for this date
                  </p>
                ) : (
                  <div className="space-y-3">
                    {startTimeSlotRows.map((row, rowIndex) => (
                      <div key={rowIndex} className="grid grid-cols-4 gap-2">
                        {row.map((time) => (
                          <button
                            key={time}
                            onClick={() => handleStartTimeSelect(time)}
                            className={`
                              py-2 px-3 border rounded-md text-sm
                              ${
                                selectedStartTime === time
                                  ? "border-blue-500 bg-blue-50 text-blue-500"
                                  : "border-gray-200 hover:border-gray-300 text-gray-800"
                              }
                            `}
                          >
                            {formatTime(time)}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* End Time Slots - Only show after start time is selected */}
              {selectedStartTime && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Select End Time
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    Choose an end time (1-2 hours from start time)
                  </p>
                  <div className="space-y-3">
                    {endTimeSlotRows.length === 0 ? (
                      <div className="text-gray-400 italic text-xs">
                        No valid end times available
                      </div>
                    ) : (
                      endTimeSlotRows.map((row, rowIndex) => (
                        <div key={rowIndex} className="grid grid-cols-4 gap-2">
                          {row.map((time) => (
                            <button
                              key={time}
                              onClick={() => handleEndTimeSelect(time)}
                              disabled={
                                !isValidEndTime(time) ||
                                !isTimeSlotAvailable(time) ||
                                calculateDurationInMinutes(
                                  selectedStartTime,
                                  time
                                ) <= 0
                              }
                              className={`
                                py-2 px-3 border rounded-md text-sm
                                ${
                                  selectedEndTime === time
                                    ? "border-red-500 bg-red-50 text-red-500"
                                    : isValidEndTime(time) &&
                                      isTimeSlotAvailable(time) &&
                                      calculateDurationInMinutes(
                                        selectedStartTime,
                                        time
                                      ) > 0
                                    ? "border-gray-200 hover:border-gray-300 text-gray-800"
                                    : "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
                                }
                              `}
                            >
                              {formatTime(time)}
                            </button>
                          ))}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

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
              {/* Description field */}
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
          disabled={
            loading || !selectedDate || !selectedStartTime || !selectedEndTime
          }
        >
          {loading ? "Processing..." : "Confirm Booking"}
        </Button>
      </div>
    </div>
  );
};

export default BookingCalendar;
