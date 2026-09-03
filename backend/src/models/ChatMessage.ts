import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IChatMessage extends Document {
  _id: Types.ObjectId;
  sessionId: Types.ObjectId;
  sender: 'CUSTOMER' | 'ADMIN';
  authorId?: Types.ObjectId;
  message: string;
  createdAt: Date;
}

const ChatMessageSchema: Schema = new Schema(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: 'ChatSession', required: true },
    sender: { type: String, enum: ['CUSTOMER', 'ADMIN'], required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User' },
    message: { type: String, required: true, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ChatMessageSchema.index({ sessionId: 1, createdAt: 1 });

export default mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);
