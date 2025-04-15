import { NextRequest, NextResponse } from "next/server";
import { db, auth } from "@/lib/firebase/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    if (decodedToken.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const { groupId, question, options, allowMultipleSelection } = await req.json();

    if (!groupId || !question || !Array.isArray(options) || options.length < 2) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const id = db.collection("polls").doc().id;
    const timestamp = new Date().toISOString();

    const poll = {
      id,
      groupId,
      question,
      options,
      votes: { yes: [], no: [] },
      allowMultipleSelection: !!allowMultipleSelection,
      totalVotes: 0,
      creatorId: decodedToken.uid,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await db.collection("polls").doc(id).set(poll);
    return NextResponse.json({ message: "Poll created", id }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
