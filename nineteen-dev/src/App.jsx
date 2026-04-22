import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Loading from './components/Loading';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import { ChatProvider } from './contexts/ChatContext';
import ChatWidget from './components/chat/ChatWidget';
import ScrollToTop from './components/ScrollToTop';
// ── Public pages ───────────────────────────────────────────────────────────
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Services = React.lazy(() => import('./pages/Services'));
const Projects = React.lazy(() => import('./pages/Projects'));
const ProjectDetail = React.lazy(() => import('./pages/ProjectDetail'));
const Activities = React.lazy(() => import('./pages/Activities'));
const AppDownloads = React.lazy(() => import('./pages/AppDownloads'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const ComingSoon = React.lazy(() => import('./pages/ComingSoon'));

// ── Public Route Wrapper (Membelokkan pengunjung jika Launch Countdown aktif)
const PublicRoute = ({ children }) => {
  const [launchMode, setLaunchMode] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkLaunchMode = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('launch_countdown_enabled')
          .limit(1)
          .single();
        setLaunchMode(!!data?.launch_countdown_enabled);
      } catch (err) {
        setLaunchMode(false); // Fallback ke normal jika gagal
      } finally {
        setLoading(false);
      }
    };
    checkLaunchMode();
  }, []);

  if (loading) return <Loading />;
  if (launchMode) return <Navigate to="/coming-soon" replace />;
  return children;
};

// ── Admin pages ────────────────────────────────────────────────────────────
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const EditProfile = React.lazy(() => import('./pages/EditProfile'));
const ManagePortfolio = React.lazy(() => import('./pages/ManagePortfolio'));
const EditPortfolio = React.lazy(() => import('./pages/EditPortfolio'));
const ManageActivities = React.lazy(() => import('./pages/ManageActivities'));
const EditActivity = React.lazy(() => import('./pages/EditActivity'));
const ManageApps = React.lazy(() => import('./pages/ManageApps'));
const EditApp = React.lazy(() => import('./pages/EditApp'));
const ManageServices = React.lazy(() => import('./pages/ManageServices'));
const EditService = React.lazy(() => import('./pages/EditService'));
const ManageOrders = React.lazy(() => import('./pages/ManageOrders'));
const EditOrder = React.lazy(() => import('./pages/EditOrder'));
const InvoicePrint = React.lazy(() => import('./pages/InvoicePrint'));
const ManageChats = React.lazy(() => import('./pages/ManageChats'));
const ManagePayments = React.lazy(() => import('./pages/ManagePayments'));
const CreatePayment = React.lazy(() => import('./pages/CreatePayment'));

function App() {
  return (
    <ChatProvider>
      <Router>
        <ScrollToTop />
        <React.Suspense fallback={<Loading />}>
          <Routes>
            {/* ── Public ── */}
            <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
            <Route path="/services" element={<PublicRoute><Services /></PublicRoute>} />
            <Route path="/projects" element={<PublicRoute><Projects /></PublicRoute>} />
            <Route path="/projects/:id" element={<PublicRoute><ProjectDetail /></PublicRoute>} />
            <Route path="/activities" element={<PublicRoute><Activities /></PublicRoute>} />
            <Route path="/apps" element={<PublicRoute><AppDownloads /></PublicRoute>} />

            {/* ── Unprotected Publics (Login & Coming Soon) ── */}
            <Route path="/coming-soon" element={<ComingSoon />} />
            <Route path="/login" element={<Login />} />

            {/* ── Admin (Protected + AdminLayout sidebar) ── */}
            <Route element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<EditProfile />} />
              <Route path="/portfolio" element={<ManagePortfolio />} />
              <Route path="/portfolio/new" element={<EditPortfolio />} />
              <Route path="/portfolio/edit/:id" element={<EditPortfolio />} />
              <Route path="/dashboard/activities" element={<ManageActivities />} />
              <Route path="/dashboard/activities/new" element={<EditActivity />} />
              <Route path="/dashboard/activities/edit/:id" element={<EditActivity />} />
              <Route path="/dashboard/apps" element={<ManageApps />} />
              <Route path="/dashboard/apps/new" element={<EditApp />} />
              <Route path="/dashboard/apps/edit/:id" element={<EditApp />} />
              <Route path="/dashboard/services" element={<ManageServices />} />
              <Route path="/dashboard/services/new" element={<EditService />} />
              <Route path="/dashboard/services/edit/:id" element={<EditService />} />
              <Route path="/dashboard/orders" element={<ManageOrders />} />
              <Route path="/dashboard/orders/new" element={<EditOrder />} />
              <Route path="/dashboard/orders/edit/:id" element={<EditOrder />} />
              <Route path="/dashboard/orders/invoice/:id" element={<InvoicePrint />} />
              <Route path="/dashboard/chats" element={<ManageChats />} />
              <Route path="/dashboard/payments" element={<ManagePayments />} />
              <Route path="/dashboard/payments/new" element={<CreatePayment />} />
            </Route>

            {/* ── 404 ── */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </React.Suspense>
        <ChatWidget />
      </Router>
    </ChatProvider>
  );
}

export default App;
