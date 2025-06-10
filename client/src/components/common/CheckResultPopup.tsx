import React from 'react';
import CardSprite from '../game/CardSprite';
import type {CheckResult} from "../../types/game";


interface Props {
    checkResult: CheckResult;
    currentPlayerName: string;
    checkedPlayerName: string;
    onClose: () => void;
}

const CheckResultPopup: React.FC<Props> = ({
                                               checkResult,
                                               currentPlayerName,
                                               checkedPlayerName,
                                               onClose,
                                           }) => (
    <div className="popup-overlay">
        <div className="popup-content">
            <h2>RESULT CHECK</h2>
            <p>
                Checked Hand: {checkResult.checkedHand?.hand.replace(/_/g, ' ')}
                {checkResult.checkedHand?.ranks?.length
                    ? ` (${checkResult.checkedHand.ranks.join(', ')})`
                    : ''}
            </p>
            <p>
                Result: {checkResult.isBluffing ? 'False' : 'True'}<br></br>
                {checkResult.isBluffing
                    ? `${checkedPlayerName} gets a penalty card`
                    : `${currentPlayerName} gets a penalty card`}
            </p>
            <ul>
                {checkResult.players.map((player) => (
                    <li key={player.id}>
                        {player.username}:
                        <div className="cards-container">
                            {player.cards.map((card, idx) => (
                                <CardSprite key={idx} rank={card.rank} suit={card.suit} value={card.rank} />
                            ))}
                        </div>
                    </li>
                ))}
            </ul>
            <button className="btn btn-primary" onClick={onClose}>Close</button>
        </div>
    </div>
);

export default CheckResultPopup;