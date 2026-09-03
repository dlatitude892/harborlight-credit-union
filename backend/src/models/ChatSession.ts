import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IChatSession extends Document {
  _id: Types.ObjectId;
  userId?: Types.ObjectId;
  visitorName: string;
  visitorEmail?: string;
  status: 'OPEN' | 'CLOSED';
  lastMessageAt: Date;
  createdAt: Date;
}

const ChatSessionSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    visitorName: { type: String, required: true, trim: true },
    visitorEmail: { type: String, trim: true },
    status: { type: String, enum: ['OPEN', 'CLOSED'], default: 'OPEN' },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ChatSessionSchema.index({ status: 1, lastMessageAt: -1 });

export default mongoose.model<IChatSession>('ChatSession', ChatSessionSchema);
