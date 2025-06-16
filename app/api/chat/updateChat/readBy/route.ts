import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getRealtimeDB } from "@/lib/firebase/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    // Authenticate
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const { roomId, chatIds, userId } = await req.json();

    // Validate input
    if (
      !roomId ||
      !Array.isArray(chatIds) ||
      chatIds.length === 0 ||
      !userId
    ) {
      return NextResponse.json(
        { error: "Missing or invalid fields" },
        { status: 400 }
      );
    }

    const db = getRealtimeDB();
    const updates: Record<string, any> = {};
    const updatedMessages: string[] = [];

    // Prepare batched updates
    for (const chatId of chatIds) {
      const readByRef = db.ref(`chats/${roomId}/${chatId}/readBy`);
      const snapshot = await readByRef.get();
      const currentReadBy: string[] = snapshot.val() || [];

      if (!currentReadBy.includes(userId)) {
        updates[`chats/${roomId}/${chatId}/readBy`] = [...currentReadBy, userId];
        updatedMessages.push(chatId);
      }
    }

    // Commit updates if needed
    if (Object.keys(updates).length > 0) {
      await db.ref().update(updates);
    }

    return NextResponse.json(
      {
        message: "Read status updated",
        updatedMessages,
        totalUpdated: updatedMessages.length,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
