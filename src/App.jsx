import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import EditProfile from './pages/EditProfile';
import ManagePortfolio from './pages/ManagePortfolio';
import EditPortfolio from './pages/EditPortfolio';
import ManageActivities from './pages/ManageActivities';
import EditActivity from './pages/EditActivity';
import ManageApps from './pages/ManageApps';
import EditApp from './pages/EditApp';
import AppDownloads from './pages/AppDownloads';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import './i18n';

function App() {
  return (
    <Router>
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
        </Route>

        {/* Public Home Page */}
        <Route path="/" element={<Home />} />
        <Route path="/apps" element={<AppDownloads />} />
      </Routes>
    </Router>
  );
}

export default App;
