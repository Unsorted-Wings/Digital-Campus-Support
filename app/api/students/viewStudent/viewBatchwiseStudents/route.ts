import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { firestore } from "@/lib/firebase/firebaseAdmin";

export async function GET(req: NextRequest) {
  try {
    // 1️⃣ Authenticate with NextAuth
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Get query params
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const batchId = searchParams.get("batchId");

    if (!courseId || !batchId) {
      return NextResponse.json(
        { error: "Missing courseId or batchId" },
        { status: 400 }
      );
    }

    // 3️⃣ Get batch document
    const batchDoc = await firestore.collection("batches").doc(batchId).get();
    if (!batchDoc.exists) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    const batchData = batchDoc.data();

    if (batchData?.courseId !== courseId) {
      return NextResponse.json(
        { error: "Batch does not belong to the specified course" },
        { status: 400 }
      );
    }

    const studentIds: string[] = batchData.students || [];
    const studentDetails: any[] = [];

    // 4️⃣ Break studentIds into chunks of 10
    const chunkSize = 10;
    for (let i = 0; i < studentIds.length; i += chunkSize) {
      const chunk = studentIds.slice(i, i + chunkSize);

      const usersSnapshot = await firestore
        .collection("users")
        .where("id", "in", chunk)
        .where("role", "==", "student")
        .get();

      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        studentDetails.push({
          studentId: userData.id,
          name: userData.name,
        });
      });
    }

    return NextResponse.json(
      {
        batchId,
        courseId,
        students: studentDetails,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
