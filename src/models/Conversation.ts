import mongoose, { Schema, Document, Types } from "mongoose";
import { IUser } from "./User";

export interface IConversation extends Document {
  _id: Types.ObjectId;
  participants: (IUser | Types.ObjectId)[]; // Użytkownicy lub ObjectId
}

const ConversationSchema: Schema = new Schema<IConversation>(
  {
    participants: [
      { type: Schema.Types.ObjectId, ref: "User", required: true },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Conversation ||
  mongoose.model<IConversation>("Conversation", ConversationSchema);
