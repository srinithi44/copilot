import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';

import StatePersister from './components/StatePersister';
import Login from './pages/Login';
import Signup from './pages/Signup';
import OTPVerify from './pages/OTPVerify';
import EmailVerify from './pages/EmailVerify';
import ForgotPassword from './pages/ForgotPassword';
import Analytics from './pages/Analytics';
import Syllabus from './pages/Syllabus';
import CentralizedDashboard from './pages/CentralizedDashboard';
import AskDoubt from './pages/AskDoubt';
import StudyPlan from './pages/StudyPlan';
import MockTest from './pages/MockTest';
import GenerateQuiz from './pages/GenerateQuiz';
import GenerateFlashcards from './pages/GenerateFlashcards';
import StudyCalendar from './pages/StudyCalendar';
import ForumPage from './pages/ForumPage';
import Settings from './pages/Settings';
import StudyTracker from './pages/StudyTracker';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfessorDashboard from './pages/dashboards/ProfessorDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import StudentQuizList from './pages/quizzes/StudentQuizList';
import QuizAttempt from './pages/quizzes/QuizAttempt';
import Pricing from './pages/Pricing';
import Tasks from './pages/Tasks';
import Podcast from './pages/Podcast';
import Flowchart from './pages/Flowchart';
import LandingPage from './pages/LandingPage';


function PrivateRoute({ children, allowedRoles }) {
    const { currentUser, is2faVerified } = useAuth();
    const location = useLocation();

    if (!currentUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Optional: 2FA Check
    // if (!is2faVerified) {
    //     return <Navigate to="/email-verify" />;
    // }

    // Role Check
    if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
        // Redirect to appropriate dashboard based on actual role
        if (currentUser.role === 'professor') return <Navigate to="/dashboard/professor" />;
        if (currentUser.role === 'admin') return <Navigate to="/dashboard/admin" />;
        if (currentUser.role === 'student') return <Navigate to="/dashboard" />;
        // Fallback
        // Fallback - prevent infinite loop by redirecting to login instead of root
        return <Navigate to="/login" replace />;

    }

    return children;
}

function PublicRoute({ children }) {
    const { currentUser } = useAuth();
    if (currentUser) {
        // If logged in but not yet verified, ensure they go to OTP verification
        if (!currentUser.isVerified) {
            return <Navigate to="/email-verify" replace />;
        }
        // If fully verified, navigate to main page
        return <Navigate to="/" replace />;
    }
    return children;
}

function App() {
    return (
        <Router>
            <ThemeProvider>
                <AuthProvider>
                    <NotificationProvider>
                        <StatePersister />
                        <div className="app-container">
                            <Routes>
                                <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
                                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                                <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
                                <Route path="/otp-verify" element={<OTPVerify />} />
                                <Route path="/email-verify" element={<EmailVerify />} />

                                <Route
                                    path="/"
                                    element={<LandingPage />}
                                />

                                <Route
                                    path="/dashboard"
                                    element={
                                        <PrivateRoute allowedRoles={['student']}>
                                            <CentralizedDashboard />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/ask-doubt"
                                    element={
                                        <PrivateRoute allowedRoles={['student']}>
                                            <AskDoubt />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/study-plan"
                                    element={
                                        <PrivateRoute allowedRoles={['student']}>
                                            <StudyPlan />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/syllabus"
                                    element={
                                        <PrivateRoute allowedRoles={['student', 'professor']}>
                                            <Syllabus />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/study-tracker"
                                    element={
                                        <PrivateRoute allowedRoles={['student']}>
                                            <StudyTracker />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/mock-test"
                                    element={
                                        <PrivateRoute allowedRoles={['student']}>
                                            <MockTest />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/generate-quiz"
                                    element={
                                        <PrivateRoute allowedRoles={['student', 'professor']}>
                                            <GenerateQuiz />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/community"
                                    element={
                                        <PrivateRoute allowedRoles={['student', 'professor']}>
                                            <ForumPage />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/calendar"
                                    element={
                                        <PrivateRoute allowedRoles={['student']}>
                                            <StudyCalendar />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/flashcards"
                                    element={
                                        <PrivateRoute allowedRoles={['student']}>
                                            <GenerateFlashcards />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/settings"
                                    element={
                                        <PrivateRoute>
                                            <Settings />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/quizzes"
                                    element={
                                        <PrivateRoute allowedRoles={['student']}>
                                            <StudentQuizList />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/quiz/:id"
                                    element={
                                        <PrivateRoute allowedRoles={['student']}>
                                            <QuizAttempt />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/leaderboard"
                                    element={
                                        <PrivateRoute allowedRoles={['student', 'professor']}>
                                            <LeaderboardPage />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/pricing"
                                    element={
                                        <PrivateRoute>
                                            <Pricing />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/tasks"
                                    element={
                                        <PrivateRoute allowedRoles={['student']}>
                                            <Tasks />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/podcast"
                                    element={
                                        <PrivateRoute allowedRoles={['student']}>
                                            <Podcast />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/flowchart"
                                    element={
                                        <PrivateRoute allowedRoles={['student']}>
                                            <Flowchart />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/subjects"
                                    element={
                                        <PrivateRoute allowedRoles={['student', 'professor']}>
                                            <Syllabus />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/progress"
                                    element={
                                        <PrivateRoute allowedRoles={['student']}>
                                            <StudyTracker />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/analytics"
                                    element={
                                        <PrivateRoute allowedRoles={['student']}>
                                            <Analytics />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/dashboard/professor"
                                    element={
                                        <PrivateRoute allowedRoles={['professor']}>
                                            <ProfessorDashboard />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/dashboard/admin"
                                    element={
                                        <PrivateRoute allowedRoles={['admin', 'super_admin']}>
                                            <AdminDashboard />
                                        </PrivateRoute>
                                    }
                                />
                                {/* Catch all redirect to login */}
                                <Route path="*" element={<Navigate to="/login" />} />
                            </Routes>
                        </div>
                    </NotificationProvider>
                </AuthProvider>
            </ThemeProvider>
        </Router>
    );
}

export default App;
