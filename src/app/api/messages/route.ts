import { NextResponse } from "next/server";
import connectToDatabase from "@/services/db";
import Message from "@/models/Message"; // Zakładam, że model wiadomości istnieje
import { verifyToken } from "@/utils/auth";
import Conversation from "@/models/Conversation";

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const url = new URL(request.url);
    const friendId = url.searchParams.get("friendId");

    if (!friendId) {
      return NextResponse.json(
        { error: "Conversation ID is required" },
        { status: 400 }
      );
    }

    const token = request.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { error: "Authorization header is missing" },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const messages = await Message.find({
      participants: { $all: [user.id, friendId] },
    }).sort({ createdAt: 1 });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}


export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const token = request.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { error: "Authorization header is missing" },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const { friendId, message } = await request.json();

    if (!friendId || !message) {
      return NextResponse.json(
        { error: "Friend ID and message content are required" },
        { status: 400 }
      );
    }

    // Find or create a conversation between the users
    let conversation = await Conversation.findOne({
      participants: { $all: [user.id, friendId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [user.id, friendId],
      });
      await conversation.save();
    }

    // Save the message
    const newMessage = new Message({
      conversation: conversation._id,
      sender: user.id,
      message, // Content of the message
    });

    await newMessage.save();

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error("Error saving message:", error);
    return NextResponse.json(
      { error: "Failed to save message" },
      { status: 500 }
    );
  }
}
