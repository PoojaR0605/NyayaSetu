import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';

// Citizen Pages
import Landing from './pages/citizen/Landing';
import Login from './pages/citizen/Login';
import Register from './pages/citizen/Register';
import Assessment from './pages/citizen/Assessment';
import Results from './pages/citizen/Results';
import Eligibility from './pages/citizen/Eligibility';
import Evidence from './pages/citizen/Evidence';
import ActionPlan from './pages/citizen/ActionPlan';
import Resources from './pages/citizen/Resources';
import SavedAssessments from './pages/citizen/SavedAssessments';
import ChatHistory from './pages/citizen/ChatHistory';
import About from './pages/citizen/About';
import Privacy from './pages/citizen/Privacy';
import NearbyLawyers from './pages/citizen/NearbyLawyers';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  const { isAuthenticated, fetchCurrentUser } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCurrentUser();
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
        
        {/* Assessment Routes (Public) */}
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/chat-history" element={<ChatHistory />} />
        <Route path="/results/:token" element={<Results />} />
        <Route path="/eligibility/:token" element={<Eligibility />} />
        <Route path="/evidence/:token" element={<Evidence />} />
        <Route path="/action-plan/:token" element={<ActionPlan />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/resources/:token" element={<Resources />} />
        <Route path="/nearby-lawyers" element={<NearbyLawyers />} />
        {/* Protected Citizen Routes */}
        <Route
          path="/assessments"
          element={
            <ProtectedRoute>
              <SavedAssessments />
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch All - Redirect to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
