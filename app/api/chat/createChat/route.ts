import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { realtimeDB } from "@/lib/firebase/firebaseAdmin";
import { v4 as uuidv4 } from "uuid";
import { Chat } from "@/models/chat"; // Make sure your Chat model includes poll support

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const {
      senderId,
      senderName,
      message,
      roomId,
      type,
      readBy,
      reaction,
      pollOptions,
      allowsMultipleVotes,
    } = body;

    // Basic field validation
    if (!senderId || !senderName || !message || !roomId || !type || !readBy || !reaction) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // If it's a poll, validate poll-specific fields
    if (type === "poll") {
      if (!Array.isArray(pollOptions) || pollOptions.length < 2) {
        return NextResponse.json({ error: "Poll must have at least two options" }, { status: 400 });
      }

      // Ensure each option has an id and text
      for (const option of pollOptions) {
        if (!option.id || !option.text || !Array.isArray(option.votes)) {
          return NextResponse.json({ error: "Each poll option must have an id and text" }, { status: 400 });
        }
      }
    }

    const messageRef = realtimeDB.ref(`chats/${roomId}`);
    const newMessageRef = messageRef.push();
    const firebaseKey = newMessageRef.key;

    if (!firebaseKey) {
      return NextResponse.json({ error: "Failed to generate Firebase key" }, { status: 500 });
    }

    const newMessage: Chat = {
      id: firebaseKey,
      senderId,
      senderName,
      message,
      roomId,
      type,
      readBy,
      reaction,
      timestamp: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...(type === "poll" && {
        pollOptions,
        allowsMultipleVotes: !!allowsMultipleVotes,
      }),
    };

    await newMessageRef.set(newMessage);

    return NextResponse.json({ message: "Chat message created", newMessage }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
