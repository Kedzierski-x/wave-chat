import mongoose, { Schema, Document } from "mongoose";

interface IMessage extends Document {
  conversation: mongoose.Types.ObjectId; // ID rozmowy
  sender: mongoose.Types.ObjectId; // ID nadawcy
  message: string; // Treść wiadomości
  createdAt: Date; // Data wysłania wiadomości
}

const MessageSchema: Schema = new Schema(
  {
    conversation: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
  },
  { timestamps: true } // Automatyczne zarządzanie `createdAt` i `updatedAt`
);

export default mongoose.models.Message ||
  mongoose.model<IMessage>("Message", MessageSchema);
