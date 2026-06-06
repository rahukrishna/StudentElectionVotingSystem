import React from 'react';
import './LoginModal.css';

const LoginModal = ({
  onLogin,
  onStartElection,
  onSecureExit,
  electionCompleted,
  onViewResults,
  electionStarted,
  isStartingElection,
  startCountdown,
  electionStartMessage,
  totalVotedStudents,
  totalEligibleStudents
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin();
  };

  const votingClosedByLimit = totalVotedStudents >= totalEligibleStudents;
  const showStartElectionButton = !electionStarted && totalVotedStudents === 0;

  return (
    <div className="login-modal">
      <div className={`login-container ${electionCompleted ? 'election-completed-container' : ''}`}>
        {electionCompleted ? (
          <div className="election-completed-login">
            <h2>🏆 Election Completed</h2>
            <div className="completion-message">
              <p>The election has been <strong>successfully completed</strong> and voting is now closed.</p>
              <p>You can view the final results using the navigation menu above or the button below.</p>
            </div>
            <div className="completed-actions">
              <button 
                className="view-results-btn"
                onClick={() => {
                  // Use the callback to trigger results password dialog
                  if (onViewResults) {
                    onViewResults();
                  } else {
                    // Fallback to the custom event
                    window.dispatchEvent(new CustomEvent('navigate-to-results'));
                  }
                }}
              >
                📊 View Final Results
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2>🗳️ Student Login</h2>
            <p>
              {showStartElectionButton
                ? 'Start the election first, then allow students to vote.'
                : 'Click continue to start voting.'}
            </p>
            <div className="login-warning-note">
              ⚠️ Do not close or refresh the browser until election voting is completed. Closing early may cause data loss.
            </div>

            {showStartElectionButton && (
              <div className="start-election-panel">
                <button
                  type="button"
                  className="start-election-button"
                  onClick={onStartElection}
                  disabled={isStartingElection}
                >
                  {isStartingElection && startCountdown
                    ? `Starting in ${startCountdown}...`
                    : '🚀 Start Election'}
                </button>
                {isStartingElection && <p className="start-election-hint">Preparing secure voting session...</p>}
              </div>
            )}

            {electionStartMessage && <p className="election-started-message">✅ {electionStartMessage}</p>}

            {votingClosedByLimit && (
              <div className="voting-closed-message">
                🏁 All students have voted. Voting is now closed.
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="login-form">
              <button
                type="submit"
                className="login-button large"
                disabled={showStartElectionButton || isStartingElection || votingClosedByLimit}
              >
                {votingClosedByLimit ? 'Voting Closed' : 'Continue to Vote'}
              </button>
            </form>

            <div className="info-section">
              <h3>Voting Instructions:</h3>
              <ul>
                <li>Press Continue to enter the voting screen</li>
                <li>You must vote for both positions</li>
                <li>Your vote is anonymous and secure</li>
              </ul>
            </div>
          </>
        )}

        {onSecureExit && (
          <button type="button" onClick={onSecureExit} className="secure-exit-button">
            Secure Exit
          </button>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
