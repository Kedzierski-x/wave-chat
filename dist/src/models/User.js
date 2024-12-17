import mongoose, { Schema } from "mongoose";
const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String },
    description: { type: String },
    friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });
export default mongoose.models.User ||
    mongoose.model("User", UserSchema);
