// app/api/chat/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { realtimeDB } from "@/lib/firebase/firebaseAdmin";
import { v4 as uuidv4 } from "uuid";
import { Chat } from "@/models/chat"; // Importing your Chat model

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { senderId, senderName, message, roomId, type } = await req.json();
    if (!senderId || !senderName || !message || !roomId || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Prepare the new message
    const newMessage: Chat = {
      id: uuidv4(),
      senderId,
      senderName,
      message,
      roomId,
      type,
      timestamp: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Push the message to Firebase Realtime DB
    const messageRef = realtimeDB.ref(`chats/${roomId}`);
    const newMessageRef = messageRef.push();
    await newMessageRef.set(newMessage);

    return NextResponse.json({ message: "Chat message created", newMessage }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
