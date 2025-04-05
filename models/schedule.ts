export interface CalendarEvent {
    id: string;              // Unique identifier (same as Firestore doc ID)
    title: string;           // Event title
    description?: string;    // Optional event details
    start: string;           // ISO date-time format (e.g., "2025-04-01T09:00:00")
    end?: string;            // Optional end time (ISO format)
    allDay: boolean;         // If true, event is an all-day event
    
    createdBy: string;       // UID of the creator (Firebase Auth UID)
    category?: "lecture" | "exam" | "meeting" | "holiday" | "other";  // Event type
    status: "scheduled" | "completed" | "canceled";  // Event status
    visibility: "public" | "private";  // Visibility of event
      // Timestamp of last update
    recurring?: {
      frequency: "daily" | "weekly" | "monthly" | "yearly"; // Recurrence rule
      interval?: number; // Every X days/weeks/months
      until?: string; // Recurs until this date
    };
    createdAt: string;       // Timestamp when event was created
    updatedAt?: string;   
  }
  