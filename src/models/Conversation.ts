import mongoose, { Schema, Document } from "mongoose";

interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[]; // Lista uczestników rozmowy
  createdAt: Date; // Data utworzenia rozmowy
}

const ConversationSchema: Schema = new Schema(
  {
    participants: [
      { type: Schema.Types.ObjectId, ref: "User", required: true },
    ],
  },
  { timestamps: true } // Automatyczne zarządzanie `createdAt` i `updatedAt`
);

export default mongoose.models.Conversation ||
  mongoose.model<IConversation>("Conversation", ConversationSchema);
