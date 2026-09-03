import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import ChatWidget from './components/ChatWidget';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Transfer from './pages/Transfer';
import Checking from './pages/Checking';
import Savings from './pages/Savings';
import Cards from './pages/Cards';
import Bills from './pages/Bills';
import Settings from './pages/Settings';
import Support from './pages/Support';
import Privacy from './pages/legal/Privacy';
import Terms from './pages/legal/Terms';
import Accessibility from './pages/legal/Accessibility';
import SecurityCenter from './pages/legal/SecurityCenter';
import AdminOverview from './pages/AdminOverview';
import AdminUsers from './pages/AdminUsers';
import AdminUserDetail from './pages/AdminUserDetail';
import AdminTransactions from './pages/AdminTransactions';
import AdminFlagged from './pages/AdminFlagged';
import AdminAuditLog from './pages/AdminAuditLog';
import AdminLoanApplications from './pages/AdminLoanApplications';
import AdminTickets from './pages/AdminTickets';
import AdminTicketDetail from './pages/AdminTicketDetail';
import AdminApplications from './pages/AdminApplications';
import AdminApplicationDetail from './pages/AdminApplicationDetail';
import AdminChat from './pages/AdminChat';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/accessibility" element={<Accessibility />} />
        <Route path="/security-center" element={<SecurityCenter />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <Transactions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transfer"
          element={
            <ProtectedRoute>
              <Transfer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checking"
          element={
            <ProtectedRoute>
              <Checking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/savings"
          element={
            <ProtectedRoute>
              <Savings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cards"
          element={
            <ProtectedRoute>
              <Cards />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bills"
          element={
            <ProtectedRoute>
              <Bills />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/support"
          element={
            <ProtectedRoute>
              <Support />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminOverview />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users/:id"
          element={
            <AdminRoute>
              <AdminUserDetail />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/transactions"
          element={
            <AdminRoute>
              <AdminTransactions />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/flagged"
          element={
            <AdminRoute>
              <AdminFlagged />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/audit-log"
          element={
            <AdminRoute>
              <AdminAuditLog />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/loan-applications"
          element={
            <AdminRoute>
              <AdminLoanApplications />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/tickets"
          element={
            <AdminRoute>
              <AdminTickets />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/tickets/:id"
          element={
            <AdminRoute>
              <AdminTicketDetail />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/applications"
          element={
            <AdminRoute>
              <AdminApplications />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/applications/:id"
          element={
            <AdminRoute>
              <AdminApplicationDetail />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/chat"
          element={
            <AdminRoute>
              <AdminChat />
            </AdminRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ChatWidgetGate />
    </AuthProvider>
  );
}

function ChatWidgetGate() {
  const location = useLocation();
  if (location.pathname.startsWith('/admin')) return null;
  return <ChatWidget />;
}
