import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Clock,
  User,
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

interface LocationSuggestion {
  id: string;
  description: string;
  place_id: string;
  structured_formatting?: {
    main_text: string;
    secondary_text?: string;
  };
}

declare global {
  interface Window {
    google: any;
    initAutocomplete: () => void;
  }
}

const BookingCalendar: React.FC = () => {
  const navigate = useNavigate();
  const autocompleteInputRef = useRef<HTMLInputElement>(null);
  const autocompleteServiceRef = useRef<any>(null);
  const placesServiceRef = useRef<any>(null);
  const sessionTokenRef = useRef<any>(null);

  const [locationSuggestions, setLocationSuggestions] = useState<
    LocationSuggestion[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

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
  const [debouncedLocation, setDebouncedLocation] = useState("");

  // API base URL
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

  // Load Google Maps API
  useEffect(() => {
    // Check if Google Maps API is already loaded
    if (window.google && window.google.maps) {
      setIsGoogleMapsLoaded(true);
      initializeGoogleMapsAutocomplete();
      return;
    }

    // Define the callback function
    window.initAutocomplete = () => {
      setIsGoogleMapsLoaded(true);
      initializeGoogleMapsAutocomplete();
    };

    // Create and add the script
    const googleMapsScript = document.createElement("script");
    // In production, replace YOUR_API_KEY with an actual key
    googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=${
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "YOUR_API_KEY"
    }&libraries=places&callback=initAutocomplete`;
    googleMapsScript.async = true;
    googleMapsScript.defer = true;

    // If API key is not available, use a fallback approach
    if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
      console.warn("Google Maps API key not available. Using mock data.");
      setIsGoogleMapsLoaded(true); // Pretend it's loaded
      return; // Skip loading the script
    }

    document.body.appendChild(googleMapsScript);

    return () => {
      // Clean up
      document.body.removeChild(googleMapsScript);
      delete window.initAutocomplete;
    };
  }, []);

  // Initialize Google Maps Autocomplete
  const initializeGoogleMapsAutocomplete = () => {
    if (window.google && window.google.maps) {
      autocompleteServiceRef.current =
        new window.google.maps.places.AutocompleteService();
      placesServiceRef.current = new window.google.maps.places.PlacesService(
        document.createElement("div")
      );
      sessionTokenRef.current =
        new window.google.maps.places.AutocompleteSessionToken();

      console.log("Google Maps Autocomplete initialized");
    }
  };

  // Debounce the location input
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedLocation(bookingLocation);
    }, 300);

    return () => {
      clearTimeout(timerId);
    };
  }, [bookingLocation]);

  // Get location suggestions
  useEffect(() => {
    if (!debouncedLocation || debouncedLocation.length < 2) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // If Google Maps API is loaded, use it
    if (isGoogleMapsLoaded && autocompleteServiceRef.current) {
      autocompleteServiceRef.current.getPlacePredictions(
        {
          input: debouncedLocation,
          types: [], // Empty array to get all types of places
          componentRestrictions: { country: "us" }, // Limit to US - change or remove as needed
          sessionToken: sessionTokenRef.current,
        },
        (predictions: LocationSuggestion[], status: string) => {
          if (status === "OK" && predictions && predictions.length > 0) {
            setLocationSuggestions(predictions);
            setShowSuggestions(true);
          } else {
            // Fallback to mock data if no results or error
            provideMockSuggestions(debouncedLocation);
          }
        }
      );
    } else {
      // Use mock data if Google Maps API is not available
      provideMockSuggestions(debouncedLocation);
    }
  }, [debouncedLocation, isGoogleMapsLoaded]);

  // Provide mock suggestions for demonstration
  const provideMockSuggestions = (input: string) => {
    // More diverse location types
    const locationTypes = [""];

    // City names for diversity
    const cities = [""];

    // Generate mock suggestions
    const mockResults: LocationSuggestion[] = [];

    // First, exact match
    mockResults.push({
      place_id: `place-${Math.random().toString(36).substr(2, 9)}`,
      description: `${input}, Main Street, Downtown`,
      id: `id-${Math.random().toString(36).substr(2, 9)}`,
      structured_formatting: {
        main_text: input,
      },
    });

    // Then, add variations
    for (let i = 0; i < 4; i++) {
      const locationType =
        locationTypes[Math.floor(Math.random() * locationTypes.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];

      mockResults.push({
        place_id: `place-${Math.random().toString(36).substr(2, 9)}`,
        description: `${input} ${locationType}, ${city}`,
        id: `id-${Math.random().toString(36).substr(2, 9)}`,
        structured_formatting: {
          main_text: `${input} ${locationType}`,
          secondary_text: city,
        },
      });
    }

    setLocationSuggestions(mockResults);
    setShowSuggestions(true);
  };

  // Handle location input change
  const handleLocationInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = e.target;
    setBookingLocation(value);

    if (value.length < 2) {
      setShowSuggestions(false);
    }
  };

  // Handle suggestion select
  const handleSuggestionSelect = (suggestion: LocationSuggestion) => {
    setBookingLocation(suggestion.description);
    setShowSuggestions(false);

    // If using real Google API, get place details
    if (
      isGoogleMapsLoaded &&
      placesServiceRef.current &&
      !suggestion.id.startsWith("id-")
    ) {
      placesServiceRef.current.getDetails(
        {
          placeId: suggestion.place_id,
          fields: ["formatted_address", "name", "geometry"],
          sessionToken: sessionTokenRef.current,
        },
        (place: any, status: string) => {
          if (status === "OK") {
            // Update with the full formatted address
            setBookingLocation(place.formatted_address);

            // Generate new session token for next search
            sessionTokenRef.current =
              new window.google.maps.places.AutocompleteSessionToken();
          }
        }
      );
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        autocompleteInputRef.current &&
        !autocompleteInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  // Calendar data
  const daysOfWeek = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  // Time slots
  const timeSlots = [
    ["10:30am", "11:30am", "12:30pm", "02:30pm"],
    ["03:30pm", "04:30pm", "05:30pm", "07:30pm"],
  ];

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

  // Handle description change
  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setBookingDescription(e.target.value);
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
    const date = new Date(selectedYear, selectedMonthIndex, selectedDate);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const handleConfirm = async () => {
    // For ON GROUND ASSESSMENT, validate location first
    if (isOnGroundAssessment && !bookingLocation.trim()) {
      Swal.fire({
        icon: "failure",
        title: "Please Enter Location",
        text: "Enter your location for On Ground Assessment.",
        timer: 3000,
        showConfirmButton: false,
      });
      return;
    }

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
        alert(`Booking failed: ${data.message || "Unknown error"}`);
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
        // Navigate to bookings page
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("An error occurred during booking. Please try again.");
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
    const emptyCells = Array(displayedMonth.firstDayOfWeek).fill(null);

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
                                monthNames.indexOf(displayedMonth.name) &&
                              selectedYear === displayedMonth.year
                                ? "bg-red-500 text-white font-medium shadow-md" // Updated styling for selected date
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
                <p className="text-gray-700 font-medium">
                  {getFormattedDate()}
                </p>
              </div>

              {/* Time slots */}
              <div className="space-y-3 mb-6">
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

              {/* Location field with autocomplete - Only for ON GROUND ASSESSMENT */}
              {isOnGroundAssessment && (
                <div className="mt-6 mb-4">
                  <Label
                    htmlFor="booking-location"
                    className="text-sm font-medium text-gray-700 mb-2 block flex items-center"
                  >
                    <MapPin className="h-4 w-4 mr-1 text-red-500" />
                    Location <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <div className="relative" ref={autocompleteInputRef}>
                    <Input
                      id="booking-location"
                      placeholder="Search for any location (stadiums, schools, parks, etc.)"
                      value={bookingLocation}
                      onChange={handleLocationInputChange}
                      className="w-full border-gray-200 rounded-md focus:border-red-500 focus:ring focus:ring-red-200"
                      required
                      autoComplete="off"
                    />
                    {showSuggestions && locationSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto">
                        {locationSuggestions.map((suggestion) => (
                          <div
                            key={suggestion.id || suggestion.place_id}
                            className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-0"
                            onClick={() => handleSuggestionSelect(suggestion)}
                          >
                            {suggestion.structured_formatting ? (
                              <>
                                <div className="font-medium">
                                  {suggestion.structured_formatting.main_text}
                                </div>
                                {suggestion.structured_formatting
                                  .secondary_text && (
                                  <div className="text-xs text-gray-500">
                                    {
                                      suggestion.structured_formatting
                                        .secondary_text
                                    }
                                  </div>
                                )}
                              </>
                            ) : (
                              <div>{suggestion.description}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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
          disabled={loading}
        >
          {loading ? "Processing..." : "Confirm Booking"}
        </Button>
      </div>
    </div>
  );
};

export default BookingCalendar;
