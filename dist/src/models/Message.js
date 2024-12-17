import mongoose, { Schema } from "mongoose";
const MessageSchema = new Schema({
    conversation: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true }, // Pole na treść wiadomości
    read: { type: Boolean, default: false },
}, { timestamps: true });
export default mongoose.models.Message || mongoose.model("Message", MessageSchema);
