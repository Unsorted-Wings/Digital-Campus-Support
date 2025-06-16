// app/api/semesterDetails/active/route.ts
import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/lib/firebase/firebaseAdmin";
import { getToken } from "next-auth/jwt";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // 🔐 1. Authenticate Student
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // 📥 2. Extract query parameters
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const batchId = searchParams.get("batchId");

    if (!courseId || !batchId) {
      return NextResponse.json(
        { error: "Missing courseId or batchId" },
        { status: 400 }
      );
    }

    const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

    // 🔍 3. Query semesterDetail collection
    const snapshot = await firestore
      .collection("semesterDetails")
      .where("courseId", "==", courseId)
      .where("batchId", "==", batchId)
      .get();

    if (snapshot.empty) {
      return NextResponse.json(
        { error: "No semesters found for the given course and batch" },
        { status: 404 }
      );
    }

    // 🧠 4. Find active semester based on dates
    const activeSemesterDoc = snapshot.docs.find((doc) => {
      const data = doc.data() as {
        startDate?: string;
        endDate?: string;
      };

      return (
        typeof data.startDate === "string" &&
        typeof data.endDate === "string" &&
        data.startDate <= today &&
        data.endDate >= today
      );
    });

    if (!activeSemesterDoc) {
      return NextResponse.json(
        { error: "No active semester found for given course and batch" },
        { status: 404 }
      );
    }

    // ✅ Return ID
    return NextResponse.json(
      { semesterDetailId: activeSemesterDoc.id },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Semester detail lookup failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
