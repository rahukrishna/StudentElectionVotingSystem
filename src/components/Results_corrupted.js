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
  };  // Tie-breaker state - now uses persistent state from App component
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
  };  const handleTieBreakerVote = (position, candidateId) => {
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
      const selectedWinner = tiedCandidates[randomIndex];      setTieBreaker(prev => ({
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
  };  // Check if final results are available (no ties or all ties resolved)
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
    csvContent += 'Position,Candidate Name,Grade,Votes,Percentage,Status\n';    activePositions.forEach(position => {
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
    });    // Add summary statistics
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
    if (link.download !== undefined) {      const url = URL.createObjectURL(blob);
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
            <p>Official Results - ${new Date().toLocaleString()}</p>
          </div>
          
          <div class="stats">
            <div class="stat-box">
              <strong>Students Voted</strong><br>
              ${totalVotedStudents}
            </div>
            ${activePositions.map(position => `
              <div class="stat-box">
                <strong>${position.displayName} Votes</strong><br>
                ${getTotalVotes(position.id)}
              </div>
            `).join('')}
          </div>
    `;    activePositions.forEach(position => {
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
    });    // Add summary statistics
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
    if (link.download !== undefined) {      const url = URL.createObjectURL(blob);
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
            <p>Official Results - ${new Date().toLocaleString()}</p>
          </div>
          
          <div class="stats">
            <div class="stat-box">
              <strong>Students Voted</strong><br>
              ${totalVotedStudents}
            </div>
            ${activePositions.map(position => `
              <div class="stat-box">
                <strong>${position.displayName} Votes</strong><br>
                ${getTotalVotes(position.id)}
              </div>
            `).join('')}
          </div>
    `;    activePositions.forEach(position => {
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
    });    // Add summary statistics
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
    if (link.download !== undefined) {      const url = URL.createObjectURL(blob);
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
            <p>Official Results - ${new Date().toLocaleString()}</p>
          </div>
          
          <div class="stats">
            <div class="stat-box">
              <strong>Students Voted</strong><br>
              ${totalVotedStudents}
            </div>
            ${activePositions.map(position => `
              <div class="stat-box">
                <strong>${position.displayName} Votes</strong><br>
                ${getTotalVotes(position.id)}
              </div>
            `).join('')}
          </div>
    `;    activePositions.forEach(position => {
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

      printContent += `
        <div class="position">
          <h2 class="position-title">${position.emoji || '📋'} ${position.displayName}</h2>
      `;      if (finalWinnerId) {
        const winner = positionCandidates.find(c => c.id === finalWinnerId);
        const tieBreakerInfo = tieState?.decided 
          ? `<br><em>Decided by Tie-breaker: ${tieState.method === 'wheel' ? 'Spinning Wheel (Random)' : 'Admin Selection'}</em>`
          : '';
        printContent += `
          <div class="winner-box">
            <strong>🏆 Winner: ${winner?.name}</strong><br>
            ${maxVotes} votes (${calculatePercentage(maxVotes, totalVotes)}%)
            ${tieBreakerInfo}
          </div>
        `;
      }

      sortedCandidates.forEach((candidate, index) => {
        printContent += `
          <div class="candidate-row">
            <div class="candidate-info">
              <strong>#${index + 1} ${candidate.name}</strong> (Grade: ${candidate.grade})
            </div>
            <div class="vote-info">
              ${candidate.votes} votes (${calculatePercentage(candidate.votes, totalVotes)}%)
            </div>
          </div>
        `;
      });      printContent += '</div>';
    });    // Add tie-breaker summary if any occurred
    const tieBreakerSummary = activePositions.filter(pos => {
      const tieState = tieBreakerResults[pos.id];
      return tieState?.decided;
    });

    if (tieBreakerSummary.length > 0) {
      printContent += `
        <div class="tie-breaker-summary">
          <h2 class="section-title">🎲 Tie-breaker Information</h2>
      `;
      
      tieBreakerSummary.forEach(pos => {
        const tieState = tieBreakerResults[pos.id];
        const method = tieState.method === 'wheel' ? 'Spinning Wheel (Random Selection)' : 'Admin Manual Selection';
        const positionCandidates = candidates[pos.id] || [];
        const winner = positionCandidates.find(c => c.id === tieState.winnerId);
          printContent += `
          <div class="tie-info-box">
            <strong>${pos.emoji || '📋'} ${pos.displayName}</strong><br>
            <em>Tie-breaker Method:</em> ${method}<br>
            <em>Selected Winner:</em> ${winner?.name}
          </div>
        `;
      });
      
      printContent += '</div>';
    }    printContent += `
          <div class="footer">
            <p>This is an official election results document for ${SCHOOL_NAME}.</p>            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const printCertificate = (positionId) => {
    const position = positions.find(p => p.id === positionId);
    if (!position) {
      alert('Invalid position for certificate');
      return;
    }

    // Get the winner for this position
    const { winnerIds, maxVotes } = getWinner(positionId);
    const tieState = tieBreakerResults[positionId];
    const finalWinnerId = tieState?.decided ? tieState.winnerId : (winnerIds.length === 1 ? winnerIds[0] : null);

    if (!finalWinnerId || maxVotes === 0) {
      alert(`No winner determined for ${position.displayName} position yet.`);
      return;
    }

    const positionCandidates = candidates[positionId] || [];
    const winner = positionCandidates.find(c => c.id === finalWinnerId);
    if (!winner) {
      alert('Winner information not found');
      return;
    }

    const today = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const printWindow = window.open('', '_blank');    const certificateContent = `
      <html>
        <head>
          <title>Winner Certificate - ${position.displayName}</title>
          <style>            body {
              font-family: 'Times New Roman', serif;
              margin: 0;
              padding: 20px;
              background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
              min-height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            .certificate {
              background: white;
              width: 750px;
              max-width: 90vw;
              padding: 40px;
              border: 6px solid #2c3e50;
              border-radius: 15px;
              box-shadow: 0 10px 20px rgba(0,0,0,0.2);
              text-align: center;
              position: relative;
              box-sizing: border-box;
              max-height: 95vh;
              overflow: hidden;
            }
            .certificate::before {
              content: '';
              position: absolute;
              top: 15px;
              left: 15px;
              right: 15px;
              bottom: 15px;
              border: 2px solid #f39c12;
              border-radius: 8px;
            }
            .certificate-header {
              margin-bottom: 20px;
            }
            .school-name {
              font-size: 1.8em;
              font-weight: bold;
              color: #2c3e50;
              margin-bottom: 8px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .certificate-title {
              font-size: 2.2em;
              color: #8e44ad;
              margin: 15px 0;
              font-weight: bold;
              text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
            }
            .certificate-text {
              font-size: 1.2em;
              color: #34495e;
              margin: 15px 0;
              line-height: 1.4;
            }
            .winner-name {
              font-size: 2em;
              color: #e74c3c;
              font-weight: bold;
              margin: 20px 0;
              text-decoration: underline;
              text-decoration-color: #f39c12;
            }
            .position-title {
              font-size: 1.6em;
              color: #2980b9;
              font-weight: bold;
              margin: 15px 0;
            }
            .certificate-footer {
              margin-top: 30px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            .signature-line {
              border-top: 2px solid #2c3e50;
              width: 180px;
              text-align: center;
              padding-top: 8px;
              font-size: 1em;
              color: #2c3e50;
            }
            .date-section {
              text-align: right;
              font-size: 1em;
              color: #2c3e50;
            }
            .decorative-element {
              font-size: 2.5em;
              color: #f39c12;
              margin: 10px 0;
            }
            .achievement-text {
              font-size: 1.1em;
              color: #27ae60;
              font-weight: bold;
              margin: 15px 0;
            }
            @media print {
              body {
                background: white;
                padding: 10px;
                margin: 0;
              }
              .certificate {
                box-shadow: none;
                border: 4px solid #2c3e50;
                max-height: none;
                width: 100%;
                max-width: none;
                padding: 30px;
                page-break-inside: avoid;
              }
              @page {
                margin: 0.5in;
                size: letter;
              }
            }
          </style>
        </head>        <body>
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
            
            <div class="certificate-text">in the School Election conducted on ${today}</div>
            
            <div class="decorative-element">⭐</div>
            
            <div class="certificate-footer">
              <div class="signature-line">Principal</div>
              <div class="date-section">
                <strong>Date:</strong><br>${today}
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(certificateContent);
    printWindow.document.close();
    printWindow.focus();
    };

  const renderResultsForPosition = (position, candidatesList, title, emoji) => {
    const totalVotes = getTotalVotes(position);
    const { winnerIds, maxVotes } = getWinner(position);

    // If tie-breaker has been decided, override winnerIds
    const tieState = tieBreaker[position];
    const isTie = winnerIds.length > 1 && maxVotes > 0;
    const decidedWinnerId = tieState?.decided ? tieState.winnerId : (winnerIds.length === 1 ? winnerIds[0] : null);
    
    // Key fix: Only show tie-breaker UI if there's a tie AND it hasn't been decided yet
    const shouldShowTieBreaker = isTie && !tieState?.decided;

    const sortedCandidates = candidatesList
      .map(candidate => ({
        ...candidate,
        votes: votes[position]?.[candidate.id] || 0
      }))
      .sort((a, b) => b.votes - a.votes);

    return (
      <div className="position-results">
        <div className="position-header">
          <h2 className="position-title">{emoji} {title}</h2>
          <div className="position-stats">
            <span className="total-votes">{totalVotes} Total Votes</span>
          </div>
        </div>

        {/* Winner Banner or Tie Notice */}
        {decidedWinnerId && maxVotes > 0 && (
          <div className="winner-banner">
            <div className="winner-crown">👑</div>
            <div className="winner-info">
              <h3>{tieState?.decided ? 'Tie-breaker Winner' : 'Current Winner'}</h3>
              <p className="winner-name">
                {candidatesList.find(c => c.id === decidedWinnerId)?.name}
              </p>              <p className="winner-votes">{maxVotes} votes ({calculatePercentage(maxVotes, totalVotes)}%)</p>
              {tieState?.decided && (
                <p className="tie-breaker-label">
                  (Decided by {tieState.method === 'wheel' ? 'Spinning Wheel' : 'Admin Selection'})
                </p>
              )}
            </div>
            <div className="winner-decoration">🏆</div>
          </div>
        )}        {/* Tie scenario: show tie-breaker UI only if tie exists and not decided */}
        {shouldShowTieBreaker && (
          <div className="tie-breaker-section">
            <div className="tie-notice">⚠️ <b>Tie detected!</b> Multiple candidates have {maxVotes} votes each.</div>
            <div className="tie-candidates-list">
              <strong>Tied candidates:</strong> {candidatesList.filter(c => winnerIds.includes(c.id)).map(c => c.name).join(', ')}
            </div>
            {!tieState?.show && (
              <button className="tie-breaker-btn" onClick={() => handleTieBreakerStart(position)}>
                🔐 Admin: Break Tie
              </button>
            )}
            {tieState?.show && !tieState?.passwordAccepted && (
              <div className="tie-breaker-auth">
                <div className="password-hint">🔑 Admin password required to break the tie</div>                <input
                  type="password"
                  placeholder="Enter admin password"
                  value={tieState.password}
                  onChange={e => handlePasswordChange(position, e.target.value)}
                  className="tie-breaker-input"
                  onKeyPress={e => e.key === 'Enter' && handlePasswordSubmit(position)}
                />
                <button className="tie-breaker-btn" onClick={() => handlePasswordSubmit(position)}>
                  Submit Password
                </button>
                {tieState?.error && <div className="tie-breaker-error">❌ {tieState.error}</div>}
              </div>
            )}            {tieState?.passwordAccepted && !tieState?.decided && !tieState?.method && (
              <div className="tie-breaker-method-selection">
                <div className="method-instructions">🎲 Choose how to break the tie:</div>
                <div className="method-options">
                  <button
                    className="method-btn manual-btn"
                    onClick={() => handleTieBreakerMethodSelect(position, 'manual')}
                  >
                    🎯 Manual Selection
                    <span className="method-desc">You choose the winner</span>
                  </button>
                  <button
                    className="method-btn wheel-btn"
                    onClick={() => handleTieBreakerMethodSelect(position, 'wheel')}
                  >
                    🎡 Spinning Wheel
                    <span className="method-desc">Random selection by wheel</span>
                  </button>
                </div>
              </div>
            )}
            {tieState?.passwordAccepted && !tieState?.decided && tieState?.method === 'manual' && (
              <div className="tie-breaker-vote">
                <div className="tie-breaker-instructions">🎯 Select the winner from the tied candidates:</div>
                <div className="tie-breaker-candidates">
                  {candidatesList.filter(c => winnerIds.includes(c.id)).map(c => (
                    <button
                      key={c.id}
                      className="tie-breaker-candidate-btn"
                      onClick={() => handleTieBreakerVote(position, c.id)}
                    >
                      👑 {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {tieState?.passwordAccepted && !tieState?.decided && tieState?.method === 'wheel' && (
              <div className="spinning-wheel-section">
                <div className="wheel-instructions">🎡 Spinning Wheel - Random Winner Selection</div>
                <div className="wheel-container">
                  <div className={`spinning-wheel ${tieState?.spinning ? 'spinning' : ''}`}>
                    {candidatesList.filter(c => winnerIds.includes(c.id)).map((candidate, index, array) => {
                      const angle = (360 / array.length) * index;
                      const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffd93d', '#ff8c94'];
                      return (
                        <div
                          key={candidate.id}
                          className="wheel-segment"
                          style={{
                            transform: `rotate(${angle}deg)`,
                            backgroundColor: colors[index % colors.length]
                          }}
                        >
                          <span className="wheel-text">{candidate.name}</span>
                        </div>
                      );
                    })}
                    <div className="wheel-pointer">▼</div>
                  </div>
                </div>
                {!tieState?.spinning && (
                  <button
                    className="spin-btn"
                    onClick={() => handleSpinWheel(position, candidatesList.filter(c => winnerIds.includes(c.id)))}
                  >
                    🎲 Spin the Wheel!
                  </button>
                )}
                {tieState?.spinning && (
                  <div className="spinning-status">
                    🎡 Spinning... Selecting winner randomly!
                  </div>
                )}
                {tieState?.decided && tieState?.spinResult && (
                  <div className="spin-result">
                    🎉 Wheel selected: <strong>{tieState.spinResult}</strong>!
                  </div>
                )}
              </div>
            )}
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
              </div>              <div className="candidate-info">
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
          ))}        </div>
      </div>
    );
  };

  return (
    <div className="results">
      <div className="results-container">
        {/* If election completed but results not yet published - show declare results interface */}
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
                      <div className="stat-icon">{position.emoji || '�'}</div>
                      <div className="stat-info">
                        <span className="stat-number">{getTotalVotes(position.id)}</span>
                        <span className="stat-label">{position.displayName} Votes</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Show tie resolution interface if there are unresolved ties */}
                {hasTies && (
                  <div className="ties-resolution-required">
                    <h3 className="ties-title">⚠️ Tie-Breaker Required</h3>
                    <p>The following positions have tied results that must be resolved before declaring results:</p>
                      <div className="results-content">
                      {positions.filter(pos => pos.isActive).map(position => 
                        renderResultsForPosition(
                          position.id, 
                          candidates[position.id] || [], 
                          `${position.displayName} Election`,
                          position.emoji || '🏆'
                        )
                      )}
                    </div>
                  </div>
                )}
                
                {/* Show declare results button when all ties are resolved */}
                {allResolved && hasResults && (
                  <div className="declare-results-section">
                    <h3 className="declare-title">🎯 Ready to Declare Results</h3>
                    <p className="declare-description">
                      All votes have been counted and any ties have been resolved. 
                      You can now officially declare the election results.
                    </p>
                    <button 
                      className="declare-results-btn" 
                      onClick={onDeclareResults}
                    >
                      📢 Declare Official Results
                    </button>
                  </div>
                )}
                
                {/* Show message if no votes cast */}
                {!hasResults && (
                  <div className="no-results-message">
                    <h3>ℹ️ No Votes Cast</h3>
                    <p>No votes have been recorded in this election.</p>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
          {/* Normal results view - only show when election is completed */}
        {electionCompleted && (
          <>
            <div className="results-header">
              <h1 className="main-title">🗳️ Election Results</h1>
              <p className="results-subtitle">
                {resultsPublished ? 'Official Final Results' : 'Final Results - Ready for Declaration'}
              </p>
                <div className="election-stats enhanced-stats">
                <div className="stat-item students-voted pop">
                  <div className="stat-icon">👥</div>
                  <div className="stat-info">
                    <span className="stat-number">{totalVotedStudents}</span>
                    <span className="stat-label">Students Voted</span>
                  </div>
                </div>
                {positions.filter(pos => pos.isActive).map((position, index) => (
                  <div key={position.id} className={`stat-item position-votes pop stat-${index}`}>
                    <div className="stat-icon">{position.emoji || '📊'}</div>
                    <div className="stat-info">
                      <span className="stat-number">{getTotalVotes(position.id)}</span>
                      <span className="stat-label">{position.displayName} Votes</span>
                    </div>
                  </div>
                ))}
              </div>

            {/* Complete Election & Export/Print Options */}
            {(() => {
              const { allResolved, hasResults, hasTies } = getFinalResultsStatus();
              
              if (!hasResults) return null;
              
              return (
                <div className="election-actions">
                  {/* Complete Election Button - Show when no ties and election not completed */}
                  {allResolved && !electionCompleted && (
                    <div className="complete-election-section">
                      <h3 className="complete-title">🏆 Ready to Complete Election</h3>
                      <p className="complete-description">All results are final with no ties remaining.</p>
                      <button className="complete-election-btn" onClick={onCompleteElection}>
                        🎯 Complete Election
                      </button>
                    </div>
                  )}

                  {/* Export/Print Options - Show only when results are published */}
                  {resultsPublished && (
                    <div className="export-options">
                      <h3 className="export-title">📊 Official Results Published</h3>
                      <div className="export-buttons">
                        <button className="export-btn csv-btn" onClick={exportResults}>
                          📄 Export CSV
                        </button>
                        <button className="export-btn print-btn" onClick={printResults}>
                          🖨️ Print Results
                        </button>
                      </div>
                        
                      {/* Certificate Printing Section */}
                      <div className="certificate-section">
                        <h4 className="certificate-title">🏆 Winner Certificates</h4>
                        <div className="certificate-buttons">
                          {positions.filter(pos => pos.isActive).map(position => (
                            <button 
                              key={position.id}
                              className={`certificate-btn ${position.id}-cert`} 
                              onClick={() => printCertificate(position.id)}
                            >
                              {position.emoji || '🏆'} {position.displayName} Certificate
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
              
            {/* Position Results */}
            <div className="results-content">
              {positions.filter(pos => pos.isActive).map(position => 
                renderResultsForPosition(
                  position.id, 
                  candidates[position.id] || [], 
                  `${position.displayName} Election`,
                  position.emoji || '🏆'
                )
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Results;
