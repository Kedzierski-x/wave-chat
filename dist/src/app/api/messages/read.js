import { NextResponse } from "next/server";
import connectToDatabase from "@/services/db";
import Message from "@/models/Message";
import { verifyToken } from "@/utils/auth";
export async function PATCH(request) {
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
        const { messageIds } = await request.json();
        if (!Array.isArray(messageIds) || messageIds.length === 0) {
            return NextResponse.json({ error: "Message IDs are required." }, { status: 400 });
        }
        // Mark messages as read
        await Message.updateMany({ _id: { $in: messageIds }, recipient: user.id }, { $set: { read: true } });
        return NextResponse.json({ success: true }, { status: 200 });
    }
    catch (error) {
        console.error("Error updating message status:", error);
        return NextResponse.json({ error: "Failed to update message status." }, { status: 500 });
    }
}
