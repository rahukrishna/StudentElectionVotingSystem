import React from 'react';
import './LoginModal.css';

const LoginModal = ({ onLogin, onSecureExit, electionCompleted, onViewResults }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin();
  };

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
            <p>Click continue to start voting</p>
            
            <form onSubmit={handleSubmit} className="login-form">
              <button type="submit" className="login-button large">
                Continue to Vote
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
