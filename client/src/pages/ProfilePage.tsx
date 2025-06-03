import type React from "react";
import { useAuth0 } from '@auth0/auth0-react';


const ProfilePage: React.FC = () => {
    const { user, isLoading } = useAuth0();

    if (isLoading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="profile-page">
            <h1>Player Profile</h1>
        
            <div className="profile-card">
                <div className="profile-header">
                    {user?.picture && (<img src={user.picture} alt="Profile" className="profile-avatar" />)}
                    <div className="profile-info">
                        <h2>{user?.nickname}</h2>
                        <p>{user?.email}</p>
                    </div>
                </div>
                
                <div className="profile-stats">
                    <h3>Game Statistics</h3>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <span className="stat-label">Games Played:</span>
                            <span className="stat-value">0</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Games Won:</span>
                            <span className="stat-value">0</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Win Rate:</span>
                            <span className="stat-value">0%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
