import React, { useState } from 'react';
import './AdminPanel.css';
import PositionManager from './PositionManager';

const AdminPanel = ({ 
  candidates, 
  setCandidates, 
  votes,
  setVotes, 
  votedStudents, 
  onResetVotes, 
  onClearAllData,
  onDebugStorage,
  onBack,
  availableSymbols,
  getRandomSymbol,
  schoolInfo,
  setSchoolInfo,
  positions,
  setPositions,
  totalEligibleStudents,
  setTotalEligibleStudents
}) => {
  const ADMIN_PASSWORDS = ['SecureAdmin2024!', 'SecureAdmin2026', 'Admin2026', 'swathi1997', 'swathi1996'];
  const LEGACY_STATUS_PASSWORD = 'status123';
  const safeTotalEligibleStudents = Math.max(1, parseInt(totalEligibleStudents, 10) || 1);

  const [activeTab, setActiveTab] = useState('overview');
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    grade: '',
    position: positions.find(pos => pos.isActive)?.id || 'schoolLeader',
    symbol: ''
  });
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    grade: '',
    position: '',
    symbol: ''
  });
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('json');
  const [showVotingStatus, setShowVotingStatus] = useState(false);
  const [votingStatusPassword, setVotingStatusPassword] = useState('');
  const [isVotingStatusUnlocked, setIsVotingStatusUnlocked] = useState(false);
  const [eligibleStudentsDraft, setEligibleStudentsDraft] = useState(String(safeTotalEligibleStudents));
  const [settingsSaveMessage, setSettingsSaveMessage] = useState('');

  // School info editing state
  const [schoolInfoForm, setSchoolInfoForm] = useState({
    name: schoolInfo.name,
    place: schoolInfo.place,
    fullName: schoolInfo.fullName
  });
  const [isEditingSchoolInfo, setIsEditingSchoolInfo] = useState(false);

  // Update form when schoolInfo changes
  React.useEffect(() => {
    setSchoolInfoForm({
      name: schoolInfo.name,
      place: schoolInfo.place,  
      fullName: schoolInfo.fullName
    });
  }, [schoolInfo]);

  React.useEffect(() => {
    setEligibleStudentsDraft(String(safeTotalEligibleStudents));
  }, [safeTotalEligibleStudents]);

  const handleSaveEligibleStudents = () => {
    const parsed = parseInt(eligibleStudentsDraft, 10);

    if (Number.isNaN(parsed) || parsed < 1) {
      setSettingsSaveMessage('Enter a valid number greater than 0.');
      return;
    }

    setTotalEligibleStudents(parsed);
    setSettingsSaveMessage('Eligible students count saved successfully.');
  };

  const handleAddCandidate = (e) => {
    e.preventDefault();
    if (newCandidate.name.trim() && newCandidate.grade.trim()) {
      // Get all candidates from all positions
      const allCandidates = positions.reduce((acc, position) => {
        return [...acc, ...(candidates[position.id] || [])];
      }, []);

      // Check if candidate name already exists
      const nameExists = allCandidates
        .some(c => c.name.toLowerCase() === newCandidate.name.trim().toLowerCase());
      
      if (nameExists) {
        alert('A candidate with this name already exists. Please use a different name.');
        return;
      }

      // Check if symbol already exists (if provided)
      if (newCandidate.symbol) {
        const symbolExists = allCandidates
          .some(c => c.symbol === newCandidate.symbol);
        
        if (symbolExists) {
          alert('This symbol is already taken by another candidate. Please select a different symbol.');
          return;
        }
      }

      // Generate new ID from all candidates
      const newId = Math.max(
        ...allCandidates.map(c => c.id),
        0
      ) + 1;

      const candidate = {
        id: newId,
        name: newCandidate.name.trim(),
        grade: newCandidate.grade.trim(),
        image: null,
        symbol: newCandidate.symbol || getRandomSymbol()
      };      setCandidates(prev => ({
        ...prev,
        [newCandidate.position]: [...(prev[newCandidate.position] || []), candidate]
      }));

      const positionName = positions.find(pos => pos.id === newCandidate.position)?.displayName || 'Unknown Position';
      setNewCandidate({ name: '', grade: '', position: positions.find(pos => pos.isActive)?.id || 'schoolLeader', symbol: '' });
      alert(`✅ ${candidate.name} has been added successfully as a ${positionName} candidate with symbol ${candidate.symbol}!`);
    } else {
      alert('Please fill in all required fields.');
    }
  };const handleRemoveCandidate = (position, candidateId) => {
    const candidate = (candidates[position] || []).find(c => c.id === candidateId);
    const positionName = positions.find(pos => pos.id === position)?.displayName || 'Unknown Position';
    
    if (window.confirm(`⚠️ Are you sure you want to remove "${candidate?.name}" from the ${positionName} candidates?\n\nThis action cannot be undone and will also remove all votes for this candidate.`)) {
      setCandidates(prev => ({
        ...prev,
        [position]: (prev[position] || []).filter(c => c.id !== candidateId)
      }));
      alert(`✅ ${candidate?.name} has been removed successfully.`);
    }
  };
  const handleEditCandidate = (position, candidate) => {
    setEditingCandidate({ ...candidate, position });
    setEditForm({
      name: candidate.name,
      grade: candidate.grade,
      position: position,
      symbol: candidate.symbol || ''
    });
  };  const handleUpdateCandidate = (e) => {
    e.preventDefault();
    if (editForm.name.trim() && editForm.grade.trim()) {
      // Get all candidates from all positions
      const allCandidates = positions.reduce((acc, position) => {
        return [...acc, ...(candidates[position.id] || [])];
      }, []);

      // Check if the new name conflicts with existing candidates (excluding current candidate)
      const nameExists = allCandidates
        .filter(c => c.id !== editingCandidate.id)
        .some(c => c.name.toLowerCase() === editForm.name.trim().toLowerCase());
      
      if (nameExists) {
        alert('A candidate with this name already exists. Please use a different name.');
        return;
      }

      // Check if the new symbol conflicts with existing candidates (excluding current candidate)
      if (editForm.symbol && editForm.symbol !== editingCandidate.symbol) {
        const symbolExists = allCandidates
          .filter(c => c.id !== editingCandidate.id)
          .some(c => c.symbol === editForm.symbol);
        
        if (symbolExists) {
          alert('This symbol is already taken by another candidate. Please select a different symbol.');
          return;
        }
      }

      setCandidates(prev => {
        const oldPosition = editingCandidate.position;
        const newPosition = editForm.position;
          // If position changed, remove from old position and add to new
        if (oldPosition !== newPosition) {
          const updatedCandidates = {
            ...prev,
            [oldPosition]: (prev[oldPosition] || []).filter(c => c.id !== editingCandidate.id),
            [newPosition]: [...(prev[newPosition] || []), {
              ...editingCandidate,
              name: editForm.name.trim(),
              grade: editForm.grade.trim(),
              symbol: editForm.symbol || getRandomSymbol()
            }]
          };
          return updatedCandidates;
        } else {
          // Same position, just update the candidate
          return {
            ...prev,
            [oldPosition]: (prev[oldPosition] || []).map(c => 
              c.id === editingCandidate.id 
                ? { 
                    ...c, 
                    name: editForm.name.trim(), 
                    grade: editForm.grade.trim(),
                    symbol: editForm.symbol || c.symbol || getRandomSymbol()
                  }
                : c
            )
          };
        }
      });
      
      setEditingCandidate(null);
      setEditForm({ name: '', grade: '', position: '', symbol: '' });
      alert(`✅ ${editForm.name.trim()} has been updated successfully!`);
    } else {
      alert('Please fill in all required fields.');
    }
  };
  const handleCancelEdit = () => {
    setEditingCandidate(null);
    setEditForm({ name: '', grade: '', position: '', symbol: '' });
  };

  // Voting Status Functions
  const handleVotingStatusAccess = () => {
    setShowVotingStatus(true);
  };

  const handleVotingStatusLogin = (e) => {
    e.preventDefault();
    if (ADMIN_PASSWORDS.includes(votingStatusPassword) || votingStatusPassword === LEGACY_STATUS_PASSWORD) {
      setIsVotingStatusUnlocked(true);
      setShowVotingStatus(false);
      setVotingStatusPassword('');
      setActiveTab('voting-status');
    } else {
      alert('❌ Incorrect password! Access denied.');
      setVotingStatusPassword('');
    }
  };

  const getOverallStats = () => {
    const totalStudents = safeTotalEligibleStudents;
    const totalVoted = votedStudents.length;
    const percentage = ((totalVoted / totalStudents) * 100).toFixed(1);
    
    // Calculate total votes from all positions
    const totalVotesCast = positions.reduce((total, position) => {
      const positionVotes = Object.values(votes[position.id] || {}).reduce((a, b) => a + b, 0);
      return total + positionVotes;
    }, 0);
    
    return {
      totalStudents,
      totalVoted,
      percentage,
      totalVotesCast,
      averageVotesPerStudent: totalVoted > 0 ? (totalVotesCast / totalVoted).toFixed(1) : 0
    };
  };

  const exportResults = () => {
    setShowExportModal(true);
  };
  const generateExportData = () => {
    const timestamp = new Date();
    
    // Generate results for all positions dynamically
    const positionResults = {};
    positions.forEach(position => {
      const positionCandidates = candidates[position.id] || [];
      const positionVotes = votes[position.id] || {};
      const positionTotal = Object.values(positionVotes).reduce((a, b) => a + b, 0);
      
      positionResults[position.id] = {
        displayName: position.displayName,
        candidates: positionCandidates.map(candidate => ({
          id: candidate.id,
          name: candidate.name,
          grade: candidate.grade,
          votes: positionVotes[candidate.id] || 0,
          percentage: positionTotal > 0 ? 
            ((positionVotes[candidate.id] || 0) / positionTotal * 100).toFixed(2) + '%' : 
            '0%'
        })).sort((a, b) => b.votes - a.votes)
      };
    });    return {
      metadata: {
        exportDate: timestamp.toISOString(),
        exportTime: timestamp.toLocaleString(),
        schoolName: schoolInfo.fullName,
        electionType: 'School Leadership Election',
        generatedBy: 'School Voting System v1.0'
      },
      summary: {
        totalStudentsVoted: votedStudents.length,
        totalVotesCast: positions.reduce((total, position) => {
          return total + Object.values(votes[position.id] || {}).reduce((a, b) => a + b, 0);
        }, 0),
        positionBreakdown: positions.map(position => ({
          position: position.displayName,
          votes: Object.values(votes[position.id] || {}).reduce((a, b) => a + b, 0)
        })),
        participationRate: `${((votedStudents.length / safeTotalEligibleStudents) * 100).toFixed(2)}%`
      },
      results: positionResults,
      votedStudents: votedStudents.sort()
    };
  };

  const handleExportConfirm = () => {
    const data = generateExportData();
    const timestamp = new Date().toISOString().split('T')[0];
    
    if (exportFormat === 'json') {
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      downloadFile(dataBlob, `school_election_results_${timestamp}.json`);
      
    } else if (exportFormat === 'csv') {
      const csvContent = generateCSV(data);
      const dataBlob = new Blob([csvContent], { type: 'text/csv' });
      downloadFile(dataBlob, `school_election_results_${timestamp}.csv`);
      
    } else if (exportFormat === 'txt') {
      const txtContent = generateTextReport(data);
      const dataBlob = new Blob([txtContent], { type: 'text/plain' });
      downloadFile(dataBlob, `school_election_results_${timestamp}.txt`);
    }
    
    setShowExportModal(false);
    alert(`✅ Election results exported successfully as ${exportFormat.toUpperCase()} file!`);
  };

  const downloadFile = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  const generateCSV = (data) => {
    let csv = 'School Election Results\n';
    csv += `Export Date,${data.metadata.exportTime}\n`;
    csv += `School,${data.metadata.schoolName}\n`;
    csv += `Total Students Voted,${data.summary.totalStudentsVoted}\n\n`;
    
    // Generate CSV for each position dynamically
    Object.keys(data.results).forEach(positionId => {
      const position = data.results[positionId];
      csv += `${position.displayName} Results\n`;
      csv += 'Rank,Name,Grade,Votes,Percentage\n';
      position.candidates.forEach((candidate, index) => {
        csv += `${index + 1},${candidate.name},${candidate.grade},${candidate.votes},${candidate.percentage}\n`;
      });
      csv += '\n';
    });
    
    return csv;
  };
  const generateTextReport = (data) => {
    let report = '='.repeat(60) + '\n';
    report += '         SCHOOL ELECTION RESULTS REPORT\n';
    report += '='.repeat(60) + '\n\n';
    
    report += `School: ${data.metadata.schoolName}\n`;
    report += `Export Date: ${data.metadata.exportTime}\n`;
    report += `Generated By: ${data.metadata.generatedBy}\n\n`;
    
    report += 'ELECTION SUMMARY\n';
    report += '-'.repeat(30) + '\n';
    report += `Total Students Voted: ${data.summary.totalStudentsVoted}\n`;
    report += `Total Votes Cast: ${data.summary.totalVotesCast}\n`;
    report += `Participation Rate: ${data.summary.participationRate}\n\n`;
    
    // Generate results for each position dynamically
    Object.keys(data.results).forEach(positionId => {
      const position = data.results[positionId];
      report += `${position.displayName.toUpperCase()} RESULTS\n`;
      report += '-'.repeat(30) + '\n';
      
      if (position.candidates.length > 0 && position.candidates[0].votes > 0) {
        report += `🏆 WINNER: ${position.candidates[0].name} (${position.candidates[0].votes} votes)\n\n`;
      }
      
      position.candidates.forEach((candidate, index) => {
        report += `${index + 1}. ${candidate.name} - Grade ${candidate.grade}\n`;
        report += `   Votes: ${candidate.votes} (${candidate.percentage})\n\n`;
      });
    });
    
    report += 'VOTED STUDENTS\n';
    report += '-'.repeat(30) + '\n';
    data.votedStudents.forEach((studentId, index) => {
      if (index % 5 === 0) report += '\n';
      report += studentId.padEnd(12);
    });
    
    report += '\n\n' + '='.repeat(60) + '\n';
    report += 'End of Report\n';
    report += '='.repeat(60);
    
    return report;
  };

  // Print candidates list
  const handlePrintCandidates = () => {
    const printWindow = window.open('', '_blank');
    const currentDate = new Date().toLocaleDateString();
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Candidates List - School Election</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 20px;
            background: white;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #1976d2;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #1976d2;
            margin: 0;
            font-size: 2.5rem;
            font-weight: bold;
          }
          .header p {
            margin: 10px 0 0 0;
            color: #666;
            font-size: 1.1rem;
          }
          .section {
            margin-bottom: 40px;
          }
          .section-title {
            background: linear-gradient(135deg, #1976d2, #42a5f5);
            color: white;
            padding: 15px 20px;
            margin: 0 0 20px 0;
            border-radius: 10px;
            font-size: 1.4rem;
            font-weight: bold;
            text-align: center;
          }
          .section-title.lady {
            background: linear-gradient(135deg, #e91e63, #f06292);
          }
          .candidates-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .candidates-table th {
            background: #f5f5f5;
            padding: 15px;
            text-align: left;
            border: 1px solid #ddd;
            font-weight: bold;
            color: #333;
          }
          .candidates-table td {
            padding: 12px 15px;
            border: 1px solid #ddd;
            vertical-align: middle;
          }
          .candidates-table tr:nth-child(even) {
            background: #f9f9f9;
          }
          .candidates-table tr:hover {
            background: #f0f8ff;
          }
          .symbol-display {
            font-size: 1.5rem;
            text-align: center;
            font-weight: bold;
            color: #1976d2;
          }
          .vote-count {
            background: #4caf50;
            color: white;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 0.9rem;
            font-weight: bold;
            text-align: center;
            display: inline-block;
            min-width: 60px;
          }
          .no-candidates {
            text-align: center;
            color: #666;
            font-style: italic;
            padding: 30px;
            background: #f5f5f5;
            border-radius: 10px;
          }
          .summary {
            background: #e3f2fd;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 30px;
            border-left: 5px solid #1976d2;
          }
          .summary h3 {
            margin: 0 0 10px 0;
            color: #1976d2;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            color: #666;
            font-size: 0.9rem;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }          @media print {
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body { 
              margin: 0; 
              font-size: 11pt;
              line-height: 1.4;
            }
            .header { 
              page-break-after: avoid; 
              break-after: avoid;
              margin-bottom: 20px;
            }
            .section { 
              page-break-inside: avoid;
              break-inside: avoid;
              margin-bottom: 25px;
            }
            .section-title {
              page-break-after: avoid;
              break-after: avoid;
              margin-bottom: 15px;
              font-size: 1.2rem;
              padding: 12px 18px;
            }
            .candidates-table {
              page-break-inside: avoid;
              break-inside: avoid;
              font-size: 10pt;
            }
            .candidates-table th {
              padding: 10px 12px;
              font-size: 10pt;
            }
            .candidates-table td {
              padding: 8px 12px;
              font-size: 10pt;
            }
            .candidates-table tr {
              page-break-inside: avoid;
              break-inside: avoid;
            }
            .symbol-display {
              font-size: 1.2rem;
            }
            .vote-count {
              font-size: 0.8rem;
              padding: 3px 8px;
            }
            .summary {
              page-break-inside: avoid;
              break-inside: avoid;
              margin-bottom: 20px;
              padding: 15px;
            }
            .no-candidates {
              page-break-inside: avoid;
              break-inside: avoid;
              padding: 20px;
            }
            .footer {
              page-break-inside: avoid;
              break-inside: avoid;
              margin-top: 25px;
              font-size: 0.8rem;
            }
            /* Prevent table rows from breaking across pages */
            .candidates-table tbody tr {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            /* Ensure section headings stay with content */
            .section-title + .candidates-table {
              page-break-before: avoid;
            }
          }
        </style>
      </head>
      <body>        <div class="header">
          <h1>🏫 ${schoolInfo.fullName} - Candidates List</h1>
          <p>Generated on: ${currentDate}</p>
        </div>
          <div class="summary">
          <h3>📊 Summary</h3>
          ${positions.map(position => `
            <p><strong>Total ${position.displayName} Candidates:</strong> ${(candidates[position.id] || []).length}</p>
          `).join('')}
          <p><strong>Total Candidates:</strong> ${positions.reduce((total, position) => total + (candidates[position.id] || []).length, 0)}</p>
        </div>

        ${positions.map(position => `
          <div class="section">
            <h2 class="section-title">${position.id === 'ladySchoolLeader' ? '👸' : position.id === 'schoolLeader' ? '👦' : '👑'} ${position.displayName} Candidates</h2>
            ${(candidates[position.id] || []).length > 0 ? `
              <table class="candidates-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Grade</th>
                    <th>Symbol</th>
                    <th>Votes</th>
                  </tr>
                </thead>
                <tbody>
                  ${(candidates[position.id] || []).map(candidate => `
                    <tr>
                      <td><strong>${candidate.name}</strong></td>
                      <td>Grade ${candidate.grade}</td>
                      <td class="symbol-display">${candidate.symbol || '❓'}</td>
                      <td><span class="vote-count">${(votes[position.id] || {})[candidate.id] || 0} votes</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : `
              <div class="no-candidates">
                <p>No candidates registered for ${position.displayName} position.</p>
              </div>
            `}
          </div>
        `).join('')}

        <div class="footer">
          <p>School Election Management System</p>
          <p>This document contains confidential election information</p>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = function() {
      printWindow.print();
    };
  };

  // School info management functions
  const handleSchoolInfoSubmit = (e) => {
    e.preventDefault();
    
    if (!schoolInfoForm.name.trim() || !schoolInfoForm.place.trim()) {
      alert('Please fill in all required fields.');
      return;
    }

    const updatedSchoolInfo = {
      name: schoolInfoForm.name.trim(),
      place: schoolInfoForm.place.trim(),
      fullName: schoolInfoForm.fullName.trim() || `${schoolInfoForm.name.trim()}, ${schoolInfoForm.place.trim()}`
    };

    setSchoolInfo(updatedSchoolInfo);
    setIsEditingSchoolInfo(false);
    alert('✅ School information updated successfully!');
  };

  const handleCancelSchoolInfoEdit = () => {
    setSchoolInfoForm({
      name: schoolInfo.name,
      place: schoolInfo.place,
      fullName: schoolInfo.fullName
    });
    setIsEditingSchoolInfo(false);
  };

  return (
    <div className="admin-panel">
      <div className="admin-container">        <div className="admin-header">
          <h1>Admin Panel</h1>
          <button onClick={onBack} className="back-button">
            Back to Voting
          </button>
        </div>        <div className="admin-tabs">
          <button 
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            Election Overview
          </button>
          <button 
            className={activeTab === 'positions' ? 'active' : ''}
            onClick={() => setActiveTab('positions')}
          >
            🏛️ Manage Positions
          </button>
          <button 
            className={activeTab === 'candidates' ? 'active' : ''}
            onClick={() => setActiveTab('candidates')}
          >
            Manage Candidates
          </button>
          <button 
            className={activeTab === 'students' ? 'active' : ''}
            onClick={() => setActiveTab('students')}
          >
            Student Records
          </button>
          <button 
            className={activeTab === 'voting-status' ? 'active' : ''}
            onClick={isVotingStatusUnlocked ? () => setActiveTab('voting-status') : handleVotingStatusAccess}
          >
            Voting Status
          </button>          <button 
            className={activeTab === 'settings' ? 'active' : ''}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
          <button 
            className={activeTab === 'school-info' ? 'active' : ''}
            onClick={() => setActiveTab('school-info')}
          >
            🏫 School Info
          </button>
        </div>

        <div className="admin-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <h2>Election Overview</h2>
                <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Students Voted</h3>
                  <div className="stat-number">{votedStudents.length}</div>
                </div>
                {positions.map(position => (
                  <div key={position.id} className="stat-card">
                    <h3>{position.displayName} Candidates</h3>
                    <div className="stat-number">{(candidates[position.id] || []).length}</div>
                  </div>
                ))}
                <div className="stat-card">
                  <h3>Total Votes Cast</h3>
                  <div className="stat-number">
                    {positions.reduce((total, position) => {
                      return total + Object.values(votes[position.id] || {}).reduce((a, b) => a + b, 0);
                    }, 0)}
                  </div>
                </div>
              </div><div className="quick-actions">
                <h3>📊 Quick Actions</h3>
                <div className="action-buttons">
                  <button onClick={exportResults} className="export-button">
                    � Export Results
                  </button>
                  <button onClick={onResetVotes} className="reset-button">
                    🗑️ Reset All Votes
                  </button>
                  <button onClick={onClearAllData} className="clear-button">
                    🔥 Clear All Data
                  </button>
                  <button onClick={onDebugStorage} className="debug-button">
                    🔍 Debug Storage
                  </button>
                </div>
              </div>

              {/* Export Modal */}
              {showExportModal && (
                <div className="export-modal-overlay">
                  <div className="export-modal">
                    <h3>📤 Export Election Results</h3>
                    <p>Choose the format for exporting your election results:</p>
                    
                    <div className="export-formats">
                      <div className="format-option">
                        <label>
                          <input
                            type="radio"
                            value="json"
                            checked={exportFormat === 'json'}
                            onChange={(e) => setExportFormat(e.target.value)}
                          />
                          <div className="format-card">
                            <div className="format-icon">📄</div>
                            <div className="format-info">
                              <h4>JSON Format</h4>
                              <p>Structured data format for technical analysis</p>
                              <span className="format-size">Comprehensive data</span>
                            </div>
                          </div>
                        </label>
                      </div>
                      
                      <div className="format-option">
                        <label>
                          <input
                            type="radio"
                            value="csv"
                            checked={exportFormat === 'csv'}
                            onChange={(e) => setExportFormat(e.target.value)}
                          />
                          <div className="format-card">
                            <div className="format-icon">📊</div>
                            <div className="format-info">
                              <h4>CSV Format</h4>
                              <p>Spreadsheet format for Excel analysis</p>
                              <span className="format-size">Table data</span>
                            </div>
                          </div>
                        </label>
                      </div>
                      
                      <div className="format-option">
                        <label>
                          <input
                            type="radio"
                            value="txt"
                            checked={exportFormat === 'txt'}
                            onChange={(e) => setExportFormat(e.target.value)}
                          />
                          <div className="format-card">
                            <div className="format-icon">📋</div>
                            <div className="format-info">
                              <h4>Text Report</h4>
                              <p>Human-readable formatted report</p>
                              <span className="format-size">Printable format</span>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>
                    
                    <div className="export-preview">
                      <h4>📋 Export Preview:</h4>
                      <div className="preview-content">
                        <span className="preview-filename">
                          school_election_results_{new Date().toISOString().split('T')[0]}.{exportFormat}
                        </span>                        <div className="preview-stats">
                          <span>📊 {votedStudents.length} students voted</span>
                          <span>👥 {positions.reduce((total, position) => total + (candidates[position.id] || []).length, 0)} candidates</span>
                          <span>🗳️ {positions.reduce((total, position) => {
                            return total + Object.values(votes[position.id] || {}).reduce((a, b) => a + b, 0);
                          }, 0)} total votes</span>
                        </div>
                        <div className="preview-details">
                          {exportFormat === 'json' && (
                            <p>📄 Complete structured data including metadata, summary, detailed results, and voted students list</p>
                          )}
                          {exportFormat === 'csv' && (
                            <p>📊 Spreadsheet-ready data with candidate rankings, votes, and percentages for each position</p>
                          )}
                          {exportFormat === 'txt' && (
                            <p>📋 Formatted report with winners highlighted, complete results breakdown, and voted students list</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="export-actions">
                      <button 
                        onClick={() => setShowExportModal(false)} 
                        className="cancel-export-btn"
                      >
                        ❌ Cancel
                      </button>
                      <button 
                        onClick={handleExportConfirm} 
                        className="confirm-export-btn"
                      >
                        💾 Export {exportFormat.toUpperCase()}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'positions' && (
            <div className="positions-tab">
              <PositionManager 
                positions={positions}
                onUpdatePositions={setPositions}
                candidates={candidates}
                setCandidates={setCandidates}
                votes={votes}
                setVotes={setVotes}
              />
            </div>
          )}          {activeTab === 'candidates' && (
            <div className="candidates-tab">
              <h2>📋 Manage Candidates</h2>
              
              {/* Add New Candidate Form */}
              <div className="add-candidate-section">
                <h3>➕ Add New Candidate</h3>
                <form onSubmit={handleAddCandidate} className="candidate-form">
                  <div className="form-grid">
                    <div className="input-group">
                      <label>Candidate Name</label>
                      <input
                        type="text"
                        placeholder="Enter full name"
                        value={newCandidate.name}
                        onChange={(e) => setNewCandidate(prev => ({
                          ...prev,
                          name: e.target.value
                        }))}
                        required
                      />
                    </div>
                    <div className="input-group">
                      <label>Grade/Class</label>
                      <input
                        type="text"
                        placeholder="e.g., 12th, Grade 11"
                        value={newCandidate.grade}
                        onChange={(e) => setNewCandidate(prev => ({
                          ...prev,
                          grade: e.target.value
                        }))}
                        required
                      />
                    </div>                    <div className="input-group">
                      <label>Position</label>
                      <select
                        value={newCandidate.position}
                        onChange={(e) => setNewCandidate(prev => ({
                          ...prev,
                          position: e.target.value
                        }))}
                      >
                        {positions.filter(pos => pos.isActive).map(position => (
                          <option key={position.id} value={position.id}>
                            {position.displayName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="input-group symbol-input-group">
                      <label>Election Symbol</label>
                      <div className="symbol-selection">
                        <input
                          type="text"
                          placeholder="Select or enter symbol"
                          value={newCandidate.symbol}
                          onChange={(e) => setNewCandidate(prev => ({
                            ...prev,
                            symbol: e.target.value
                          }))}
                          className="symbol-input"
                          maxLength="2"
                        />
                        <button 
                          type="button" 
                          className="random-symbol-btn"
                          onClick={() => setNewCandidate(prev => ({
                            ...prev,
                            symbol: getRandomSymbol()
                          }))}
                          title="Get random symbol"
                        >
                          🎲
                        </button>
                      </div>
                      <div className="symbol-preview">
                        {newCandidate.symbol && (
                          <span className="preview-symbol">{newCandidate.symbol}</span>
                        )}
                      </div>
                      <div className="available-symbols">
                        <small>Available symbols:</small>
                        <div className="symbol-grid">
                          {availableSymbols.slice(0, 12).map(symbol => (
                            <button
                              key={symbol}
                              type="button"
                              className="symbol-option"
                              onClick={() => setNewCandidate(prev => ({
                                ...prev,
                                symbol: symbol
                              }))}
                            >
                              {symbol}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="input-group">
                      <button type="submit" className="add-candidate-btn">
                        ➕ Add Candidate
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Edit Candidate Modal */}
              {editingCandidate && (
                <div className="edit-modal-overlay">
                  <div className="edit-modal">
                    <h3>✏️ Edit Candidate</h3>
                    <form onSubmit={handleUpdateCandidate} className="candidate-form">
                      <div className="form-grid">
                        <div className="input-group">
                          <label>Candidate Name</label>
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm(prev => ({
                              ...prev,
                              name: e.target.value
                            }))}
                            required
                          />
                        </div>
                        <div className="input-group">
                          <label>Grade/Class</label>
                          <input
                            type="text"
                            value={editForm.grade}
                            onChange={(e) => setEditForm(prev => ({
                              ...prev,
                              grade: e.target.value
                            }))}
                            required
                          />
                        </div>                        <div className="input-group">
                          <label>Position</label>
                          <select
                            value={editForm.position}
                            onChange={(e) => setEditForm(prev => ({
                              ...prev,
                              position: e.target.value
                            }))}
                          >
                            {positions.filter(pos => pos.isActive).map(position => (
                              <option key={position.id} value={position.id}>
                                {position.displayName}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="input-group symbol-input-group">
                          <label>Election Symbol</label>
                          <div className="symbol-selection">
                            <input
                              type="text"
                              placeholder="Select or enter symbol"
                              value={editForm.symbol}
                              onChange={(e) => setEditForm(prev => ({
                                ...prev,
                                symbol: e.target.value
                              }))}
                              className="symbol-input"
                              maxLength="2"
                            />
                            <button 
                              type="button" 
                              className="random-symbol-btn"
                              onClick={() => setEditForm(prev => ({
                                ...prev,
                                symbol: getRandomSymbol()
                              }))}
                              title="Get random symbol"
                            >
                              🎲
                            </button>
                          </div>
                          <div className="symbol-preview">
                            {editForm.symbol && (
                              <span className="preview-symbol">{editForm.symbol}</span>
                            )}
                          </div>
                          <div className="available-symbols">
                            <small>Available symbols:</small>
                            <div className="symbol-grid">
                              {availableSymbols.slice(0, 12).map(symbol => (
                                <button
                                  key={symbol}
                                  type="button"
                                  className="symbol-option"
                                  onClick={() => setEditForm(prev => ({
                                    ...prev,
                                    symbol: symbol
                                  }))}
                                >
                                  {symbol}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="modal-actions">
                        <button type="button" onClick={handleCancelEdit} className="cancel-btn">
                          ❌ Cancel
                        </button>
                        <button type="submit" className="update-btn">
                          ✅ Update Candidate
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}              {/* Candidates Lists */}
              <div className="candidates-sections">
                {/* Print Candidates Button */}
                <div className="candidates-actions">
                  <button 
                    onClick={handlePrintCandidates}
                    className="print-candidates-btn"
                    title="Print complete candidates list"
                  >
                    🖨️ Print Candidates List
                  </button>
                </div>

                {/* Dynamic Position Sections */}
                {positions.filter(pos => pos.isActive).map(position => (
                  <div key={position.id} className="position-section">
                    <h3>
                      {position.id === 'schoolLeader' ? '👦' : 
                       position.id === 'ladySchoolLeader' ? '👧' : '🏛️'} {position.displayName} Candidates ({(candidates[position.id] || []).length})
                    </h3>
                    <div className="candidates-grid">
                      {(candidates[position.id] || []).map(candidate => (
                        <div key={candidate.id} className="candidate-card">
                          <div className="candidate-header">
                            <div className={`candidate-avatar ${position.id === 'ladySchoolLeader' ? 'lady' : ''}`}>
                              {candidate.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="candidate-symbol-display">
                              {candidate.symbol || '❓'}
                            </div>
                            <div className="candidate-info">
                              <h4>{candidate.name}</h4>
                              <p>Grade: {candidate.grade}</p>
                              <p className="symbol-info">Symbol: <span className="symbol-badge">{candidate.symbol || '❓'}</span></p>
                              <span className="vote-count">
                                🗳️ {votes[position.id]?.[candidate.id] || 0} votes
                              </span>
                            </div>
                          </div>
                          <div className="candidate-actions">
                            <button 
                              onClick={() => handleEditCandidate(position.id, candidate)}
                              className="edit-btn"
                            >
                              ✏️ Edit
                            </button>
                            <button 
                              onClick={() => handleRemoveCandidate(position.id, candidate.id)}
                              className="remove-btn"
                            >
                              🗑️ Remove
                            </button>
                          </div>
                        </div>
                      ))}
                      {(candidates[position.id] || []).length === 0 && (
                        <div className="no-candidates">
                          <p>No candidates added yet for {position.displayName} position.</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <div className="students-tab">
              <h2>Student Voting Records</h2>
              <p>Summary view only</p>

              <div className="students-summary-grid">
                <div className="student-summary-card voted">
                  <h3>Students Voted</h3>
                  <div className="student-summary-number">{votedStudents.length}</div>
                </div>
                <div className="student-summary-card remaining">
                  <h3>Students Remaining</h3>
                  <div className="student-summary-number">{Math.max(0, safeTotalEligibleStudents - votedStudents.length)}</div>
                </div>
                <div className="student-summary-card eligible">
                  <h3>Total Eligible Students</h3>
                  <div className="student-summary-number">{safeTotalEligibleStudents}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="settings-tab">
              <h2>System Settings</h2>
              
              <div className="settings-section">
                <h3>Election Configuration</h3>
                <div className="setting-item">
                  <label htmlFor="totalEligibleStudentsInput">Total Eligible Students:</label>
                  <div className="setting-input-group">
                    <input
                      id="totalEligibleStudentsInput"
                      type="number"
                      min="1"
                      step="1"
                      value={eligibleStudentsDraft}
                      onChange={(e) => {
                        setEligibleStudentsDraft(e.target.value);
                        if (settingsSaveMessage) {
                          setSettingsSaveMessage('');
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="save-settings-btn"
                      onClick={handleSaveEligibleStudents}
                    >
                      Save
                    </button>
                  </div>
                </div>
                {settingsSaveMessage && (
                  <p className="settings-save-message">{settingsSaveMessage}</p>
                )}
                <div className="setting-item">
                  <label>Allow Multiple Votes per Student:</label>
                  <span className="setting-value">Disabled (Security)</span>
                </div>
                <div className="setting-item">
                  <label>Voting Session Timeout:</label>
                  <span className="setting-value">10 minutes</span>
                </div>
                <div className="setting-item">
                  <label>Real-time Results:</label>
                  <span className="setting-value">Enabled</span>
                </div>
              </div>              <div className="danger-zone">
                <h3>⚠️ Danger Zone</h3>
                <div className="danger-buttons">
                  <button onClick={onResetVotes} className="reset-button">
                    🗳️ Reset Votes Only
                  </button>
                  <button onClick={onClearAllData} className="danger-button">
                    🗑️ Clear ALL Data
                  </button>
                </div>
                <div className="debug-section">
                  <button onClick={onDebugStorage} className="debug-button">
                    🔍 Debug Storage Data
                  </button>
                </div>
                <p className="danger-warning">
                  ⚠️ "Reset Votes Only" clears votes but keeps candidates.<br/>
                  💀 "Clear ALL Data" removes everything including candidates!<br/>
                  🔍 "Debug Storage" shows data in browser console for troubleshooting.
                </p>
              </div>
            </div>
          )}

          {/* Voting Status Tab */}
          {activeTab === 'voting-status' && (
            <div className="voting-status-tab">
              <h2>📊 Voting Status & Statistics</h2>
              
              {/* Overall Statistics */}
              <div className="overall-stats-section">
                <h3>🎯 Overall Voting Statistics</h3>
                <div className="overall-stats-grid">
                  <div className="overall-stat-card primary">
                    <div className="stat-icon">🗳️</div>
                    <div className="stat-content">
                      <h4>Total Participation</h4>
                      <div className="stat-value">{getOverallStats().percentage}%</div>
                      <p>{getOverallStats().totalVoted} out of {getOverallStats().totalStudents} students</p>
                    </div>
                  </div>
                  
                  <div className="overall-stat-card success">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                      <h4>Students Voted</h4>
                      <div className="stat-value">{getOverallStats().totalVoted}</div>
                      <p>Out of {safeTotalEligibleStudents} eligible students</p>
                    </div>
                  </div>
                  
                  <div className="overall-stat-card info">
                    <div className="stat-icon">📈</div>
                    <div className="stat-content">
                      <h4>Total Votes Cast</h4>
                      <div className="stat-value">{getOverallStats().totalVotesCast}</div>
                      <p>Both positions combined</p>
                    </div>
                  </div>
                  
                  <div className="overall-stat-card warning">
                    <div className="stat-icon">⭐</div>
                    <div className="stat-content">
                      <h4>Avg Votes/Student</h4>
                      <div className="stat-value">{getOverallStats().averageVotesPerStudent}</div>
                      <p>Votes per participating student</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="progress-section">
                <h3>📊 Participation Progress</h3>
                <div className="progress-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${getOverallStats().percentage}%` }}
                    ></div>
                  </div>
                  <div className="progress-labels">
                    <span>0%</span>
                    <span className="current-progress">{getOverallStats().percentage}%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              <div className="detailed-stats-section">
                <div className="section-header">
                  <h3>🧮 Student Voting Totals</h3>
                </div>
                <p>Total-only view is enabled. Class-wise voted counts are hidden.</p>
              </div>
              
              {/* Quick Actions for Voting Status */}
              <div className="voting-status-actions">
                <h3>🚀 Quick Actions</h3>
                <div className="action-buttons">
                  <button 
                    onClick={exportResults}
                    className="action-btn success"
                  >
                    📤 Export Statistics
                  </button>
                  <button 
                    onClick={() => {
                      setIsVotingStatusUnlocked(false);
                      setActiveTab('overview');
                    }}
                    className="action-btn warning"
                  >
                    🔒 Lock & Exit
                  </button>
                </div>
              </div>            </div>
          )}

          {/* School Info Management Tab */}
          {activeTab === 'school-info' && (
            <div className="school-info-tab">
              <h2>🏫 School Information Management</h2>
              
              <div className="school-info-section">
                <div className="current-info-display">
                  <h3>📋 Current School Information</h3>
                  <div className="info-display-card">
                    <div className="info-item">
                      <strong>School Name:</strong>
                      <span>{schoolInfo.name}</span>
                    </div>
                    <div className="info-item">
                      <strong>Place/Location:</strong>
                      <span>{schoolInfo.place}</span>
                    </div>
                    <div className="info-item">
                      <strong>Full Display Name:</strong>
                      <span>{schoolInfo.fullName}</span>
                    </div>
                  </div>
                  
                  {!isEditingSchoolInfo && (
                    <button 
                      onClick={() => setIsEditingSchoolInfo(true)}
                      className="edit-school-info-btn"
                    >
                      ✏️ Edit School Information
                    </button>
                  )}
                </div>

                {isEditingSchoolInfo && (
                  <div className="school-info-form-section">
                    <h3>✏️ Edit School Information</h3>
                    <form onSubmit={handleSchoolInfoSubmit} className="school-info-form">
                      <div className="form-group">
                        <label htmlFor="school-name">
                          <strong>School Name *</strong>
                          <span className="field-hint">Main name of the institution</span>
                        </label>
                        <input
                          id="school-name"
                          type="text"
                          value={schoolInfoForm.name}
                          onChange={(e) => setSchoolInfoForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Bharathiya Vidya Bhavan"
                          required
                          maxLength={100}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="school-place">
                          <strong>Place/Location *</strong>
                          <span className="field-hint">City or location where school is situated</span>
                        </label>
                        <input
                          id="school-place"
                          type="text"
                          value={schoolInfoForm.place}
                          onChange={(e) => setSchoolInfoForm(prev => ({ ...prev, place: e.target.value }))}
                          placeholder="e.g., Valanchery"
                          required
                          maxLength={50}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="school-full-name">
                          <strong>Full Display Name</strong>
                          <span className="field-hint">How it appears in headers and certificates (auto-generated if empty)</span>
                        </label>
                        <input
                          id="school-full-name"
                          type="text"
                          value={schoolInfoForm.fullName}
                          onChange={(e) => setSchoolInfoForm(prev => ({ ...prev, fullName: e.target.value }))}
                          placeholder="e.g., Bharathiya Vidya Bhavan Valanchery"
                          maxLength={150}
                        />
                        <div className="auto-preview">
                          <strong>Preview:</strong> {schoolInfoForm.fullName || `${schoolInfoForm.name.trim()}, ${schoolInfoForm.place.trim()}`}
                        </div>
                      </div>

                      <div className="form-actions">
                        <button 
                          type="button" 
                          onClick={handleCancelSchoolInfoEdit}
                          className="cancel-btn"
                        >
                          ❌ Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="save-btn"
                        >
                          💾 Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="school-info-usage">
                  <h3>📍 Where This Information Appears</h3>
                  <div className="usage-list">
                    <div className="usage-item">
                      <span className="usage-icon">🖥️</span>
                      <div className="usage-content">
                        <strong>Main Header</strong>
                        <p>Displayed at the top of the voting interface</p>
                      </div>
                    </div>
                    <div className="usage-item">
                      <span className="usage-icon">🖨️</span>
                      <div className="usage-content">
                        <strong>Printed Materials</strong>
                        <p>Candidate lists, results, and certificates</p>
                      </div>
                    </div>
                    <div className="usage-item">
                      <span className="usage-icon">📊</span>
                      <div className="usage-content">
                        <strong>Export/Reports</strong>
                        <p>CSV exports and result summaries</p>
                      </div>
                    </div>
                    <div className="usage-item">
                      <span className="usage-icon">🏆</span>
                      <div className="usage-content">
                        <strong>Winner Certificates</strong>
                        <p>Official certificates for elected candidates</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="school-info-tips">
                  <h3>💡 Tips</h3>
                  <ul className="tips-list">
                    <li><strong>Keep it professional:</strong> Use the official name as it appears on documents</li>
                    <li><strong>Check spelling:</strong> This information appears on printed certificates</li>
                    <li><strong>Full name:</strong> If left empty, it will automatically combine name + place</li>
                    <li><strong>Changes are immediate:</strong> Updates apply to all new prints and displays</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Password Modal for Voting Status */}
          {showVotingStatus && (
            <div className="voting-status-modal-overlay">
              <div className="voting-status-modal">
                <h3>🔐 Voting Status Access</h3>
                <p>This section contains sensitive voting statistics. Please enter the password to continue.</p>
                
                <form onSubmit={handleVotingStatusLogin} className="status-login-form">
                  <div className="input-group">
                    <label>Password:</label>
                    <input
                      type="password"
                      value={votingStatusPassword}
                      onChange={(e) => setVotingStatusPassword(e.target.value)}
                      placeholder="Enter password"
                      autoFocus
                      required
                    />
                  </div>
                  
                  <div className="modal-actions">
                    <button 
                      type="button" 
                      onClick={() => {
                        setShowVotingStatus(false);
                        setVotingStatusPassword('');
                      }}
                      className="cancel-btn"
                    >
                      ❌ Cancel
                    </button>
                    <button type="submit" className="access-btn">
                      🔓 Access Statistics
                    </button>
                  </div>
                </form>
                
                <div className="password-hint">
                  <p><strong>Password:</strong> Use admin password</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
