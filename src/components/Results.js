import React, { useState, useEffect } from 'react';
import './Results.css';

const Results = ({ candidates, votes, positions, totalVotedStudents, electionCompleted, resultsPublished, tieBreakerResults, setTieBreakerResults, onCompleteElection, onDeclareResults, schoolInfo }) => {
  // School name - can be configured or from environment variable
  const SCHOOL_NAME = schoolInfo?.fullName || process.env.REACT_APP_SCHOOL_NAME || 'Bharathiya Vidya Bhavan, Valanchery';
  
  const calculatePercentage = (candidateVotes, totalVotes) => {
    if (totalVotes === 0) return 0;
    return ((candidateVotes / totalVotes) * 100).toFixed(1);
  };

  const getTotalVotes = (position) => {
    return Object.values(votes[position] || {}).reduce((sum, count) => sum + count, 0);
  };

  // Enhanced getWinner: returns array of winnerIds if tie, and maxVotes
  const getWinner = (position) => {
    const positionVotes = votes[position] || {};
    let maxVotes = 0;
    let winnerIds = [];

    Object.entries(positionVotes).forEach(([candidateId, voteCount]) => {
      if (voteCount > maxVotes) {
        maxVotes = voteCount;
        winnerIds = [parseInt(candidateId)];
      } else if (voteCount === maxVotes && maxVotes > 0) {
        winnerIds.push(parseInt(candidateId));
      }
    });

    return { winnerIds, maxVotes };
  };

  // Tie-breaker state - now uses persistent state from App component
  const [tieBreaker, setTieBreaker] = useState(tieBreakerResults || {});

  // Sync tie-breaker state with parent component
  useEffect(() => {
    setTieBreakerResults(tieBreaker);
  }, [tieBreaker, setTieBreakerResults]);

  // Update local state when tieBreakerResults prop changes
  useEffect(() => {
    setTieBreaker(tieBreakerResults || {});
  }, [tieBreakerResults]);

  // Admin password - matches the admin tab password
  const ADMIN_PASSWORD = 'SecureAdmin2024!';

  const handleTieBreakerStart = (position) => {
    setTieBreaker(prev => ({
      ...prev,
      [position]: { show: true, password: '', error: '', selected: null, decided: false, winnerId: null, method: '', spinning: false }
    }));
  };

  const handlePasswordChange = (position, value) => {
    setTieBreaker(prev => ({
      ...prev,
      [position]: { ...prev[position], password: value, error: '' }
    }));
  };

  const handlePasswordSubmit = (position) => {
    if (tieBreaker[position].password === ADMIN_PASSWORD) {
      setTieBreaker(prev => ({
        ...prev,
        [position]: { ...prev[position], error: '', show: true, passwordAccepted: true }
      }));
    } else {
      setTieBreaker(prev => ({
        ...prev,
        [position]: { ...prev[position], error: 'Incorrect password', passwordAccepted: false }
      }));
    }
  };

  const handleTieBreakerMethodSelect = (position, method) => {
    setTieBreaker(prev => ({
      ...prev,
      [position]: { ...prev[position], method: method }
    }));
  };

  const handleTieBreakerVote = (position, candidateId) => {
    setTieBreaker(prev => ({
      ...prev,
      [position]: { ...prev[position], selected: candidateId, decided: true, winnerId: candidateId }
    }));
  };

  const handleSpinWheel = (position, tiedCandidates) => {
    setTieBreaker(prev => ({
      ...prev,
      [position]: { ...prev[position], spinning: true }
    }));

    // Simulate spinning for 3-5 seconds
    const spinDuration = 3000 + Math.random() * 2000; // 3-5 seconds
    
    setTimeout(() => {
      // Randomly select a winner from tied candidates
      const randomIndex = Math.floor(Math.random() * tiedCandidates.length);
      const selectedWinner = tiedCandidates[randomIndex];

      setTieBreaker(prev => ({
        ...prev,
        [position]: { 
          ...prev[position], 
          spinning: false, 
          selected: selectedWinner.id, 
          decided: true, 
          winnerId: selectedWinner.id,
          spinResult: selectedWinner.name
        }
      }));
    }, spinDuration);
  };

  // Check if final results are available (no ties or all ties resolved)
  const getFinalResultsStatus = () => {
    const activePositions = positions?.filter(pos => pos.isActive) || [];
    let allResolved = true;
    let hasResults = false;
    let hasTies = false;

    activePositions.forEach(position => {
      const { winnerIds, maxVotes } = getWinner(position.id);
      const isTie = winnerIds.length > 1 && maxVotes > 0;
      const tieState = tieBreaker[position.id];
      
      if (maxVotes > 0) {
        hasResults = true;
        // A tie is unresolved if there's a tie and no tie-breaker decision has been made
        if (isTie && !tieState?.decided) {
          allResolved = false;
          hasTies = true;
        }
      }
    });

    return { allResolved, hasResults, hasTies };
  };

  // Export results as CSV
  const exportResults = () => {
    const activePositions = positions?.filter(pos => pos.isActive) || [];

    let csvContent = `SCHOOL ELECTION RESULTS - ${SCHOOL_NAME}\n`;
    csvContent += `Generated on: ${new Date().toLocaleString()}\n\n`;
    csvContent += 'Position,Candidate Name,Grade,Votes,Percentage,Status\n';

    activePositions.forEach(position => {
      const positionCandidates = candidates[position.id] || [];
      const { winnerIds, maxVotes } = getWinner(position.id);
      const totalVotes = getTotalVotes(position.id);
      const tieState = tieBreaker[position.id];
      const finalWinnerId = tieState?.decided ? tieState.winnerId : 
        (winnerIds.length === 1 ? winnerIds[0] : null);

      const sortedCandidates = positionCandidates
        .map(candidate => ({
          ...candidate,
          votes: votes[position.id]?.[candidate.id] || 0
        }))
        .sort((a, b) => b.votes - a.votes);

      sortedCandidates.forEach(candidate => {
        const percentage = calculatePercentage(candidate.votes, totalVotes);
        let status = 'Candidate';
        if (candidate.id === finalWinnerId) {
          if (tieState?.decided) {
            status = tieState.method === 'wheel' 
              ? 'Winner (Tie-breaker: Spinning Wheel)' 
              : 'Winner (Tie-breaker: Admin Selection)';
          } else {
            status = 'Winner';
          }
        }
        csvContent += `"${position.displayName}","${candidate.name}","${candidate.grade}",${candidate.votes},"${percentage}%","${status}"\n`;
      });
    });

    // Add summary statistics
    csvContent += '\nSUMMARY STATISTICS\n';
    csvContent += `Total Students Voted,${totalVotedStudents}\n`;
    
    activePositions.forEach(position => {
      csvContent += `${position.displayName} Total Votes,${getTotalVotes(position.id)}\n`;
    });
    
    csvContent += `Export Date,"${new Date().toLocaleString()}"\n`;

    // Add tie-breaker information if any occurred
    const tieBreakerInfo = activePositions.filter(position => {
      const tieState = tieBreaker[position.id];
      return tieState?.decided;
    });

    if (tieBreakerInfo.length > 0) {
      csvContent += '\nTIE-BREAKER INFORMATION\n';
      tieBreakerInfo.forEach(position => {
        const tieState = tieBreaker[position.id];
        const method = tieState.method === 'wheel' ? 'Spinning Wheel (Random Selection)' : 'Admin Manual Selection';
        csvContent += `"${position.displayName}","Tie-breaker Method: ${method}"\n`;
        const winnerCandidate = candidates[position.id]?.find(c => c.id === tieState.winnerId);
        csvContent += `"${position.displayName}","Selected Winner: ${winnerCandidate?.name || 'Unknown'}"\n`;
      });
    }

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      const schoolNameForFile = SCHOOL_NAME.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      link.setAttribute('download', `${schoolNameForFile}-election-results-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  // Print results
  const printResults = () => {
    const printWindow = window.open('', '_blank');
    const activePositions = positions?.filter(pos => pos.isActive) || [];

    let printContent = `
      <html>
        <head>
          <title>Election Results</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .title { font-size: 2em; color: #333; margin-bottom: 5px; }
            .subtitle { font-size: 1.5em; color: #667eea; margin-bottom: 10px; }
            .stats { display: flex; justify-content: space-around; margin: 20px 0; }
            .stat-box { text-align: center; padding: 15px; border: 2px solid #ddd; border-radius: 8px; }
            .position { margin: 30px 0; }
            .position-title { font-size: 1.5em; color: #667eea; margin-bottom: 15px; }
            .winner-box { background: #fff9e6; border: 2px solid #ffd700; padding: 15px; margin: 15px 0; border-radius: 8px; }
            .candidate-row { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee; }
            .candidate-info { flex: 1; }
            .vote-info { text-align: right; }
            .tie-breaker-summary { margin: 30px 0; }
            .section-title { font-size: 1.3em; color: #8e44ad; margin-bottom: 15px; }
            .tie-info-box { background: #f8f9fa; border: 1px solid #dee2e6; padding: 15px; margin: 10px 0; border-radius: 8px; }
            .footer { margin-top: 40px; text-align: center; font-size: 0.9em; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">🗳️ ${SCHOOL_NAME}</h1>
            <h2 class="subtitle">School Election Results</h2>
            <p>Total Students Voted: ${totalVotedStudents}</p>
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>
          
          <div class="stats">
            ${activePositions.map(position => `
              <div class="stat-box">
                <strong>${getTotalVotes(position.id)}</strong><br>
                ${position.displayName} Votes
              </div>
            `).join('')}
          </div>
    `;

    // Add each position's results
    activePositions.forEach(position => {
      const positionCandidates = candidates[position.id] || [];
      const { winnerIds, maxVotes } = getWinner(position.id);
      const tieState = tieBreakerResults[position.id];
      
      printContent += `
        <div class="position">
          <h3 class="position-title">${position.displayName}</h3>
      `;

      // Show winner or tie status
      if (tieState?.decided) {
        const winner = positionCandidates.find(c => c.id === tieState.winnerId);
        printContent += `
          <div class="winner-box">
            <strong>🏆 Winner: ${winner?.name || 'Unknown'}</strong><br>
            ${maxVotes} votes (${calculatePercentage(maxVotes, getTotalVotes(position.id))}%)
            <br><small>Tie resolved by administrator</small>
          </div>
        `;
      } else if (winnerIds.length === 1) {
        const winner = positionCandidates.find(c => c.id === winnerIds[0]);
        printContent += `
          <div class="winner-box">
            <strong>🏆 Winner: ${winner?.name || 'Unknown'}</strong><br>
            ${maxVotes} votes (${calculatePercentage(maxVotes, getTotalVotes(position.id))}%)
          </div>
        `;
      } else if (winnerIds.length > 1) {
        const tiedCandidates = positionCandidates.filter(c => winnerIds.includes(c.id));
        printContent += `
          <div class="winner-box" style="background: #fff0f0; border-color: #ff6b6b;">
            <strong>⚖️ Tie between:</strong><br>
            ${tiedCandidates.map(c => c.name).join(', ')}<br>
            ${maxVotes} votes each (${calculatePercentage(maxVotes, getTotalVotes(position.id))}% each)
          </div>
        `;
      }

      // Show all candidates' results
      positionCandidates
        .sort((a, b) => (votes[position.id]?.[b.id] || 0) - (votes[position.id]?.[a.id] || 0))
        .forEach(candidate => {
          const candidateVotes = votes[position.id]?.[candidate.id] || 0;
          const percentage = calculatePercentage(candidateVotes, getTotalVotes(position.id));
          
          printContent += `
            <div class="candidate-row">
              <div class="candidate-info">
                <strong>${candidate.name}</strong><br>
                <small>${candidate.class} - ${candidate.house}</small>
              </div>
              <div class="vote-info">
                <strong>${candidateVotes} votes</strong><br>
                <small>${percentage}%</small>
              </div>
            </div>
          `;
        });

      printContent += `</div>`;
    });

    // Add tie-breaker summary if any
    const tiePositions = Object.keys(tieBreakerResults);
    if (tiePositions.length > 0) {
      printContent += `
        <div class="tie-breaker-summary">
          <h3 class="section-title">Tie-Breaker Summary</h3>
      `;
      
      tiePositions.forEach(positionId => {
        const position = positions.find(p => p.id === positionId);
        const tieState = tieBreakerResults[positionId];
        const winner = candidates[positionId]?.find(c => c.id === tieState.winnerId);
        
        printContent += `
          <div class="tie-info-box">
            <strong>${position?.displayName || 'Unknown Position'}</strong><br>
            Resolved in favor of: <strong>${winner?.name || 'Unknown'}</strong><br>
            <small>Decision made by administrator</small>
          </div>
        `;
      });
      
      printContent += `</div>`;
    }

    printContent += `
          <div class="footer">
            <p>This is an official election results document.</p>
            <p>Generated by ${SCHOOL_NAME} Election System</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  // Print certificate for winners
  const printCertificate = (positionId) => {
    const position = positions.find(p => p.id === positionId);
    if (!position) {
      alert('Invalid position for certificate');
      return;
    }

    // Get the winner for this position
    const { winnerIds, maxVotes } = getWinner(positionId);
    const tieState = tieBreakerResults[positionId];
    const winnerId = tieState?.decided ? tieState.winnerId : 
      (winnerIds.length === 1 ? winnerIds[0] : null);

    if (!winnerId) {
      alert('No winner determined for this position yet');
      return;
    }

    const winner = candidates[positionId]?.find(c => c.id === winnerId);
    if (!winner) {
      alert('Winner candidate not found');
      return;
    }

    const printWindow = window.open('', '_blank');
    
    // Certificate HTML with embedded styles
    const certificateHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Certificate - ${winner.name}</title>          <style>
            body { margin: 0; padding: 15px; font-family: 'Times New Roman', serif; background: #f5f5f5; }
            .certificate { 
              background: white; 
              border: 8px double #2c3e50; 
              padding: 35px; 
              margin: 15px auto; 
              width: 90%; 
              max-width: 750px;
              text-align: center; 
              box-shadow: 0 0 20px rgba(0,0,0,0.1);
              box-sizing: border-box;
            }
            .school-name { font-size: 2.2em; font-weight: bold; color: #2c3e50; margin-bottom: 10px; }
            .certificate-title { font-size: 1.8em; color: #e74c3c; margin: 20px 0; letter-spacing: 3px; }
            .certificate-text { font-size: 1.2em; margin: 15px 0; color: #34495e; }
            .winner-name { font-size: 2.5em; color: #27ae60; font-weight: bold; margin: 25px 0; text-transform: uppercase; }
            .position-title { font-size: 1.8em; color: #8e44ad; font-weight: bold; margin: 20px 0; }
            .decorative-element { font-size: 2.5em; color: #f39c12; margin: 10px 0; }
            .achievement-text { font-size: 1.1em; color: #27ae60; font-weight: bold; margin: 15px 0; }
            @media print {
              body { 
                background: white; 
                padding: 10mm; 
                margin: 0; 
                width: 100%;
                box-sizing: border-box;
              }
              .certificate { 
                box-shadow: none; 
                border: 6px double #2c3e50; 
                width: 100%; 
                max-width: none; 
                padding: 25px; 
                page-break-inside: avoid; 
                margin: 0;
                box-sizing: border-box;
              }
              @page { 
                margin: 15mm; 
                size: letter; 
              }
            }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="certificate-header">
              <div class="school-name">${SCHOOL_NAME}</div>
              <div class="decorative-element">🏆</div>
            </div>
            
            <div class="certificate-title">CERTIFICATE OF EXCELLENCE</div>
            
            <div class="certificate-text">This is to certify that</div>
            
            <div class="winner-name">${winner.name}</div>
            
            <div class="certificate-text">of Grade <strong>${winner.grade}</strong></div>
            
            <div class="achievement-text">has been elected as the</div>
            
            <div class="position-title">${position.emoji || '🏆'} ${position.displayName}</div>
            
            <div class="certificate-text">in the School Election held on <strong>${new Date().toLocaleDateString()}</strong></div>
            
            <div class="decorative-element">🌟</div>
            
            <div class="certificate-text">This certificate is awarded in recognition of the trust and confidence placed by fellow students.</div>
              <div style="margin-top: 40px; display: flex; justify-content: space-between; align-items: end; flex-wrap: wrap; gap: 10px;">
              <div style="text-align: left; flex: 1; min-width: 150px;">
                <div style="border-top: 2px solid #2c3e50; width: 120px; margin-bottom: 5px;"></div>
                <div style="font-size: 0.9em;">Principal</div>
              </div>
              <div style="text-align: center; flex: 1; min-width: 100px;">
                <div style="font-size: 0.8em; color: #7f8c8d;">${new Date().toLocaleDateString()}</div>
                <div style="font-size: 0.8em; color: #7f8c8d;">Date</div>
              </div>
              <div style="text-align: right; flex: 1; min-width: 150px;">
                <div style="border-top: 2px solid #2c3e50; width: 120px; margin-bottom: 5px; margin-left: auto;"></div>
                <div style="font-size: 0.9em;">Election Officer</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(certificateHTML);
    printWindow.document.close();
    
    // Auto-print after a short delay to ensure content is loaded
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div className="results">
      <div className="results-container">
        {/* Election not completed yet */}
        {!electionCompleted && (
          <div className="pre-completion-message">
            <div className="results-header">
              <h1 className="main-title">🗳️ Election In Progress</h1>
              <p className="results-subtitle">Results will be available once the election is completed</p>
            </div>
            <div className="completion-info">
              <div className="info-card">
                <h3>📊 Current Status</h3>
                <p>Students are currently voting. Results will be hidden until the election administrator officially completes the election.</p>
                <p><strong>Students voted so far:</strong> {totalVotedStudents}</p>
              </div>
              <div className="info-card">
                <h3>🔒 Result Security</h3>
                <p>Vote counts and winner information are kept secure and will only be revealed when the election is officially declared complete.</p>
              </div>
            </div>
          </div>
        )}

        {/* Election completed but results not yet published */}
        {electionCompleted && !resultsPublished && (() => {
          const { allResolved, hasResults, hasTies } = getFinalResultsStatus();
          
          return (
            <div className="declare-results-interface">
              <div className="results-header">
                <h1 className="main-title">🏁 Election Completed</h1>
                <p className="results-subtitle">Ready to Declare Official Results</p>
              </div>
              
              <div className="election-summary">
                <div className="election-stats enhanced-stats">
                  <div className="stat-item students-voted pop">
                    <div className="stat-icon">👥</div>
                    <div className="stat-info">
                      <span className="stat-number">{totalVotedStudents}</span>
                      <span className="stat-label">Students Voted</span>
                    </div>
                  </div>
                  {positions.filter(pos => pos.isActive).map((position, index) => (
                    <div key={position.id} className={`stat-item position-votes pop`}>
                      <div className="stat-icon">{position.emoji || '📊'}</div>
                      <div className="stat-info">
                        <span className="stat-number">{getTotalVotes(position.id)}</span>
                        <span className="stat-label">{position.displayName} Votes</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="final-results-status">
                  {hasResults ? (
                    <>
                      {allResolved ? (
                        <div className="status-ready">
                          <div className="status-icon">✅</div>
                          <div className="status-text">
                            <h3>All Results Ready</h3>
                            <p>All positions have clear winners{hasTies ? ' (ties have been resolved)' : ''}. You can now declare the official results.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="status-pending">
                          <div className="status-icon">⏳</div>
                          <div className="status-text">
                            <h3>Tie-Breakers Required</h3>
                            <p>Some positions have tied candidates that need to be resolved before declaring results.</p>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="status-no-votes">
                      <div className="status-icon">❓</div>
                      <div className="status-text">
                        <h3>No Votes Recorded</h3>
                        <p>No votes have been recorded for any position yet.</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {hasResults && (
                  <div className="declare-results-actions">
                    {allResolved ? (
                      <button 
                        className="declare-btn ready"
                        onClick={onDeclareResults}
                      >
                        🎉 Declare Official Results
                      </button>
                    ) : (
                      <button className="declare-btn disabled" disabled>
                        Resolve Ties First
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Normal results view - only show when results are published */}
        {electionCompleted && resultsPublished && (
          <>
            <div className="results-header">
              <h1 className="main-title">🗳️ Election Results</h1>
              <p className="results-subtitle">Official Final Results</p>
              
              <div className="election-stats enhanced-stats">
                <div className="stat-item students-voted pop">
                  <div className="stat-icon">👥</div>
                  <div className="stat-info">
                    <span className="stat-number">{totalVotedStudents}</span>
                    <span className="stat-label">Students Voted</span>
                  </div>
                </div>
                {positions.filter(pos => pos.isActive).map((position, index) => (
                  <div key={position.id} className={`stat-item position-votes pop`}>
                    <div className="stat-icon">{position.emoji || '📊'}</div>
                    <div className="stat-info">
                      <span className="stat-number">{getTotalVotes(position.id)}</span>
                      <span className="stat-label">{position.displayName} Votes</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="results-actions">
                <button className="results-btn print-btn" onClick={printResults}>
                  🖨️ Print Results
                </button>
                <button className="results-btn export-btn" onClick={exportResults}>
                  📊 Export CSV
                </button>
              </div>
            </div>
              
            {/* Position Results */}
            <div className="results-content">
              {positions.filter(pos => pos.isActive).map(position => {
                const positionCandidates = candidates[position.id] || [];
                const { winnerIds, maxVotes } = getWinner(position.id);
                const totalVotes = getTotalVotes(position.id);
                const tieState = tieBreaker[position.id];
                
                // If tie-breaker has been decided, override winnerIds
                const isTie = winnerIds.length > 1 && maxVotes > 0;
                const decidedWinnerId = tieState?.decided ? tieState.winnerId : (winnerIds.length === 1 ? winnerIds[0] : null);
                
                // Key fix: Only show tie-breaker UI if there's a tie AND it hasn't been decided yet
                const shouldShowTieBreaker = isTie && !tieState?.decided;

                const sortedCandidates = positionCandidates
                  .map(candidate => ({
                    ...candidate,
                    votes: votes[position.id]?.[candidate.id] || 0
                  }))
                  .sort((a, b) => b.votes - a.votes);

                return (
                  <div key={position.id} className="position-results">
                    <div className="position-header">
                      <h2 className="position-title">{position.emoji} {position.displayName} Election</h2>
                      <div className="position-stats">
                        <span className="total-votes">Total Votes: {totalVotes}</span>
                      </div>
                    </div>

                    {decidedWinnerId && (
                      <div className="winner-announcement">
                        <div className="winner-content">
                          {(() => {
                            const winner = sortedCandidates.find(c => c.id === decidedWinnerId);
                            return winner ? (
                              <>
                                <div className="winner-info">
                                  <h3>🏆 Winner: {winner.name}</h3>
                                  <p>Grade: {winner.grade} | Votes: {winner.votes} ({calculatePercentage(winner.votes, totalVotes)}%)</p>
                                  {tieState?.decided && (
                                    <p className="tie-resolution">
                                      🎲 Winner determined by {tieState.method === 'wheel' ? 'spinning wheel' : 'admin selection'} due to tie
                                    </p>
                                  )}
                                </div>
                                <button 
                                  className="certificate-btn"
                                  onClick={() => printCertificate(position.id)}
                                >
                                  🏆 Print Certificate
                                </button>
                              </>
                            ) : null;
                          })()}
                        </div>
                        <div className="winner-decoration">🏆</div>
                      </div>
                    )}

                    <div className="candidates-results">
                      {sortedCandidates.map((candidate, index) => (
                        <div
                          key={candidate.id}
                          className={`candidate-result ${candidate.id === decidedWinnerId ? 'winner' : ''}`}
                        >
                          <div className="candidate-rank">
                            <span className="rank-number">#{index + 1}</span>
                          </div>
                          
                          <div className="candidate-info">
                            <div className="candidate-avatar">
                              {candidate.image ? (
                                <img src={candidate.image} alt={candidate.name} />
                              ) : (
                                <div className="avatar-placeholder">
                                  {candidate.name.split(' ').map(n => n[0]).join('')}
                                </div>
                              )}
                            </div>
                            <div className="candidate-symbol-results">
                              {candidate.symbol || '❓'}
                            </div>
                            <div className="candidate-details">
                              <h4>{candidate.name}</h4>
                              <p>Grade: {candidate.grade}</p>
                              <p className="symbol-display-results">Symbol: <span className="symbol-badge-results">{candidate.symbol || '❓'}</span></p>
                            </div>
                          </div>

                          <div className="vote-stats">
                            <div className="vote-count">
                              <span className="votes">{candidate.votes}</span>
                              <span className="votes-label">votes</span>
                            </div>
                            <div className="percentage">
                              {calculatePercentage(candidate.votes, totalVotes)}%
                            </div>
                          </div>

                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{
                                width: `${Math.max(calculatePercentage(candidate.votes, totalVotes), 2)}%`
                              }}
                            ></div>
                          </div>

                          {candidate.id === decidedWinnerId && (
                            <div className="winner-badge">🏆 Winner</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Results;
