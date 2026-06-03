import React, { useState, useEffect } from 'react';
import './VotingInterface.css';

const VotingInterface = ({ candidates, onVoteSubmit, onCancel, onSecureExit, positions, schoolInfo }) => {
  // Dynamic state for votes based on positions
  const [votes, setVotes] = useState({});
  const [currentStep, setCurrentStep] = useState(0); // Start with first position
  // Get active positions
  const activePositions = positions?.filter(pos => pos.isActive) || [];
  // Initialize votes state
  useEffect(() => {
    const initialVotes = {};
    activePositions.forEach(position => {
      initialVotes[position.id] = '';
    });
    setVotes(initialVotes);
  }, [positions]);

  // Function to show scroll transition indicator
  const showScrollIndicator = (message, icon = '📍') => {
    const indicator = document.createElement('div');
    indicator.className = 'scroll-indicator';
    indicator.innerHTML = `
      <span class="indicator-icon">${icon}</span>
      <span>${message}</span>
    `;
    
    document.body.appendChild(indicator);
    
    // Show indicator
    setTimeout(() => indicator.classList.add('show'), 100);
    
    // Hide and remove indicator
    setTimeout(() => {
      indicator.classList.remove('show');
      setTimeout(() => {
        if (document.body.contains(indicator)) {
          document.body.removeChild(indicator);
        }
      }, 300);
    }, 1500);
  };

  // Function to scroll to the start of the voting section so heading + candidates are visible
  const scrollToCandidates = () => {
    const scrollOnce = () => {
      const sectionTitle = document.querySelector('.voting-section h2');
      const candidatesGrid = document.querySelector('.voting-section .candidates-grid');
      const targetElement = sectionTitle || candidatesGrid;

      if (!targetElement) {
        return false;
      }

      const rect = targetElement.getBoundingClientRect();
      const pageTop = window.pageYOffset || document.documentElement.scrollTop;
      const header = document.querySelector('.app-header');
      const headerHeight = header ? header.getBoundingClientRect().height : 0;
      const extraTopPadding = window.innerWidth <= 768 ? 64 : 78;
      const topOffset = headerHeight + extraTopPadding;
      const targetTop = Math.max(0, rect.top + pageTop - topOffset);

      window.scrollTo({
        top: targetTop,
        behavior: 'smooth'
      });

      return true;
    };

    // Retry to handle async layout shifts (images/fonts).
    [120, 420, 900].forEach(delay => {
      setTimeout(() => {
        scrollOnce();
      }, delay);
    });
  };

  // Function to scroll to action buttons
  const scrollToActionButtons = () => {
    setTimeout(() => {
      const actionButtons = document.querySelector('.voting-actions');
      if (actionButtons) {
        actionButtons.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest' 
        });
      }
    }, 300);
  };

  // Function to show selection toast
  const showSelectionToast = (candidateName, positionName) => {
    const toast = document.createElement('div');
    toast.className = 'selection-toast';
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-icon">✅</span>
        <div class="toast-text">
          <strong>${candidateName}</strong>
          <small>Selected for ${positionName}</small>
        </div>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Hide and remove toast
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 2000);
  };

  // Auto-scroll functionality
  useEffect(() => {
    // Scroll to candidates section when step changes
    scrollToCandidates();
  }, [currentStep]);  // Enhanced candidate selection with auto-scroll and animation
  const handleCandidateSelect = (positionId, candidateId) => {
    // Update votes state
    setVotes(prev => ({
      ...prev,
      [positionId]: candidateId
    }));

    // Add selection animation
    const candidateCard = document.querySelector(`[data-candidate-id="${candidateId}"]`);
    if (candidateCard) {
      candidateCard.classList.add('candidate-selected-animation');
      setTimeout(() => {
        candidateCard.classList.remove('candidate-selected-animation');
      }, 600);
    }

    const position = activePositions.find(p => p.id === positionId);
    const candidate = candidates[positionId]?.find(c => c.id === parseInt(candidateId));
    
    if (candidate && position) {
      showSelectionToast(candidate.name, position.displayName);
      scrollToActionButtons();
    }
  };
  // Navigation functions
  const handleNext = () => {
    if (currentStep < activePositions.length - 1) {
      const currentPosition = activePositions[currentStep];
      
      if (!votes[currentPosition.id]) {
        alert(`Please select a candidate for ${currentPosition.displayName}`);
        return;
      }
      
      setCurrentStep(currentStep + 1);
      const nextPosition = activePositions[currentStep + 1];
      showScrollIndicator(`Moving to ${nextPosition.displayName} selection`, '➡️');
      scrollToCandidates();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      const prevPosition = activePositions[currentStep - 1];
      showScrollIndicator(`Returning to ${prevPosition.displayName} selection`, '⬅️');
      scrollToCandidates();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all positions have selections
    const missingPositions = activePositions.filter(position => !votes[position.id]);
    if (missingPositions.length > 0) {
      const missingNames = missingPositions.map(p => p.displayName).join(', ');
      alert(`Please select candidates for: ${missingNames}`);
      return;
    }

    // Format votes for submission
    const formattedVotes = {};
    activePositions.forEach(position => {
      formattedVotes[position.id] = parseInt(votes[position.id]);
    });

    // Create confirmation message
    const confirmationMessage = `Confirm your votes:\n\n${activePositions.map(position => {
      const candidate = candidates[position.id]?.find(c => c.id === parseInt(votes[position.id]));
      return `${position.displayName}: ${candidate?.name || 'Unknown'}`;
    }).join('\n')}\n\nAre you sure you want to submit these votes?`;

    if (window.confirm(confirmationMessage)) {
      onVoteSubmit(formattedVotes);
    }
  };

  if (!activePositions.length) {
    return (
      <div className="voting-interface">
        <div className="no-positions-message">
          <h2>No Active Positions</h2>
          <p>There are currently no active positions available for voting.</p>
          <button onClick={onCancel} className="back-button">
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }  const currentPosition = activePositions[currentStep];
  const currentCandidates = candidates[currentPosition?.id] || [];
  
  // Debug logs for troubleshooting
  console.log('VotingInterface render:', { 
    currentStep, 
    currentPosition, 
    activePositions, 
    votes,
    currentPositionVote: votes[currentPosition?.id],
    buttonDisabled: !votes[currentPosition?.id]
  });

  console.log('Render state:', { 
    currentStep, 
    currentPosition, 
    currentCandidates: currentCandidates.length, 
    votes,
    currentVote: votes[currentPosition?.id]
  }); // Debug log

  return (
    <div className="voting-interface">      <div className="voting-header">
        <h1>🗳️ {schoolInfo?.name || 'School'} Election Voting</h1>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentStep + 1) / activePositions.length) * 100}%` }}
          ></div>
        </div>
        <div className="step-indicator">
          Step {currentStep + 1} of {activePositions.length}: {currentPosition?.displayName}
        </div>
      </div>

      <div className="voting-section">
        <div className="requirement-note" role="alert">
          ⚠️ Important: Do not close or refresh the browser until voting is fully completed. Closing early can cause vote data loss.
        </div>
        <h2>Select {currentPosition?.displayName}</h2>
        
        <div className="candidates-grid">
          {currentCandidates.map(candidate => (
            <div 
              key={candidate.id}
              data-candidate-id={candidate.id}
              className={`candidate-card ${votes[currentPosition.id] === candidate.id.toString() ? 'selected' : ''}`}
              onClick={() => handleCandidateSelect(currentPosition.id, candidate.id.toString())}
            >
              <div className="candidate-symbol-section">
                <div className="candidate-symbol">
                  {candidate.symbol || '❓'}
                </div>
              </div>
              <div className="candidate-image">
                {candidate.image ? (
                  <img src={candidate.image} alt={candidate.name} />
                ) : (
                  <div className="placeholder-image">
                    {candidate.name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
              </div>
              <div className="candidate-info">
                <h3>{candidate.name}</h3>
                <p className="grade">Grade: {candidate.grade}</p>
                <div className="symbol-info">
                  <span className="symbol-label">SYMBOL:</span>
                  <span className="symbol-badge">{candidate.symbol || '❓'}</span>
                </div>
                <div className="selection-indicator">
                  {votes[currentPosition.id] === candidate.id.toString() && <span className="checkmark">✓</span>}
                </div>
              </div>
            </div>
          ))}
        </div>        <div className="voting-actions">
          {currentStep > 0 && (
            <button onClick={handleBack} className="back-button">
              ⬅️ Back to Previous
            </button>
          )}
          
          {currentStep < activePositions.length - 1 ? (
            <button 
              onClick={handleNext} 
              className="next-button"
              disabled={!votes[currentPosition?.id] || votes[currentPosition?.id] === ''}
              style={{
                opacity: (!votes[currentPosition?.id] || votes[currentPosition?.id] === '') ? 0.5 : 1,
                cursor: (!votes[currentPosition?.id] || votes[currentPosition?.id] === '') ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>Continue to {activePositions[currentStep + 1]?.displayName || 'Next'}</span>
              <span>➡️</span>
            </button>
          ) : (
            <button onClick={handleSubmit} className="submit-button">
              ✅ Submit Vote
            </button>
          )}
        </div>

        <div className="vote-summary">
          <h3>Your Selections:</h3>
          {activePositions.map((position, index) => {
            const selectedCandidate = candidates[position.id]?.find(c => 
              c.id === parseInt(votes[position.id])
            );
            return (
              <div key={position.id} className="summary-item">
                <strong>{position.displayName}:</strong> 
                {selectedCandidate ? selectedCandidate.name : 'Not selected yet'}
                {index <= currentStep && selectedCandidate && <span className="checkmark"> ✓</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="voting-footer">
        <button onClick={onSecureExit} className="secure-exit-button">
          🔒 Secure Exit
        </button>
        <button onClick={onCancel} className="cancel-button">
          ❌ Cancel Voting
        </button>
      </div>
    </div>
  );
};

export default VotingInterface;
