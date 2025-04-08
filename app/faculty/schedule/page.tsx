"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { format, addDays, addWeeks, addMonths, subDays, subWeeks, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from "date-fns";

export default function FacultySchedulePage() {
  const [view, setView] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [currentDate, setCurrentDate] = useState(new Date());

  const events = [
    { id: 1, title: "Math Lecture", start: new Date(2025, 3, 7, 10, 0), end: new Date(2025, 3, 7, 11, 30), course: "Mathematics 101" },
    { id: 2, title: "Physics Lab", start: new Date(2025, 3, 8, 14, 0), end: new Date(2025, 3, 8, 16, 0), course: "Physics 201" },
  ];

  const navigate = (direction: "prev" | "next") => {
    switch (view) {
      case "daily": setCurrentDate(direction === "prev" ? subDays(currentDate, 1) : addDays(currentDate, 1)); break;
      case "weekly": setCurrentDate(direction === "prev" ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1)); break;
      case "monthly": setCurrentDate(direction === "prev" ? subMonths(currentDate, 1) : addMonths(currentDate, 1)); break;
    }
  };

  const renderDailyView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const dayEvents = events.filter((event) => isSameDay(event.start, currentDate));
    return (
      <div className="grid grid-cols-[80px_1fr] gap-2 h-[calc(100%-2rem)]">
        <div className="flex flex-col text-muted-foreground text-xs">
          {hours.map((hour) => <div key={hour} className="h-16 flex items-center justify-end pr-3 border-b border-border/50">{format(new Date().setHours(hour, 0), "h a")}</div>)}
        </div>
        <div className="relative">
          {hours.map((hour) => <div key={hour} className="h-16 border-b border-border/50 bg-background/50" />)}
          {dayEvents.map((event) => {
            const startHour = event.start.getHours() + event.start.getMinutes() / 60;
            const duration = (event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60);
            return (
              <div
                key={event.id}
                className="absolute left-1 right-1 p-2 bg-gradient-to-br from-primary to-primary/70 text-primary-foreground rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                style={{ top: `${startHour * 64}px`, height: `${duration * 64}px` }}
              >
                <p className="text-sm font-semibold">{event.title}</p>
                <p className="text-xs">{format(event.start, "h:mm a")} - {format(event.end, "h:mm a")}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeeklyView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: endOfWeek(weekStart, { weekStartsOn: 1 }) });
    return (
      <div className="grid grid-cols-8 gap-1 h-[calc(100%-2rem)]">
        <div className="flex flex-col text-muted-foreground text-xs">
          {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
            <div key={hour} className="h-16 flex items-center justify-end pr-3 border-b border-border/50">{format(new Date().setHours(hour, 0), "h a")}</div>
          ))}
        </div>
        {weekDays.map((day) => {
          const dayEvents = events.filter((event) => isSameDay(event.start, day));
          return (
            <div key={day.toString()} className="relative border-l border-border/50">
              {Array.from({ length: 24 }, (_, i) => i).map((hour) => <div key={hour} className="h-16 border-b border-border/50 bg-background/50" />)}
              {dayEvents.map((event) => {
                const startHour = event.start.getHours() + event.start.getMinutes() / 60;
                const duration = (event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60);
                return (
                  <div
                    key={event.id}
                    className="absolute left-0.5 right-0.5 p-1 bg-gradient-to-br from-primary to-primary/70 text-primary-foreground rounded-md shadow-md hover:shadow-lg transition-all duration-300"
                    style={{ top: `${startHour * 64}px`, height: `${duration * 64}px` }}
                  >
                    <p className="text-xs font-semibold truncate">{event.title}</p>
                    <p className="text-xs truncate">{format(event.start, "h:mm a")}</p>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  const renderMonthlyView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const paddedDays = [...Array(monthStart.getDay()).fill(null), ...days];
    while (paddedDays.length % 7 !== 0) paddedDays.push(null);
    return (
      <div className="grid grid-cols-7 gap-2 h-[calc(100%-2rem)]">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-foreground font-semibold p-2 bg-muted/50 rounded-t-lg">{day}</div>
        ))}
        {paddedDays.map((day, idx) => day ? (
          <div
            key={day.toString()}
            className={cn(
              "h-32 p-2 bg-card border border-border/50 rounded-lg shadow-sm transition-all duration-300",
              isToday(day) ? "bg-primary/10 border-primary" : "hover:bg-primary/5"
            )}
          >
            <p className={cn("text-sm font-medium text-foreground", isToday(day) && "text-primary")}>{format(day, "d")}</p>
            {events.filter((e) => isSameDay(e.start, day)).slice(0, 3).map((event) => (
              <div key={event.id} className="text-xs p-1 bg-gradient-to-r from-primary/80 to-primary/60 text-primary-foreground rounded-sm truncate shadow-sm hover:bg-primary/90">
                {format(event.start, "h:mm a")} - {event.title}
              </div>
            ))}
          </div>
        ) : <div key={idx} className="h-32 bg-muted/10 border border-border/20 rounded-lg" />)}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] gap-6 p-6">
      <Card className="bg-card/95 backdrop-blur-md shadow-xl rounded-xl">
        <CardHeader className="p-4 flex items-center justify-between">
          <CardTitle className="text-3xl font-bold text-foreground flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-primary" />
            Schedule
          </CardTitle>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setCurrentDate(new Date())} className="border-border text-foreground hover:bg-primary/10">Today</Button>
            <Button variant="outline" onClick={() => navigate("prev")} className="border-border text-foreground hover:bg-primary/10"><ChevronLeft className="h-5 w-5" /></Button>
            <Button variant="outline" onClick={() => navigate("next")} className="border-border text-foreground hover:bg-primary/10"><ChevronRight className="h-5 w-5" /></Button>
          </div>
        </CardHeader>
      </Card>
      <Card className="flex-1 bg-card/95 backdrop-blur-md shadow-xl rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-secondary/5 opacity-30 pointer-events-none" />
        <Tabs value={view} onValueChange={(v) => setView(v as typeof view)} className="h-full flex flex-col relative z-10">
          <TabsList className="grid grid-cols-3 w-full max-w-xs mx-auto bg-muted/50 rounded-xl p-1 mt-4">
            <TabsTrigger value="daily" className="text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">Daily</TabsTrigger>
            <TabsTrigger value="weekly" className="text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">Weekly</TabsTrigger>
            <TabsTrigger value="monthly" className="text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">Monthly</TabsTrigger>
          </TabsList>
          <CardContent className="flex-1 p-6 overflow-auto">
            <TabsContent value="daily" className="h-full">{renderDailyView()}</TabsContent>
            <TabsContent value="weekly" className="h-full">{renderWeeklyView()}</TabsContent>
            <TabsContent value="monthly" className="h-full">{renderMonthlyView()}</TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}