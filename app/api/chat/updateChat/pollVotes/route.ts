import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getRealtimeDB } from "@/lib/firebase/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { chatId, roomId, optionIdx, userId } = await req.json();
    if (!chatId || !roomId || optionIdx === undefined || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    const db = getRealtimeDB();
    const messageRef = db.ref(`chats/${roomId}/${chatId}`);
    const snapshot = await messageRef.once("value");
    const message = snapshot.val();

    if (!message || message.type !== "poll") {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    const { pollOptions, allowsMultipleVotes } = message;
    if (!Array.isArray(pollOptions) || !pollOptions[optionIdx]) {
      return NextResponse.json(
        { error: "Invalid option index" },
        { status: 400 }
      );
    }

    // Check if user already voted for this option
    const targetVotes = pollOptions[optionIdx].votes || [];
    const userVotedHere = targetVotes.includes(userId);

    if (userVotedHere) {
      // User already voted here → remove vote
      const updatedVotes = targetVotes.filter((uid: string) => uid !== userId);
      await db
        .ref(`chats/${roomId}/${chatId}/pollOptions/${optionIdx}/votes`)
        .set(updatedVotes);
      return NextResponse.json({ message: "Vote removed" }, { status: 200 });
    }

    if (!allowsMultipleVotes) {
      // Remove vote from other options
      for (let i = 0; i < pollOptions.length; i++) {
        if (i === optionIdx) continue;
        const otherVotes = pollOptions[i].votes || [];
        if (otherVotes.includes(userId)) {
          const filtered = otherVotes.filter((uid: string) => uid !== userId);
          await db
            .ref(`chats/${roomId}/${chatId}/pollOptions/${i}/votes`)
            .set(filtered);
        }
      }
    }

    // Add vote to selected option
    const updatedTargetVotes = [...targetVotes, userId];
    await db
      .ref(`chats/${roomId}/${chatId}/pollOptions/${optionIdx}/votes`)
      .set(updatedTargetVotes);

    return NextResponse.json({ message: "Vote added" }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
