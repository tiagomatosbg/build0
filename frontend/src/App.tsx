import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layout components
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import NewJob from './pages/NewJob';
import EditJob from './pages/EditJob';
import JobDetails from './pages/JobDetails';
import Candidates from './pages/Candidates';
import NewCandidate from './pages/NewCandidate';
import EditCandidate from './pages/EditCandidate';
import CandidateDetails from './pages/CandidateDetails';
import Interviews from './pages/Interviews';
import NewInterview from './pages/NewInterview';
import EditInterview from './pages/EditInterview';
import InterviewDetails from './pages/InterviewDetails';
import Tests from './pages/Tests';
import NewTest from './pages/NewTest';
import EditTest from './pages/EditTest';
import TestDetails from './pages/TestDetails';

// Create a client
const queryClient = new QueryClient();

// Protected route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              
              {/* Jobs routes */}
              <Route path="jobs" element={<Jobs />} />
              <Route path="jobs/new" element={<NewJob />} />
              <Route path="jobs/:jobId" element={<JobDetails />} />
              <Route path="jobs/:jobId/edit" element={<EditJob />} />
              
              {/* Candidates routes */}
              <Route path="candidates" element={<Candidates />} />
              <Route path="candidates/new" element={<NewCandidate />} />
              <Route path="candidates/:candidateId" element={<CandidateDetails />} />
              <Route path="candidates/:candidateId/edit" element={<EditCandidate />} />
              
              {/* Interviews routes */}
              <Route path="interviews" element={<Interviews />} />
              <Route path="interviews/new" element={<NewInterview />} />
              <Route path="interviews/:interviewId" element={<InterviewDetails />} />
              <Route path="interviews/:interviewId/edit" element={<EditInterview />} />
              
              {/* Tests routes */}
              <Route path="tests" element={<Tests />} />
              <Route path="tests/new" element={<NewTest />} />
              <Route path="tests/:testId" element={<TestDetails />} />
              <Route path="tests/:testId/edit" element={<EditTest />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
