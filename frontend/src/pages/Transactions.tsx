import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import TransactionsTable from '../components/TransactionsTable';
import { api } from '../api/client';
import type { PaginatedTransactions, Transaction } from '../types';

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get<PaginatedTransactions>(`/transactions?page=${page}&limit=10`)
      .then((res) => {
        if (cancelled) return;
        setTransactions(res.transactions);
        setPages(res.pagination.pages || 1);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [page]);

  return (
    <AppLayout title="Transactions" subtitle="Every deposit, transfer, and withdrawal on your account.">
      {loading ? (
        <div className="empty-state">Loading transactions…</div>
      ) : (
        <>
          <TransactionsTable transactions={transactions} />
          {pages > 1 && (
            <div className="pagination">
              <button className="btn btn-ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </button>
              <span>
                Page {page} of {pages}
              </span>
              <button className="btn btn-ghost" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
                Next
              </button>
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
}
