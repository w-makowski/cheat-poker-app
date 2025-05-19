import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

const Navbar: React.FC = () => {
    const { isAuthenticated, loginWithRedirect, logout } = useAuth0();
    const navigate = useNavigate();
  
    const handleLogin = () => {
        loginWithRedirect();
    };
  
    const handleLogout = () => {
        logout({ logoutParams: { returnTo: window.location.origin } });
    };
  
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">Cheat Poker Game</Link>
            </div>
            <div className="navbar-links">
                <Link to="/">Home</Link>
                <Link to="/rules">Rules</Link>
                {isAuthenticated && (
                    <>
                    <Link to="/profile">Profile</Link>
                    </>
                )}
            </div>
            <div className="navbar-auth">
                {isAuthenticated ? (
                    <button className="btn btn-logout" onClick={handleLogout}>Log Out</button>
                ) : (
                    <button className="btn btn-login" onClick={handleLogin}>Log In</button>
                )}
            </div>
        </nav>
    );
};
  
export default Navbar;
