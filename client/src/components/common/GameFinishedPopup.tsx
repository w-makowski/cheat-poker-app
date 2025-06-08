import React from 'react';

interface Standing {
    id: string;
    username: string;
    standing: number | null;
}

interface Props {
    standings: Standing[];
    winnerId?: string;
    onReturnHome: () => void;
}

function getOrdinal(n: number) {
    if (n === 1) return '1st place';
    if (n === 2) return '2nd place';
    if (n === 3) return '3rd place';
    return `${n}th place`;
}

const GameFinishedPopup: React.FC<Props> = ({
                                                standings,
                                                winnerId,
                                                onReturnHome,
                                            }) => {
    // Sort by standing, treating null as 1 (first place)
    const sorted = [...standings].sort((a, b) => {
        const aStanding = a.standing === null ? 1 : a.standing;
        const bStanding = b.standing === null ? 1 : b.standing;
        return aStanding - bStanding;
    });

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <h2>Game Finished!</h2>
                <p>
                    Winner: <b>{standings.find(p => p.id === winnerId)?.username || 'Unknown'}</b>
                </p>
                <h3>Standings:</h3>
                <ol>
                    {sorted.map(player => (
                        <li key={player.id}>
                            {player.username} ({getOrdinal(player.standing === null ? 1 : player.standing)})
                        </li>
                    ))}
                </ol>
                <button className="btn btn-primary" onClick={onReturnHome}>
                    Return to Home
                </button>
            </div>
        </div>
    );
};

export default GameFinishedPopup;