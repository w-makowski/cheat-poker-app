import type React from "react";
import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';


const ProfilePage: React.FC = () => {
    const { user, isLoading, isAuthenticated, getAccessTokenSilently } = useAuth0();
    const [profile, setProfile] = useState<{id:number, username:string, email:string, gamesPlayed:number, gamesWon:number, isBanned:boolean} | null>(null);

    useEffect(() => {
        if (!isAuthenticated) return;
        (async () => {
            const token = await getAccessTokenSilently();
            const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/users/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('res:', res);
            const data = await res.json();
            setProfile(data);
        })();
    }, [isAuthenticated]);

    const [newUsername, setNewUsername] = useState('');
    const [updateMsg, setUpdateMsg] = useState('');

    const handleUsernameChange = async () => {
        try {
            const token = await getAccessTokenSilently();
            const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/users/username`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ username: newUsername })
            });

            if (res.status === 200) {
            const data = await res.json();
            setProfile((prev) => prev ? { ...prev, username: data.username } : prev);
            setUpdateMsg('Username updated!');
            } else {
            const err = await res.json();
            setUpdateMsg(err.error || 'Something went wrong');
            }
        } catch (err) {
            setUpdateMsg('Failed to update username');
        }
    };


    if (isLoading || !profile) {
        return <div className="loading">Loading...</div>;
    }

    const winRate = profile.gamesPlayed ? ((profile.gamesWon / profile.gamesPlayed) * 100).toFixed(0) : '0';

    return (
        <div className="profile-page">
            <h1>Player Profile</h1>
        
            <div className="profile-card">
                <div className="profile-header">
                    {user?.picture && (<img src={user.picture} alt="Profile" className="profile-avatar" />)}
                    <div className="profile-info">
                        <h2>{profile.username}</h2>
                        <div className="username-update">
                            <input
                                type="text"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                placeholder="Enter new username"
                            />
                            <button onClick={handleUsernameChange}>Update Username</button>
                            {updateMsg && <p>{updateMsg}</p>}
                        </div>

                        <p>{profile.email}</p>
                    </div>
                </div>
                
                <div className="profile-stats">
                    <h3>Game Statistics</h3>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <span className="stat-label">Games Played: </span>
                            <span className="stat-value">{profile.gamesPlayed}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Games Won: </span>
                            <span className="stat-value">{profile.gamesWon}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Win Rate: </span>
                            <span className="stat-value">{winRate}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
