import mongoose, { Document, Schema, Types } from 'mongoose';

export type TicketCategory =
  | 'GENERAL'
  | 'ACCOUNT_SUPPORT'
  | 'LOAN_QUESTION'
  | 'MORTGAGE_QUESTION'
  | 'ONLINE_BANKING'
  | 'TECHNICAL_SUPPORT'
  | 'APPLICATION_STATUS'
  | 'OTHER';

export type TicketStatus = 'NEW' | 'IN_PROGRESS' | 'WAITING_FOR_CUSTOMER' | 'RESOLVED' | 'CLOSED';

export interface ITicketResponse {
  authorId: Types.ObjectId;
  message: string;
  createdAt: Date;
}

export interface ICustomerCareTicket extends Document {
  _id: Types.ObjectId;
  userId?: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  category: TicketCategory;
  message: string;
  status: TicketStatus;
  assignedTo?: Types.ObjectId;
  responses: ITicketResponse[];
  createdAt: Date;
}

const CustomerCareTicketSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    subject: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: [
        'GENERAL',
        'ACCOUNT_SUPPORT',
        'LOAN_QUESTION',
        'MORTGAGE_QUESTION',
        'ONLINE_BANKING',
        'TECHNICAL_SUPPORT',
        'APPLICATION_STATUS',
        'OTHER',
      ],
      default: 'GENERAL',
    },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['NEW', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED'],
      default: 'NEW',
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    responses: [
      {
        authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        message: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

CustomerCareTicketSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model<ICustomerCareTicket>('CustomerCareTicket', CustomerCareTicketSchema);
