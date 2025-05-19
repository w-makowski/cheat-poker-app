import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
    const { isAuthenticated, loginWithRedirect, isLoading } = useAuth0();

    if (isLoading) {
      return <div className="loading">Loading...</div>;
    }
  
    if (isAuthenticated) {
      return <Navigate to="/" replace />;
    }
  
    return (
      <div className="login-page">
        <div className="login-container">
          <h1>Login to Cheat Poker Game</h1>
          <p>Please log in to create or join game rooms.</p>
          <button className="btn btn-primary" onClick={() => loginWithRedirect()}>
            Log In / Sign Up
          </button>
        </div>
      </div>
    );
}

export default LoginPage;
