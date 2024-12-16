import { NextResponse } from "next/server";
import connectToDatabase from "@/services/db";
import Message from "@/models/Message";

export async function GET(request: Request) {
  const userId = request.headers.get("userId"); // ID użytkownika z nagłówków

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    await connectToDatabase();

    const unreadMessages = await Message.find({ recipient: userId, read: false })
      .populate("sender", "name avatar")
      .sort({ createdAt: -1 });

    return NextResponse.json(unreadMessages, { status: 200 });
  } catch (error) {
    console.error("Error fetching unread messages:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
