
import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";
export async function PUT(req: NextRequest) {
    try {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
      const token = authHeader.split("Bearer ")[1];
      const decodedToken = await admin.auth().verifyIdToken(token);
      if (decodedToken.role !== "admin") {
        return NextResponse.json({ error: "Forbidden: Only admins can update courses" }, { status: 403 });
      }
  
      const { id, name, duration } = await req.json();
  
      if (!id || !name || !duration) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }
  
      const courseRef = admin.firestore().collection("courses").doc(id);
      const courseDoc = await courseRef.get();
  
      if (!courseDoc.exists) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
      }
  
      const updatedCourse = {
        name,
        duration,
        updatedAt: new Date().toISOString(),
      };
  
      await courseRef.update(updatedCourse);
  
      return NextResponse.json({ message: "Course updated successfully", courseId: id }, { status: 200 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  