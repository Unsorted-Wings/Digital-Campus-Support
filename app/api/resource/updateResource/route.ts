// app/api/resources/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { firestore } from "@/lib/firebase/firebaseAdmin";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || token.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updates = await req.json();
    updates.updatedAt = new Date().toISOString();

    const resourceRef = firestore.collection("resources").doc(params.id);
    const doc = await resourceRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    await resourceRef.update(updates);
    return NextResponse.json({ message: "Resource updated" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
