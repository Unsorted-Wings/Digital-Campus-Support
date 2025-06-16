import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { firestore } from "@/lib/firebase/firebaseAdmin";
import { isToday, parseISO, isWithinInterval, addDays } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const snapshot = await firestore.collection("calendarEvents").get();
    const today = new Date();

    const filteredEvents = snapshot.docs
      .map((doc) => doc.data())
      .filter((event) => {
        if (!Array.isArray(event.userIds) || !event.userIds.includes(userId)) {
          return false;
        }

        const startDate = parseISO(
          event.start.length === 16 ? event.start + ":00" : event.start
        );
        if (isNaN(startDate.getTime())) return false;

        // Case 1: Non-recurring event, match by exact date
        if (!event.recurring) {
          return isToday(startDate);
        }
        // Case 2: Recurring event, check if today matches recurrence
        const {
          startDate: recurStart,
          endDate: recurEnd,
          byDay,
        } = event.recurring;

        const recurStartDate = parseISO(
          event.recurring.startDate.length === 10
            ? event.recurring.startDate + "T00:00:00"
            : event.recurring.startDate
        );
        const recurEndDate = parseISO(
          event.recurring.endDate.length === 10
            ? event.recurring.endDate + "T23:59:59"
            : event.recurring.endDate
        );

        const isWithinRange = isWithinInterval(today, {
          start: recurStartDate,
          end: recurEndDate,
        });

        if (!isWithinRange) return false;

        const weekdayMap: Record<string, number> = {
          SU: 0,
          MO: 1,
          TU: 2,
          WE: 3,
          TH: 4,
          FR: 5,
          SA: 6,
        };

        const todayWeekday = today.getDay();
        const todayDayCode = Object.keys(weekdayMap).find(
          (key) => weekdayMap[key] === todayWeekday
        );

        return byDay.includes(todayDayCode);
      });

    return NextResponse.json(filteredEvents, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
