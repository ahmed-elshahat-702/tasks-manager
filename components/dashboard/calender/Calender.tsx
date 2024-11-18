import React, { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  format,
  startOfToday,
  eachHourOfInterval,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  isSameHour,
  isSameDay,
  parseISO,
} from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useTasks } from "@/hooks/use-tasks";

const Calendar = () => {
  const { tasks, fetchTasks } = useTasks();

  useEffect(() => {
    fetchTasks();
  }, []);

  const [view, setView] = useState<"day" | "week" | "month">("day");
  const today = startOfToday();

  // Generate time slots based on view
  const getTimeSlots = (): Date[] => {
    switch (view) {
      case "day":
        return eachHourOfInterval({
          start: new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            0,
            0,
            0
          ),
          end: new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            23,
            59,
            59
          ),
        });
      case "week":
        return eachDayOfInterval({
          start: startOfWeek(today),
          end: endOfWeek(today),
        });
      case "month":
        return eachDayOfInterval({
          start: startOfMonth(today),
          end: endOfMonth(today),
        });
      default:
        return [];
    }
  };

  // Filter tasks for a specific time slot
  const getTasksForTimeSlot = (slot: Date) => {
    return tasks.filter((task) => {
      if (!task.date && !task.time) return false;

      const taskDate = task.date ? parseISO(task.date) : null;
      const taskTime = task.time
        ? parseISO(`${task?.date?.split("T")[0]}T${task.time}`)
        : null;

      switch (view) {
        case "day":
          return taskTime
            ? isSameHour(taskTime, slot)
            : taskDate && isSameDay(taskDate, today);
        case "week":
          return taskDate ? isSameDay(taskDate, slot) : false;
        case "month":
          return taskDate ? isSameDay(taskDate, slot) : false;
      }
    });
  };

  const timeSlots = getTimeSlots();

  function convertTo12HourFormat(time: String) {
    const [hours, minutes] = time?.split(":").map(Number);

    const suffix = hours >= 12 ? "PM" : "AM";
    const adjustedHours = hours % 12 || 12; // Convert 0 to 12 for midnight.

    return `${adjustedHours}:${String(minutes).padStart(2, "0")} ${suffix}`;
  }

  return (
    <div className="w-full h-full p-4">
      <Tabs
        defaultValue="day"
        className="w-full"
        onValueChange={(value) => setView(value as "day" | "week" | "month")}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="day">Today</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
        </TabsList>

        <TabsContent value="day" className="mt-4">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-4 pr-4">
              {timeSlots.map((hour: Date, idx) => (
                <div key={idx} className="flex gap-4 p-4 border rounded-lg">
                  <div className="w-24 font-medium">
                    {format(hour, "h:mm a")}
                  </div>
                  <div className="flex-1">
                    {getTasksForTimeSlot(hour).map((task, taskIdx) => (
                      <div
                        key={taskIdx}
                        className={cn(
                          "p-2 mb-2 rounded flex justify-between items-center",
                          task.completed ? "bg-green-100" : "bg-blue-100"
                        )}
                      >
                        <span>{task.title}</span>
                        {task.time && (
                          <span className="text-sm text-gray-600">
                            {convertTo12HourFormat(task.time)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="week" className="mt-4">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {timeSlots.map((day, idx) => (
                <div key={idx} className="border rounded-lg p-4">
                  <div className="font-medium mb-2">
                    {format(day, "EEE, MMM d")}
                  </div>
                  <div className="space-y-2">
                    {getTasksForTimeSlot(day).map((task, taskIdx) => (
                      <div
                        key={taskIdx}
                        className={cn(
                          "p-2 rounded text-sm flex justify-between items-center",
                          task.completed ? "bg-green-100" : "bg-blue-100"
                        )}
                      >
                        <span>{task.title}</span>
                        {task.time && (
                          <span className="text-xs text-gray-600">
                            {convertTo12HourFormat(task.time)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="month" className="mt-4">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="grid grid-cols-7 gap-4">
              {timeSlots.map((day, idx) => (
                <div key={idx} className="border rounded-lg p-4 min-h-[120px]">
                  <div className="font-medium mb-2">{format(day, "d")}</div>
                  <div className="space-y-1">
                    {getTasksForTimeSlot(day).map((task, taskIdx) => (
                      <div
                        key={taskIdx}
                        className={cn(
                          "p-1 rounded text-xs flex justify-between items-center",
                          task.completed ? "bg-green-100" : "bg-blue-100"
                        )}
                      >
                        <span>{task.title}</span>
                        {task.time && (
                          <span className="text-xs text-gray-600">
                            {convertTo12HourFormat(task.time)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Calendar;
