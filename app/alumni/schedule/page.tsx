"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  format,
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  parseISO,
  isBefore,
  isEqual,
  startOfDay,
} from "date-fns";
import { title } from "process";
import { Description } from "@radix-ui/react-dialog";

export default function SchedulePage() {
  const [view, setView] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [studentSubjects, setStudentSubjects] = useState<any[]>([]);
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Math Lecture",
      start: new Date(2025, 3, 7, 10, 0),
      end: new Date(2025, 3, 7, 11, 30),
      subject: "Mathematics",
    },
    {
      id: 2,
      title: "Physics Lab",
      start: new Date(2025, 3, 8, 14, 0),
      end: new Date(2025, 3, 8, 16, 0),
      subject: "Physics",
    },
    {
      id: 3,
      title: "CS Assignment Due",
      start: new Date(2025, 3, 10, 23, 59),
      end: new Date(2025, 3, 10, 23, 59),
      subject: "Computer Science",
    },
    {
      id: 4,
      title: "Study Group",
      start: new Date(2025, 3, 9, 15, 0),
      end: new Date(2025, 3, 9, 16, 30),
      subject: "General",
    },
  ]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    start: "",
    end: "",
    subject: "",
  });
  const [eventError, setEventError] = useState("");
  const [studentData, setStudentData] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [studentCourseData, setStudentCourseData] = useState<any>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [currentSemesterId, setCurrentSemesterId] = useState<string | null>(
    null
  );

  const fetchStudentCourseDetails = async () => {
    try {
      const response = await fetch(
        `/api/batch/viewBatch/viewStudentBatchDetail?studentId=${user.uid}`
      );
      const data = await response.json();
      setStudentCourseData(data);
    } catch (error) {
      console.error("Error fetching student course details:", error);
    }
  };

  const fetchStudentCurrentSemester = async () => {
    try {
      const res = await fetch(
        `/api/semesterDetail/viewSemesterDetail/viewStudentCurrentSemester/?courseId=${studentCourseData?.courseId}&batchId=${studentCourseData?.batchId}`,
        {
          method: "GET",
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch semester detail");
      }
      setCurrentSemesterId(data.semesterDetailId);
    } catch (error) {
      console.error("Error fetching semester detail:", error);
    }
  };

  function dayStringToIndex(day: string) {
    const map: Record<string, number> = {
      SU: 0,
      MO: 1,
      TU: 2,
      WE: 3,
      TH: 4,
      FR: 5,
      SA: 6,
    };
    return map[day];
  }

  function expandRecurringEvents(events: any[]) {
    const expandedEvents: any[] = [];

    events.forEach((event) => {
      if (event.recurring) {
        const { startDate, endDate, frequency, interval, byDay } =
          event.recurring;
        const start = parseISO(startDate);
        const end = parseISO(endDate);

        let currentDate = new Date(start);

        while (isBefore(currentDate, end) || isEqual(currentDate, end)) {
          if (frequency === "weekly") {
            byDay.forEach((dayCode: string) => {
              const weekdayIndex = dayStringToIndex(dayCode);

              const eventDate = new Date(currentDate);
              eventDate.setDate(
                currentDate.getDate() +
                  ((weekdayIndex - currentDate.getDay() + 7) % 7)
              );

              if (eventDate >= start && eventDate <= end) {
                expandedEvents.push(createEventInstance(event, eventDate));
              }
            });

            currentDate = addWeeks(currentDate, interval);
          } else if (frequency === "daily") {
            // Add currentDate if it's within range
            if (currentDate >= start && currentDate <= end) {
              expandedEvents.push(createEventInstance(event, currentDate));
            }

            currentDate = addDays(currentDate, interval);
          } else {
            // Handle other frequencies (monthly, etc.) if needed
            break;
          }
        }
      } else {
        // Non-recurring event
        expandedEvents.push({
          id: event.id,
          title: event.title,
          start: new Date(event.start),
          end: new Date(event.end),
          subject: event.description || "General",
        });
      }
    });

    return expandedEvents;
  }

  // Helper to create a recurring event instance on a specific date
  function createEventInstance(event: any, eventDate: Date) {
    const eventStartTime = new Date(event.start);
    const eventEndTime = new Date(event.end);

    const expandedStart = new Date(
      eventDate.getFullYear(),
      eventDate.getMonth(),
      eventDate.getDate(),
      eventStartTime.getHours(),
      eventStartTime.getMinutes()
    );

    const expandedEnd = new Date(
      eventDate.getFullYear(),
      eventDate.getMonth(),
      eventDate.getDate(),
      eventEndTime.getHours(),
      eventEndTime.getMinutes()
    );

    return {
      id: `${event.id}-${eventDate.toISOString()}`,
      title: event.title,
      start: expandedStart,
      end: expandedEnd,
      subject: event.description || "General",
    };
  }

  const fetchStudentSubjects = async () => {
    try {
      const response = await fetch(
        `/api/subjects/viewSubject/viewStudentSubjects?studentId=${user.uid}`
      );
      const data = await response.json();

      setStudentSubjects(data.simplifiedSubjects);
    } catch (error) {
      console.error("Error fetching student subjects:", error);
    }
  };

  useEffect(() => {
    if (user) {
      const fetchAndSetEvents = async () => {
        try {
          const response = await fetch(
            `/api/schedule/viewSchedule/viewStudentSchedule?userId=${user.uid}`
          );
          const data = await response.json();

          // setStudentData(data);

          const allEvents = expandRecurringEvents(data);
          setEvents(allEvents);
        } catch (error) {
          console.error("Error fetching student data:", error);
        }
      };

      fetchAndSetEvents();
      fetchStudentSubjects();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchStudentCourseDetails();
    }
  }, [user]);

  useEffect(() => {
    if (user && studentCourseData) {
      fetchStudentCurrentSemester();
    }
  }, [user, studentCourseData]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const navigate = (direction: "prev" | "next") => {
    switch (view) {
      case "daily":
        setCurrentDate(
          direction === "prev"
            ? subDays(currentDate, 1)
            : addDays(currentDate, 1)
        );
        break;
      case "weekly":
        setCurrentDate(
          direction === "prev"
            ? subWeeks(currentDate, 1)
            : addWeeks(currentDate, 1)
        );
        break;
      case "monthly":
        setCurrentDate(
          direction === "prev"
            ? subMonths(currentDate, 1)
            : addMonths(currentDate, 1)
        );
        break;
    }
  };

  const getDateDisplay = () => {
    if (view === "daily") return format(currentDate, "MMMM d, yyyy");
    if (view === "weekly") {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `${format(weekStart, "MMM d")} - ${format(
        weekEnd,
        "MMM d, yyyy"
      )}`;
    }
    return format(currentDate, "MMMM yyyy");
  };

  const createNewEvent = async (eventData: any) => {
    try {
      const response = await fetch(
        "/api/schedule/createSchedule/createPersonalSchedule",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(eventData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Something went wrong");
      }
      return result;
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  const handleAddEvent = () => {
    if (!newEvent.title.trim()) {
      setEventError("Event title is required.");
      console.error("Event title is required.");
      return;
    }
    if (!newEvent.start || !newEvent.end) {
      setEventError("Start and end times are required.");
      console.error("Start and end times are required.");
      return;
    }
    const startDate = new Date(newEvent.start);
    const endDate = new Date(newEvent.end);
    if (startDate > endDate) {
      setEventError("End time must be after start time.");
      console.error("End time must be after start time.");
      return;
    }
    if (!newEvent.subject) {
      setEventError("Subject is required.");
      console.error("Subject is required.");
      return;
    }
    const newEventData = {
      id: events.length + 1,
      title: newEvent.title,
      start: startDate,
      end: endDate,
      subject: newEvent.subject,
    };

    console.log("New Event Data:", newEventData);
    setEvents([...events, newEventData]);
    setNewEvent({ title: "", start: "", end: "", subject: "" });
    setShowAddEvent(false);
    setEventError("");

    const dataToSend = {
      title: newEventData.title,
      start: newEventData.start,
      end: newEventData.end,
      description: title + " " + selectedSubject,
    };

    createNewEvent(dataToSend);
  };

  const expandedEvents = expandRecurringEvents(events);

  const renderDailyView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const dayEvents = expandedEvents.filter((event) =>
      isSameDay(startOfDay(event.start), startOfDay(currentDate))
    );

    return (
      <ScrollArea className="h-full min-h-0">
        <div className="grid grid-cols-[80px_1fr] border-b border-border/50 bg-muted/50 p-2">
          <div className="text-center text-muted-foreground font-medium">
            Time
          </div>
          <div className="text-center text-muted-foreground font-medium">
            {format(currentDate, "EEEE, MMMM d")}
          </div>
        </div>
        <div className="grid grid-cols-[80px_1fr] gap-2">
          <div className="flex flex-col text-muted-foreground text-xs">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-16 flex items-center justify-end pr-3 border-b border-border/50"
              >
                {format(new Date().setHours(hour, 0), "h a")}
              </div>
            ))}
          </div>
          <div className="relative">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-16 border-b border-border/50 bg-background/50"
              />
            ))}
            {dayEvents.map((event) => {
              const startHour =
                event.start.getHours() + event.start.getMinutes() / 60;
              const duration =
                (event.end.getTime() - event.start.getTime()) /
                (1000 * 60 * 60);
              return (
                <div
                  key={event.id}
                  className="absolute left-1 right-1 p-2 bg-gradient-to-br from-primary to-primary/70 text-primary-foreground rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-primary/80"
                  style={{
                    top: `${startHour * 64}px`,
                    height: `${duration * 64}px`,
                  }}
                >
                  <p className="text-sm font-semibold">{event.title}</p>
                  <p className="text-xs flex items-center gap-1">
                    <Clock className="h-3 w-3" />{" "}
                    {format(event.start, "h:mm a")} -{" "}
                    {format(event.end, "h:mm a")}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    );
  };

  const renderWeeklyView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({
      start: weekStart,
      end: endOfWeek(weekStart, { weekStartsOn: 1 }),
    });

    return (
      <ScrollArea className="h-full min-h-0">
        <div className="grid grid-cols-8 gap-1 border-b border-border/50 bg-muted/50 p-2">
          <div className="text-center text-muted-foreground font-medium">
            Time
          </div>
          {weekDays.map((day) => (
            <div
              key={day.toString()}
              className="text-center text-muted-foreground font-medium"
            >
              {format(day, "EEE d")}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-8 gap-1">
          <div className="flex flex-col text-muted-foreground text-xs">
            {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
              <div
                key={hour}
                className="h-16 flex items-center justify-end pr-3 border-b border-border/50"
              >
                {format(new Date().setHours(hour, 0), "h a")}
              </div>
            ))}
          </div>
          {weekDays.map((day) => {
            const dayEvents = events.filter((event) =>
              isSameDay(event.start, day)
            );
            return (
              <div
                key={day.toString()}
                className="relative border-l border-border/50"
              >
                {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                  <div
                    key={hour}
                    className="h-16 border-b border-border/50 bg-background/50"
                  />
                ))}
                {dayEvents.map((event) => {
                  const startHour =
                    event.start.getHours() + event.start.getMinutes() / 60;
                  const duration =
                    (event.end.getTime() - event.start.getTime()) /
                    (1000 * 60 * 60);
                  return (
                    <div
                      key={event.id}
                      className="absolute left-0.5 right-0.5 p-1 bg-gradient-to-br from-primary to-primary/70 text-primary-foreground rounded-md shadow-md hover:shadow-lg transition-all duration-300 border-l-2 border-primary/80"
                      style={{
                        top: `${startHour * 64}px`,
                        height: `${duration * 64}px`,
                      }}
                    >
                      <p className="text-xs font-semibold truncate">
                        {event.title}
                      </p>
                      <p className="text-xs truncate">
                        {format(event.start, "h:mm a")}
                      </p>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    );
  };

  const renderMonthlyView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const firstDayOfWeek = monthStart.getDay();
    const paddedDays = [...Array(firstDayOfWeek).fill(null), ...days];
    const totalCells = Math.ceil(paddedDays.length / 7) * 7;
    while (paddedDays.length < totalCells) paddedDays.push(null);

    return (
      <ScrollArea className="h-full min-h-0">
        <div className="grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center text-foreground font-semibold p-2 bg-muted/50 rounded-t-lg"
            >
              {day}
            </div>
          ))}
          {paddedDays.map((day, idx) => {
            if (!day)
              return (
                <div
                  key={idx}
                  className="h-32 bg-muted/10 border border-border/20 rounded-lg"
                />
              );
            const dayEvents = events.filter((event) =>
              isSameDay(event.start, day)
            );
            return (
              <div
                key={day.toString()}
                className={cn(
                  "h-32 p-2 bg-card border border-border/50 rounded-lg shadow-sm transition-all duration-300",
                  isToday(day)
                    ? "bg-primary/10 border-primary shadow-md"
                    : "hover:bg-primary/5"
                )}
              >
                <p
                  className={cn(
                    "text-sm font-medium text-foreground",
                    isToday(day) && "text-primary"
                  )}
                >
                  {format(day, "d")}
                </p>
                <div className="mt-1 space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className="text-xs p-1 bg-gradient-to-r from-primary/80 to-primary/60 text-primary-foreground rounded-sm shadow-sm hover:bg-primary/90 truncate"
                    >
                      {format(event.start, "h:mm a")} - {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{dayEvents.length - 3} more
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] gap-6 p-6">
      {/* Header */}
      <Card className="bg-card/95 backdrop-blur-md shadow-xl rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-20 pointer-events-none" />
        <CardHeader className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-6 w-6 text-primary" />
            <div>
              <CardTitle className="text-2xl font-bold text-foreground">
                Schedule
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {getDateDisplay()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={() => setCurrentDate(new Date())}
              className="bg-primary/10 text-foreground hover:bg-primary/20 rounded-lg"
            >
              Today
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("prev")}
              className="bg-primary/10 text-foreground hover:bg-primary/20 rounded-lg px-2"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("next")}
              className="bg-primary/10 text-foreground hover:bg-primary/20 rounded-lg px-2"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
            <Button
              onClick={() => setShowAddEvent(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Event
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar */}
      <Card className="flex-1 bg-card/95 backdrop-blur-md shadow-xl rounded-xl relative overflow-hidden h-full min-h-0">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-secondary/5 opacity-30 pointer-events-none" />
        <Tabs
          value={view}
          onValueChange={(v) => setView(v as typeof view)}
          className="flex flex-col h-full min-h-0 relative z-10"
        >
          <TabsList className="grid grid-cols-3 w-full max-w-xs mx-auto bg-muted/50 rounded-xl p-1 mt-4">
            <TabsTrigger
              value="daily"
              className="text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
            >
              Daily
            </TabsTrigger>
            <TabsTrigger
              value="weekly"
              className="text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
            >
              Weekly
            </TabsTrigger>
            <TabsTrigger
              value="monthly"
              className="text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
            >
              Monthly
            </TabsTrigger>
          </TabsList>
          <CardContent className="flex-1 p-6 flex flex-col h-full min-h-0">
            <TabsContent value="daily" className="h-full m-0 flex-1">
              {renderDailyView()}
            </TabsContent>
            <TabsContent value="weekly" className="h-full m-0 flex-1">
              {renderWeeklyView()}
            </TabsContent>
            <TabsContent value="monthly" className="h-full m-0 flex-1">
              {renderMonthlyView()}
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Add Event Dialog */}
      <Dialog open={showAddEvent} onOpenChange={setShowAddEvent}>
        <DialogContent className="bg-card/95 backdrop-blur-md shadow-xl rounded-xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Add New Event</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Fill in the event details below and click "Create" to schedule it.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 p-4">
            {eventError && (
              <p className="text-destructive text-sm">{eventError}</p>
            )}

            <div>
              <Label htmlFor="title" className="text-foreground">
                Title
              </Label>
              <Input
                id="title"
                value={newEvent.title}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, title: e.target.value })
                }
                placeholder="Event title"
                className="bg-muted/50 border-border focus:ring-primary focus:border-primary rounded-lg"
              />
            </div>

            <div>
              <Label htmlFor="start" className="text-foreground">
                Start Time
              </Label>
              <Input
                id="start"
                type="datetime-local"
                value={newEvent.start}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, start: e.target.value })
                }
                className="bg-muted/50 border-border focus:ring-primary focus:border-primary rounded-lg"
              />
            </div>

            <div>
              <Label htmlFor="end" className="text-foreground">
                End Time
              </Label>
              <Input
                id="end"
                type="datetime-local"
                value={newEvent.end}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, end: e.target.value })
                }
                className="bg-muted/50 border-border focus:ring-primary focus:border-primary rounded-lg"
              />
            </div>

            <div>
              <Label htmlFor="subject" className="text-foreground">
                Subject
              </Label>
              <Select
                value={newEvent.subject}
                onValueChange={(value) => {
                  const selected = studentSubjects.find(
                    (subject) => subject.id === value
                  );
                  setNewEvent({ ...newEvent, subject: value });
                  if (selected) {
                    setSelectedSubject(selected.name);
                  }
                }}
              >
                <SelectTrigger className="bg-muted/50 border-border focus:ring-primary focus:border-primary rounded-lg">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {studentSubjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowAddEvent(false)}
                className="border-border text-foreground hover:bg-primary/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddEvent}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Create
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
