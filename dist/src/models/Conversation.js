import mongoose, { Schema } from "mongoose";
const ConversationSchema = new Schema({
    participants: [
        { type: Schema.Types.ObjectId, ref: "User", required: true },
    ],
}, { timestamps: true });
export default mongoose.models.Conversation ||
    mongoose.model("Conversation", ConversationSchema);
