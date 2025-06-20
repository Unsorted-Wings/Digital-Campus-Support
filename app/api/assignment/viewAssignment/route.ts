import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import * as admin from "firebase-admin";

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
    // Authorization using NextAuth JWT Token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }



    if (token.role === "faculty") {
      const uid = token.id;

      // Step 1: Get all assignments by this faculty
      const snapshot = await admin
        .firestore()
        .collection("assignments")
        .where("teacherId", "==", uid)
        .get();

      const rawAssignments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
 const resourceIds = new Set<string>();
      rawAssignments.forEach((assignment: any) => {
        if (assignment.resource_id) { // Assuming resource_id is the field that links to the resource collection
          resourceIds.add(assignment.resource_id);
        }
      });

      const cloudinaryResourceMap: Record<string, string> = {}; // Maps resource_id to cloudinaryResourceType
      if (resourceIds.size > 0) {
        // Fetch resources in batches if there are many to avoid query limits
        const resourceFetches = Array.from(resourceIds).map(async (resId) => {
          const resourceDoc = await admin.firestore().collection("resources").doc(resId).get();
          if (resourceDoc.exists) {
            const resourceData = resourceDoc.data();
            // Assuming the field in your 'resources' collection is named 'cloudinaryResourceType'
            if (resourceData?.cloudinaryResourceType) {
              cloudinaryResourceMap[resId] = resourceData.cloudinaryResourceType;
            }
          }
        });
        await Promise.all(resourceFetches);
      }
      // Step 2: Collect all unique student userIds from submittedBy arrays
      const userIdSet = new Set<string>();
      rawAssignments.forEach((assignment: any) => {
        (assignment.submittedBy || []).forEach((entry: any) => {
          if (entry.userId) userIdSet.add(entry.userId);
        });
      });

      // Step 3: Fetch user names for these userIds from the "users" collection
      const userMap: Record<string, string> = {};
      const userFetches = Array.from(userIdSet).map(async (userId) => {
        const userDoc = await admin.firestore().collection("users").doc(userId).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          userMap[userId] = userData?.name || "Unknown";
        }
      });
      await Promise.all(userFetches);

      // Step 4: Add userName to each submittedBy entry
      const enrichedAssignments = rawAssignments.map((assignment: any) => ({
        id: assignment.id,
        assignmentDocUrl: assignment.assignmentDocUrl,
        batchId: assignment.batchId,
        courseId: assignment.courseId,
        createdAt: assignment.createdAt,
        description: assignment.description,
        dueDate: assignment.dueDate,
        semesterId: assignment.semesterId,
        subjectId: assignment.subjectId,
        submittedBy: (assignment.submittedBy || []).map((entry: any) => ({
          ...entry,
          userName: userMap[entry.userId] || "Unknown",
        })),
        teacherId: assignment.teacherId,
        title: assignment.title,
        updatedAt: assignment.updatedAt,
        resource_id: assignment.resource_id,
         cloudinaryResourceType: assignment.resource_id
          ? cloudinaryResourceMap[assignment.resource_id] || "raw" // Default to 'raw' if not found or if resource_id is missing/invalid
          : "raw",
      }));

      // Step 5: Add subject names
      const subjectsSnapshot = await admin.firestore().collection("subjects").get();
      const subjects: Record<string, any> = {};
      subjectsSnapshot.docs.forEach((doc) => {
        subjects[doc.id] = doc.data();
      });

      const assignmentsWithSubjects = enrichedAssignments.map((assignment) => {
        const subjectDetails = subjects[assignment.subjectId] || { name: "Unknown Subject" };
        return {
          ...assignment,
          subject: subjectDetails.name,
        };
      });

      return NextResponse.json(assignmentsWithSubjects, { status: 200 });
    }

    else if (token.role === "student") {
      console.log(token)
      const { searchParams } = new URL(req.url);
      const courseId = searchParams.get("courseId");
      if (!courseId) {
        return NextResponse.json({ error: "Missing courseId" }, { status: 400 });
      }
      const snapshot = await admin
        .firestore()
        .collection("assignments")
        .where("courseId", "==", courseId)
        .get();

      const assignments = snapshot.docs.map((doc) => {
        const data = doc.data();

        // Filter submittedBy array to only include entry with matching uid
        const submittedBy = (data.submittedBy || []).filter(
          (entry: any) => entry.userId === token.id
        );

        return {
          id: doc.id,
          assignmentDocUrl: data.assignmentDocUrl,
          batchId: data.batchId,
          courseId: data.courseId,
          createdAt: data.createdAt,
          description: data.description,
          dueDate: data.dueDate,
          semesterId: data.semesterId,
          subjectId: data.subjectId,
          submittedBy, // filtered array
          teacherId: data.teacherId,
          title: data.title,
          updatedAt: data.updatedAt,
        };
      });
      const subjectsSnapshot = await admin.firestore().collection("subjects").get();
      const subjects: Record<string, any> = {};
      subjectsSnapshot.docs.forEach((doc) => {
        subjects[doc.id] = doc.data();
      });

      // Combine assignment with subject name
      const assignmentsWithSubjects = assignments.map((assignment) => {
        const subjectDetails = subjects[assignment.subjectId] || { name: "Unknown Subject" };
        return {
          ...assignment,
          subject: subjectDetails.name,
        };
      });
      return NextResponse.json(assignmentsWithSubjects, { status: 200 });

    }
    else {
      return NextResponse.json({ status: 400 });
    }



  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
