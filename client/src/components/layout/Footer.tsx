import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; {currentYear} Cheat Poker Game. All rights reserved.</p>
        <p>
          <a href="https://github.com/w-makowski/cheat-poker-app" target="_blank" rel="noopener noreferrer">
            GitHub Repository
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
