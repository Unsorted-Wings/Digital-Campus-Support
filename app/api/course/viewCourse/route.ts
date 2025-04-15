
import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";
export async function GET(req: NextRequest) {
    try {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
      const token = authHeader.split("Bearer ")[1];
      const decodedToken = await admin.auth().verifyIdToken(token);
      if (decodedToken.role !== "admin") {
        return NextResponse.json({ error: "Forbidden: Only admins can view courses" }, { status: 403 });
      }
  
      const url = new URL(req.url);
      const courseId = url.searchParams.get("courseId");
  
      if (!courseId) {
        return NextResponse.json({ error: "Missing course ID" }, { status: 400 });
      }
  
      const courseDoc = await admin.firestore().collection("courses").doc(courseId).get();
  
      if (!courseDoc.exists) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
      }
  
      return NextResponse.json(courseDoc.data(), { status: 200 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  