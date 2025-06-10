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

    const isActiveLink = (path: string) => {
        return location.pathname === path ? 'active' : '';
    };
  
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">Cheat Poker Game</Link>
            </div>
            <div className="navbar-links">
                <Link to="/" className={isActiveLink('/')}>Home</Link>
                <Link to="/rules" className={isActiveLink('/rules')}>Rules</Link>
                {isAuthenticated && (
                    <Link to="/profile" className={isActiveLink('/profile')}>Profile</Link>
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


// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate, useLocation } from 'react-router-dom';
// import { useAuth0 } from '@auth0/auth0-react';

// const Navbar: React.FC = () => {
//   const { isAuthenticated, loginWithRedirect, logout } = useAuth0();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//   const handleLogin = () => {
//     loginWithRedirect();
//   };

//   const handleLogout = () => {
//     logout({ logoutParams: { returnTo: window.location.origin } });
//   };

//   const toggleMobileMenu = () => {
//     setIsMobileMenuOpen(!isMobileMenuOpen);
//   };

//   const closeMobileMenu = () => {
//     setIsMobileMenuOpen(false);
//   };

//   // Close mobile menu when route changes
//   useEffect(() => {
//     setIsMobileMenuOpen(false);
//   }, [location.pathname]);

//   // Close mobile menu when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       const target = event.target as HTMLElement;
//       if (isMobileMenuOpen && !target.closest('.mobile-menu') && !target.closest('.hamburger-menu')) {
//         setIsMobileMenuOpen(false);
//       }
//     };

//     if (isMobileMenuOpen) {
//       document.addEventListener('mousedown', handleClickOutside);
//       // Prevent body scroll when menu is open
//       document.body.style.overflow = 'hidden';
//     } else {
//       document.body.style.overflow = 'unset';
//     }

//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//       document.body.style.overflow = 'unset';
//     };
//   }, [isMobileMenuOpen]);

//   // Helper function to check if link is active
//   const isActiveLink = (path: string) => {
//     return location.pathname === path ? 'active' : '';
//   };

//   return (
//     <>
//       <nav className="navbar">
//         <div className="navbar-brand">
//           <Link to="/">Cheat Poker Game</Link>
//         </div>

//         <div className="navbar-links">
//           <Link to="/" className={isActiveLink('/')}>Home</Link>
//           <Link to="/rules" className={isActiveLink('/rules')}>Rules</Link>
//           {isAuthenticated && (
//             <Link to="/profile" className={isActiveLink('/profile')}>Profile</Link>
//           )}
//         </div>

//         <div className="navbar-auth">
//           {isAuthenticated ? (
//             <button className="btn btn-logout" onClick={handleLogout}>Log Out</button>
//           ) : (
//             <button className="btn btn-login" onClick={handleLogin}>Log In</button>
//           )}
//         </div>
//       </nav>
//     </>
//   );
// };

// export default Navbar;
