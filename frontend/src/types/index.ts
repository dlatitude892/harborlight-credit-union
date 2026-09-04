export type AccountStatus = 'ACTIVE' | 'UNDER_REVIEW' | 'RESTRICTED' | 'FROZEN' | 'CLOSED';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  accountNumber: string;
  role: 'CUSTOMER' | 'ADMIN';
  accountStatus: AccountStatus;
  customerNotice?: string;
  balance: number;
  createdAt?: string;
}

export interface AdminNote {
  authorId: { firstName: string; lastName: string; email: string } | string;
  message: string;
  createdAt: string;
}

export interface AdminUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  accountNumber: string;
  role: 'CUSTOMER' | 'ADMIN';
  accountStatus: AccountStatus;
  customerNotice?: string;
  adminNotes: AdminNote[];
  balance: number;
  createdAt: string;
}

export interface AuditLogEntry {
  _id: string;
  userId: { firstName: string; lastName: string; email: string; role: string } | string;
  action: string;
  details: Record<string, unknown>;
  createdAt: string;
}

export interface FlaggedActivity {
  flaggedUsers: AdminUser[];
  largeTransactions: Transaction[];
  blockedTransactions: Transaction[];
  threshold: number;
}

export interface TransactionParty {
  _id: string;
  firstName: string;
  lastName: string;
  accountNumber: string;
  email?: string;
}

export type TransferMethod = 'MEMBER' | 'BANK_ACCOUNT' | 'CASH_APP' | 'ZELLE' | 'VENMO' | 'PAYPAL';

export interface PayeeSummary {
  _id: string;
  label: string;
  method: TransferMethod;
  handle: string;
}

export interface Transaction {
  _id: string;
  senderId: TransactionParty | string;
  recipientId?: TransactionParty | string;
  payeeId?: PayeeSummary | string;
  method: TransferMethod;
  amount: number;
  currency: string;
  category: string;
  description: string;
  transactionType: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
  status: 'PENDING' | 'ON_HOLD' | 'OTP_REQUIRED' | 'OTP_VERIFIED' | 'APPROVED' | 'REJECTED' | 'BLOCKED' | 'CANCELLED';
  reference: string;
  adminNote?: string;
  createdAt: string;
}

export interface ChatSession {
  _id: string;
  visitorName: string;
  visitorEmail?: string;
  status: 'OPEN' | 'CLOSED';
  lastMessageAt: string;
  createdAt: string;
}

export interface ChatMessage {
  _id: string;
  sessionId: string;
  sender: 'CUSTOMER' | 'ADMIN';
  message: string;
  createdAt: string;
}

export interface Payee {
  _id: string;
  method: 'BANK_ACCOUNT' | 'CASH_APP' | 'ZELLE' | 'VENMO' | 'PAYPAL';
  label: string;
  handle: string;
  recipientName?: string;
  recipientAddress?: string;
  bankName?: string;
  bankAddress?: string;
  routingNumber?: string;
  swiftCode?: string;
  accountNumberLast4?: string;
  createdAt: string;
}

export interface Card {
  _id: string;
  cardholderName: string;
  last4: string;
  brand: 'VISA' | 'MASTERCARD';
  cardType: 'DEBIT' | 'CREDIT';
  expMonth: number;
  expYear: number;
  status: 'ACTIVE' | 'FROZEN';
  spendingLimit: number;
}

export interface LoanApplication {
  _id: string;
  loanType: 'HOME' | 'HOME_REFINANCE' | 'AUTO' | 'PERSONAL' | 'BUSINESS';
  reference: string;
  status: 'NEW' | 'IN_REVIEW' | 'APPROVED' | 'DENIED';
  fullName: string;
  email: string;
  phone: string;
  requestedAmount: number;
  purpose?: string;
  createdAt: string;
  [key: string]: unknown;
}

export interface TicketResponse {
  authorId: { firstName: string; lastName: string; email: string } | string;
  message: string;
  createdAt: string;
}

export interface CustomerCareTicket {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  category: string;
  message: string;
  status: 'NEW' | 'IN_PROGRESS' | 'WAITING_FOR_CUSTOMER' | 'RESOLVED' | 'CLOSED';
  assignedTo?: { firstName: string; lastName: string; email: string } | string;
  responses: TicketResponse[];
  createdAt: string;
}

export interface SavingsAccount {
  _id: string;
  accountNumber: string;
  balance: number;
  status: AccountStatus;
  apy: number;
  openedAt: string;
}

export interface SavingsTransaction {
  _id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  amount: number;
  description: string;
  balanceAfter: number;
  createdAt: string;
}

export interface AccountApplication {
  _id: string;
  userId: { firstName: string; lastName: string; email: string; accountNumber: string; accountStatus: AccountStatus } | string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'REQUIRES_ADDITIONAL_INFO';
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  employmentStatus: string;
  occupation: string;
  sourceOfIncome: string;
  ssnLast4: string;
  idType: string;
  idNumberLast4: string;
  createdAt: string;
}

export interface AdminSummary {
  memberCount: number;
  totalBalance: number;
  pendingCount: number;
  underReviewCount: number;
  pendingApplicationsCount: number;
}

export interface DashboardSummary {
  balance: number;
  income: number;
  expenses: number;
  incomeChangePct: number;
  expenseChangePct: number;
}

export interface PaginatedTransactions {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
