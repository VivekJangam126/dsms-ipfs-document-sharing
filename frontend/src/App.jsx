import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import SharedDocuments from './pages/SharedDocuments';
import SharedWithMe from './pages/SharedWithMe';
import DocumentDetails from './pages/DocumentDetails';
import AccessShared from './pages/AccessShared';
import Logs from './pages/Logs';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/dashboard" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/documents" element={<PrivateRoute><Documents /></PrivateRoute>} />
            <Route path="/documents/:id" element={<PrivateRoute><DocumentDetails /></PrivateRoute>} />
          <Route path="/shared" element={<PrivateRoute><SharedDocuments /></PrivateRoute>} />
          <Route path="/shared-with-me" element={<PrivateRoute><SharedWithMe /></PrivateRoute>} />
          <Route path="/logs" element={<PrivateRoute><Logs /></PrivateRoute>} />
          <Route path="/shared/:shareId" element={<AccessShared />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
