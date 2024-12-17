import { NextResponse } from "next/server";
import connectToDatabase from "@/services/db";
import User from "@/models/User";
import { verifyToken } from "@/utils/auth";
export async function GET(request) {
    var _a;
    try {
        await connectToDatabase();
        const token = (_a = request.headers.get("Authorization")) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const user = verifyToken(token);
        if (!user || !user.id) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }
        const url = new URL(request.url);
        const search = url.searchParams.get("search") || "";
        // Wyszukiwanie użytkowników
        const users = await User.find({
            name: { $regex: search, $options: "i" }, // Szukaj po nazwie (ignoruje wielkość liter)
            _id: { $ne: user.id }, // Wyklucz aktualnie zalogowanego użytkownika
        }).select("id name email avatar"); // Zwraca również avatar
        return NextResponse.json(users);
    }
    catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}
