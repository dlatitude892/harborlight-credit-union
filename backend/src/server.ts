import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

import connectDB from './config/db';
import authRoutes from './routes/auth';
import transactionRoutes from './routes/transaction';
import accountRoutes from './routes/account';
import payeeRoutes from './routes/payee';
import cardRoutes from './routes/card';
import adminRoutes from './routes/admin';
import loanApplicationRoutes from './routes/loanApplication';
import customerCareRoutes from './routes/customerCare';
import savingsRoutes from './routes/savings';
import chatRoutes from './routes/chat';
import { notFound, errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';

const app = express();
const PORT = process.env.PORT || 5000;

// Security headers
app.use(helmet());

// CORS - restrict to configured frontend origin(s)
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: '100kb' }));
app.use(apiLimiter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'harborlight-credit-union-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/payees', payeeRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/loan-applications', loanApplicationRoutes);
app.use('/api/customer-care', customerCareRoutes);
app.use('/api/savings', savingsRoutes);
app.use('/api/chat', chatRoutes);

app.use(notFound);
app.use(errorHandler);

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Harborlight Credit Union API running on port ${PORT}`);
  });
};

start();

export default app;
