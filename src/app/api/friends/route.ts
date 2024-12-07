import { NextResponse } from "next/server";
import connectToDatabase from "@/services/db";
import User from "@/models/User";
import { verifyToken } from "@/utils/auth";

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const token = request.headers.get("Authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (!user || !user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { userId } = await request.json();
    if (!userId) return NextResponse.json({ error: "User ID is required" }, { status: 400 });

    const currentUser = await User.findById(user.id);
    const newFriend = await User.findById(userId);

    if (!currentUser || !newFriend) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (currentUser.friends.includes(newFriend._id)) {
      return NextResponse.json({ error: "Already a friend" }, { status: 400 });
    }

    currentUser.friends.push(newFriend._id);
    await currentUser.save();

    return NextResponse.json(newFriend, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add friend" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const token = request.headers.get("Authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (!user || !user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = await User.findById(user.id).populate("friends", "id name email avatar");

    if (!currentUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json(currentUser.friends || [], { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch friends" }, { status: 500 });
  }
}
