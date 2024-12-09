import mongoose, { Schema, Document, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId; // Obiekt ID użytkownika
  name: string;
  email: string;
  password: string;
  avatar?: string; // Opcjonalne zdjęcie profilowe
  description?: string; // Opcjonalny opis użytkownika
  friends: Types.ObjectId[]; // Lista znajomych jako ObjectId
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String },
    description: { type: String },
    friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
