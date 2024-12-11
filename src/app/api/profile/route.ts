import { NextResponse } from "next/server";
import connectToDatabase from "@/services/db";
import User, { IUser } from "@/models/User";
import { verifyToken } from "@/utils/auth";
import cloudinary from "@/services/cloudinary";

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const token = request.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || !user.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Typujemy wynik zapytania
    const currentUser: IUser | null = await User.findById(user.id)
      .select("name email avatar description")
      .lean();

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        id: currentUser._id.toString(),
        name: currentUser.name,
        email: currentUser.email,
        avatar: currentUser.avatar || null,
        description: currentUser.description || null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header is missing" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const user = verifyToken(token);
    if (!user || !user.id) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const description = formData.get("description") as string | null;
    const avatarFile = formData.get("avatar") as File | null;

    const updateData: { avatar?: string; description?: string } = {};

    if (description) {
      updateData.description = description.trim();
    }

    if (avatarFile) {
      const avatarBuffer = await avatarFile.arrayBuffer();
      const base64String = `data:${avatarFile.type};base64,${Buffer.from(
        avatarBuffer
      ).toString("base64")}`;

      try {
        const uploadResponse = await cloudinary.uploader.upload(base64String, {
          folder: "avatars",
          public_id: user.id,
          overwrite: true,
        });

        updateData.avatar = uploadResponse.secure_url;
      } catch (error) {
        console.error("Error uploading avatar:", error);
        return NextResponse.json(
          { error: "Failed to upload avatar" },
          { status: 500 }
        );
      }
    }

    const updatedUser = await User.findByIdAndUpdate(user.id, updateData, {
      new: true,
    });

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Failed to update user profile" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedUser, // Zwracamy cały zaktualizowany użytkownik
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
