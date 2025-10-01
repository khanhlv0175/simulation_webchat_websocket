import mongoose, { Document, Schema } from "mongoose";

export interface IMessage extends Document {
  userId: string;
  username: string;
  content: string;
  roomId: string;
  timestamp: Date;
}

const MessageSchema = new Schema<IMessage>({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  content: { type: String, required: true },
  roomId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model<IMessage>("Message", MessageSchema);
