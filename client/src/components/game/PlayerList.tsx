import React from 'react';

interface Player {
    id: string;
    username: string;
    position: number;
    cardsCount: number;
    isActive: boolean;
    isHost: boolean;
}

interface PlayerListProps {
    players: Player[];
    currentTurn: number;
    currentPlayerId: string;
}

const PlayerList: React.FC<PlayerListProps> = ({players, currentTurn, currentPlayerId}) => {
    // Sort players by position
    const sortedPlayers = [...players].sort((a, b) => a.position - b.position);
  
    return (
        <div className="player-list">
            <h3>Players</h3>
            <div className="players">
            {sortedPlayers.map((player) => (
                <div 
                key={player.id}
                className={`player-item ${player.id === currentPlayerId ? 'current-player' : ''} 
                ${players[currentTurn]?.id === player.id ? 'active-turn' : ''} ${!player.isActive ? 'inactive' : ''}`}
                >
                <div className="player-name">
                    {player.username}
                    {player.isHost && <span className="host-badge">Host</span>}
                    {player.id === currentPlayerId && <span className="you-badge">You</span>}
                </div>
                <div className="player-stats">
                    <span className="cards-count">{player.cardsCount} cards</span>
                    {!player.isActive && <span className="status-inactive">Out</span>}
                </div>
                </div>
            ))}
            </div>
        </div>
    );
};
  
export default PlayerList;
