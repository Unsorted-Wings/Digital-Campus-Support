import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt"; // Import getToken from NextAuth
import { firestore } from "@/lib/firebase/firebaseAdmin"; // Assuming you have a Firestore connection

export async function POST(req: NextRequest) {
  try {
    // 1️⃣ Get the token from the request using NextAuth's JWT helper
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // 2️⃣ Check if the token exists; if not, return Unauthorized
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3️⃣ Check if the user has 'admin' role (assuming you have 'role' in the token)
    if (token.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    // 4️⃣ Parse the request body
    const { groupId, question, options, allowMultipleSelection } = await req.json();

    // 5️⃣ Validate required fields
    if (!groupId || !question || !Array.isArray(options) || options.length < 2) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // 6️⃣ Create the poll
    const id = firestore.collection("polls").doc().id;
    const timestamp = new Date().toISOString();

    const poll = {
      id,
      groupId,
      question,
      options,
      votes: { yes: [], no: [] },
      allowMultipleSelection: !!allowMultipleSelection,
      totalVotes: 0,
      creatorId: token.sub, // Use user ID from NextAuth token (sub represents the user's ID)
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // 7️⃣ Save the poll to Firestore
    await firestore.collection("polls").doc(id).set(poll);

    // 8️⃣ Return success response
    return NextResponse.json({ message: "Poll created", id }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
