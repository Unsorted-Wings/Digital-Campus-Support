import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt"; // Import NextAuth's JWT token handler
import { firestore } from "@/lib/firebase/firebaseAdmin"; 

export async function GET(req: NextRequest) {
  try {
    // 1️⃣ Authorization Check using NextAuth JWT Token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role } = token; // Assuming the role is included in the JWT token

    // 2️⃣ Verify that only admins can view batch data
    if (role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    // 3️⃣ Get batchId from query parameters
    const url = new URL(req.url);
    const batchId = url.searchParams.get("batchId");

    if (!batchId) {
      return NextResponse.json({ error: "Missing batchId" }, { status: 400 });
    }

    // 4️⃣ Fetch the batch document from Firestore
    const batchRef =firestore.collection("batches").doc(batchId);
    const batchDoc = await batchRef.get();

    if (!batchDoc.exists) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    // 5️⃣ Return the batch data
    return NextResponse.json(batchDoc.data(), { status: 200 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
