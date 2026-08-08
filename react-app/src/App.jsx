import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Complaints from './pages/Complaints';
import ComplaintForm from './pages/ComplaintForm';
import Verifications from './pages/Verifications';
import VerificationForm from './pages/VerificationForm';
import VerificationReports from './pages/VerificationReports';
import VerificationReportForm from './pages/VerificationReportForm';
import Enquiries from './pages/Enquiries';
import EnquiryForm from './pages/EnquiryForm';
import InvestigationOfficers from './pages/InvestigationOfficers';
import OfficerForm from './pages/OfficerForm';
import OffenceTypes from './pages/OffenceTypes';
import Cases from './pages/Cases';
import CaseForm from './pages/CaseForm';
import Profile from './pages/Profile';
import Users from './pages/Users';
import UserForm from './pages/UserForm';
import Circles from './pages/Circles';
import CourtCases from './pages/CourtCases';
import Laws from './pages/Laws';
import Rules from './pages/Rules';
import SOP from './pages/SOP';
import UserManual from './pages/UserManual';
import Chat from './pages/Chat';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading...</div>;
  return user ? <Navigate to="/" /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="complaints" element={<Complaints />} />
        <Route path="complaints/create" element={<ComplaintForm />} />
        <Route path="complaints/:id/edit" element={<ComplaintForm />} />
        <Route path="verifications" element={<Verifications />} />
        <Route path="verifications/create" element={<VerificationForm />} />
        <Route path="verifications/:id/edit" element={<VerificationForm />} />
        <Route path="verifications/reports" element={<VerificationReports />} />
        <Route path="verifications/reports/create" element={<VerificationReportForm />} />
        <Route path="verifications/reports/:id/edit" element={<VerificationReportForm />} />
        <Route path="enquiries" element={<Enquiries />} />
        <Route path="enquiries/create" element={<EnquiryForm />} />
        <Route path="enquiries/:id/edit" element={<EnquiryForm />} />
        <Route path="messages" element={<Chat />} />
        <Route path="investigation-officers" element={<InvestigationOfficers />} />
        <Route path="investigation-officers/create" element={<OfficerForm />} />
        <Route path="investigation-officers/:id/edit" element={<OfficerForm />} />
        <Route path="offence-types" element={<OffenceTypes />} />
        <Route path="cases" element={<Cases />} />
        <Route path="cases/create" element={<CaseForm />} />
        <Route path="cases/:id/edit" element={<CaseForm />} />
        <Route path="profile" element={<Profile />} />
        <Route path="users" element={<Users />} />
        <Route path="users/create" element={<UserForm />} />
        <Route path="users/:id/edit" element={<UserForm />} />
        <Route path="circles" element={<Circles />} />
        <Route path="court-cases" element={<CourtCases />} />
        <Route path="laws" element={<Laws />} />
        <Route path="laws/create" element={<Laws />} />
        <Route path="laws/:id/edit" element={<Laws />} />
        <Route path="rules" element={<Rules />} />
        <Route path="rules/create" element={<Rules />} />
        <Route path="rules/:id/edit" element={<Rules />} />
        <Route path="sops" element={<SOP />} />
        <Route path="sops/create" element={<SOP />} />
        <Route path="sops/:id/edit" element={<SOP />} />
        <Route path="user-manuals" element={<UserManual />} />
        <Route path="user-manuals/create" element={<UserManual />} />
        <Route path="user-manuals/:id/edit" element={<UserManual />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
