// app/api/semesterDetails/route.ts
import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/lib/firebase/firebaseAdmin"; // Assuming you have this set up
import * as admin from "firebase-admin";

// Initialize Firebase Admin if not already initialized

export const dynamic = "force-dynamic"; // Ensure this route is always dynamic

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
    });
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const courseId = searchParams.get("courseId");
        const batchId = searchParams.get("batchId");

        if (!courseId || !batchId) {
            return NextResponse.json({ error: "courseId and batchId are required" }, { status: 400 });
        }

        const semesterDetailsQuerySnapshot = await firestore
            .collection("semesterDetails")
            .where("courseId", "==", courseId)
            .where("batchId", "==", batchId)
            .limit(1) // Assuming one semester detail per course-batch combination
            .get();

        if (semesterDetailsQuerySnapshot.empty) {
            return NextResponse.json({ error: "Semester details not found for the given course and batch" }, { status: 404 });
        }

        const semesterId = semesterDetailsQuerySnapshot.docs[0].id;
        return NextResponse.json({ semesterId }, { status: 200 });

    } catch (error: any) {
        console.error("Error fetching semester details:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}