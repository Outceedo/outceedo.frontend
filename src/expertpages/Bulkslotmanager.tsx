import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Calendar,
  Clock,
  Plus,
  X,
  Trash2,
  Save,
  Copy,
  AlertCircle,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface AvailabilityPattern {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface DayAvailability {
  dayOfWeek: number;
  slots: TimeSlot[];
  active: boolean;
}

interface TimeSlot {
  id?: string;
  startTime: string;
  endTime: string;
  active?: boolean;
  deleted?: boolean;
}

const GUIDE_CARDS_KEY = "bulk_availability_guide_dismissed";

const BulkAvailabilityManager = () => {
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const timeOptions = [
    "06:00",
    "06:30",
    "07:00",
    "07:30",
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
    "20:00",
    "20:30",
    "21:00",
    "21:30",
  ];

  const [weeklyAvailability, setWeeklyAvailability] = useState<
    DayAvailability[]
  >([]);
  const [availabilityPatterns, setAvailabilityPatterns] = useState<
    AvailabilityPattern[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addSlotDialogOpen, setAddSlotDialogOpen] = useState(false);
  const [selectedDayForNewSlot, setSelectedDayForNewSlot] = useState<
    number | null
  >(null);
  const [newSlotStartTime, setNewSlotStartTime] = useState("09:00");
  const [newSlotEndTime, setNewSlotEndTime] = useState("17:00");
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [copySourceDay, setCopySourceDay] = useState<number | null>(null);
  const [copyTargetDays, setCopyTargetDays] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deletedSlots, setDeletedSlots] = useState<
    { id?: string; dayOfWeek: number; startTime: string; endTime: string }[]
  >([]);

  // Guide state and refs
  const [guideStep, setGuideStep] = useState<number>(0);
  const [showGuide, setShowGuide] = useState<boolean>(false);

  const saveBtnRef = useRef<HTMLButtonElement>(null);
  const copyBtnRef = useRef<HTMLButtonElement>(null);
  const helpBtnRef = useRef<HTMLButtonElement>(null);
  const addSlotBtnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const clearAllBtnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const dayCheckboxRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const API_BASE_URL = `${
    import.meta.env.VITE_PORT || "https://sportsapp.publicvm.com"
  }/api/v1/user/availability`;
  const BLOCK_API_URL = `${
    import.meta.env.VITE_PORT || "https://sportsapp.publicvm.com"
  }/api/v1/user/availability/block`;
  const userId =
    localStorage.getItem("userId") ||
    localStorage.getItem("userid") ||
    localStorage.getItem("user_id") ||
    "22951a3363";
  const token = localStorage.getItem("token");

  const axiosInstance = axios.create({
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    initializeWeeklyAvailability();
    fetchAvailabilityPatterns();
    if (!localStorage.getItem(GUIDE_CARDS_KEY)) {
      setShowGuide(true);
      setGuideStep(0);
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    updateWeeklyAvailabilityFromPatterns();
    // eslint-disable-next-line
  }, [availabilityPatterns]);

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
      title: "Enable/Disable Days",
      icon: <Calendar className="h-7 w-7 text-purple-600" />,
      description:
        "Use the checkboxes next to each day to enable or disable availability for that day of the week.",
      focusRef: { current: dayCheckboxRefs.current[1] }, // Monday checkbox
      buttonLabel: "Next",
    },
    {
      title: "Add Time Slots",
      icon: <Plus className="h-7 w-7 text-green-600" />,
      description:
        "Click 'Add Slot' on any active day to add new available time slots for that weekday.",
      focusRef: { current: addSlotBtnRefs.current[1] }, // Monday add button
      buttonLabel: "Next",
    },
    {
      title: "Copy Schedule",
      icon: <Copy className="h-7 w-7 text-blue-600" />,
      description:
        "Use this button to copy one day's schedule to other days. Perfect for setting up repetitive weekly patterns.",
      focusRef: copyBtnRef,
      buttonLabel: "Next",
    },
    {
      title: "Clear All Slots",
      icon: <Trash2 className="h-7 w-7 text-orange-600" />,
      description:
        "Use 'Clear All' to remove all time slots for a specific day in one click.",
      focusRef: {
        current: clearAllBtnRefs.current.find((ref) => ref !== null),
      },
      buttonLabel: "Next",
    },
    {
      title: "Save Changes",
      icon: <Save className="h-7 w-7 text-red-600" />,
      description:
        "Always remember to save your changes! This will update your weekly availability schedule.",
      focusRef: saveBtnRef,
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

        // Adjust if popper would go off-screen horizontally
        if (left < 10) {
          left = 10;
        } else if (left + popperWidth > viewportWidth - 10) {
          left = viewportWidth - popperWidth - 10;
        }

        // Adjust if popper would go off-screen vertically
        if (top + popperHeight > viewportHeight - 10) {
          top = rect.top - popperHeight - 12;
        }

        // Special positioning for Copy Schedule button
        if (stepCard.focusRef === copyBtnRef) {
          left = rect.left - popperWidth - 12;
          top = rect.top - 60;

          if (left < 10) {
            left = rect.left + rect.width / 2 - popperWidth / 2;
            top = rect.bottom + 12;
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
        // Add a highlight effect
        stepCard.focusRef.current.style.boxShadow =
          "0 0 0 3px rgba(59, 130, 246, 0.5)";
        stepCard.focusRef.current.style.borderRadius = "6px";

        // Remove highlight after 3 seconds
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

  const initializeWeeklyAvailability = () => {
    const initial: DayAvailability[] = [];
    for (let day = 0; day < 7; day++) {
      initial.push({
        dayOfWeek: day,
        slots: [],
        active: day > 0 && day < 6, // Monday to Friday are active by default
      });
    }
    setWeeklyAvailability(initial);
  };

  const fetchAvailabilityPatterns = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/${userId}`);
      setAvailabilityPatterns(response.data || []);
      setDeletedSlots([]);
    } catch (error) {
      console.error("Error fetching availability patterns:", error);
      setError(
        "Failed to load availability patterns. Please check your connection."
      );
      toast.error("Failed to load availability patterns");
    } finally {
      setLoading(false);
    }
  };

  const updateWeeklyAvailabilityFromPatterns = () => {
    if (!availabilityPatterns || availabilityPatterns.length === 0) return;

    const updated = [...weeklyAvailability];

    // Reset all days first
    for (let day = 0; day < 7; day++) {
      updated[day].slots = [];
      updated[day].active = false;
    }

    // Update with patterns
    for (let day = 0; day < 7; day++) {
      const dayPatterns = availabilityPatterns.filter(
        (pattern) => pattern.dayOfWeek === day
      );
      if (dayPatterns.length > 0) {
        updated[day].active = true;
        updated[day].slots = dayPatterns.map((pattern) => ({
          id: pattern.id,
          startTime: pattern.startTime,
          endTime: pattern.endTime,
          active: true,
        }));
        // Sort slots by start time
        updated[day].slots.sort((a, b) =>
          a.startTime.localeCompare(b.startTime)
        );
      }
    }

    setWeeklyAvailability(updated);
  };

  const formatTimeForDisplay = (time: string): string => {
    const [hour, minute] = time.split(":");
    const hourNum = parseInt(hour, 10);
    if (hourNum === 0) return `12:${minute}am`;
    if (hourNum === 12) return `12:${minute}pm`;
    if (hourNum > 12) return `${hourNum - 12}:${minute}pm`;
    return `${hourNum}:${minute}am`;
  };

  const getNextDayOccurrence = (dayOfWeek: number): string => {
    const currentDate = new Date();
    const currentDay = currentDate.getDay();
    const daysToAdd = (dayOfWeek - currentDay + 7) % 7;
    const targetDate = new Date(currentDate);
    targetDate.setDate(currentDate.getDate() + daysToAdd);
    return targetDate.toISOString().split("T")[0];
  };

  const blockTimeSlot = async (
    dayOfWeek: number,
    startTime: string,
    endTime: string
  ): Promise<boolean> => {
    try {
      const dateToBlock = getNextDayOccurrence(dayOfWeek);
      const blockPayload = {
        date: dateToBlock,
        startTime,
        endTime,
        reason: "Manually removed from schedule",
      };

      await axiosInstance.patch(BLOCK_API_URL, blockPayload);
      return true;
    } catch (error) {
      console.error("Error blocking time slot:", error);
      return false;
    }
  };

  const saveAvailabilityPatterns = async () => {
    setSaving(true);
    setError(null);

    try {
      const availabilitiesToAdd: {
        dayOfWeek: number;
        startTime: string;
        endTime: string;
      }[] = [];
      let availabilitiesToDelete: string[] = [];

      // Process each day
      weeklyAvailability.forEach((day) => {
        if (day.active) {
          day.slots.forEach((slot) => {
            if (slot.active !== false && !slot.deleted) {
              if (!slot.id) {
                // New slot to add
                availabilitiesToAdd.push({
                  dayOfWeek: day.dayOfWeek,
                  startTime: slot.startTime,
                  endTime: slot.endTime,
                });
              }
            } else if (slot.id) {
              // Existing slot to delete
              availabilitiesToDelete.push(slot.id);
            }
          });
        } else {
          // Day is inactive, delete all its slots
          day.slots.forEach((slot) => {
            if (slot.id) availabilitiesToDelete.push(slot.id);
          });
        }
      });

      // Add deleted slots to deletion list
      deletedSlots.forEach((slot) => {
        const pattern = availabilityPatterns.find(
          (p) =>
            p.dayOfWeek === slot.dayOfWeek &&
            p.startTime === slot.startTime &&
            p.endTime === slot.endTime
        );
        if (pattern?.id) {
          availabilitiesToDelete.push(pattern.id);
        }
      });

      // Remove duplicates
      availabilitiesToDelete = Array.from(new Set(availabilitiesToDelete));

      // Add new availabilities
      if (availabilitiesToAdd.length > 0) {
        await axiosInstance.post(API_BASE_URL, {
          availabilities: availabilitiesToAdd,
        });
      }

      // Delete removed availabilities
      if (availabilitiesToDelete.length > 0) {
        await axiosInstance.delete(API_BASE_URL, {
          data: { ids: availabilitiesToDelete },
        });
      }

      // Block deleted time slots
      if (deletedSlots.length > 0) {
        for (const slot of deletedSlots) {
          await blockTimeSlot(slot.dayOfWeek, slot.startTime, slot.endTime);
        }
        setDeletedSlots([]);
      }

      toast.success("Availability schedule saved successfully");
      await fetchAvailabilityPatterns(); // Refresh data
    } catch (error: any) {
      console.error("Error saving availability patterns:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to save availability schedule";
      setError(errorMessage);
      toast.error("Failed to save availability schedule");
    } finally {
      setSaving(false);
    }
  };

  const toggleDayActive = (dayIndex: number) => {
    const updated = [...weeklyAvailability];
    const previouslyActive = updated[dayIndex].active;
    updated[dayIndex].active = !previouslyActive;

    if (previouslyActive) {
      // Day is being deactivated, mark all slots for deletion
      updated[dayIndex].slots.forEach((slot) => {
        if (slot.id) {
          setDeletedSlots((prev) => [
            ...prev,
            { ...slot, dayOfWeek: dayIndex },
          ]);
          slot.deleted = true;
        }
      });
    }

    setWeeklyAvailability(updated);
  };

  const addTimeSlot = () => {
    if (selectedDayForNewSlot === null) return;

    if (newSlotStartTime >= newSlotEndTime) {
      toast.error("Invalid time range", {
        description: "End time must be after start time.",
      });
      return;
    }

    const updated = [...weeklyAvailability];
    const dayAvailability = updated[selectedDayForNewSlot];

    // Check for overlapping slots
    const isOverlapping = dayAvailability.slots.some(
      (slot) =>
        !slot.deleted &&
        ((newSlotStartTime >= slot.startTime &&
          newSlotStartTime < slot.endTime) ||
          (newSlotEndTime > slot.startTime && newSlotEndTime <= slot.endTime) ||
          (newSlotStartTime <= slot.startTime &&
            newSlotEndTime >= slot.endTime))
    );

    if (isOverlapping) {
      toast.error("Time slot overlap", {
        description: "This time slot overlaps with an existing slot.",
      });
      return;
    }

    // Add new slot
    dayAvailability.slots.push({
      startTime: newSlotStartTime,
      endTime: newSlotEndTime,
      active: true,
    });

    // Sort slots by start time
    dayAvailability.slots.sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );

    setWeeklyAvailability(updated);
    setAddSlotDialogOpen(false);
    setNewSlotStartTime("09:00");
    setNewSlotEndTime("17:00");

    toast.success("Time slot added", {
      description: `New slot added for ${dayNames[selectedDayForNewSlot]}`,
    });
  };

  const deleteTimeSlot = (dayIndex: number, slotIndex: number) => {
    const updated = [...weeklyAvailability];
    const slotToDelete = updated[dayIndex].slots[slotIndex];

    if (slotToDelete.id) {
      // Mark existing slot for deletion
      setDeletedSlots((prev) => [
        ...prev,
        { ...slotToDelete, dayOfWeek: dayIndex },
      ]);
      slotToDelete.deleted = true;
    }

    // Remove slot from UI
    updated[dayIndex].slots.splice(slotIndex, 1);
    setWeeklyAvailability(updated);

    toast.info(`Time slot removed from ${dayNames[dayIndex]}`);
  };

  const clearAllSlots = (dayIndex: number) => {
    const updated = [...weeklyAvailability];

    // Mark all existing slots for deletion
    updated[dayIndex].slots.forEach((slot) => {
      if (slot.id) {
        setDeletedSlots((prev) => [...prev, { ...slot, dayOfWeek: dayIndex }]);
        slot.deleted = true;
      }
    });

    // Clear all slots
    updated[dayIndex].slots = [];
    setWeeklyAvailability(updated);

    toast.info(`All time slots for ${dayNames[dayIndex]} cleared`);
  };

  const copyDaySchedule = () => {
    if (copySourceDay === null || copyTargetDays.length === 0) return;

    const updated = [...weeklyAvailability];
    const sourceSlots = weeklyAvailability[copySourceDay].slots.filter(
      (slot) => !slot.deleted
    );

    copyTargetDays.forEach((targetDay) => {
      // Mark existing slots for deletion
      updated[targetDay].slots.forEach((slot) => {
        if (slot.id) {
          setDeletedSlots((prev) => [
            ...prev,
            { ...slot, dayOfWeek: targetDay },
          ]);
        }
      });

      // Copy source slots (without IDs so they'll be created as new)
      updated[targetDay].slots = sourceSlots.map((slot) => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
        active: true,
      }));

      // Activate target day
      updated[targetDay].active = true;
    });

    setWeeklyAvailability(updated);
    setCopyDialogOpen(false);
    setCopySourceDay(null);
    setCopyTargetDays([]);

    toast.success("Schedule copied", {
      description: `${dayNames[copySourceDay]}'s schedule copied to ${copyTargetDays.length} day(s)`,
    });
  };

  const handleCopySourceDayChange = (day: number) => {
    setCopySourceDay(day);
    setCopyTargetDays([]);
  };

  const handleCopyTargetDayToggle = (day: number) => {
    setCopyTargetDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

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
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">Bulk Availability Manager</h1>
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
          <Button
            ref={saveBtnRef}
            onClick={saveAvailabilityPatterns}
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="mr-2">Saving...</span>
                <span className="animate-spin">⏳</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 p-4 rounded-md mb-4 flex items-start">
            <AlertCircle className="text-red-500 h-5 w-5 mr-2 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800">Error</h3>
              <p className="text-red-700 text-sm">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 border-red-300 text-red-600"
                onClick={() => setError(null)}
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}

        <Card className="bg-white">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                Weekly Schedule
              </CardTitle>
              <Dialog open={copyDialogOpen} onOpenChange={setCopyDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" ref={copyBtnRef}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Schedule
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Copy Day Schedule</DialogTitle>
                    <DialogDescription>
                      Copy one day's availability schedule to other days
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <div className="space-y-2">
                      <Label>Copy from:</Label>
                      <Select
                        value={copySourceDay?.toString() || ""}
                        onValueChange={(value) =>
                          handleCopySourceDayChange(parseInt(value))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select source day" />
                        </SelectTrigger>
                        <SelectContent>
                          {dayNames.map((day, index) => (
                            <SelectItem
                              key={`source-${index}`}
                              value={index.toString()}
                              disabled={
                                !weeklyAvailability[index]?.active ||
                                weeklyAvailability[index]?.slots.length === 0
                              }
                            >
                              {day}{" "}
                              {weeklyAvailability[index]?.slots.length > 0
                                ? `(${weeklyAvailability[index].slots.length} slots)`
                                : "(no slots)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {copySourceDay !== null && (
                      <div className="space-y-2">
                        <Label>Copy to:</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {dayNames.map(
                            (day, index) =>
                              index !== copySourceDay && (
                                <div
                                  key={`target-${index}`}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    id={`target-day-${index}`}
                                    checked={copyTargetDays.includes(index)}
                                    onCheckedChange={() =>
                                      handleCopyTargetDayToggle(index)
                                    }
                                  />
                                  <Label htmlFor={`target-day-${index}`}>
                                    {day}
                                  </Label>
                                </div>
                              )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCopyDialogOpen(false);
                        setCopySourceDay(null);
                        setCopyTargetDays([]);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={copyDaySchedule}
                      disabled={
                        copySourceDay === null || copyTargetDays.length === 0
                      }
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Copy Schedule
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {weeklyAvailability.map((day, dayIndex) => (
                  <div
                    key={`day-${dayIndex}`}
                    className="border rounded-md p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id={`day-active-${dayIndex}`}
                          checked={day.active}
                          onCheckedChange={() => toggleDayActive(dayIndex)}
                          ref={(el) => (dayCheckboxRefs.current[dayIndex] = el)}
                        />
                        <Label
                          htmlFor={`day-active-${dayIndex}`}
                          className={`text-lg font-medium ${
                            !day.active ? "text-gray-400" : ""
                          }`}
                        >
                          {dayNames[dayIndex]}
                        </Label>
                        {day.active && day.slots.length > 0 && (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-600"
                          >
                            {day.slots.length}{" "}
                            {day.slots.length === 1 ? "slot" : "slots"}
                          </Badge>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          ref={(el) => (addSlotBtnRefs.current[dayIndex] = el)}
                          onClick={() => {
                            setSelectedDayForNewSlot(dayIndex);
                            setAddSlotDialogOpen(true);
                          }}
                          disabled={!day.active}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Slot
                        </Button>
                        {day.slots.length > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            ref={(el) =>
                              (clearAllBtnRefs.current[dayIndex] = el)
                            }
                            onClick={() => clearAllSlots(dayIndex)}
                            className="text-red-500 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Clear All
                          </Button>
                        )}
                      </div>
                    </div>
                    {day.active && (
                      <div className="space-y-2">
                        {day.slots.length === 0 ? (
                          <div className="text-center py-4 text-gray-500">
                            <Clock className="h-6 w-6 mx-auto mb-2" />
                            <p>No time slots added for {dayNames[dayIndex]}</p>
                            <p className="text-sm">
                              Click "Add Slot" to create availability
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {day.slots
                              .filter((slot) => !slot.deleted)
                              .map((slot, slotIndex) => (
                                <div
                                  key={`slot-${dayIndex}-${slotIndex}`}
                                  className="flex justify-between items-center p-3 border rounded-md bg-gray-50"
                                >
                                  <span className="font-medium">
                                    {formatTimeForDisplay(slot.startTime)} -{" "}
                                    {formatTimeForDisplay(slot.endTime)}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-500 hover:bg-red-50"
                                    onClick={() =>
                                      deleteTimeSlot(dayIndex, slotIndex)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Slot Dialog */}
      <Dialog open={addSlotDialogOpen} onOpenChange={setAddSlotDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Time Slot</DialogTitle>
            <DialogDescription>
              {selectedDayForNewSlot !== null
                ? `Add a new availability slot for ${dayNames[selectedDayForNewSlot]}`
                : "Add a new availability slot"}
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
                      <SelectItem key={`start-${time}`} value={time}>
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
                      <SelectItem key={`end-${time}`} value={time}>
                        {formatTimeForDisplay(time)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddSlotDialogOpen(false);
                setNewSlotStartTime("09:00");
                setNewSlotEndTime("17:00");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={addTimeSlot}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Add Slot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BulkAvailabilityManager;
