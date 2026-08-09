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
import { canAssignVerification, canCreateComplaint, canView } from './utils/permissions';

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

function FeatureRoute({ feature, children, fallback = '/' }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (!canView(feature, user)) return <Navigate to={fallback} replace />;
  return children;
}

function CreateComplaintRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (!canCreateComplaint(user)) return <Navigate to="/verifications" replace />;
  return children;
}

function AssignVerificationRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (!canAssignVerification(user)) return <Navigate to="/verifications" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="analytics" element={<FeatureRoute feature="analytics"><Analytics /></FeatureRoute>} />
        <Route path="complaints" element={<FeatureRoute feature="complaints"><Complaints /></FeatureRoute>} />
        <Route path="complaints/create" element={<CreateComplaintRoute><ComplaintForm /></CreateComplaintRoute>} />
        <Route path="complaints/:id/edit" element={<FeatureRoute feature="complaints"><ComplaintForm /></FeatureRoute>} />
        <Route path="verifications" element={<FeatureRoute feature="verifications"><Verifications /></FeatureRoute>} />
        <Route path="verifications/create" element={<AssignVerificationRoute><VerificationForm /></AssignVerificationRoute>} />
        <Route path="verifications/:id/edit" element={<FeatureRoute feature="verifications"><VerificationForm /></FeatureRoute>} />
        <Route path="verifications/reports" element={<FeatureRoute feature="reports"><VerificationReports /></FeatureRoute>} />
        <Route path="verifications/reports/create" element={<FeatureRoute feature="reports"><VerificationReportForm /></FeatureRoute>} />
        <Route path="verifications/reports/:id/edit" element={<FeatureRoute feature="reports"><VerificationReportForm /></FeatureRoute>} />
        <Route path="enquiries" element={<FeatureRoute feature="enquiries"><Enquiries /></FeatureRoute>} />
        <Route path="enquiries/create" element={<FeatureRoute feature="enquiries"><EnquiryForm /></FeatureRoute>} />
        <Route path="enquiries/:id/edit" element={<FeatureRoute feature="enquiries"><EnquiryForm /></FeatureRoute>} />
        <Route path="messages" element={<Chat />} />
        <Route path="investigation-officers" element={<FeatureRoute feature="io_records"><InvestigationOfficers /></FeatureRoute>} />
        <Route path="investigation-officers/create" element={<FeatureRoute feature="io_records"><OfficerForm /></FeatureRoute>} />
        <Route path="investigation-officers/:id/edit" element={<FeatureRoute feature="io_records"><OfficerForm /></FeatureRoute>} />
        <Route path="offence-types" element={<FeatureRoute feature="offence_types"><OffenceTypes /></FeatureRoute>} />
        <Route path="cases" element={<FeatureRoute feature="dac_cases"><Cases /></FeatureRoute>} />
        <Route path="cases/create" element={<FeatureRoute feature="dac_cases"><CaseForm /></FeatureRoute>} />
        <Route path="cases/:id/edit" element={<FeatureRoute feature="dac_cases"><CaseForm /></FeatureRoute>} />
        <Route path="profile" element={<Profile />} />
        <Route path="users" element={<FeatureRoute feature="users"><Users /></FeatureRoute>} />
        <Route path="users/create" element={<FeatureRoute feature="users"><UserForm /></FeatureRoute>} />
        <Route path="users/:id/edit" element={<FeatureRoute feature="users"><UserForm /></FeatureRoute>} />
        <Route path="circles" element={<FeatureRoute feature="circles"><Circles /></FeatureRoute>} />
        <Route path="court-cases" element={<FeatureRoute feature="court_cases"><CourtCases /></FeatureRoute>} />
        <Route path="laws" element={<FeatureRoute feature="reference"><Laws /></FeatureRoute>} />
        <Route path="laws/create" element={<FeatureRoute feature="reference"><Laws /></FeatureRoute>} />
        <Route path="laws/:id/edit" element={<FeatureRoute feature="reference"><Laws /></FeatureRoute>} />
        <Route path="rules" element={<FeatureRoute feature="reference"><Rules /></FeatureRoute>} />
        <Route path="rules/create" element={<FeatureRoute feature="reference"><Rules /></FeatureRoute>} />
        <Route path="rules/:id/edit" element={<FeatureRoute feature="reference"><Rules /></FeatureRoute>} />
        <Route path="sops" element={<FeatureRoute feature="reference"><SOP /></FeatureRoute>} />
        <Route path="sops/create" element={<FeatureRoute feature="reference"><SOP /></FeatureRoute>} />
        <Route path="sops/:id/edit" element={<FeatureRoute feature="reference"><SOP /></FeatureRoute>} />
        <Route path="user-manuals" element={<FeatureRoute feature="reference"><UserManual /></FeatureRoute>} />
        <Route path="user-manuals/create" element={<FeatureRoute feature="reference"><UserManual /></FeatureRoute>} />
        <Route path="user-manuals/:id/edit" element={<FeatureRoute feature="reference"><UserManual /></FeatureRoute>} />
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
