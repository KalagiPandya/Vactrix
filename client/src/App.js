import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth }   from './context/AuthContext';
import { NotificationProvider }    from './context/NotificationContext';

import Login    from './pages/auth/Login';
import Register from './pages/auth/Register';

import Dashboard      from './pages/employee/Dashboard';
import BrowseJobs     from './pages/employee/BrowseJobs';
import JobDetail      from './pages/employee/JobDetail';
import MyApplications from './pages/employee/MyApplications';
import Profile        from './pages/employee/Profile';

import HRDashboard        from './pages/hr/HRDashboard';
import PostJob            from './pages/hr/PostJob';
import ViewApplicants     from './pages/hr/ViewApplicants';
import VacancyReport      from './pages/hr/VacancyReport';
import Promotions         from './pages/hr/Promotions';
import OrgChartPage       from './pages/hr/OrgChartPage';
import AnalyticsDashboard from './pages/hr/AnalyticsDashboard';
import SearchPage         from './pages/hr/SearchPage';          // Part 6

import AdminDashboard    from './pages/admin/AdminDashboard';
import ScoringConfigPanel from './pages/admin/ScoringConfigPanel'; // Part 5

import Notifications from './pages/shared/Notifications';
import NotFound      from './pages/shared/NotFound';
import LandingPage from './pages/shared/LandingPage';

function PrivateRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    if (user.role === 'hr')    return <Navigate to="/hr/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'hr')    return <Navigate to="/hr/dashboard" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/" element={<LandingPage />} />
          <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Employee */}
            <Route path="/dashboard"       element={<PrivateRoute roles={['employee']}><Dashboard /></PrivateRoute>} />
            <Route path="/jobs"            element={<PrivateRoute roles={['employee']}><BrowseJobs /></PrivateRoute>} />
            <Route path="/jobs/:jobId"     element={<PrivateRoute roles={['employee']}><JobDetail /></PrivateRoute>} />
            <Route path="/my-applications" element={<PrivateRoute roles={['employee']}><MyApplications /></PrivateRoute>} />
            <Route path="/profile"         element={<PrivateRoute roles={['employee']}><Profile /></PrivateRoute>} />

            {/* HR */}
            <Route path="/hr/dashboard"         element={<PrivateRoute roles={['hr']}><HRDashboard /></PrivateRoute>} />
            <Route path="/hr/post-job"          element={<PrivateRoute roles={['hr']}><PostJob /></PrivateRoute>} />
            <Route path="/hr/applicants/:jobId" element={<PrivateRoute roles={['hr']}><ViewApplicants /></PrivateRoute>} />
            <Route path="/hr/impact/:appId"     element={<PrivateRoute roles={['hr']}><VacancyReport /></PrivateRoute>} />
            <Route path="/hr/promotions"        element={<PrivateRoute roles={['hr']}><Promotions /></PrivateRoute>} />
            <Route path="/hr/org-chart"         element={<PrivateRoute roles={['hr']}><OrgChartPage /></PrivateRoute>} />
            <Route path="/hr/analytics"         element={<PrivateRoute roles={['hr','admin']}><AnalyticsDashboard /></PrivateRoute>} />
            <Route path="/hr/search"            element={<PrivateRoute roles={['hr','admin']}><SearchPage /></PrivateRoute>} />

            {/* Admin */}
            <Route path="/admin/dashboard"       element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
            <Route path="/admin/scoring-config"  element={<PrivateRoute roles={['admin']}><ScoringConfigPanel /></PrivateRoute>} />

            {/* Shared */}
            <Route path="/notifications" element={<PrivateRoute roles={['employee','hr','admin']}><Notifications /></PrivateRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
