import express from 'express';
import { adminAuth } from '../middleware/auth';
import validate from '../middleware/validate';
import {
  getAdminSummary,
  listUsers,
  getUserDetail,
  updateUserStatus,
  updateUserStatusSchema,
  addUserNote,
  addUserNoteSchema,
  creditAccount,
  creditAccountSchema,
  listPendingTransactions,
  getFlaggedActivity,
  getAuditLog,
  approveTransaction,
  blockTransaction,
  rejectTransaction,
  holdTransaction,
  unblockTransaction,
  listApplications,
  getApplication,
  updateApplicationStatus,
  updateApplicationStatusSchema,
  editTransaction,
  editTransactionSchema,
  updateAccountCreatedAt,
  updateAccountCreatedAtSchema,
} from '../controllers/admin';

const router = express.Router();

router.get('/summary', adminAuth, getAdminSummary);

router.get('/users', adminAuth, listUsers);
router.get('/users/:id', adminAuth, getUserDetail);
router.patch('/users/:id/status', adminAuth, validate(updateUserStatusSchema), updateUserStatus);
router.post('/users/:id/notes', adminAuth, validate(addUserNoteSchema), addUserNote);

router.post('/credit', adminAuth, validate(creditAccountSchema), creditAccount);

router.get('/transactions/pending', adminAuth, listPendingTransactions);
router.post('/transactions/:id/approve', adminAuth, approveTransaction);
router.post('/transactions/:id/block', adminAuth, blockTransaction);
router.post('/transactions/:id/reject', adminAuth, rejectTransaction);
router.post('/transactions/:id/hold', adminAuth, holdTransaction);
router.post('/transactions/:id/unblock', adminAuth, unblockTransaction);
router.patch('/transactions/:id/edit', adminAuth, validate(editTransactionSchema), editTransaction);

router.patch('/users/:id/created-at', adminAuth, validate(updateAccountCreatedAtSchema), updateAccountCreatedAt);

router.get('/applications', adminAuth, listApplications);
router.get('/applications/:id', adminAuth, getApplication);
router.patch('/applications/:id/status', adminAuth, validate(updateApplicationStatusSchema), updateApplicationStatus);

router.get('/flagged', adminAuth, getFlaggedActivity);
router.get('/audit-log', adminAuth, getAuditLog);

export default router;
