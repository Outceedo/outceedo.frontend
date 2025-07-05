import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Info,
  Clock as ClockIcon,
  HelpCircle,
  Unlock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch as SwitchComponent } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Swal from "sweetalert2";
import BulkAvailabilityManager from "./Bulkslotmanager";

interface TimeSlot {
  id?: string;
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
  reason?: string;
  blockid: string;
}
interface AvailabilityPattern {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}
interface DailyAvailability {
  [date: string]: boolean;
}

const GUIDE_CARDS_KEY = "expert_availability_guide_dismissed";

const ExpertAvailabilityManager = () => {
  const currentDate = new Date();
  const [activeTab, setActiveTab] = useState("calendar");
  const [selectedDate, setSelectedDate] = useState(new Date(currentDate));
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [availabilityPatterns, setAvailabilityPatterns] = useState<
    AvailabilityPattern[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [loadingAvailabilityPatterns, setLoadingAvailabilityPatterns] =
    useState(false);
  const [addSlotDialogOpen, setAddSlotDialogOpen] = useState(false);
  const [updateSlotDialogOpen, setUpdateSlotDialogOpen] = useState(false);
  const [newSlotStartTime, setNewSlotStartTime] = useState("09:00");
  const [newSlotEndTime, setNewSlotEndTime] = useState("17:00");
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [monthlyAvailability, setMonthlyAvailability] =
    useState<DailyAvailability>({});
  const [selectedDayAvailability, setSelectedDayAvailability] = useState(true);
  const [blockReasonDialogOpen, setBlockReasonDialogOpen] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [blockingDate, setBlockingDate] = useState<Date | null>(null);
  const [blockingTimeSlot, setBlockingTimeSlot] = useState<{
    startTime: string;
    endTime: string;
  } | null>(null);
  const [calendarTimeSlots, setCalendarTimeSlots] = useState<
    Record<string, TimeSlot[]>
  >({});

  // Popper guide state and refs
  const [guideStep, setGuideStep] = useState<number>(0);
  const [showGuide, setShowGuide] = useState<boolean>(false);

  // Button refs for popper positioning
  const prevMonthBtnRef = useRef<HTMLButtonElement>(null);
  const nextMonthBtnRef = useRef<HTMLButtonElement>(null);
  const helpBtnRef = useRef<HTMLButtonElement>(null);
  const addSlotBtnRef = useRef<HTMLButtonElement>(null);
  const updateSlotBtnRef = useRef<HTMLButtonElement>(null);
  const switchWrapperRef = useRef<HTMLDivElement>(null);

  const API_BASE_URL = `${import.meta.env.VITE_PORT}/api/v1/user/availability`;
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
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayOfWeekMap = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };
  const dayOfWeekReverseMap = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const expertId =
    localStorage.getItem("userId") ||
    localStorage.getItem("userid") ||
    localStorage.getItem("user_id");

  const token = localStorage.getItem("token");
  const axiosInstance = axios.create({
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const timeOptions = [
    "06:00",
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
    "23:00",
    "00:00",
  ];

  useEffect(() => {
    fetchAvailabilityPatterns();
    if (!localStorage.getItem(GUIDE_CARDS_KEY)) {
      setShowGuide(true);
      setGuideStep(0);
    }
  }, []);

  useEffect(() => {
    fetchMonthlyAvailability();
    fetchCalendarSlotsForMonth();
  }, [currentMonth, currentYear]);

  useEffect(() => {
    if (selectedDate) {
      fetchTimeSlotsForSelectedDate();
    }
  }, [selectedDate]);

  useEffect(() => {
    if (selectedDate) {
      const formattedSelectedDate = formatDateString(selectedDate);
      if (monthlyAvailability[formattedSelectedDate] !== undefined) {
        setSelectedDayAvailability(monthlyAvailability[formattedSelectedDate]);
      }
    }
  }, [monthlyAvailability, selectedDate]);

  const handleNextStep = () => {
    if (guideStep < guideSteps.length - 1) {
      setGuideStep(guideStep + 1);
    } else {
      setShowGuide(false);
      localStorage.setItem(GUIDE_CARDS_KEY, "true");
    }
  };

  const handleCloseGuide = () => {
    setShowGuide(false);
    localStorage.setItem(GUIDE_CARDS_KEY, "true");
  };

  const guideSteps = [
    {
      title: "Help & Guide",
      icon: <HelpCircle className="h-7 w-7 text-blue-600" />,
      description:
        "Click the Help button (blue question mark) any time to see this step-by-step guide again.",
      focusRef: helpBtnRef,
      buttonLabel: "Next",
    },
    {
      title: "Previous Month",
      icon: <ChevronLeft className="h-7 w-7 text-gray-600" />,
      description:
        "Click this button to view the previous month in the calendar.",
      focusRef: prevMonthBtnRef,
      buttonLabel: "Next",
    },
    {
      title: "Next Month",
      icon: <ChevronRight className="h-7 w-7 text-gray-600" />,
      description: "Click this button to view the next month in the calendar.",
      focusRef: nextMonthBtnRef,
      buttonLabel: "Next",
    },
    {
      title: "Mark Day as Available",
      icon: <SwitchComponent className="h-7 w-7 text-green-600" />,
      description:
        "Use this switch to mark a day as available or unavailable. Unavailable days cannot have slots.",
      focusRef: switchWrapperRef,
      buttonLabel: "Next",
    },
    {
      title: "Add/Update/Delete Time Slots",
      icon: <Plus className="h-7 w-7 text-red-600" />,
      description:
        "Click here to add time slots by specifying a range. Once slots are added, use the update button to modify the range or delete button to remove all slots.",
      focusRef: addSlotBtnRef,
      buttonLabel: "Finish",
    },
  ];

  const GuidePopper = ({
    stepCard,
    onNext,
    onClose,
  }: {
    stepCard: (typeof guideSteps)[number];
    onNext: () => void;
    onClose: () => void;
  }) => {
    const [style, setStyle] = useState<React.CSSProperties>({});

    useEffect(() => {
      if (stepCard.focusRef?.current) {
        const rect = stepCard.focusRef.current.getBoundingClientRect();
        const popperWidth = 360;
        const popperHeight = 150;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let top = rect.bottom + 12;
        let left = rect.left + rect.width / 2 - popperWidth / 2;

        if (left < 10) {
          left = 10;
        } else if (left + popperWidth > viewportWidth - 10) {
          left = viewportWidth - popperWidth - 10;
        }

        if (top + popperHeight > viewportHeight - 10) {
          top = rect.top - popperHeight - 12;
        }

        if (stepCard.focusRef === nextMonthBtnRef) {
          left = rect.left - popperWidth - 12;
          top = rect.top - 60;

          if (left < 10) {
            left = rect.left + rect.width / 2 - popperWidth / 2;
            top = rect.bottom + 12;
          }
        }

        if (stepCard.focusRef === addSlotBtnRef) {
          left = rect.left - popperWidth - 12;
          top = rect.top - 60;

          if (left < 10) {
            left = rect.left + rect.width / 2 - popperWidth / 2;
            top = rect.bottom + 12;
          }
        }
        if (stepCard.focusRef === switchWrapperRef) {
          left = rect.left;
          top = rect.top - 90;

          if (left < 10) {
            left = rect.left + rect.width / 2 - popperWidth / 2;
            top = rect.bottom;
          }
        }

        setStyle({
          position: "fixed",
          top: Math.max(10, top),
          left: Math.max(10, left),
          minWidth: 320,
          maxWidth: popperWidth,
          zIndex: 9999,
        });
      }
    }, [stepCard.focusRef, showGuide, guideStep]);

    useEffect(() => {
      if (stepCard.focusRef?.current) {
        stepCard.focusRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        stepCard.focusRef.current.style.boxShadow =
          "0 0 0 3px rgba(59, 130, 246, 0.5)";
        stepCard.focusRef.current.style.borderRadius = "6px";

        setTimeout(() => {
          if (stepCard.focusRef?.current) {
            stepCard.focusRef.current.style.boxShadow = "";
          }
        }, 3000);
      }
    }, [stepCard.focusRef, showGuide, guideStep]);

    if (!stepCard.focusRef?.current) return null;

    return (
      <div
        style={style}
        className="shadow-lg rounded-lg bg-white border border-gray-200 p-5 animate-fade-in"
      >
        <div className="flex gap-3 items-center mb-2">
          {stepCard.icon}
          <span className="text-lg font-bold">{stepCard.title}</span>
        </div>
        <div className="text-gray-700 mb-3 text-sm">{stepCard.description}</div>
        <div className="flex justify-between">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Skip Guide
          </Button>
          <Button size="sm" onClick={onNext}>
            {stepCard.buttonLabel}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  const fetchCalendarSlotsForMonth = async () => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    let newCalendarSlots: Record<string, TimeSlot[]> = {};
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(currentYear, currentMonth, day);
      const formattedDate = formatDateString(dateObj);
      try {
        const response = await axiosInstance.get(
          `${API_BASE_URL}/${expertId}/slots?date=${formattedDate}`
        );
        if (response.data && response.data.length > 0) {
          newCalendarSlots[formattedDate] = response.data;
        } else {
          newCalendarSlots[formattedDate] = [];
        }
      } catch {
        newCalendarSlots[formattedDate] = [];
      }
    }
    setCalendarTimeSlots(newCalendarSlots);
  };

  const fetchAvailabilityPatterns = async () => {
    setLoadingAvailabilityPatterns(true);
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/${expertId}`);
      setAvailabilityPatterns(response.data);
    } catch (error) {
      Swal.fire("Error", "Failed to load availability patterns", "error");
    } finally {
      setLoadingAvailabilityPatterns(false);
    }
  };

  const fetchMonthlyAvailability = async () => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/${expertId}/monthly?month=${
          currentMonth + 1
        }&year=${currentYear}`
      );
      setMonthlyAvailability(response.data);
    } catch (error) {
      Swal.fire("Error", "Failed to load monthly availability", "error");
      generateDummyMonthlyAvailability();
    }
  };

  const fetchTimeSlotsForSelectedDate = async () => {
    if (!selectedDate) return;
    setLoading(true);
    const formattedDate = formatDateString(selectedDate);
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/${expertId}/slots?date=${formattedDate}`
      );
      const transformedSlots: TimeSlot[] = response.data.map((slot: any) => ({
        id: slot.id || generateId(),
        date: formattedDate,
        startTime: slot.startTime,
        endTime: slot.endTime,
        available: slot.isAvailable,
        reason: slot.reason,
        blockid: slot.blockId,
      }));
      console.log(transformedSlots);
      setTimeSlots(transformedSlots);
    } catch (error) {
      Swal.fire("Error", "Failed to load time slots", "error");
      if (!monthlyAvailability[formattedDate]) {
        setTimeSlots([]);
      } else {
        generateDummyTimeSlots(formattedDate);
      }
    } finally {
      setLoading(false);
    }
  };

  // Updated blockDate function with immediate state updates and fetchAvailabilityPatterns call
  const blockDate = async (
    date: Date,
    reason: string,
    timeSlot?: { startTime: string; endTime: string }
  ) => {
    const formattedDate = formatDateString(date);

    try {
      const payload: any = { date: formattedDate, reason: reason };
      if (timeSlot) {
        payload.startTime = timeSlot.startTime;
        payload.endTime = timeSlot.endTime;
      }

      const response = await axiosInstance.patch(
        `${API_BASE_URL}/block`,
        payload
      );

      if (!timeSlot) {
        // Blocking entire day
        setMonthlyAvailability((prev) => ({
          ...prev,
          [formattedDate]: false,
        }));
        if (isSameDay(date, selectedDate)) {
          setSelectedDayAvailability(false);
          setTimeSlots([]);
        }
        Swal.fire(
          "Success",
          `${formatDateForDisplay(date)} has been marked as unavailable.`,
          "success"
        );
      } else {
        // Blocking specific time slot - update state immediately
        if (isSameDay(date, selectedDate)) {
          setTimeSlots((prev) =>
            prev.map((slot) => {
              if (
                slot.startTime === timeSlot.startTime &&
                slot.endTime === timeSlot.endTime
              ) {
                return {
                  ...slot,
                  available: false,
                  reason,
                  blockid: response.data?.id || slot.blockid || generateId(),
                };
              }
              return slot;
            })
          );
        }

        // Also update calendar slots for the month view
        setCalendarTimeSlots((prev) => ({
          ...prev,
          [formattedDate]: (prev[formattedDate] || []).map((slot) => {
            if (
              slot.startTime === timeSlot.startTime &&
              slot.endTime === timeSlot.endTime
            ) {
              return {
                ...slot,
                available: false,
                reason,
                blockid: response.data?.blockId || slot.blockid || generateId(),
              };
            }
            return slot;
          }),
        }));

        // Fetch availability patterns after blocking a specific time slot
        fetchAvailabilityPatterns();

        Swal.fire(
          "Success",
          `Time slot from ${formatTimeForDisplay(
            timeSlot.startTime
          )} to ${formatTimeForDisplay(timeSlot.endTime)} has been blocked.`,
          "success"
        );
      }
    } catch (error) {
      Swal.fire("Error", "Failed to block date or time slot", "error");
    }
  };

  const generateTimeSlots = (
    startTime: string,
    endTime: string
  ): { startTime: string; endTime: string }[] => {
    // Return a single slot with the exact start and end times selected by the user
    return [{ startTime, endTime }];
  };

  // This function works like the original addTimeSlot - adds multiple slots based on range
  const addTimeSlots = async () => {
    try {
      const generatedSlots = generateTimeSlots(
        newSlotStartTime,
        newSlotEndTime
      );

      if (generatedSlots.length === 0) {
        Swal.fire(
          "Error",
          "No valid time slots could be generated with the specified range.",
          "error"
        );
        return false;
      }

      // Use the same logic as the original working version
      const payload = {
        availabilities: generatedSlots.map((slot) => ({
          dayOfWeek: dayOfWeekMap[dayOfWeekReverseMap[selectedDate.getDay()]],
          startTime: slot.startTime,
          endTime: slot.endTime,
        })),
      };

      await axiosInstance.post(`${API_BASE_URL}`, payload);
      setMonthlyAvailability((prev) => ({
        ...prev,
        [formatDateString(selectedDate)]: true,
      }));
      setSelectedDayAvailability(true);
      fetchTimeSlotsForSelectedDate();
      fetchAvailabilityPatterns();
      fetchCalendarSlotsForMonth();
      Swal.fire(
        "Success",
        `${
          generatedSlots.length
        } time slots (1 hour each) added from ${formatTimeForDisplay(
          newSlotStartTime
        )} to ${formatTimeForDisplay(newSlotEndTime)}.`,
        "success"
      );
      return true;
    } catch (error) {
      Swal.fire("Error", "Failed to add time slots", "error");
      return false;
    }
  };

  // Update time slots - delete existing and add new ones
  const updateTimeSlots = async () => {
    try {
      // First delete all existing patterns for this day
      const dayOfWeek = selectedDate.getDay();
      const patternsToDelete = availabilityPatterns.filter(
        (pattern) => pattern.dayOfWeek === dayOfWeek
      );

      if (patternsToDelete.length > 0) {
        const deletePayload = {
          ids: patternsToDelete.map((pattern) => pattern.id).filter(Boolean),
        };
        await axiosInstance.delete(`${API_BASE_URL}`, { data: deletePayload });
      }

      // Then add new slots with the updated range
      const generatedSlots = generateTimeSlots(
        newSlotStartTime,
        newSlotEndTime
      );

      if (generatedSlots.length === 0) {
        Swal.fire(
          "Error",
          "No valid time slots could be generated with the specified range.",
          "error"
        );
        return false;
      }

      const payload = {
        availabilities: generatedSlots.map((slot) => ({
          dayOfWeek: dayOfWeekMap[dayOfWeekReverseMap[selectedDate.getDay()]],
          startTime: slot.startTime,
          endTime: slot.endTime,
        })),
      };

      await axiosInstance.post(`${API_BASE_URL}`, payload);

      fetchTimeSlotsForSelectedDate();
      fetchAvailabilityPatterns();
      fetchCalendarSlotsForMonth();

      Swal.fire(
        "Success",
        `Time slots updated! ${
          generatedSlots.length
        } slots (1 hour each) now available from ${formatTimeForDisplay(
          newSlotStartTime
        )} to ${formatTimeForDisplay(newSlotEndTime)}.`,
        "success"
      );
      return true;
    } catch (error) {
      Swal.fire("Error", "Failed to update time slots", "error");
      return false;
    }
  };

  // Delete all time slots for the selected day
  const deleteAllTimeSlots = async () => {
    try {
      const dayOfWeek = selectedDate.getDay();
      const patternsToDelete = availabilityPatterns.filter(
        (pattern) => pattern.dayOfWeek === dayOfWeek
      );

      if (patternsToDelete.length === 0) {
        Swal.fire(
          "Info",
          "No time slots found to delete for this day.",
          "info"
        );
        return false;
      }

      const result = await Swal.fire({
        title: "Delete All Time Slots?",
        text: `This will delete all time slots for ${dayOfWeekReverseMap[dayOfWeek]}s. This action cannot be undone.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, delete all slots",
        cancelButtonText: "Cancel",
      });

      if (!result.isConfirmed) return false;

      const payload = {
        ids: patternsToDelete.map((pattern) => pattern.id).filter(Boolean),
      };

      await axiosInstance.delete(`${API_BASE_URL}`, { data: payload });

      fetchTimeSlotsForSelectedDate();
      fetchAvailabilityPatterns();
      fetchCalendarSlotsForMonth();

      Swal.fire(
        "Success",
        "All time slots have been deleted for this day.",
        "success"
      );
      return true;
    } catch (error) {
      Swal.fire("Error", "Failed to delete time slots", "error");
      return false;
    }
  };

  // Updated unblockTimeSlot function with fetchAvailabilityPatterns call
  const unblockTimeSlot = async (blockid: string) => {
    if (!blockid) {
      Swal.fire("Error", "Block ID is missing for this slot.", "error");
      return;
    }

    try {
      const url = `${API_BASE_URL}/${blockid}/unblock`;
      await axiosInstance.delete(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // Update state immediately
      const formattedDate = formatDateString(selectedDate);

      // Update timeSlots state
      setTimeSlots((prev) =>
        prev.map((slot) => {
          if (slot.blockid === blockid) {
            return {
              ...slot,
              available: true,
              reason: undefined,
              blockid: "",
            };
          }
          return slot;
        })
      );

      // Update calendar slots for month view
      setCalendarTimeSlots((prev) => ({
        ...prev,
        [formattedDate]: (prev[formattedDate] || []).map((slot) => {
          if (slot.blockid === blockid) {
            return {
              ...slot,
              available: true,
              reason: undefined,
              blockid: "",
            };
          }
          return slot;
        }),
      }));

      // Fetch availability patterns after unblocking
      fetchAvailabilityPatterns();

      Swal.fire(
        "Success",
        "Time slot has been unblocked and is now available.",
        "success"
      );
    } catch (err: any) {
      Swal.fire(
        "Error",
        err?.response?.data?.message || "Failed to unblock time slot.",
        "error"
      );
    }
  };

  const generateDummyMonthlyAvailability = () => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const availability: DailyAvailability = {};
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      availability[formatDateString(date)] = !isWeekend;
    }
    setMonthlyAvailability(availability);
  };

  const generateDummyTimeSlots = (formattedDate: string) => {
    const date = new Date(formattedDate);
    const dayOfWeek = date.getDay();
    let startHour = 9;
    let endHour = 17;
    if (dayOfWeek === 1) {
      startHour = 10;
      endHour = 16;
    } else if (dayOfWeek === 5) {
      startHour = 9;
      endHour = 15;
    }
    const dummySlots: TimeSlot[] = [];
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minutes of ["00", "30"]) {
        const startTime = `${hour.toString().padStart(2, "0")}:${minutes}`;
        let endHour = hour;
        let endMinutes = parseInt(minutes) + 30;
        if (endMinutes >= 60) {
          endHour += 1;
          endMinutes -= 60;
        }
        const endTime = `${endHour.toString().padStart(2, "0")}:${endMinutes
          .toString()
          .padStart(2, "0")}`;
        const isAvailable = Math.random() > 0.3;
        dummySlots.push({
          id: generateId(),
          date: formattedDate,
          startTime,
          endTime,
          available: isAvailable,
          blockid: "",
        });
      }
    }
    setTimeSlots(dummySlots);
  };

  const formatDateString = (date: Date): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const formatDateForDisplay = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTimeForDisplay = (time: string): string => {
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

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const generateId = (): string => {
    return Math.random().toString(36).substring(2, 11);
  };

  const isPastDay = (day: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return day < today;
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleDayAvailabilityToggle = (available: boolean) => {
    if (!available) {
      setBlockingDate(new Date(selectedDate));
      setBlockingTimeSlot(null);
      setBlockReasonDialogOpen(true);
    } else {
      setSelectedDayAvailability(true);
      setMonthlyAvailability((prev) => ({
        ...prev,
        [formatDateString(selectedDate)]: true,
      }));
      fetchTimeSlotsForSelectedDate();
      Swal.fire(
        "Success",
        `${formatDateString(selectedDate)} is now marked as available.`,
        "success"
      );
    }
  };

  const handleBlockTimeSlot = (slot: TimeSlot) => {
    if (!slot.available) {
      Swal.fire(
        "Error",
        "This time slot is already booked by a player.",
        "error"
      );
      return;
    }
    setBlockingDate(new Date(selectedDate));
    setBlockingTimeSlot({
      startTime: slot.startTime,
      endTime: slot.endTime,
    });
    setBlockReasonDialogOpen(true);
  };

  const handleConfirmBlock = () => {
    if (!blockingDate) return;
    if (blockReason.trim() === "") {
      Swal.fire(
        "Error",
        "Please provide a reason for blocking this time.",
        "error"
      );
      return;
    }
    blockDate(blockingDate, blockReason, blockingTimeSlot || undefined);
    setBlockReasonDialogOpen(false);
    setBlockReason("");
    setBlockingDate(null);
    setBlockingTimeSlot(null);
  };

  const handleAddTimeSlots = () => {
    if (newSlotStartTime >= newSlotEndTime) {
      Swal.fire({ icon: "error", text: "End time must be after start time." });
      return;
    }
    addTimeSlots().then((success) => {
      if (success) {
        setNewSlotStartTime("09:00");
        setNewSlotEndTime("17:00");
        setAddSlotDialogOpen(false);
      }
    });
  };

  const handleUpdateTimeSlots = () => {
    if (newSlotStartTime >= newSlotEndTime) {
      Swal.fire("Error", "End time must be after start time.", "error");
      return;
    }
    updateTimeSlots().then((success) => {
      if (success) {
        setNewSlotStartTime("09:00");
        setNewSlotEndTime("17:00");
        setUpdateSlotDialogOpen(false);
      }
    });
  };

  const handleDeleteAllTimeSlots = () => {
    deleteAllTimeSlots();
  };

  const handleOpenUpdateDialog = () => {
    // Set current time range based on existing slots
    if (timeSlots.length > 0) {
      const sortedSlots = [...timeSlots].sort((a, b) =>
        a.startTime.localeCompare(b.startTime)
      );
      setNewSlotStartTime(sortedSlots[0].startTime);
      setNewSlotEndTime(sortedSlots[sortedSlots.length - 1].endTime);
    }
    setUpdateSlotDialogOpen(true);
  };

  const generateCalendarDays = () => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const days = [];
    for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(currentYear, currentMonth, day));
    }
    return days;
  };

  const groupTimeSlotsByHour = () => {
    const groupedSlots: { [hour: string]: TimeSlot[] } = {};
    timeSlots.forEach((slot) => {
      const hour = slot.startTime.split(":")[0];
      if (!groupedSlots[hour]) groupedSlots[hour] = [];
      groupedSlots[hour].push(slot);
    });
    return groupedSlots;
  };

  const calendarDays = generateCalendarDays();
  const groupedTimeSlots = groupTimeSlotsByHour();
  const hasTimeSlots = timeSlots.length > 0;

  return (
    <div className="container mx-auto py-6">
      {showGuide && (
        <GuidePopper
          stepCard={guideSteps[guideStep]}
          onNext={handleNextStep}
          onClose={handleCloseGuide}
        />
      )}
      <div className="flex flex-col space-y-6">
        <h1 className="text-2xl font-bold">Manage Your Availability</h1>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
            {/* <TabsTrigger value="bulk">Bulk Edit</TabsTrigger> */}
          </TabsList>
          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <CardTitle>Monthly Availability</CardTitle>
                    <Button
                      ref={helpBtnRef}
                      variant="ghost"
                      className="px-1"
                      onClick={() => {
                        setShowGuide(true);
                        setGuideStep(0);
                        localStorage.removeItem(GUIDE_CARDS_KEY);
                      }}
                      aria-label="Show Help Guide"
                    >
                      <HelpCircle className="h-5 w-5 text-blue-500" />
                    </Button>
                  </div>
                  <div className="flex items-center">
                    <Button
                      ref={prevMonthBtnRef}
                      variant="outline"
                      size="icon"
                      onClick={handlePrevMonth}
                      className="mr-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-md font-medium">
                      {monthNames[currentMonth]} {currentYear}
                    </span>
                    <Button
                      ref={nextMonthBtnRef}
                      variant="outline"
                      size="icon"
                      onClick={handleNextMonth}
                      className="ml-2"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {dayNames.map((day, index) => (
                    <div
                      key={index}
                      className="text-center text-sm font-medium text-gray-500"
                    >
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, index) => {
                    if (day === null) {
                      return (
                        <div key={`empty-${index}`} className="h-14 p-1"></div>
                      );
                    }
                    const formattedDate = formatDateString(day);
                    const isAvailable = monthlyAvailability[formattedDate];
                    const isSelected = isSameDay(day, selectedDate);
                    const slotsForDay = calendarTimeSlots[formattedDate] || [];
                    const hasSlots = slotsForDay.length > 0;
                    const isPast = isPastDay(day);
                    return (
                      <div
                        key={formattedDate}
                        onClick={() => {
                          if (!isPast) handleDateSelect(day);
                        }}
                        className={`
                          h-14 p-1 border rounded-md flex flex-col justify-between cursor-pointer relative
                          ${
                            isSelected
                              ? "border-red-500 bg-red-50"
                              : "border-gray-200 hover:border-gray-300"
                          }
                          ${isPast ? "opacity-50 cursor-not-allowed" : ""}
                        `}
                        style={{
                          pointerEvents: isPast ? "none" : undefined,
                          background: isSelected
                            ? "#fef2f2"
                            : isPast
                            ? "#f9fafb"
                            : undefined,
                        }}
                        aria-disabled={isPast}
                      >
                        <div className="absolute top-1 left-1">
                          {isAvailable === true && !isPast ? (
                            hasSlots ? (
                              <ClockIcon
                                className="h-4 w-4 text-green-500"
                                title="Time slots added"
                              />
                            ) : (
                              <ClockIcon
                                className="h-4 w-4 text-red-500"
                                title="No time slots for available day"
                              />
                            )
                          ) : null}
                        </div>
                        <div className="text-right text-sm font-medium">
                          {day.getDate()}
                        </div>
                        <div className="flex justify-center">
                          {isAvailable === false && !isPast ? (
                            <Badge
                              variant="outline"
                              className="bg-gray-100 text-gray-500 text-xs"
                            >
                              Unavailable
                            </Badge>
                          ) : isAvailable === true && !isPast ? (
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-600 text-xs"
                            >
                              Available
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
              <div className="h-12 flex flex-col justify-between items-end px-8">
                <div className="flex w-36 justify-between items-center">
                  <ClockIcon
                    className="h-4 w-4 text-green-500"
                    title="Time slots added"
                  />
                  <p>Added time slots</p>
                </div>
                <div className="flex w-36 gap-2 items-center">
                  <ClockIcon
                    className="h-4 w-4 text-red-500"
                    title="No time slots for available day"
                  />
                  <p>No time slots</p>
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <CardTitle>Daily Slots</CardTitle>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">
                      {selectedDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center justify-between">
                  <div
                    className="flex items-center space-x-2"
                    ref={switchWrapperRef}
                  >
                    <Label
                      htmlFor="day-availability"
                      className="text-sm font-medium"
                    >
                      Mark day as available
                    </Label>
                    <SwitchComponent
                      id="day-availability"
                      checked={selectedDayAvailability}
                      onCheckedChange={handleDayAvailabilityToggle}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    {hasTimeSlots ? (
                      <>
                        <Button
                          ref={updateSlotBtnRef}
                          variant="outline"
                          size="sm"
                          className="flex items-center"
                          disabled={!selectedDayAvailability}
                          onClick={handleOpenUpdateDialog}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Update Slots
                        </Button>
                        <Button
                          ref={addSlotBtnRef}
                          variant="destructive"
                          size="sm"
                          className="flex items-center"
                          disabled={!selectedDayAvailability}
                          onClick={handleDeleteAllTimeSlots}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete All Slots
                        </Button>
                      </>
                    ) : (
                      <Dialog
                        open={addSlotDialogOpen}
                        onOpenChange={setAddSlotDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            ref={addSlotBtnRef}
                            variant="outline"
                            size="sm"
                            className="flex items-center"
                            disabled={!selectedDayAvailability}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Time Slots
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Time Slots</DialogTitle>
                            <DialogDescription>
                              Create 30-minute time slots by specifying a range
                              for{" "}
                              {selectedDate.toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="start-time">Start Time</Label>
                                <Select
                                  value={newSlotStartTime}
                                  onValueChange={setNewSlotStartTime}
                                >
                                  <SelectTrigger id="start-time">
                                    <SelectValue placeholder="Select start time" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {timeOptions.map((time) => (
                                      <SelectItem
                                        key={`start-${time}`}
                                        value={time}
                                      >
                                        {formatTimeForDisplay(time)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="end-time">End Time</Label>
                                <Select
                                  value={newSlotEndTime}
                                  onValueChange={setNewSlotEndTime}
                                >
                                  <SelectTrigger id="end-time">
                                    <SelectValue placeholder="Select end time" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {timeOptions.map((time) => (
                                      <SelectItem
                                        key={`end-${time}`}
                                        value={time}
                                      >
                                        {formatTimeForDisplay(time)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="text-sm text-gray-600">
                              This will create 30-minute slots between{" "}
                              {formatTimeForDisplay(newSlotStartTime)} and{" "}
                              {formatTimeForDisplay(newSlotEndTime)}.
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setAddSlotDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button onClick={handleAddTimeSlots}>
                              Add Slots
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                  </div>
                ) : !selectedDayAvailability ? (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                    <AlertCircle className="h-10 w-10 mb-2" />
                    <p>This day is marked as unavailable</p>
                    <p className="text-sm">
                      Toggle the switch above to make it available.
                    </p>
                  </div>
                ) : timeSlots.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                    <Clock className="h-10 w-10 mb-2" />
                    <p>No time slots available</p>
                    <p className="text-sm">
                      Click the "Add Time Slots" button to create slots.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupedTimeSlots).map(([hour, slots]) => (
                      <div key={hour} className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-700">
                          {formatTimeForDisplay(`${hour}:00`).split(":")[0]}{" "}
                          {parseInt(hour) < 12 ? "AM" : "PM"}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {slots.map((slot) => (
                            <div
                              key={slot.id}
                              className={`
                                p-3 border rounded-md
                                ${
                                  !slot.available
                                    ? "bg-gray-50 border-gray-300"
                                    : "border-gray-200"
                                }
                              `}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <span className="text-sm font-medium">
                                    {formatTimeForDisplay(slot.startTime)} -{" "}
                                    {formatTimeForDisplay(slot.endTime)}
                                  </span>

                                  {!slot.available && slot.blockid && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-red-600 hover:bg-green-50 ml-2"
                                            onClick={() =>
                                              unblockTimeSlot(slot.blockid)
                                            }
                                          >
                                            <Unlock className="h-4 w-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Unblock time slot</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}

                                  {slot.reason && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div className="inline-block ml-1">
                                            <Info className="h-4 w-4 text-gray-400 inline-block" />
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Reason: {slot.reason}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                </div>

                                {slot.available && (
                                  <div className="flex space-x-1">
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50"
                                            onClick={() =>
                                              handleBlockTimeSlot(slot)
                                            }
                                          >
                                            <AlertCircle className="h-4 w-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Block time slot</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="list" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <CardTitle>All Available Time Slots</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(monthlyAvailability)
                    .filter(([_, isAvailable]) => isAvailable)
                    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                    .map(([date]) => {
                      const dateObj = new Date(date);
                      const formattedDate = dateObj.toLocaleDateString(
                        "en-US",
                        {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        }
                      );

                      return (
                        <div key={date} className="border rounded-md p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-md font-medium">
                              {formattedDate}
                            </h3>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const dateObj = new Date(date);
                                setSelectedDate(dateObj);
                                setCurrentMonth(dateObj.getMonth());
                                setCurrentYear(dateObj.getFullYear());
                                setActiveTab("calendar");
                              }}
                            >
                              View Day
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="bulk" className="space-y-6">
            <BulkAvailabilityManager />
          </TabsContent>
        </Tabs>
      </div>

      {/* Update Slots Dialog */}
      <Dialog
        open={updateSlotDialogOpen}
        onOpenChange={setUpdateSlotDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Time Slots</DialogTitle>
            <DialogDescription>
              Update the time range for 30-minute slots on{" "}
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="update-start-time">Start Time</Label>
                <Select
                  value={newSlotStartTime}
                  onValueChange={setNewSlotStartTime}
                >
                  <SelectTrigger id="update-start-time">
                    <SelectValue placeholder="Select start time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={`update-start-${time}`} value={time}>
                        {formatTimeForDisplay(time)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="update-end-time">End Time</Label>
                <Select
                  value={newSlotEndTime}
                  onValueChange={setNewSlotEndTime}
                >
                  <SelectTrigger id="update-end-time">
                    <SelectValue placeholder="Select end time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={`update-end-${time}`} value={time}>
                        {formatTimeForDisplay(time)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              This will replace all existing slots with new 30-minute slots
              between {formatTimeForDisplay(newSlotStartTime)} and{" "}
              {formatTimeForDisplay(newSlotEndTime)}.
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUpdateSlotDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateTimeSlots}>Update Slots</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={blockReasonDialogOpen}
        onOpenChange={setBlockReasonDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {blockingTimeSlot ? "Block Time Slot" : "Block Entire Day"}
            </DialogTitle>
            <DialogDescription>
              {blockingTimeSlot
                ? `Block the time slot from ${formatTimeForDisplay(
                    blockingTimeSlot.startTime
                  )} to ${formatTimeForDisplay(blockingTimeSlot.endTime)}`
                : `Mark ${blockingDate?.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })} as unavailable`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="block-reason">Reason for blocking</Label>
              <Input
                id="block-reason"
                placeholder="e.g., Personal appointment, Out of town, etc."
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBlockReasonDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmBlock}
              disabled={blockReason.trim() === ""}
            >
              Block {blockingTimeSlot ? "Time Slot" : "Day"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpertAvailabilityManager;
