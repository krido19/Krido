import React from 'react';
import { supabase } from './supabaseClient';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Loading from './components/Loading';

const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const SignUp = React.lazy(() => import('./pages/SignUp'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const EditProfile = React.lazy(() => import('./pages/EditProfile'));
const ManagePortfolio = React.lazy(() => import('./pages/ManagePortfolio'));
const EditPortfolio = React.lazy(() => import('./pages/EditPortfolio'));
const ManageActivities = React.lazy(() => import('./pages/ManageActivities'));
const EditActivity = React.lazy(() => import('./pages/EditActivity'));
const ManageApps = React.lazy(() => import('./pages/ManageApps'));
const EditApp = React.lazy(() => import('./pages/EditApp'));
const AppDownloads = React.lazy(() => import('./pages/AppDownloads'));
const Services = React.lazy(() => import('./pages/Services'));
const ManageServices = React.lazy(() => import('./pages/ManageServices'));
const EditService = React.lazy(() => import('./pages/EditService'));
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import './i18n';

function App() {
  React.useEffect(() => {
    const trackVisit = async () => {
      const hasVisited = sessionStorage.getItem('hasVisited');
      if (!hasVisited) {
        try {
          const { error } = await supabase.rpc('increment_visitor_count');
          if (!error) {
            sessionStorage.setItem('hasVisited', 'true');
          }
        } catch (error) {
          console.error('Error tracking visit:', error);
        }
      }
    };

    trackVisit();
  }, []);

  return (
    <Router>
      <React.Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Protected Routes wrapped in Layout */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<EditProfile />} />
            <Route path="/portfolio" element={<ManagePortfolio />} />
            <Route path="/portfolio/new" element={<EditPortfolio />} />
            <Route path="/portfolio/edit/:id" element={<EditPortfolio />} />
            <Route path="/activities" element={<ManageActivities />} />
            <Route path="/activities/new" element={<EditActivity />} />
            <Route path="/activities/edit/:id" element={<EditActivity />} />
            <Route path="/dashboard/apps" element={<ManageApps />} />
            <Route path="/dashboard/apps/new" element={<EditApp />} />
            <Route path="/dashboard/apps/edit/:id" element={<EditApp />} />
            <Route path="/dashboard/services" element={<ManageServices />} />
            <Route path="/dashboard/services/new" element={<EditService />} />
            <Route path="/dashboard/services/edit/:id" element={<EditService />} />
          </Route>

          {/* Public Home Page */}
          <Route path="/" element={<Home />} />
          <Route path="/apps" element={<AppDownloads />} />
          <Route path="/services" element={<Services />} />
        </Routes>
      </React.Suspense>
    </Router>
  );
}

export default App;
