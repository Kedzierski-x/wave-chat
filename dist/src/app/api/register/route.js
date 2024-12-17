import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import connectToDatabase from "@/services/db";
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
export async function POST(request) {
    try {
        await connectToDatabase();
        const { name, email, password } = await request.json();
        if (!name || !email || !password) {
            return NextResponse.json({ error: "All fields (name, email, password) are required" }, { status: 400 });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ name, email, password: hashedPassword });
        const token = jwt.sign({ id: newUser._id, name: newUser.name, email: newUser.email }, JWT_SECRET, { expiresIn: "1d" });
        return NextResponse.json({
            message: "User created successfully",
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
            },
        }, { status: 201 });
    }
    catch (error) {
        console.error("Error in registration:", error);
        return NextResponse.json({ error: "Failed to register user" }, { status: 500 });
    }
}
