import { NextResponse } from "next/server";
import connectToDatabase from "@/services/db";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";
import { verifyToken } from "@/utils/auth";
export async function GET(request) {
    var _a;
    try {
        await connectToDatabase();
        const token = (_a = request.headers.get("Authorization")) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!token) {
            return NextResponse.json({ error: "Authorization header is missing." }, { status: 401 });
        }
        const user = verifyToken(token);
        if (!user) {
            return NextResponse.json({ error: "Invalid or expired token." }, { status: 401 });
        }
        const url = new URL(request.url);
        const friendId = url.searchParams.get("friendId");
        if (!friendId) {
            return NextResponse.json({ error: "Friend ID is required." }, { status: 400 });
        }
        // Find conversation between the users
        const conversation = await Conversation.findOne({
            participants: { $all: [user.id, friendId] },
        });
        if (!conversation) {
            return NextResponse.json([], { status: 200 });
        }
        // Fetch messages for the conversation
        const messages = await Message.find({ conversation: conversation._id })
            .sort({ createdAt: 1 })
            .populate("sender", "name email avatar");
        const normalizedMessages = messages.map((msg) => ({
            id: msg._id.toString(),
            content: msg.content,
            createdAt: msg.createdAt,
            sender: {
                id: msg.sender._id.toString(),
                name: msg.sender.name,
                email: msg.sender.email,
                avatar: msg.sender.avatar,
            },
        }));
        return NextResponse.json(normalizedMessages, { status: 200 });
    }
    catch (error) {
        console.error("Error fetching messages:", error);
        return NextResponse.json({ error: "Failed to fetch messages." }, { status: 500 });
    }
}
export async function POST(request) {
    var _a;
    try {
        await connectToDatabase();
        const token = (_a = request.headers.get("Authorization")) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!token) {
            return NextResponse.json({ error: "Authorization header is missing." }, { status: 401 });
        }
        const user = verifyToken(token);
        if (!(user === null || user === void 0 ? void 0 : user.id)) {
            return NextResponse.json({ error: "Invalid or expired token." }, { status: 401 });
        }
        const { friendId, message } = await request.json();
        if (!friendId || !message) {
            return NextResponse.json({ error: "Friend ID and message content are required." }, { status: 400 });
        }
        let conversation = await Conversation.findOne({
            participants: { $all: [user.id, friendId] },
        });
        if (!conversation) {
            conversation = new Conversation({
                participants: [user.id, friendId],
            });
            await conversation.save();
        }
        const newMessage = new Message({
            conversation: conversation._id,
            sender: user.id,
            content: message,
        });
        await newMessage.save();
        const populatedMessage = await newMessage.populate("sender", "name email avatar");
        return NextResponse.json({
            id: populatedMessage._id.toString(),
            content: populatedMessage.content,
            createdAt: populatedMessage.createdAt,
            sender: {
                id: populatedMessage.sender._id.toString(),
                name: populatedMessage.sender.name,
                email: populatedMessage.sender.email,
                avatar: populatedMessage.sender.avatar,
            },
        }, { status: 201 });
    }
    catch (error) {
        console.error("Error saving message:", error);
        return NextResponse.json({ error: "Failed to save message." }, { status: 500 });
    }
}
