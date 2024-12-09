import { NextResponse } from "next/server";
import Conversation, { IConversation } from "@/models/Conversation";
import connectToDatabase from "@/services/db";
import { verifyToken } from "@/utils/auth";

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const token = request.headers.get("Authorization")?.split(" ")[1];
    if (!token) throw new Error("Authorization header is missing");

    const user = verifyToken(token);
    if (!user || !user.id) throw new Error("Invalid or expired token");

    const { participantId } = await request.json();
    if (!participantId) throw new Error("Participant ID is required");
    if (participantId === user.id) throw new Error("Cannot chat with yourself");

    const existingConversation = await Conversation.findOne({
      participants: { $all: [user.id, participantId] },
    }).populate("participants", "name email avatar");

    if (existingConversation) {
      return NextResponse.json({
        id: existingConversation._id.toString(),
        participants: existingConversation.participants,
      });
    }

    const newConversation = await Conversation.create({
      participants: [user.id, participantId],
    });

    const populatedConversation = await Conversation.findById(newConversation._id)
      .populate("participants", "name email avatar")
      .lean<IConversation>(); // Specify the type explicitly

    return NextResponse.json(
      {
        id: populatedConversation?._id.toString(),
        participants: populatedConversation?.participants,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json({ error: (error as Error).message || "Failed to create conversation." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const token = request.headers.get("Authorization")?.split(" ")[1];
    if (!token) throw new Error("Authorization header is missing");

    const user = verifyToken(token);
    if (!user || !user.id) throw new Error("Invalid or expired token");

    const conversations = await Conversation.find({
      participants: user.id,
    })
      .populate("participants", "name email avatar")
      .lean<IConversation[]>(); // Specify type for the array

    const normalizedConversations = conversations.map((conversation) => ({
      id: conversation._id.toString(),
      participants: conversation.participants,
    }));

    return NextResponse.json(normalizedConversations, { status: 200 });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json({ error: (error as Error).message || "Failed to fetch conversations." }, { status: 500 });
  }
}
