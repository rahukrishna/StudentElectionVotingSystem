import React, { useState } from 'react';
import './LoginModal.css';

const LoginModal = ({ onLogin, onSecureExit, electionCompleted, onViewResults }) => {
  const [selectedGrade, setSelectedGrade] = useState('5');
  const [rollNumber, setRollNumber] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({
      grade: selectedGrade,
      rollNumber
    });
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
            <p>Only students from Class 5 to Class 10 can vote.</p>
            
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="grade">Class</label>
                <select
                  id="grade"
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  required
                >
                  {[5, 6, 7, 8, 9, 10].map(grade => (
                    <option key={grade} value={grade}>{`Class ${grade}`}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="rollNumber">Roll Number (optional)</label>
                <input
                  id="rollNumber"
                  type="text"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="Enter roll number"
                  maxLength={20}
                />
              </div>

              <button type="submit" className="login-button large">
                Continue to Vote
              </button>
            </form>

            <div className="info-section">
              <h3>Voting Instructions:</h3>
              <ul>
                <li>Select class between 5 and 10, then press Continue</li>
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
