import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from './supabaseClient';
import Loading from './components/Loading';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import { ChatProvider } from './contexts/ChatContext';
import ChatWidget from './components/chat/ChatWidget';
import ScrollToTop from './components/ScrollToTop';
// ── Public pages ───────────────────────────────────────────────────────────
const Home = React.lazy(() => import('./pages/public/Home'));
const Login = React.lazy(() => import('./pages/auth/Login'));
const Services = React.lazy(() => import('./pages/public/Services'));
const Projects = React.lazy(() => import('./pages/public/Projects'));
const ProjectDetail = React.lazy(() => import('./pages/public/ProjectDetail'));
const Activities = React.lazy(() => import('./pages/public/Activities'));
const AppDownloads = React.lazy(() => import('./pages/public/AppDownloads'));
const NotFound = React.lazy(() => import('./pages/public/NotFound'));
const ComingSoon = React.lazy(() => import('./pages/public/ComingSoon'));
const InvoiceLanding = React.lazy(() => import('./pages/public/InvoiceLanding'));
const TrackOrder = React.lazy(() => import('./pages/public/TrackOrder'));
const ReviewForm = React.lazy(() => import('./pages/public/ReviewForm'));
const Blogs = React.lazy(() => import('./pages/public/Blogs'));
const BlogPost = React.lazy(() => import('./pages/public/BlogPost'));
const WorldCup = React.lazy(() => import('./pages/public/WorldCup'));
const MatchDetail = React.lazy(() => import('./pages/public/MatchDetail'));

// ── Public Route Wrapper (Membelokkan pengunjung jika Launch Countdown aktif)
const PublicRoute = ({ children }) => {
  const { data: launchMode, isLoading: loading } = useQuery({
    queryKey: ['launchMode'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('launch_countdown_enabled')
          .limit(1)
          .single();
        if (error) throw error;
        return !!data?.launch_countdown_enabled;
      } catch (err) {
        return false; // Fallback ke normal jika gagal
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  if (loading) return <Loading />;
  if (launchMode) return <Navigate to="/coming-soon" replace />;
  return children;
};

// ── Admin pages ────────────────────────────────────────────────────────────
const Dashboard = React.lazy(() => import('./pages/admin/Dashboard'));
const EditProfile = React.lazy(() => import('./pages/admin/EditProfile'));
const ManagePortfolio = React.lazy(() => import('./pages/admin/ManagePortfolio'));
const EditPortfolio = React.lazy(() => import('./pages/admin/EditPortfolio'));
const ManageActivities = React.lazy(() => import('./pages/admin/ManageActivities'));
const EditActivity = React.lazy(() => import('./pages/admin/EditActivity'));
const ManageApps = React.lazy(() => import('./pages/admin/ManageApps'));
const EditApp = React.lazy(() => import('./pages/admin/EditApp'));
const ManageServices = React.lazy(() => import('./pages/admin/ManageServices'));
const EditService = React.lazy(() => import('./pages/admin/EditService'));
const ManageOrders = React.lazy(() => import('./pages/admin/ManageOrders'));
const EditOrder = React.lazy(() => import('./pages/admin/EditOrder'));
const InvoicePrint = React.lazy(() => import('./pages/admin/InvoicePrint'));
const ManageChats = React.lazy(() => import('./pages/admin/ManageChats'));
const ManagePayments = React.lazy(() => import('./pages/admin/ManagePayments'));
const CreatePayment = React.lazy(() => import('./pages/admin/CreatePayment'));
const ManageBlogs = React.lazy(() => import('./pages/admin/ManageBlogs'));
const EditBlog = React.lazy(() => import('./pages/admin/EditBlog'));
const WorldCupBracketPage = React.lazy(() => import('./pages/admin/WorldCupBracketPage'));

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
            <Route path="/blog" element={<PublicRoute><Blogs /></PublicRoute>} />
            <Route path="/blog/:slug" element={<PublicRoute><BlogPost /></PublicRoute>} />
            <Route path="/world-cup" element={<PublicRoute><WorldCup /></PublicRoute>} />
            <Route path="/world-cup/:id" element={<PublicRoute><MatchDetail /></PublicRoute>} />

            {/* ── Unprotected Publics (Login, Invoice, Coming Soon) ── */}
            <Route path="/coming-soon" element={<ComingSoon />} />
            <Route path="/login" element={<Login />} />
            <Route path="/invoice/:id" element={<InvoiceLanding />} />
            <Route path="/track" element={<TrackOrder />} />
            <Route path="/review" element={<ReviewForm />} />

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
              <Route path="/dashboard/blogs" element={<ManageBlogs />} />
              <Route path="/dashboard/blogs/new" element={<EditBlog />} />
              <Route path="/dashboard/blogs/edit/:id" element={<EditBlog />} />
              <Route path="/dashboard/world-cup" element={<WorldCupBracketPage />} />
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
