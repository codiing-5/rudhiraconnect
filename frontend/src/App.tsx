import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

// Import Pages
import { Home } from './pages/Home';
import { Guidelines } from './pages/Guidelines';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Camps } from './pages/Camps';
import { Leaderboard } from './pages/Leaderboard';
import { Awareness } from './pages/Awareness';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { EligibilityChecker } from './pages/EligibilityChecker';
import { BloodBuddyChallenge } from './pages/BloodBuddyChallenge';
import { AIAssistant } from './pages/AIAssistant';
import { AdminDashboard } from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          {/* Global Header */}
          <Navbar />

          {/* Page Routing */}
          <div className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/guidelines" element={<Guidelines />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/camps" element={<Camps />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/awareness" element={<Awareness />} />

              {/* Protected Volunteer Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/eligibility-checker"
                element={
                  <ProtectedRoute>
                    <EligibilityChecker />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/blood-buddy"
                element={
                  <ProtectedRoute>
                    <BloodBuddyChallenge />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ai-assistant"
                element={
                  <ProtectedRoute>
                    <AIAssistant />
                  </ProtectedRoute>
                }
              />

              {/* Protected Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>

          {/* Global Footer */}
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
