import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "./stores/authStore";
import { useArtworkStore } from "./stores/artworkStore";
import { AppBackground } from "./components/AppBackground";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { StudentDashboard } from "./pages/StudentDashboard";
import { SubmitWork } from "./pages/SubmitWork";
import { MyWorks } from "./pages/MyWorks";
import { TeacherDashboard } from "./pages/TeacherDashboard";
import { WorksOverview } from "./pages/WorksOverview";

function ProtectedRoute({
  children,
  allowedRole
}: {
  children: React.ReactNode;
  allowedRole: 'student' | 'teacher';
}) {
  const { currentUser, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!currentUser || currentUser.role !== allowedRole) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  const { initialize: initAuth } = useAuthStore();
  const { initialize: initArtworks } = useArtworkStore();

  useEffect(() => {
    initAuth();
    initArtworks();
  }, [initAuth, initArtworks]);

  return (
    <Router>
      <div className="relative min-h-screen overflow-x-hidden bg-black">
        <AppBackground />
        <div className="relative z-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />

            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRole="student">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/submit"
              element={
                <ProtectedRoute allowedRole="student">
                  <SubmitWork />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/works"
              element={
                <ProtectedRoute allowedRole="student">
                  <MyWorks />
                </ProtectedRoute>
              }
            />

            <Route
              path="/teacher"
              element={
                <ProtectedRoute allowedRole="teacher">
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/works"
              element={
                <ProtectedRoute allowedRole="teacher">
                  <WorksOverview />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
