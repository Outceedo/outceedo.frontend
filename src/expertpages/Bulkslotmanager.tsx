import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Calendar,
  Clock,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Save,
  Copy,
  CheckCircle2,
  AlertCircle,
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
  deleted?: boolean; // Track if slot was deleted
}

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
  const shortDayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

  const [activeTab, setActiveTab] = useState("weekly");
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
  const [selectedDay, setSelectedDay] = useState(1); // Monday default
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [copySourceDay, setCopySourceDay] = useState<number | null>(null);
  const [copyTargetDays, setCopyTargetDays] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deletedSlots, setDeletedSlots] = useState<
    { dayOfWeek: number; startTime: string; endTime: string }[]
  >([]);

  // Constants and configuration
  const CURRENT_DATE = "2025-06-08 15:13:15"; // Using the provided date/time
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
    "22951a3363"; // Using the provided login as fallback

  const token = localStorage.getItem("token");

  // Create axios instance with authentication
  const axiosInstance = axios.create({
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    initializeWeeklyAvailability();
    fetchAvailabilityPatterns();
  }, []);

  useEffect(() => {
    updateWeeklyAvailabilityFromPatterns();
  }, [availabilityPatterns]);

  const initializeWeeklyAvailability = () => {
    const initialWeeklyAvailability: DayAvailability[] = [];

    for (let day = 0; day < 7; day++) {
      initialWeeklyAvailability.push({
        dayOfWeek: day,
        slots: [],
        active: day > 0 && day < 6, // Mon-Fri active by default
      });
    }

    setWeeklyAvailability(initialWeeklyAvailability);
  };

  const fetchAvailabilityPatterns = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log(
        `Fetching availability patterns from: ${API_BASE_URL}/${userId}`
      );
      const response = await axiosInstance.get(`${API_BASE_URL}/${userId}`);
      console.log("API Response:", response.data);
      setAvailabilityPatterns(response.data);

      // Reset deleted slots when refreshing data
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

    const updatedAvailability = [...weeklyAvailability];

    for (let day = 0; day < 7; day++) {
      const dayPatterns = availabilityPatterns.filter(
        (pattern) => pattern.dayOfWeek === day
      );

      if (dayPatterns.length > 0) {
        updatedAvailability[day].active = true;
        updatedAvailability[day].slots = dayPatterns.map((pattern) => ({
          id: pattern.id,
          startTime: pattern.startTime,
          endTime: pattern.endTime,
          active: true,
        }));
      }
    }

    setWeeklyAvailability(updatedAvailability);
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

  // Helper to get the next occurrence of a day of week from current date
  const getNextDayOccurrence = (dayOfWeek: number): string => {
    const currentDate = new Date(CURRENT_DATE);
    const currentDay = currentDate.getDay();
    const daysToAdd = (dayOfWeek - currentDay + 7) % 7;

    const targetDate = new Date(currentDate);
    targetDate.setDate(currentDate.getDate() + daysToAdd);

    return targetDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  };

  // Block a specific time slot
  const blockTimeSlot = async (
    dayOfWeek: number,
    startTime: string,
    endTime: string
  ) => {
    try {
      // Get the next occurrence of this day of week
      const dateToBlock = getNextDayOccurrence(dayOfWeek);

      // Create the block payload
      const blockPayload = JSON.stringify({
        date: dateToBlock,
        startTime: startTime,
        endTime: endTime,
        reason: "Manually removed from schedule",
      });

      console.log(
        `Blocking slot on ${dayNames[dayOfWeek]}: ${startTime}-${endTime}`,
        blockPayload
      );

      // Call the block API endpoint
      const response = await axiosInstance.patch(BLOCK_API_URL, blockPayload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Block response:", response.data);
      return true;
    } catch (error) {
      console.error(
        `Error blocking time slot on ${dayNames[dayOfWeek]}:`,
        error
      );
      return false;
    }
  };

  const saveAvailabilityPatterns = async () => {
    setSaving(true);
    setError(null);

    try {
      // Collect availabilities to add
      const availabilitiesToAdd: {
        dayOfWeek: number;
        startTime: string;
        endTime: string;
      }[] = [];

      // Collect IDs to delete
      const availabilitiesToDelete: string[] = [];

      // Process each day of the week
      weeklyAvailability.forEach((day) => {
        if (day.active) {
          // For active days, process slots
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
              // Deactivated slot to delete
              availabilitiesToDelete.push(slot.id);
            }
          });
        } else {
          // For inactive days, delete all slots
          day.slots.forEach((slot) => {
            if (slot.id) {
              availabilitiesToDelete.push(slot.id);
            }
          });
        }
      });

      console.log("Data to save:", {
        toAdd: availabilitiesToAdd,
        toDelete: availabilitiesToDelete,
        toBlock: deletedSlots,
      });

      // 1. Handle additions if there are any
      if (availabilitiesToAdd.length > 0) {
        console.log("Adding availabilities:", availabilitiesToAdd);

        // Create the exact payload format required by the API
        const addPayload = JSON.stringify({
          availabilities: availabilitiesToAdd.map((a) => ({
            dayOfWeek: a.dayOfWeek,
            startTime: a.startTime,
            endTime: a.endTime,
          })),
        });

        console.log("POST payload:", addPayload);

        // Make the API call with the exact payload format
        const addResponse = await axiosInstance.post(API_BASE_URL, addPayload, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Add response:", addResponse.data);
      }

      // 2. Handle deletions if there are any
      if (availabilitiesToDelete.length > 0) {
        console.log("Deleting availability IDs:", availabilitiesToDelete);

        // Create the delete payload
        const deletePayload = JSON.stringify({ ids: availabilitiesToDelete });
        console.log("DELETE payload:", deletePayload);

        // Make the delete API call
        const deleteResponse = await axiosInstance.delete(API_BASE_URL, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          data: deletePayload,
        });

        console.log("Delete response:", deleteResponse.data);
      }

      // 3. Handle blocking for any deleted slots
      if (deletedSlots.length > 0) {
        console.log("Blocking deleted slots:", deletedSlots);

        // Block each deleted slot
        for (const slot of deletedSlots) {
          await blockTimeSlot(slot.dayOfWeek, slot.startTime, slot.endTime);
        }

        // Clear the deleted slots after processing
        setDeletedSlots([]);
      }

      toast.success("Availability schedule saved successfully");

      // Refresh data
      fetchAvailabilityPatterns();
    } catch (error: any) {
      console.error("Error saving availability patterns:", error);
      setError(error.message || "Failed to save availability schedule");
      toast.error("Failed to save availability schedule");
    } finally {
      setSaving(false);
    }
  };

  const toggleDayActive = (dayIndex: number) => {
    const updatedAvailability = [...weeklyAvailability];
    const previouslyActive = updatedAvailability[dayIndex].active;
    updatedAvailability[dayIndex].active = !previouslyActive;

    // If day is being deactivated, track deleted slots
    if (previouslyActive) {
      const slotsToDelete = updatedAvailability[dayIndex].slots;

      // Add to deletedSlots list for blocking
      slotsToDelete.forEach((slot) => {
        if (slot.id) {
          setDeletedSlots((prev) => [
            ...prev,
            {
              dayOfWeek: dayIndex,
              startTime: slot.startTime,
              endTime: slot.endTime,
            },
          ]);
        }
      });
    }

    setWeeklyAvailability(updatedAvailability);
  };

  const addTimeSlot = () => {
    if (!selectedDayForNewSlot && selectedDayForNewSlot !== 0) return;

    if (newSlotStartTime >= newSlotEndTime) {
      toast.error("Invalid time range", {
        description: "End time must be after start time.",
      });
      return;
    }

    const updatedAvailability = [...weeklyAvailability];
    const dayAvailability = updatedAvailability[selectedDayForNewSlot];

    const isOverlapping = dayAvailability.slots.some((slot) => {
      return (
        !slot.deleted &&
        ((newSlotStartTime >= slot.startTime &&
          newSlotStartTime < slot.endTime) ||
          (newSlotEndTime > slot.startTime && newSlotEndTime <= slot.endTime) ||
          (newSlotStartTime <= slot.startTime &&
            newSlotEndTime >= slot.endTime))
      );
    });

    if (isOverlapping) {
      toast.error("Time slot overlap", {
        description: "This time slot overlaps with an existing slot.",
      });
      return;
    }

    dayAvailability.slots.push({
      startTime: newSlotStartTime,
      endTime: newSlotEndTime,
      active: true,
    });

    dayAvailability.slots.sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );

    setWeeklyAvailability(updatedAvailability);
    setAddSlotDialogOpen(false);

    toast.success("Time slot added", {
      description: `New slot added for ${dayNames[selectedDayForNewSlot]}`,
    });
  };

  const deleteTimeSlot = (dayIndex: number, slotIndex: number) => {
    const updatedAvailability = [...weeklyAvailability];
    const slotToDelete = updatedAvailability[dayIndex].slots[slotIndex];

    // If the slot has an ID (exists in database), track it for blocking
    if (slotToDelete.id) {
      // Add to deletedSlots list
      setDeletedSlots((prev) => [
        ...prev,
        {
          dayOfWeek: dayIndex,
          startTime: slotToDelete.startTime,
          endTime: slotToDelete.endTime,
        },
      ]);

      // Mark as deleted instead of removing from array
      slotToDelete.deleted = true;
    }

    // Remove from the UI
    updatedAvailability[dayIndex].slots.splice(slotIndex, 1);
    setWeeklyAvailability(updatedAvailability);
  };

  const copyDaySchedule = () => {
    if (!copySourceDay && copySourceDay !== 0) return;
    if (!copyTargetDays.length) return;

    const updatedAvailability = [...weeklyAvailability];

    // Filter out deleted slots
    const sourceSlots = weeklyAvailability[copySourceDay].slots.filter(
      (slot) => !slot.deleted
    );

    copyTargetDays.forEach((targetDay) => {
      // For each target day that's getting copied to, track any existing slots for deletion
      if (updatedAvailability[targetDay].slots.length > 0) {
        updatedAvailability[targetDay].slots.forEach((slot) => {
          if (slot.id) {
            setDeletedSlots((prev) => [
              ...prev,
              {
                dayOfWeek: targetDay,
                startTime: slot.startTime,
                endTime: slot.endTime,
              },
            ]);
          }
        });
      }

      // Now copy the source slots to the target day
      updatedAvailability[targetDay].slots = sourceSlots.map((slot) => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
        active: true,
      }));

      updatedAvailability[targetDay].active = true;
    });

    setWeeklyAvailability(updatedAvailability);
    setCopyDialogOpen(false);

    toast.success("Schedule copied", {
      description: `${dayNames[copySourceDay]}'s schedule copied to ${copyTargetDays.length} day(s)`,
    });
  };

  const handleCopySourceDayChange = (day: number) => {
    setCopySourceDay(day);
    setCopyTargetDays([]);
  };

  const handleCopyTargetDayToggle = (day: number) => {
    setCopyTargetDays((prev) => {
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day);
      } else {
        return [...prev, day];
      }
    });
  };

  const clearAllSlots = (dayIndex: number) => {
    const updatedAvailability = [...weeklyAvailability];

    // Track all slots for deletion
    updatedAvailability[dayIndex].slots.forEach((slot) => {
      if (slot.id) {
        setDeletedSlots((prev) => [
          ...prev,
          {
            dayOfWeek: dayIndex,
            startTime: slot.startTime,
            endTime: slot.endTime,
          },
        ]);
      }
    });

    // Clear the slots from the UI
    updatedAvailability[dayIndex].slots = [];
    setWeeklyAvailability(updatedAvailability);

    toast.info(`All time slots for ${dayNames[dayIndex]} cleared`);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Bulk Availability Manager</h1>
          <Button
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

        {/* Error Message */}
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
                  <Button variant="outline" size="sm">
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
                            >
                              {day}
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
                      onClick={() => setCopyDialogOpen(false)}
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
                              .filter((slot) => !slot.deleted) // Only show non-deleted slots
                              .map((slot, slotIndex) => (
                                <div
                                  key={`slot-${dayIndex}-${slotIndex}`}
                                  className="flex justify-between items-center p-3 border rounded-md"
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
              onClick={() => setAddSlotDialogOpen(false)}
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
