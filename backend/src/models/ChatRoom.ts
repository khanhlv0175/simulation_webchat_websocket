import mongoose, { Document, Schema } from "mongoose";
import { randomBytes } from "crypto";

export interface IChatRoom extends Document {
  roomId: string;
  name: string;
  createdAt: Date;
  users: string[];
}

const ChatRoomSchema = new Schema<IChatRoom>({
  roomId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  users: [{ type: String }],
});

// Generate a random roomId before saving
ChatRoomSchema.pre("save", function (next) {
  if (!this.roomId) {
    this.roomId = randomBytes(6).toString("hex");
  }
  next();
});

export default mongoose.model<IChatRoom>("ChatRoom", ChatRoomSchema);
