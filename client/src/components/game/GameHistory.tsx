import React, { useEffect, useRef } from 'react';

interface GameHistoryProps {
    history: string[];
}

const GameHistory: React.FC<GameHistoryProps> = ({ history }) => {
    const lastEntryRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    if (lastEntryRef.current) {
      lastEntryRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

    return (
        <div className="game-history">
            <h3>Game Log</h3>
            <div className="game-history-log">
                {history.length === 0 ? (
                    <p className="text-muted">No actions yet.</p>
                ) : (
                    history.map((entry, index) => {
                        const isLast = index === history.length - 1;
                        const isHighlight = entry.toLowerCase().includes('round started');
                        return (
                        <p key={index} ref={isLast ? lastEntryRef : null} className={`game-history-entry ${isHighlight ? 'highlight-round' : ''}`}>
                            {entry}
                        </p>
                    )})
                )}
            </div>
        </div>
    );
};

export default GameHistory;
