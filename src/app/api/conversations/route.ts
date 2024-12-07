import { NextResponse } from "next/server";
import Conversation from "@/models/Conversation";
import connectToDatabase from "@/services/db";
import { verifyToken } from "@/utils/auth";

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const authHeader = request.headers.get("Authorization");
    if (!authHeader) throw new Error("Authorization header is missing");

    const token = authHeader.split(" ")[1];
    const user = verifyToken(token);
    if (!user || !user.id) throw new Error("Invalid or expired token");

    const { participantId } = await request.json();
    if (!participantId) throw new Error("Participant ID is required");
    if (participantId === user.id) throw new Error("Cannot chat with yourself");

    const existingConversation = await Conversation.findOne({
      participants: { $all: [user.id, participantId] },
    }).populate("participants", "name email");

    if (existingConversation) {
      return NextResponse.json({
        ...existingConversation.toObject(),
        id: existingConversation._id,
      });
    }

    const conversation = await Conversation.create({
      participants: [user.id, participantId],
    });

    const newConversation = await Conversation.findById(conversation._id).populate(
      "participants",
      "name email"
    );

    return NextResponse.json(
      {
        ...newConversation?.toObject(),
        id: newConversation?._id,
      },
      { status: 201 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error creating conversation:", errorMessage);

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const authHeader = request.headers.get("Authorization");
    if (!authHeader) throw new Error("Authorization header is missing");

    const token = authHeader.split(" ")[1];
    const user = verifyToken(token);
    if (!user || !user.id) throw new Error("Invalid or expired token");

    const conversations = await Conversation.find({
      participants: user.id,
    }).populate("participants", "name email");

    return NextResponse.json(conversations || [], { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error fetching conversations:", errorMessage);

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
