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

const GameFinishedPopup: React.FC<Props> = ({
                                                standings,
                                                winnerId,
                                                onReturnHome,
                                            }) => (
    <div className="popup-overlay">
        <div className="popup-content">
            <h2>Game Finished!</h2>
            <p>
                Winner: <b>{standings.find(p => p.id === winnerId)?.username || 'Unknown'}</b>
            </p>
            <h3>Standings:</h3>
            <ol>
                {standings
                    .sort((a, b) => (a.standing ?? 999) - (b.standing ?? 999))
                    .map(player => (
                        <li key={player.id}>
                            {player.username} {player.standing !== null ? `(Place: ${player.standing})` : ''}
                        </li>
                    ))}
            </ol>
            <button className="btn btn-primary" onClick={onReturnHome}>
                Return to Home
            </button>
        </div>
    </div>
);

export default GameFinishedPopup;