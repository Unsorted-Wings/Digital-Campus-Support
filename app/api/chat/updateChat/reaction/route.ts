import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { realtimeDB } from "@/lib/firebase/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId, chatId, emoji, userId } = await req.json();

    if (!roomId || !chatId || !emoji || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const reactionRef = realtimeDB.ref(`chats/${roomId}/${chatId}/reaction`);
    const snapshot = await reactionRef.get();
    const currentReactions = snapshot.val() || {};

    const emojiReactors: string[] = currentReactions[emoji] || [];

    // Toggle userId in the emoji's array
    const updatedReactors = emojiReactors.includes(userId)
      ? emojiReactors.filter(uid => uid !== userId) // remove if already reacted
      : [...emojiReactors, userId]; // add if not yet reacted

    // Update reactions
    const updatedReactions = {
      ...currentReactions,
      [emoji]: updatedReactors
    };

    await reactionRef.set(updatedReactions);

    return NextResponse.json({ message: "Reaction updated", reaction: updatedReactions }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
