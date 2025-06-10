import React from 'react';

interface Player {
    id: string;
    username: string;
    position: number;
    cardsCount: number;
    isActive: boolean;
    isHost: boolean;
    ready?: boolean;
}

interface PlayerListProps {
    players: Player[];
    currentPlayerId: string;
    activePlayerId?: string;
    isHost?: boolean;
    onKickPlayer?: (playerId: string) => void;
    gameStatus?: string;
}

const PlayerList: React.FC<PlayerListProps> = ({
                                                   players,
                                                   currentPlayerId,
                                                   activePlayerId,
                                                   isHost,
                                                   onKickPlayer,
                                                   gameStatus,
                                               }) => {
    const sortedPlayers = [...players].sort((a, b) => a.position - b.position);

    return (
        <div className="player-list">
            <h3>Players</h3>
            <div className="players">
                {sortedPlayers.map((player) => (
                    <div
                        key={player.id}
                        className={
                            'player-item' +
                            (player.id === currentPlayerId ? ' current-player' : '') +
                            (player.id === activePlayerId ? ' active-turn' : '') +
                            (!player.isActive ? ' inactive' : '')
                        }
                        style={{
                            opacity: !player.isActive ? 0.5 : 1,
                            color: !player.isActive ? '#aaa' : player.id === activePlayerId ? '#2196f3' : undefined,
                            fontWeight: player.id === activePlayerId ? 'bold' : undefined,
                        }}
                    >
                        <div className="player-name">
                            {player.username}
                            {player.isHost && <span className="host-badge">Host</span>}
                            {player.id === currentPlayerId && <span className="you-badge">You</span>}
                            {!player.isHost && gameStatus !== 'active' && (
                                <span style={{ marginLeft: 8 }}>
                                    {player.ready ? '✅ Ready' : '❌ Not Ready'}
                                </span>
                            )}
                            {isHost && onKickPlayer && !player.isHost && player.id !== currentPlayerId && gameStatus !== 'active' && (
                                <button
                                    className="kick-btn"
                                    onClick={() => onKickPlayer(player.id)}
                                    style={{ marginLeft: 8 }}
                                >
                                    Kick
                                </button>
                            )}
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