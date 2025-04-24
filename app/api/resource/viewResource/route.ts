// app/api/resources/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/lib/firebase/firebaseAdmin";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resourceRef = firestore.collection("resources").doc(params.id);
    const doc = await resourceRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(doc.data(), { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
