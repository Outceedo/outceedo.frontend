import React, { useState } from "react";
import { Calendar, Clock, Save, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const BulkAvailabilityManager = () => {
  // State for weekly schedule
  const [weeklySchedule, setWeeklySchedule] = useState({
    monday: { enabled: true, slots: [] },
    tuesday: { enabled: true, slots: [] },
    wednesday: { enabled: true, slots: [] },
    thursday: { enabled: true, slots: [] },
    friday: { enabled: true, slots: [] },
    saturday: { enabled: false, slots: [] },
    sunday: { enabled: false, slots: [] },
  });

  // State for bulk time slots dialog
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkStartTime, setBulkStartTime] = useState("09:00");
  const [bulkEndTime, setBulkEndTime] = useState("17:00");
  const [bulkInterval, setBulkInterval] = useState("30");
  const [selectedDays, setSelectedDays] = useState({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
  });

  // State for date range
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );

  // Time options for dropdowns
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

  const intervalOptions = [
    { value: "15", label: "15 minutes" },
    { value: "30", label: "30 minutes" },
    { value: "45", label: "45 minutes" },
    { value: "60", label: "1 hour" },
    { value: "90", label: "1.5 hours" },
    { value: "120", label: "2 hours" },
  ];

  // Format time for display
  const formatTimeForDisplay = (time) => {
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

  // Toggle day enabled/disabled
  const toggleDayEnabled = (day) => {
    setWeeklySchedule({
      ...weeklySchedule,
      [day]: {
        ...weeklySchedule[day],
        enabled: !weeklySchedule[day].enabled,
      },
    });
  };

  // Toggle day selection for bulk operations
  const toggleDaySelection = (day) => {
    setSelectedDays({
      ...selectedDays,
      [day]: !selectedDays[day],
    });
  };

  // Generate time slots based on start time, end time, and interval
  const generateTimeSlots = (startTime, endTime, intervalMinutes) => {
    const slots = [];
    const interval = parseInt(intervalMinutes, 10);

    // Convert start and end times to minutes since midnight
    const [startHour, startMinute] = startTime
      .split(":")
      .map((num) => parseInt(num, 10));
    const [endHour, endMinute] = endTime
      .split(":")
      .map((num) => parseInt(num, 10));

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    // Generate slots
    for (let time = startMinutes; time < endMinutes; time += interval) {
      const slotStartHour = Math.floor(time / 60);
      const slotStartMinute = time % 60;

      const slotEndTime = time + interval;
      const slotEndHour = Math.floor(slotEndTime / 60);
      const slotEndMinute = slotEndTime % 60;

      if (slotEndTime <= endMinutes) {
        slots.push({
          startTime: `${slotStartHour
            .toString()
            .padStart(2, "0")}:${slotStartMinute.toString().padStart(2, "0")}`,
          endTime: `${slotEndHour.toString().padStart(2, "0")}:${slotEndMinute
            .toString()
            .padStart(2, "0")}`,
        });
      }
    }

    return slots;
  };

  // Apply bulk time slots to selected days
  const applyBulkTimeSlots = () => {
    const newSchedule = { ...weeklySchedule };
    const slots = generateTimeSlots(bulkStartTime, bulkEndTime, bulkInterval);

    // Apply slots to selected days
    Object.keys(selectedDays).forEach((day) => {
      if (selectedDays[day]) {
        newSchedule[day] = {
          enabled: true,
          slots: slots,
        };
      }
    });

    setWeeklySchedule(newSchedule);
    setShowBulkDialog(false);

    toast({
      title: "Schedule updated",
      description:
        "Your weekly schedule has been updated with the new time slots.",
      duration: 3000,
    });
  };

  // Generate availability based on the weekly schedule and date range
  const generateAvailability = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];

    // Validate date range
    if (start > end) {
      toast({
        title: "Invalid date range",
        description: "End date must be after start date.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    // Count how many slots would be generated
    let slotCount = 0;
    for (
      let date = new Date(start);
      date <= end;
      date.setDate(date.getDate() + 1)
    ) {
      const dayOfWeek = days[date.getDay()];
      if (weeklySchedule[dayOfWeek].enabled) {
        slotCount += weeklySchedule[dayOfWeek].slots.length;
      }
    }

    if (slotCount === 0) {
      toast({
        title: "No slots to generate",
        description:
          "Please set up your weekly schedule first or select days with time slots.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    // Confirm with the user
    const confirmMessage = `This will generate ${slotCount} time slots from ${start.toLocaleDateString()} to ${end.toLocaleDateString()}. Do you want to continue?`;

    if (window.confirm(confirmMessage)) {
      // In a real app, this would make an API call to save the slots
      // For now, just show a success message
      toast({
        title: "Availability generated",
        description: `${slotCount} time slots have been created based on your weekly schedule.`,
        duration: 3000,
      });
    }
  };

  // Clear all slots for a day
  const clearDaySlots = (day) => {
    setWeeklySchedule({
      ...weeklySchedule,
      [day]: {
        ...weeklySchedule[day],
        slots: [],
      },
    });

    toast({
      title: "Slots cleared",
      description: `All time slots for ${
        day.charAt(0).toUpperCase() + day.slice(1)
      } have been removed.`,
      duration: 3000,
    });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        <h1 className="text-2xl font-bold">Bulk Availability Management</h1>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Calendar className="h-5 w-5 text-gray-500" />
              <CardTitle>Set Your Weekly Schedule</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4 mb-4">
                <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Set Bulk Time Slots
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Set Bulk Time Slots</DialogTitle>
                      <DialogDescription>
                        Create a consistent schedule across multiple days.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label>Select Days</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.keys(selectedDays).map((day) => (
                            <div
                              key={day}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`select-${day}`}
                                checked={selectedDays[day]}
                                onCheckedChange={() => toggleDaySelection(day)}
                              />
                              <Label
                                htmlFor={`select-${day}`}
                                className="capitalize"
                              >
                                {day}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="bulk-start-time">Start Time</Label>
                          <Select
                            value={bulkStartTime}
                            onValueChange={setBulkStartTime}
                          >
                            <SelectTrigger id="bulk-start-time">
                              <SelectValue placeholder="Select start time" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeOptions.map((time) => (
                                <SelectItem
                                  key={`bulk-start-${time}`}
                                  value={time}
                                >
                                  {formatTimeForDisplay(time)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bulk-end-time">End Time</Label>
                          <Select
                            value={bulkEndTime}
                            onValueChange={setBulkEndTime}
                          >
                            <SelectTrigger id="bulk-end-time">
                              <SelectValue placeholder="Select end time" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeOptions.map((time) => (
                                <SelectItem
                                  key={`bulk-end-${time}`}
                                  value={time}
                                >
                                  {formatTimeForDisplay(time)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bulk-interval">Interval</Label>
                        <Select
                          value={bulkInterval}
                          onValueChange={setBulkInterval}
                        >
                          <SelectTrigger id="bulk-interval">
                            <SelectValue placeholder="Select interval" />
                          </SelectTrigger>
                          <SelectContent>
                            {intervalOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowBulkDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={applyBulkTimeSlots}>
                        Apply to Selected Days
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Day</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Time Slots</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(weeklySchedule).map(
                    ([day, { enabled, slots }]) => (
                      <TableRow key={day}>
                        <TableCell className="font-medium capitalize">
                          {day}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`enable-${day}`}
                              checked={enabled}
                              onCheckedChange={() => toggleDayEnabled(day)}
                            />
                            <Label htmlFor={`enable-${day}`}>
                              {enabled ? "Available" : "Unavailable"}
                            </Label>
                          </div>
                        </TableCell>
                        <TableCell>
                          {enabled ? (
                            slots.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {slots.map((slot, index) => (
                                  <div
                                    key={index}
                                    className="text-xs bg-gray-100 rounded px-2 py-1"
                                  >
                                    {formatTimeForDisplay(slot.startTime)} -{" "}
                                    {formatTimeForDisplay(slot.endTime)}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-500 italic">
                                No slots defined
                              </span>
                            )
                          ) : (
                            <span className="text-gray-500 italic">
                              Day marked as unavailable
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {enabled && slots.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => clearDaySlots(day)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              Clear Slots
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Calendar className="h-5 w-5 text-gray-500" />
              <CardTitle>Generate Availability</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                    min={startDate}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={generateAvailability}
                  className="flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Generate Availability
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BulkAvailabilityManager;
