import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt"; // Import getToken from NextAuth
import { firestore } from "@/lib/firebase/firebaseAdmin"; // Assuming you have a Firestore connection

export async function PUT(req: NextRequest) {
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
    const { id, question, options, allowMultipleSelection } = await req.json();

    // 5️⃣ Validate the required fields
    if (!id) return NextResponse.json({ error: "Poll ID is required" }, { status: 400 });

    // 6️⃣ Fetch the poll from Firestore
    const pollRef = firestore.collection("polls").doc(id);
    const pollSnap = await pollRef.get();

    // 7️⃣ If the poll doesn't exist, return an error
    if (!pollSnap.exists) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    // 8️⃣ Prepare the data for updating the poll
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (question) updateData.question = question;
    if (options && Array.isArray(options)) updateData.options = options;
    if (allowMultipleSelection !== undefined) updateData.allowMultipleSelection = allowMultipleSelection;

    // 9️⃣ Update the poll in Firestore
    await pollRef.update(updateData);

    // 🔟 Return success response
    return NextResponse.json({ message: "Poll updated successfully" }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
