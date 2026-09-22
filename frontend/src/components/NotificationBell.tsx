import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import type { PaginatedTransactions, Transaction } from '../types';
import { IconBell, IconCheck, IconClose, IconArrowDown } from './icons';

interface NotifItem {
  id: string;
  message: string;
  timestamp: string;
  tone: 'positive' | 'warning' | 'danger' | 'neutral';
}

const formatRelative = (iso: string) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const messageFor = (txn: Transaction, isOutgoing: boolean): NotifItem | null => {
  const amount = formatCurrency(txn.amount);
  switch (txn.status) {
    case 'APPROVED':
      return {
        id: txn._id,
        message: isOutgoing ? `Your transfer of ${amount} was approved.` : `You received ${amount}.`,
        timestamp: txn.createdAt,
        tone: 'positive',
      };
    case 'REJECTED':
      return { id: txn._id, message: `Your transfer of ${amount} was rejected.`, timestamp: txn.createdAt, tone: 'danger' };
    case 'BLOCKED':
      return { id: txn._id, message: `Your transfer of ${amount} was blocked.`, timestamp: txn.createdAt, tone: 'danger' };
    case 'ON_HOLD':
      return { id: txn._id, message: `Your transfer of ${amount} is on hold for review.`, timestamp: txn.createdAt, tone: 'warning' };
    case 'PENDING':
      return { id: txn._id, message: `Your transfer of ${amount} is pending approval.`, timestamp: txn.createdAt, tone: 'warning' };
    default:
      return null;
  }
};

const toneIcon = (tone: NotifItem['tone']) => {
  if (tone === 'positive') return <IconCheck />;
  if (tone === 'danger') return <IconClose />;
  return <IconArrowDown />;
};

export default function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotifItem[]>([]);
  const [seenAt, setSeenAt] = useState<number>(0);
  const ref = useRef<HTMLDivElement>(null);

  const storageKey = user ? `harborlight_notif_seen_${user.id}` : null;

  useEffect(() => {
    if (storageKey) {
      setSeenAt(Number(localStorage.getItem(storageKey)) || 0);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!user) return;
    api
      .get<PaginatedTransactions>('/transactions?limit=8')
      .then((res) => {
        const notifItems: NotifItem[] = [];

        if (user.customerNotice) {
          notifItems.push({
            id: 'account-notice',
            message: user.customerNotice,
            timestamp: user.createdAt || new Date().toISOString(),
            tone: 'neutral',
          });
        }

        res.transactions.forEach((txn) => {
          const senderId = typeof txn.senderId === 'string' ? txn.senderId : txn.senderId._id;
          const item = messageFor(txn, senderId === user.id);
          if (item) notifItems.push(item);
        });

        setItems(notifItems);
      })
      .catch(() => undefined);
  }, [user]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const unreadCount = items.filter((i) => new Date(i.timestamp).getTime() > seenAt).length;

  const markAllRead = () => {
    const now = Date.now();
    setSeenAt(now);
    if (storageKey) localStorage.setItem(storageKey, String(now));
  };

  return (
    <div className="notif-bell-wrap" ref={ref}>
      <button className="notif-bell-btn" onClick={() => setOpen((o) => !o)} aria-label="Notifications">
        <IconBell />
        {unreadCount > 0 && <span className="notif-bell-dot" />}
      </button>

      {open && (
        <div className="notif-panel">
          <div className="notif-panel-header">
            <h3>Notifications</h3>
            {items.length > 0 && <button onClick={markAllRead}>Mark all as read</button>}
          </div>
          {items.length === 0 ? (
            <div className="notif-panel-empty">You're all caught up.</div>
          ) : (
            <div className="notif-list">
              {items.map((item) => (
                <div className="notif-item" key={item.id}>
                  <span className={`notif-item-icon notif-tone-${item.tone}`}>{toneIcon(item.tone)}</span>
                  <div className="notif-item-body">
                    <p>{item.message}</p>
                    <span>{formatRelative(item.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
