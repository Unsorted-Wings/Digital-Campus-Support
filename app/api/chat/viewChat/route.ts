import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { realtimeDB } from "@/lib/firebase/firebaseAdmin";
import { Chat } from "@/models/chat"; 

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");

    if (!roomId) {
      return NextResponse.json({ error: "Missing roomId in query" }, { status: 400 });
    }

    // Fetching messages from Firebase Realtime DB
    const messageRef = realtimeDB.ref(`chats/${roomId}`);
    const snapshot = await messageRef.once("value");

    if (!snapshot.exists()) {
      return NextResponse.json({ error: "No messages found for this room" }, { status: 404 });
    }

    const messagesData = snapshot.val(); // Get all messages from the room
    const messagesArray: Chat[] = Object.keys(messagesData).map(key => {
      const message = messagesData[key];
      return {
        id: key,
        senderId: message.senderId,
        senderName: message.senderName,
        message: message.message,
        roomId,
        type: message.type,
        timestamp: message.timestamp,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
      };
    });

    return NextResponse.json(messagesArray);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
