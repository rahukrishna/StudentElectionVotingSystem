import React, { useState } from 'react';
import './LoginModal.css';

const LoginModal = ({ onLogin, onSecureExit, electionCompleted, onViewResults }) => {
  const [studentId, setStudentId] = useState('');
  const [showAllIds, setShowAllIds] = useState(false);

  // Function to handle student ID selection with auto-scroll
  const handleIdSelect = (id) => {
    setStudentId(id);
    
    // Auto-scroll to the continue button after selection
    setTimeout(() => {
      const continueButton = document.querySelector('.login-form button[type="submit"]');
      if (continueButton) {
        continueButton.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
        
        // Add highlight effect to the button
        continueButton.classList.add('highlight-button');
        setTimeout(() => {
          continueButton.classList.remove('highlight-button');
        }, 1500);
      }
    }, 100);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (studentId.trim()) {
      const success = onLogin(studentId.trim());
      if (success) {
        setStudentId('');
      }
    } else {
      alert('Please enter your Student ID');
    }
  };  return (
    <div className="login-modal">
      <div className={`login-container ${electionCompleted ? 'election-completed-container' : ''}`}>        {electionCompleted ? (
          <div className="election-completed-login">
            <h2>🏆 Election Completed</h2>
            <div className="completion-message">
              <p>The election has been <strong>successfully completed</strong> and voting is now closed.</p>
              <p>You can view the final results using the navigation menu above or the button below.</p>
            </div>
            <div className="completed-actions">              <button 
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
          </div>) : (
          <>
            <h2>🗳️ Student Login</h2>
            <p>Enter your Student ID to cast your vote</p>
            
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="studentId">Student ID:</label>
                <input
                  type="text"
                  id="studentId"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                  placeholder="Enter your Student ID (e.g., STD0101)"
                  maxLength={7}
                  required
                />
              </div>
              <button type="submit" className="login-button">
                Continue to Vote
              </button>
            </form>

            <div className="info-section">
              <h3>Student ID Format:</h3>
              <div className="id-format-info">
                <p><strong>Format:</strong> STD + Class + Student Number</p>
                <p><strong>Example:</strong> STD0101 = 1st Standard, Student 01</p>
                <p><strong>Range:</strong> STD0101 to STD1030 (Classes 1-10, Students 01-30)</p>              </div>
              <ul>
                <li>Each student can vote only once</li>
                <li>You must vote for both positions</li>
                <li>Your vote is anonymous and secure</li>
              </ul>
            </div>
              <div className="all-ids-section">
                <button 
                  type="button"
                  className="toggle-ids-btn"
                  onClick={() => setShowAllIds(!showAllIds)}
                >
                  {showAllIds ? 'Hide All Student IDs' : 'Show All Valid Student IDs'}
                </button>
                
                {showAllIds && (
                  <div className="all-ids-container">
                    <div className="ids-grid">
                      {Array.from({length: 10}, (_, classIndex) => (
                        <div key={classIndex} className="class-group">
                          <h5>Class {classIndex + 1}</h5>
                          <div className="class-ids">
                            {Array.from({length: 30}, (_, studentIndex) => {
                              const classCode = (classIndex + 1).toString().padStart(2, '0');
                              const studentCode = (studentIndex + 1).toString().padStart(2, '0');
                              const id = `STD${classCode}${studentCode}`;
                              return (
                                <span 
                                  key={id}
                                  className="student-id"
                                  onClick={() => handleIdSelect(id)}
                                >
                                  {id}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
