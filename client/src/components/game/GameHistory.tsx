import React from 'react';

interface GameHistoryProps {
    history: string[];
}

const GameHistory: React.FC<GameHistoryProps> = ({ history }) => {
    return (
        <div className="game-history">
            <h3>Game Log</h3>
            <div className="game-history-log">
                {history.length === 0 ? (
                    <p className="text-muted">No actions yet.</p>
                ) : (
                    history.map((entry, index) => (
                        <p key={index} className="game-history-entry">{entry}</p>
                    ))
                )}
            </div>
        </div>
    );
};

export default GameHistory;
