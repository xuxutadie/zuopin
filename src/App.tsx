import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "./stores/authStore";
import { useArtworkStore } from "./stores/artworkStore";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { StudentDashboard } from "./pages/StudentDashboard";
import { SubmitWork } from "./pages/SubmitWork";
import { MyWorks } from "./pages/MyWorks";
import { TeacherDashboard } from "./pages/TeacherDashboard";
import { WorksOverview } from "./pages/WorksOverview";

function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode; allowedRole: 'student' | 'teacher' }) {
  const { currentUser, isLoading } = useAuthStore();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
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
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        
        {/* 学生路由 */}
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
        
        {/* 老师路由 */}
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
        
        {/* 默认重定向 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
