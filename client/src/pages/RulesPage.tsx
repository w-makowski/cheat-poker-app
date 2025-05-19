const RulesPage: React.FC = () => {
    return (
        <div className="rules-page">
            <h1>Cheat Poker Game – Rules</h1>
            
            <section className="rules-section">
                <h2>Players</h2>
                <p>2-8 players (for one deck of cards)<br />
                For more players (9-15), using 2 or 3 decks is recommended.</p>
            </section>
            
            <section className="rules-section">
                <h2>Game Objective</h2>
                <p>Be the last player standing by avoiding losses in rounds and gaining additional cards.</p>
            </section>
            
            <section className="rules-section">
                <h2>Setup</h2>
                <ul>
                    <li>Shuffled standard deck of playing cards (52 cards)</li>
                    <li>Establish player order</li>
                </ul>
            </section>
            
            <section className="rules-section">
                <h2>Gameplay</h2>
                <h3>Starting the Game</h3>
                <ol>
                    <li>Cards are thoroughly shuffled at the beginning of each round.</li>
                    <li>In the first round, each player receives 1 card, which they don't show to other players.</li>
                    <li>The player in position #1 begins the round, then play proceeds clockwise.</li>
                </ol>
                
                <h3>Player's Turn</h3>
                <p>During their turn, a player must choose one of two actions:</p>
                <ol>
                    <li><strong>Declaration</strong> – Declare a poker hand that they believe exists among all cards on the table (combined among all players). The declared hand must be of higher value than the hand declared by the previous player.</li>
                    <li><strong>Challenge</strong> – Question the previous player's declaration, suggesting they were bluffing.</li>
                </ol>
            </section>
            
            <section className="rules-section">
                <h2>Poker Hand Hierarchy</h2>
                <p>(from lowest to highest)</p>
                <ul>
                    <li>High Card</li>
                    <li>Pair (2 cards of the same value)</li>
                    <li>Two Pairs</li>
                    <li>Three of a Kind</li>
                    <li>Straight (5 consecutive cards)</li>
                    <li>Flush (5 cards of the same suit)</li>
                    <li>Full House (Three of a Kind and a Pair)</li>
                    <li>Four of a Kind</li>
                    <li>Straight Flush (Straight of the same suit)</li>
                    <li>Royal Flush (10, J, Q, K, A of the same suit)</li>
                </ul>
            </section>
            
            <section className="rules-section">
                <h2>Round Resolution</h2>
                <p>After a "Challenge" is declared, all players reveal their cards:</p>
                <ol>
                    <li>If the declared poker hand exists among all cards on the table – the challenging player loses the round.</li>
                    <li>If the declared poker hand does not exist – the player who made the incorrect declaration loses the round.</li>
                </ol>
            </section>
            
            <section className="rules-section">
                <h2>Losing Consequences</h2>
                <ul>
                    <li>The player who loses the round receives an additional card in the next round.</li>
                    <li>A player is eliminated when they would receive their seventh card.</li>
                </ul>
            </section>
            
            <section className="rules-section">
                <h2>Subsequent Rounds</h2>
                <ol>
                    <li>After a round ends, cards are collected and shuffled.</li>
                    <li>Cards are dealt in the appropriate number to each player.</li>
                    <li>The new round is started by the next player according to the initial sequence (e.g., in the second round, the player in position #2 starts).</li>
                </ol>
            </section>
            
            <section className="rules-section">
                <h2>Victory Condition</h2>
                <p>The winner is the last player remaining in the game.</p>
            </section>
            
            <section className="rules-section">
                <h2>Additional Notes</h2>
                <ul>
                    <li>Players must remember how many cards each opponent has.</li>
                    <li>The probability of hand combinations changes with each round as players receive more cards.</li>
                    <li>Strategy involves both skillful bluffing and sensing the right moment to challenge an opponent.</li>
                </ul>
            </section>
        </div>
    );
}

export default RulesPage;
