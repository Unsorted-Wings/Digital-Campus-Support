import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { firestore } from "@/lib/firebase/firebaseAdmin";

export async function GET(req: NextRequest) {
  try {
    // 1️⃣ Authenticate the request
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Get `batchId` from query params
    const url = new URL(req.url);
    const batchId = url.searchParams.get("batchId");

    if (!batchId) {
      return NextResponse.json({ error: "Missing batch ID" }, { status: 400 });
    }

    // 3️⃣ Fetch matching semester and limit to 1 result
    const snapshot = await firestore
      .collection("semesterDetails")
      .where("batchId", "==", batchId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json(
        { error: "No semester found for this batch" },
        { status: 404 }
      );
    }

    // 4️⃣ Extract only the `subjects` field
    const doc = snapshot.docs[0];
    const data = doc.data();
    const subjects = data.subjects ?? [];

    return NextResponse.json(subjects, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
