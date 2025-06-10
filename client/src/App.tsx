import { Routes, Route } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import GameRoomPage from './pages/GameRoomPage';
import ProfilePage from './pages/ProfilePage';
import RulesPage from './pages/RulesPage';
import LoginPage from './pages/LoginPage';
import CreateGamePage from './pages/CreateGamePage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { SocketProvider } from './contexts/SocketContext';
import { useUserSync } from './hooks/useUserSync';
import AdminPage from './pages/AdminPage';
// import './App.css'

function App() {
  const { isAuthenticated, isLoading } = useAuth0();

  useUserSync();

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <SocketProvider>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="rules" element={<RulesPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route
            path="games/:gameId" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <GameRoomPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="profile" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route path="create" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <CreateGamePage />
            </ProtectedRoute>
            } />
        </Route>
        <Route path="admin" element={<AdminPage />} />
      </Routes>
    </SocketProvider>
  );
}

export default App
