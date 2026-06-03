// School Election Voting System - Main Application Component
// Developed for educational institutions to manage digital voting

import React, { useState, useEffect } from 'react';
import './App.css';
import VotingInterface from './components/VotingInterface';
import AdminPanel from './components/AdminPanel';
import Results from './components/Results';
import LoginModal from './components/LoginModal';
import ErrorBoundary from './components/ErrorBoundary';

const DEFAULT_TOTAL_ELIGIBLE_STUDENTS = 180;

// StatusView Component
function StatusView({ 
  votedStudents, 
  votes, 
  candidates, 
  onBack, 
  electionCompleted, 
  votingPaused, 
  onCompleteVoting, 
  positions, 
  onPauseVoting, 
  onResumeVoting, 
  schoolInfo,
  totalEligibleStudents
}) {
  const totalVotesCast = positions
    .filter(pos => pos.isActive)
    .reduce((sum, position) => sum + Object.values(votes[position.id] || {}).reduce((a, b) => a + b, 0), 0);
  const safeTotalEligibleStudents = Math.max(1, parseInt(totalEligibleStudents, 10) || DEFAULT_TOTAL_ELIGIBLE_STUDENTS);
  const participationRate = ((votedStudents.length / safeTotalEligibleStudents) * 100).toFixed(1);

  return (
    <div className="status-view">
      <div className="status-header">
        <h2>📊 Voting Status Overview</h2>
        <button onClick={onBack} className="back-btn">
          ← Back
        </button>
      </div>
      
      <div className="status-content">
        {/* Overall Stats Card */}
        <div className="status-card">
          <h3>📈 Overall Participation</h3>
          <div className="stat-item">
            <span className="stat-label">Total Students Voted:</span>
            <span className="stat-value">{votedStudents.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Votes Cast:</span>
            <span className="stat-value">{totalVotesCast}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Participation Rate:</span>
            <span className="stat-value">
              {participationRate}%
            </span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${participationRate}%` }}
            ></div>
          </div>
          <p className="progress-text">
            {votedStudents.length} out of {safeTotalEligibleStudents} eligible students have voted
          </p>
        </div>

        {/* Quick Stats Card */}
        <div className="status-card">
          <h3>📋 Quick Stats</h3>
          <div className="quick-stats">
            {positions.filter(pos => pos.isActive).map(position => (
              <div key={position.id} className="quick-stat">
                <div className="quick-stat-number">
                  {Object.values(votes[position.id] || {}).reduce((a, b) => a + b, 0)}
                </div>
                <div className="quick-stat-label">{position.displayName} Votes</div>
              </div>
            ))}
            <div className="quick-stat">
              <div className="quick-stat-number">
                {positions.filter(pos => pos.isActive).reduce((total, position) => 
                  total + (candidates[position.id] || []).length, 0
                )}
              </div>
              <div className="quick-stat-label">Total Candidates</div>
            </div>
          </div>
        </div>

        <div className="status-card summary-card">
          <h3>📝 Voting Summary</h3>
          <div className="summary-stats">
            <div className="summary-item">
              <span className="summary-label">Eligible Students Configured:</span>
              <span className="summary-value good">{safeTotalEligibleStudents}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Students Voted:</span>
              <span className="summary-value moderate">{votedStudents.length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">No class-wise split is shown.</span>
              <span className="summary-value low">Total-only view</span>
            </div>
          </div>
        </div>

        {/* Voting Control Actions */}
        <div className="status-card admin-controls-card">
          <h3>⚙️ Voting Control Center</h3>
          <div className="admin-controls">
            <div className="voting-status-indicator">
              <div className={`status-badge ${electionCompleted ? 'completed' : votingPaused ? 'paused' : 'active'}`}>
                {electionCompleted ? '🏁 Election Completed' : votingPaused ? '⏸️ Voting Paused' : '� Voting Active'}
              </div>
            </div>
            
            <div className="control-buttons">
              {!electionCompleted && !votingPaused && (
                <button 
                  onClick={onPauseVoting}
                  className="control-btn pause-btn"
                  title="Temporarily pause voting (admin password required)"
                >
                  ⏸️ Pause Voting
                </button>
              )}
              
              {!electionCompleted && votingPaused && (
                <button 
                  onClick={onResumeVoting}
                  className="control-btn resume-btn"
                  title="Resume voting (admin password required)"
                >
                  ▶️ Resume Voting
                </button>
              )}
              
              {!electionCompleted && (
                <button 
                  onClick={onCompleteVoting}
                  className="control-btn complete-btn"
                  title="Complete election permanently (admin password required)"
                >
                  🏁 Complete Election
                </button>
              )}
              
              <button 
                onClick={() => printElectionStatus()}
                className="control-btn print-btn"
                title="Print current election status and trends"
              >
                🖨️ Print Status Report
              </button>
            </div>
          </div>
        </div>

        <div className="status-note">
          <p>�🔒 For detailed analytics and management, access the Admin panel</p>
          <p>📊 Live updates - Data refreshes automatically</p>
        </div>
      </div>
    </div>
  );

  // Print Election Status Function
  function printElectionStatus() {
    const printWindow = window.open('', '_blank');
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    
    const totalVoted = votedStudents.length;
    const totalStudents = safeTotalEligibleStudents;
    const overallPercentage = ((totalVoted / totalStudents) * 100).toFixed(1);
    
    // Calculate vote distribution
    const positionVotes = {};
    let totalVotesCast = 0;
    
    positions.filter(pos => pos.isActive).forEach(position => {
      const positionTotal = Object.values(votes[position.id] || {}).reduce((a, b) => a + b, 0);
      positionVotes[position.id] = positionTotal;
      totalVotesCast += positionTotal;
    });

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Election Status Report - ${schoolInfo?.fullName || 'School Election'}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 20px;
            background: white;
            color: #333;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #1976d2;
            padding-bottom: 25px;
          }
          .header h1 {
            color: #1976d2;
            margin: 0;
            font-size: 2.5rem;
            font-weight: bold;
          }
          .header .subtitle {
            color: #666;
            font-size: 1.2rem;
            margin: 10px 0;
          }
          .header .timestamp {
            color: #888;
            font-size: 1rem;
            margin-top: 15px;
          }
          .status-indicator {
            text-align: center;
            margin: 30px 0;
            padding: 20px;
            border-radius: 12px;
            font-size: 1.2rem;
            font-weight: bold;
          }
          .status-active { background: #e8f5e8; border: 2px solid #4caf50; color: #2e7d32; }
          .status-paused { background: #fff3e0; border: 2px solid #ff9800; color: #f57c00; }
          .status-completed { background: #e3f2fd; border: 2px solid #2196f3; color: #1976d2; }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 30px;
          }
          .summary-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            border: 1px solid #e0e0e0;
            text-align: center;
          }
          .summary-card h3 {
            margin: 0 0 10px 0;
            color: #1976d2;
            font-size: 1.1rem;
          }
          .summary-number {
            font-size: 2rem;
            font-weight: bold;
            color: #333;
            margin: 10px 0;
          }
          .class-stats-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .class-stats-table th {
            background: #1976d2;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: bold;
          }
          .class-stats-table td {
            padding: 10px 12px;
            border: 1px solid #ddd;
          }
          .class-stats-table tr:nth-child(even) {
            background: #f9f9f9;
          }
          .progress-bar {
            background: #e0e0e0;
            border-radius: 10px;
            height: 8px;
            overflow: hidden;
            margin: 5px 0;
          }
          .progress-fill {
            background: linear-gradient(135deg, #4caf50, #66bb6a);
            height: 100%;
            transition: width 0.3s ease;
          }
          .section-title {
            color: #1976d2;
            border-bottom: 2px solid #1976d2;
            padding-bottom: 10px;
            margin: 30px 0 20px 0;
            font-size: 1.4rem;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            color: #666;
            font-size: 0.9rem;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
          @media print {
            body { margin: 0; font-size: 12pt; }
            .header { page-break-after: avoid; }
            .summary-grid { grid-template-columns: repeat(2, 1fr); }
            .class-stats-table { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 Election Status Report</h1>
          <p class="subtitle">${schoolInfo?.fullName || 'School Election System'}</p>
          <p class="timestamp">Generated on: ${currentDate} at ${currentTime}</p>
        </div>
        
        <div class="status-indicator ${electionCompleted ? 'status-completed' : votingPaused ? 'status-paused' : 'status-active'}">
          ${electionCompleted ? '🏁 Election Completed - Final Results Available' : 
            votingPaused ? '⏸️ Voting Currently Paused - Temporarily Suspended' : 
            '🟢 Voting Active - Students Can Vote Now'}
        </div>

        <h2 class="section-title">📈 Overall Statistics</h2>
        <div class="summary-grid">
          <div class="summary-card">
            <h3>Total Participation</h3>
            <div class="summary-number">${overallPercentage}%</div>
            <p>${totalVoted} out of ${totalStudents} students</p>
          </div>
          <div class="summary-card">
            <h3>Votes Cast</h3>
            <div class="summary-number">${totalVotesCast}</div>
            <p>Total votes across all positions</p>
          </div>
          ${positions.filter(pos => pos.isActive).map(position => `
            <div class="summary-card">
              <h3>${position.displayName} Votes</h3>
              <div class="summary-number">${positionVotes[position.id] || 0}</div>
              <p>${(candidates[position.id] || []).length} candidates</p>
            </div>
          `).join('')}
        </div>

        <h2 class="section-title">🧮 Student Voting Totals</h2>
        <div class="summary-card">
          <h3>Total Students Voted</h3>
          <div class="summary-number">${totalVoted}</div>
          <p>Configured eligible students: ${totalStudents}</p>
        </div>

        <div class="footer">
          <p><strong>School Election Management System</strong></p>
          <p>This is an official election status report containing live data at the time of generation.</p>
          <p>For questions about the election, please contact school administration.</p>
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
  }

  // Return at end of StatusView component
}

function App() {
  const [currentView, setCurrentView] = useState('login');
  const [currentStudent, setCurrentStudent] = useState(null);
  const [totalEligibleStudents, setTotalEligibleStudents] = useState(() => {
    try {
      const saved = localStorage.getItem('schoolElection_totalEligibleStudents');
      const parsed = saved ? parseInt(JSON.parse(saved), 10) : DEFAULT_TOTAL_ELIGIBLE_STUDENTS;
      return Number.isNaN(parsed) || parsed < 1 ? DEFAULT_TOTAL_ELIGIBLE_STUDENTS : parsed;
    } catch (error) {
      console.error('Error loading total eligible students:', error);
      return DEFAULT_TOTAL_ELIGIBLE_STUDENTS;
    }
  });

  const ADMIN_PASSWORDS = ['SecureAdmin2024!', 'SecureAdmin2026', 'Admin2026', 'swathi1997'];
  const LEGACY_RESULTS_PASSWORD = 'SecureResults2024!';
  const LEGACY_STATUS_PASSWORD = 'status123';
  const LEGACY_SECURE_EXIT_PASSWORD = 'close123';

  // Password dialog states
  const [passwordDialog, setPasswordDialog] = useState({
    show: false,
    type: '', // 'admin', 'results', 'status', 'reset-votes', 'clear-all', 'complete-election', 'pause-voting', 'resume-voting'
    password: '',
    error: ''
  });

  // Election completion state
  const [electionCompleted, setElectionCompleted] = useState(() => {
    try {
      const saved = localStorage.getItem('schoolElection_completed');
      return saved ? JSON.parse(saved) : false;
    } catch (error) {
      console.error('Error loading election completion status:', error);
      return false;
    }
  });

  // Results declaration state - tracks if results have been officially published
  const [resultsPublished, setResultsPublished] = useState(() => {
    try {
      const saved = localStorage.getItem('schoolElection_resultsPublished');
      return saved ? JSON.parse(saved) : false;
    } catch (error) {
      console.error('Error loading results publication status:', error);
      return false;
    }
  });

  // Persistent tie-breaker results
  const [tieBreakerResults, setTieBreakerResults] = useState(() => {
    try {
      const saved = localStorage.getItem('schoolElection_tieBreakers');
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Error loading tie-breaker results:', error);
      return {};
    }
  });

  // Load data from localStorage or use defaults
  const [votedStudents, setVotedStudents] = useState(() => {
    try {
      const saved = localStorage.getItem('schoolElection_votedStudents');
      const loadedStudents = saved ? JSON.parse(saved) : [];
      console.log('Loaded voted students from localStorage:', loadedStudents);
      return loadedStudents;
    } catch (error) {
      console.error('Error loading voted students from localStorage:', error);
      return [];
    }
  });

  // School information state
  const [schoolInfo, setSchoolInfo] = useState(() => {
    try {
      const saved = localStorage.getItem('schoolElection_schoolInfo');
      return saved ? JSON.parse(saved) : {
        name: 'Bharathiya Vidya Bhavan Valanchery',
        place: 'Valanchery',
        fullName: 'Bharathiya Vidya Bhavan Valanchery'
      };
    } catch (error) {
      console.error('Error loading school info from localStorage:', error);
      return {
        name: 'Bharathiya Vidya Bhavan Valanchery',
        place: 'Valanchery',
        fullName: 'Bharathiya Vidya Bhavan Valanchery'
      };
    }
  });

  // Voting pause/resume state
  const [votingPaused, setVotingPaused] = useState(() => {
    try {
      const saved = localStorage.getItem('schoolElection_votingPaused');
      return saved ? JSON.parse(saved) : false;
    } catch (error) {
      console.error('Error loading voting pause status:', error);
      return false;
    }
  });

  // Save election completion state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('schoolElection_completed', JSON.stringify(electionCompleted));
    } catch (error) {
      console.error('Error saving election completion status:', error);
    }
  }, [electionCompleted]);

  // Save results publication state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('schoolElection_resultsPublished', JSON.stringify(resultsPublished));
    } catch (error) {
      console.error('Error saving results publication status:', error);
    }
  }, [resultsPublished]);

  // Save tie-breaker results to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('schoolElection_tieBreakers', JSON.stringify(tieBreakerResults));
    } catch (error) {
      console.error('Error saving tie-breaker results:', error);
    }
  }, [tieBreakerResults]);

  // Save school info to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('schoolElection_schoolInfo', JSON.stringify(schoolInfo));
    } catch (error) {
      console.error('Error saving school info to localStorage:', error);
    }
  }, [schoolInfo]);

  // Save voting pause state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('schoolElection_votingPaused', JSON.stringify(votingPaused));
    } catch (error) {
      console.error('Error saving voting pause status:', error);
    }
  }, [votingPaused]);

  // Save eligible students configuration to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('schoolElection_totalEligibleStudents', JSON.stringify(totalEligibleStudents));
    } catch (error) {
      console.error('Error saving total eligible students:', error);
    }
  }, [totalEligibleStudents]);

  const completeElection = () => {
    setPasswordDialog({
      show: true,
      type: 'complete-election',
      password: '',
      error: ''
    });
  };

  const executeCompleteElection = () => {
    setElectionCompleted(true);
    
    // Show success message without automatically navigating to results
    setTimeout(() => {
      alert('🎉 Election completed successfully!\n\n✅ Results are now final\n❌ Voting is disabled\n📊 Use "Declare Results" to view final results\n🔐 Admin password required for results access');
    }, 500);
  };
  useEffect(() => {
    // Add/remove protection class to body
    if (currentStudent || currentView === 'voting') {
      document.body.classList.add('voting-protected');
    } else {
      document.body.classList.remove('voting-protected');
    }

    // Handle custom navigation event from LoginModal
    const handleNavigateToResults = () => {
      // Trigger password dialog instead of directly showing results
      setPasswordDialog({
        show: true,
        type: 'results',
        password: '',
        error: ''
      });
    };

    window.addEventListener('navigate-to-results', handleNavigateToResults);

    const handleBeforeUnload = (e) => {
      // Only protect when student is logged in or voting
      if (currentStudent || currentView === 'voting') {
        e.preventDefault();
        e.returnValue = 'Voting session is protected. Use the Exit button to close safely.';
        return 'Voting session is protected. Use the Exit button to close safely.';
      }
    };

    // Stronger protection - prevent actual closing
    const handleUnload = (e) => {
      if (currentStudent || currentView === 'voting') {
        e.preventDefault();
        return false;
      }
    };

    // Detect browser close attempts more aggressively
    const handleKeyDown = (e) => {
      if (currentStudent || currentView === 'voting') {
        // Prevent Alt+F4 (Windows close)
        if (e.altKey && e.keyCode === 115) {
          e.preventDefault();
          alert('Alt+F4 is disabled during voting. Use the Exit button.');
          return false;
        }
        // Prevent Ctrl+W (Close tab)
        if (e.ctrlKey && e.keyCode === 87) {
          e.preventDefault();
          alert('Ctrl+W is disabled during voting. Use the Exit button.');
          return false;
        }
        // Prevent Ctrl+Shift+W (Close window)
        if (e.ctrlKey && e.shiftKey && e.keyCode === 87) {
          e.preventDefault();
          alert('Window closing shortcuts are disabled during voting.');
          return false;
        }
        // F12
        if (e.keyCode === 123) {
          e.preventDefault();
          alert('Developer tools are disabled during voting.');
        }
        // Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+U
        if (e.ctrlKey && (
          (e.shiftKey && (e.keyCode === 73 || e.keyCode === 67)) || 
          e.keyCode === 85
        )) {
          e.preventDefault();
          alert('This action is disabled during voting.');
        }
      }
    };

    const handleVisibilityChange = () => {
      // Detect when user tries to switch tabs/minimize during voting
      if (document.hidden && (currentStudent || currentView === 'voting')) {
        setTimeout(() => {
          if (document.hidden) {
            const password = prompt('Unauthorized tab switch detected! Enter password to continue:');
            if (!ADMIN_PASSWORDS.includes(password) && password !== LEGACY_SECURE_EXIT_PASSWORD) {
              alert('Access denied! Redirecting to login.');
              setCurrentStudent(null);
              setCurrentView('login');
            }
          }
        }, 2000); // 2 second delay to detect sustained tab switch
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Prevent right-click context menu during voting
    const handleContextMenu = (e) => {
      if (currentStudent || currentView === 'voting') {
        e.preventDefault();
        alert('Right-click is disabled during voting session.');
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('unload', handleUnload);

    // Cleanup function
    return () => {
      window.removeEventListener('navigate-to-results', handleNavigateToResults);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentStudent, currentView]);

  const normalizeDefaultPositionLabels = (positionList) => {
    if (!Array.isArray(positionList)) {
      return positionList;
    }

    return positionList.map(position => {
      if (position.id === 'schoolLeader') {
        return {
          ...position,
          name: 'Boy School Leader',
          displayName: 'Boy School Leader'
        };
      }

      if (position.id === 'ladySchoolLeader') {
        return {
          ...position,
          name: 'Girl School Leader',
          displayName: 'Girl School Leader'
        };
      }

      return position;
    });
  };

  // Positions management state
  const [positions, setPositions] = useState(() => {
    try {
      const saved = localStorage.getItem('schoolElection_positions');
      return saved ? normalizeDefaultPositionLabels(JSON.parse(saved)) : [
        {
          id: 'schoolLeader',
          name: 'Boy School Leader',
          displayName: 'Boy School Leader',
          description: 'The main leadership position for the school',
          maxCandidates: 10,
          isActive: true,
          order: 0,
          createdAt: '2024-01-01T00:00:00.000Z'
        },
        {
          id: 'ladySchoolLeader',
          name: 'Girl School Leader',
          displayName: 'Girl School Leader',
          description: 'The female leadership position for the school',
          maxCandidates: 10,
          isActive: true,
          order: 1,
          createdAt: '2024-01-01T00:00:00.000Z'
        }
      ];
    } catch (error) {
      console.error('Error loading positions from localStorage:', error);
      return [
        {
          id: 'schoolLeader',
          name: 'Boy School Leader',
          displayName: 'Boy School Leader',
          description: 'The main leadership position for the school',
          maxCandidates: 10,
          isActive: true,
          order: 0,
          createdAt: '2024-01-01T00:00:00.000Z'
        },
        {
          id: 'ladySchoolLeader',
          name: 'Girl School Leader',
          displayName: 'Girl School Leader',
          description: 'The female leadership position for the school',
          maxCandidates: 10,
          isActive: true,
          order: 1,
          createdAt: '2024-01-01T00:00:00.000Z'
        }
      ];
    }
  });

  const [candidates, setCandidates] = useState(() => {
    try {
      const saved = localStorage.getItem('schoolElection_candidates');
      if (saved) {
        const parsedCandidates = JSON.parse(saved);
        const legacyCandidateNames = [
          'Alex Johnson',
          'Sarah Miller',
          'Michael Chen',
          'Emma Wilson',
          'Jessica Brown',
          'Olivia Davis',
          'Sophia Garcia',
          'Maya Patel',
          'Isabella Rodriguez'
        ];
        const allSavedCandidates = Object.values(parsedCandidates || {}).flat();
        const hasLegacyCandidates = allSavedCandidates.some(candidate =>
          legacyCandidateNames.includes(candidate?.name)
        );

        if (!hasLegacyCandidates) {
          return parsedCandidates;
        }
      }
      
      // Initialize with sample candidates for default positions if they exist
      const defaultCandidates = {};
      
      // Check if we have the default positions and add sample candidates
      const schoolLeaderPos = positions.find(p => p.id === 'schoolLeader');
      const ladySchoolLeaderPos = positions.find(p => p.id === 'ladySchoolLeader');
      
      if (schoolLeaderPos) {
        defaultCandidates.schoolLeader = [
          { id: 1, name: 'Anay S', grade: 'N/A', image: null, symbol: '🎒' },
          { id: 2, name: 'Avinash V', grade: 'N/A', image: null, symbol: '🧰' },
          { id: 3, name: 'Lithin Babu', grade: 'N/A', image: null, symbol: '📚' }
        ];
      }
      
      if (ladySchoolLeaderPos) {
        defaultCandidates.ladySchoolLeader = [
          { id: 4, name: 'Anshika Sudeesh', grade: 'N/A', image: null, symbol: '🖊️' },
          { id: 5, name: 'Avanthika S', grade: 'N/A', image: null, symbol: '📏' },
          { id: 6, name: 'Thanmayee HS', grade: 'N/A', image: null, symbol: '🧽' }
        ];
      }
      
      return defaultCandidates;
    } catch (error) {
      console.error('Error loading candidates from localStorage:', error);
      return {};
    }
  });

  const [votes, setVotes] = useState(() => {
    try {
      const saved = localStorage.getItem('schoolElection_votes');
      if (saved) {
        const loadedVotes = JSON.parse(saved);
        console.log('Loaded votes from localStorage:', loadedVotes);
        return loadedVotes;
      }
      
      // Initialize with empty vote counts for all active positions
      const initialVotes = {};
      positions.filter(pos => pos.isActive).forEach(position => {
        initialVotes[position.id] = {};
      });
      
      return initialVotes;
    } catch (error) {
      console.error('Error loading votes from localStorage:', error);
      return {};
    }
  });

  // Candidate list modal state
  const [showCandidateList, setShowCandidateList] = useState(false);

  // Predefined symbols for candidates (unique election symbols)
  const availableSymbols = [
    '🦅', '🌟', '🚀', '🏆', '🌺', '🦋', '🌙', '⭐', '🌸', '🔥',
    '💎', '🌈', '⚡', '🎯', '🌅', '🎪', '🎨', '🎭', '🎵', '🎸',
    '🏃', '🏀', '⚽', '🏐', '🎾', '🏓', '🏸', '🥅', '🎲', '🎳',
    '📚', '📝', '📐', '📊', '📈', '📉', '🔬', '🔭', '💡', '🔋',
    '🛡️', '⚔️', '🏹', '🎪', '🎡', '🎢', '🎠', '🎪', '🎭', '🎨',
    '🌍', '🌎', '🌏', '🌋', '⛰️', '🏔️', '🗻', '🏕️', '🏖️', '🏝️'
  ];

  // Get unused symbols for new candidates
  const getAvailableSymbols = () => {
    const usedSymbols = [];
    
    // Collect symbols from all positions
    positions.forEach(position => {
      if (candidates[position.id]) {
        candidates[position.id].forEach(candidate => {
          if (candidate.symbol) {
            usedSymbols.push(candidate.symbol);
          }
        });
      }
    });
    
    return availableSymbols.filter(symbol => !usedSymbols.includes(symbol));
  };

  // Generate random unused symbol
  const getRandomSymbol = () => {
    const available = getAvailableSymbols();
    return available.length > 0 ? available[Math.floor(Math.random() * available.length)] : '🔴';
  };

  // Initialize vote counts for new candidates only
  useEffect(() => {
    setVotes(prevVotes => {
      const updatedVotes = { ...prevVotes };
      
      // Initialize votes for any new candidates that don't have vote counts yet
      positions.forEach(position => {
        if (!updatedVotes[position.id]) {
          updatedVotes[position.id] = {};
        }
        
        if (candidates[position.id]) {
          candidates[position.id].forEach(candidate => {
            if (!(candidate.id in updatedVotes[position.id])) {
              updatedVotes[position.id][candidate.id] = 0;
            }
          });
        }
      });
      
      return updatedVotes;
    });
  }, [candidates, positions]);

  // Save positions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('schoolElection_positions', JSON.stringify(positions));
    } catch (error) {
      console.error('Error saving positions to localStorage:', error);
    }
  }, [positions]);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem('schoolElection_votedStudents', JSON.stringify(votedStudents));
    } catch (error) {
      console.error('Error saving voted students to localStorage:', error);
    }
  }, [votedStudents]);

  useEffect(() => {
    try {
      localStorage.setItem('schoolElection_candidates', JSON.stringify(candidates));
    } catch (error) {
      console.error('Error saving candidates to localStorage:', error);
    }
  }, [candidates]);

  useEffect(() => {
    try {
      localStorage.setItem('schoolElection_votes', JSON.stringify(votes));
    } catch (error) {
      console.error('Error saving votes to localStorage:', error);
    }
  }, [votes]);

  const handleStudentLogin = (studentId = '') => {
    const normalizedStudentId = typeof studentId === 'string' ? studentId.trim() : '';
    const generatedStudentId = normalizedStudentId || `VOTER-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    if (normalizedStudentId && votedStudents.includes(normalizedStudentId)) {
      alert('This student has already voted!');
      return false;
    }

    setCurrentStudent(generatedStudentId);
    setCurrentView('voting');
    return true;
  };

  const handleVoteSubmit = (formattedVotes) => {
    if (!currentStudent) return;

    // Record the votes for each position
    setVotes(prevVotes => {
      const newVotes = { ...prevVotes };
      
      Object.entries(formattedVotes).forEach(([positionId, candidateId]) => {
        if (!newVotes[positionId]) {
          newVotes[positionId] = {};
        }
        const candidateIdInt = parseInt(candidateId);
        newVotes[positionId][candidateIdInt] = (newVotes[positionId][candidateIdInt] || 0) + 1;
      });
      
      return newVotes;
    });

    // Mark student as voted
    setVotedStudents(prev => [...prev, currentStudent]);
    setCurrentStudent(null);
    setCurrentView('login');

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        const audioContext = new AudioContextClass();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const now = audioContext.currentTime;

        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(1180, now);
        oscillator.frequency.exponentialRampToValueAtTime(1240, now + 2.7);

        gainNode.gain.setValueAtTime(0.0001, now);
        gainNode.gain.exponentialRampToValueAtTime(0.34, now + 0.03);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.start(now);
        oscillator.stop(now + 3.0);

        oscillator.onended = () => {
          audioContext.close().catch(() => {});
        };
      }
    } catch (error) {
      console.warn('Vote completion beep could not be played:', error);
    }
    
    alert('Vote submitted successfully! Thank you for voting.');
  };

  const handleAdminAccess = () => {
    setPasswordDialog({
      show: true,
      type: 'admin',
      password: '',
      error: ''
    });
  };

  const handleResultsAccess = () => {
    setPasswordDialog({
      show: true,
      type: 'results',
      password: '',
      error: ''
    });
  };

  const handleStatusAccess = () => {
    setPasswordDialog({
      show: true,
      type: 'status',
      password: '',
      error: ''
    });
  };

  const handleViewResultsFromLogin = () => {
    // Trigger the results password dialog
    setPasswordDialog({
      show: true,
      type: 'results',
      password: '',
      error: ''
    });
  };

  const handlePasswordSubmit = () => {
    const { type, password } = passwordDialog;
    let validPasswords = [];
    let targetView = '';

    switch (type) {
      case 'admin':
        validPasswords = [...ADMIN_PASSWORDS];
        targetView = 'admin';
        break;
      case 'results':
        validPasswords = [...ADMIN_PASSWORDS, LEGACY_RESULTS_PASSWORD];
        // Don't set targetView - will be handled separately
        break;
      case 'declare-results':
        validPasswords = [...ADMIN_PASSWORDS, LEGACY_RESULTS_PASSWORD];
        break;
      case 'status':
        validPasswords = [...ADMIN_PASSWORDS, LEGACY_STATUS_PASSWORD];
        targetView = 'status';
        break;
      case 'reset-votes':
        validPasswords = [...ADMIN_PASSWORDS];
        break;
      case 'clear-all':
        validPasswords = [...ADMIN_PASSWORDS];
        break;
      case 'complete-election':
        validPasswords = [...ADMIN_PASSWORDS];
        break;
      case 'pause-voting':
        validPasswords = [...ADMIN_PASSWORDS];
        break;
      case 'resume-voting':
        validPasswords = [...ADMIN_PASSWORDS];
        break;
      case 'complete-voting-status':
        validPasswords = [...ADMIN_PASSWORDS];
        break;
      default:
        return;
    }

    if (validPasswords.includes(password)) {
      setPasswordDialog({ show: false, type: '', password: '', error: '' });
      
      if (targetView) {
        setCurrentView(targetView);
      } else if (type === 'results') {
        // Handle results access based on election state
        if (electionCompleted && !resultsPublished) {
          // Election completed but results not published - start declaration workflow
          setCurrentView('results');
        } else {
          // Normal results access
          setCurrentView('results');
        }
      } else if (type === 'declare-results') {
        // Officially publish the results
        setResultsPublished(true);
        alert('✅ Results have been officially declared!\n\n📊 Final results are now public\n🖨️ Export and certificate options are available');
      } else if (type === 'reset-votes') {
        executeResetVotes();
      } else if (type === 'clear-all') {
        executeClearAllData();
      } else if (type === 'complete-election') {
        executeCompleteElection();
      } else if (type === 'pause-voting') {
        executePauseVoting();
      } else if (type === 'resume-voting') {
        executeResumeVoting();
      } else if (type === 'complete-voting-status') {
        executeCompleteVotingFromStatus();
      }
    } else {
      setPasswordDialog(prev => ({
        ...prev,
        error: 'Incorrect admin password!',
        password: ''
      }));
    }
  };

  const handlePasswordCancel = () => {
    setPasswordDialog({ show: false, type: '', password: '', error: '' });
  };

  const handleSecureExit = () => {
    const password = prompt('Enter password to exit safely:');
    if (ADMIN_PASSWORDS.includes(password) || password === LEGACY_SECURE_EXIT_PASSWORD) {
      setCurrentStudent(null);
      setCurrentView('login');
      alert('Exited safely. You can now close the browser if needed.');
    } else {
      alert('Incorrect password! Exit denied.');
    }
  };

  const resetVotes = () => {
    // First, ask for admin password
    setPasswordDialog({
      show: true,
      type: 'reset-votes',
      password: '',
      error: ''
    });
  };

  const clearAllData = () => {
    // First, ask for admin password
    setPasswordDialog({
      show: true,
      type: 'clear-all',
      password: '',
      error: ''
    });
  };

  const executeResetVotes = () => {
    if (window.confirm('Are you sure you want to reset all votes? This action cannot be undone.')) {
      // Clear localStorage
      try {
        localStorage.removeItem('schoolElection_votes');
        localStorage.removeItem('schoolElection_votedStudents');
        localStorage.removeItem('schoolElection_completed');
        localStorage.removeItem('schoolElection_resultsPublished');
        localStorage.removeItem('schoolElection_tieBreakers');
      } catch (error) {
        console.error('Error clearing localStorage:', error);
      }

      // Reset state
      const initialVotes = {};
      positions.forEach(position => {
        initialVotes[position.id] = {};
      });
      
      setVotes(initialVotes);
      setVotedStudents([]);
      setElectionCompleted(false);
      setResultsPublished(false);
      setTieBreakerResults({});
      
      // Reinitialize vote counts for all candidates
      const updatedVotes = { ...initialVotes };
      positions.forEach(position => {
        if (candidates[position.id]) {
          candidates[position.id].forEach(candidate => {
            updatedVotes[position.id][candidate.id] = 0;
          });
        }
      });
      
      setVotes(updatedVotes);
      
      alert('All votes have been reset successfully! Voting is now enabled.');
    }
  };

  const executeClearAllData = () => {
    if (window.confirm('⚠️ WARNING: This will clear ALL election data including votes, candidates, and settings. This action cannot be undone. Are you absolutely sure?')) {
      if (window.confirm('This is your final confirmation. Clear ALL election data?')) {
        try {
          // Clear all localStorage
          localStorage.removeItem('schoolElection_votes');
          localStorage.removeItem('schoolElection_votedStudents');
          localStorage.removeItem('schoolElection_candidates');
          localStorage.removeItem('schoolElection_completed');
          localStorage.removeItem('schoolElection_resultsPublished');
          localStorage.removeItem('schoolElection_tieBreakers');
          localStorage.removeItem('schoolElection_totalEligibleStudents');
          
          // Reset to default state - only add sample candidates if default positions exist
          const defaultCandidates = {};
          const defaultVotes = {};
          
          // Check if we have the default positions and add sample candidates
          const schoolLeaderPos = positions.find(p => p.id === 'schoolLeader');
          const ladySchoolLeaderPos = positions.find(p => p.id === 'ladySchoolLeader');
          
          if (schoolLeaderPos) {
            defaultCandidates.schoolLeader = [
              { id: 1, name: 'Anay S', grade: 'N/A', image: null, symbol: '🎒' },
              { id: 2, name: 'Avinash V', grade: 'N/A', image: null, symbol: '🧰' },
              { id: 3, name: 'Lithin Babu', grade: 'N/A', image: null, symbol: '📚' }
            ];
            defaultVotes.schoolLeader = {};
          }
          
          if (ladySchoolLeaderPos) {
            defaultCandidates.ladySchoolLeader = [
              { id: 4, name: 'Anshika Sudeesh', grade: 'N/A', image: null, symbol: '🖊️' },
              { id: 5, name: 'Avanthika S', grade: 'N/A', image: null, symbol: '📏' },
              { id: 6, name: 'Thanmayee HS', grade: 'N/A', image: null, symbol: '🧽' }
            ];
            defaultVotes.ladySchoolLeader = {};
          }
          
          // Initialize votes for all positions
          positions.forEach(position => {
            if (!defaultVotes[position.id]) {
              defaultVotes[position.id] = {};
            }
          });
          
          setCandidates(defaultCandidates);
          setVotes(defaultVotes);
          setVotedStudents([]);
          setElectionCompleted(false);
          setResultsPublished(false);
          setTieBreakerResults({});
          setTotalEligibleStudents(DEFAULT_TOTAL_ELIGIBLE_STUDENTS);
          
          alert('✅ All election data has been cleared and reset to defaults! Voting is now enabled.');
        } catch (error) {
          console.error('Error clearing data:', error);
          alert('❌ Error clearing data. Please try again.');
        }
      }
    }
  };

  const executePauseVoting = () => {
    setVotingPaused(true);
    alert('🚫 Voting has been paused!\n\n❌ Students cannot vote while paused\n🔐 Use admin password to resume voting');
  };

  const executeResumeVoting = () => {
    setVotingPaused(false);
    alert('✅ Voting has been resumed!\n\n🗳️ Students can now vote normally\n📊 All voting functions are active');
  };

  const executeCompleteVotingFromStatus = () => {
    if (window.confirm('⚠️ FINAL CONFIRMATION: This will permanently complete the election and end all voting. This action cannot be undone. Are you sure?')) {
      setElectionCompleted(true);
      setVotingPaused(false); // Clear any pause state when completing
      alert('🏁 Election has been completed permanently!\n\n❌ No more votes can be cast\n📊 Results are now final\n� Use "Declare Results" to view winners\n�🖨️ You can print final reports');
    }
  };

  // Handler functions for status view controls
  const completeVotingFromStatus = () => {
    setPasswordDialog({
      show: true,
      type: 'complete-voting-status',
      password: '',
      error: ''
    });
  };

  const pauseVoting = () => {
    setPasswordDialog({
      show: true,
      type: 'pause-voting',
      password: '',
      error: ''
    });
  };

  const resumeVoting = () => {
    setPasswordDialog({
      show: true,
      type: 'resume-voting',
      password: '',
      error: ''
    });
  };

  const declareResults = () => {
    setPasswordDialog({
      show: true,
      type: 'declare-results',
      password: '',
      error: ''
    });
  };

  const debugLocalStorage = () => {
    console.log('=== LocalStorage Debug Info ===');
    console.log('Votes:', localStorage.getItem('schoolElection_votes'));
    console.log('Voted Students:', localStorage.getItem('schoolElection_votedStudents'));
    console.log('Candidates:', localStorage.getItem('schoolElection_candidates'));
    console.log('Current State - Votes:', votes);
    console.log('Current State - Voted Students:', votedStudents);
    console.log('Current State - Candidates:', candidates);
    alert('Check browser console (F12) for debug information');
  };

  // Update document title based on current view
  useEffect(() => {
    const titles = {
      login: 'SEVS - Vote',
      voting: 'SEVS - Voting',
      results: 'SEVS - Results',
      admin: 'SEVS - Admin',
      status: 'SEVS - Status'
    };
    
    document.title = titles[currentView] || 'SEVS';
  }, [currentView]);

  // Print candidates list from main view
  const handlePrintCandidatesFromMain = () => {
    const printWindow = window.open('', '_blank');
    const currentDate = new Date().toLocaleDateString();
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Election Candidates - School Voting System</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 20px;
            background: white;
            color: #333;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #1976d2;
            padding-bottom: 25px;
          }
          .header h1 {
            color: #1976d2;
            margin: 0;
            font-size: 2.8rem;
            font-weight: bold;
          }
          .header .subtitle {
            color: #666;
            font-size: 1.2rem;
            margin: 10px 0;
            font-style: italic;
          }
          .header .date {
            color: #888;
            font-size: 1rem;
            margin-top: 15px;
          }
          .intro {
            background: #e3f2fd;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 40px;
            border-left: 5px solid #1976d2;
            text-align: center;
          }
          .intro h2 {
            color: #1976d2;
            margin: 0 0 10px 0;
            font-size: 1.5rem;
          }
          .intro p {
            margin: 0;
            font-size: 1.1rem;
            color: #555;
          }
          .section {
            margin-bottom: 50px;
            page-break-inside: avoid;
            break-inside: avoid;
            orphans: 3;
            widows: 3;
          }
          .section-title {
            background: linear-gradient(135deg, #1976d2, #42a5f5);
            color: white;
            padding: 18px 25px;
            margin: 0 0 25px 0;
            border-radius: 12px;
            font-size: 1.6rem;
            font-weight: bold;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
          }
          .section-title.lady {
            background: linear-gradient(135deg, #e91e63, #f06292);
          }
          .candidates-container {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 25px;
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          .candidate-card {
            border: 2px solid #e0e0e0;
            border-radius: 15px;
            padding: 20px;
            text-align: center;
            background: #fafafa;
            transition: all 0.3s ease;
            page-break-inside: avoid;
            break-inside: avoid;
            margin-bottom: 15px;
            min-height: 180px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            width: 100%;
            box-sizing: border-box;
          }
          .candidate-card:hover {
            border-color: #1976d2;
            background: #f8f9fa;
          }
          .symbol-large {
            font-size: 3.2rem;
            margin-bottom: 12px;
            color: #1976d2;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
            display: block;
            line-height: 1;
          }
          .candidate-name {
            font-size: 1.4rem;
            font-weight: bold;
            color: #333;
            margin: 0 0 8px 0;
          }
          .candidate-grade {
            color: #666;
            font-size: 1.1rem;
            margin: 0 0 15px 0;
          }
          .symbol-info {
            background: linear-gradient(135deg, #1976d2, #42a5f5);
            color: white;
            padding: 8px 15px;
            border-radius: 20px;
            font-size: 1rem;
            font-weight: 600;
            display: inline-block;
          }
          .symbol-badge {
            background: rgba(255, 255, 255, 0.3);
            padding: 5px 10px;
            border-radius: 8px;
            margin-left: 8px;
            font-weight: bold;
          }
          .summary-box {
            background: #f0f8ff;
            border: 2px solid #1976d2;
            border-radius: 15px;
            padding: 25px;
            margin-bottom: 40px;
            text-align: center;
          }
          .summary-box h3 {
            color: #1976d2;
            margin: 0 0 15px 0;
            font-size: 1.4rem;
          }
          .summary-stats {
            display: flex;
            justify-content: space-around;
            flex-wrap: wrap;
            gap: 20px;
          }
          .stat-item {
            text-align: center;
          }
          .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: #1976d2;
            display: block;
          }
          .stat-label {
            color: #666;
            font-size: 0.9rem;
            margin-top: 5px;
          }
          .footer {
            margin-top: 60px;
            text-align: center;
            color: #666;
            font-size: 0.9rem;
            border-top: 2px solid #e0e0e0;
            padding-top: 25px;
          }
          @media print {
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body { 
              margin: 0; 
              font-size: 12pt; 
              line-height: 1.4;
            }
            .header { 
              page-break-after: avoid; 
              break-after: avoid;
              margin-bottom: 25px;
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
              font-size: 1.3rem;
              padding: 12px 20px;
            }
            .candidates-container {
              display: flex;
              flex-wrap: wrap;
              gap: 15px;
              justify-content: space-between;
              align-items: flex-start;
              page-break-inside: avoid;
              break-inside: avoid;
            }
            .candidate-card { 
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              width: calc(48% - 10px);
              margin: 0 0 15px 0;
              padding: 15px;
              min-height: 150px;
              max-height: 200px;
              overflow: hidden;
              box-sizing: border-box;
              flex: 0 0 auto;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              border: 2px solid #e0e0e0 !important;
              background: #fafafa !important;
            }
            .symbol-large {
              font-size: 2.5rem;
              margin-bottom: 8px;
            }
            .candidate-name {
              font-size: 1.2rem;
              margin: 0 0 5px 0;
            }
            .candidate-grade {
              font-size: 1rem;
              margin: 0 0 10px 0;
            }
            .symbol-info {
              font-size: 0.9rem;
              padding: 6px 12px;
            }
            .intro,
            .summary-box,
            .voting-reminder {
              page-break-inside: avoid;
              break-inside: avoid;
              margin-bottom: 20px;
            }
            .summary-stats {
              flex-direction: row;
              justify-content: space-around;
              gap: 15px;
            }
            .stat-number {
              font-size: 1.5rem;
            }
            .footer {
              page-break-inside: avoid;
              break-inside: avoid;
              margin-top: 30px;
              font-size: 0.8rem;
            }
            /* Force page breaks between major sections if needed */
            .section:nth-of-type(2) {
              page-break-before: auto;
            }
            /* Ensure no orphaned cards */
            .candidates-container:has(.candidate-card:nth-child(odd):last-child) .candidate-card:last-child {
              width: 100%;
              max-width: 48%;
              margin: 0 auto;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏫 ${schoolInfo.fullName} Election Candidates</h1>
          <p class="subtitle">Complete List of Election Candidates</p>
          <p class="date">Generated on: ${currentDate}</p>
        </div>
        
        <div class="intro">
          <h2>📢 About This Election</h2>
          <p>This document contains the complete list of candidates running for student leadership positions. 
          Please review all candidates and remember their symbols for voting.</p>
        </div>
        
        <div class="summary-box">
          <h3>📊 Election Summary</h3>
          <div class="summary-stats">
            ${positions.filter(pos => pos.isActive).map(position => `
              <div class="stat-item">
                <span class="stat-number">${(candidates[position.id] || []).length}</span>
                <div class="stat-label">${position.displayName} Candidates</div>
              </div>
            `).join('')}
            <div class="stat-item">
              <span class="stat-number">${positions.filter(pos => pos.isActive).reduce((total, position) => 
                total + (candidates[position.id] || []).length, 0
              )}</span>
              <div class="stat-label">Total Candidates</div>
            </div>
          </div>
        </div>

        ${positions.filter(pos => pos.isActive).map(position => `
          <div class="section">
            <h2 class="section-title">${position.emoji || '🏆'} ${position.displayName} Candidates</h2>
            ${(candidates[position.id] || []).length > 0 ? `
              <div class="candidates-container">
                ${(candidates[position.id] || []).map(candidate => `
                  <div class="candidate-card">
                    <div class="symbol-large">${candidate.symbol || '❓'}</div>
                    <h3 class="candidate-name">${candidate.name}</h3>
                    <p class="candidate-grade">Grade: ${candidate.grade}</p>
                    <div class="symbol-info">
                      Symbol: <span class="symbol-badge">${candidate.symbol || '❓'}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : `
              <div class="candidate-card">
                <p style="color: #666; font-style: italic;">No candidates registered for ${position.displayName} position.</p>
              </div>
            `}
          </div>
        `).join('')}

        <div class="voting-reminder">
          <h3>📝 Important Voting Instructions</h3>
          <p><strong>Remember each candidate's symbol!</strong> You will need to identify candidates by their symbols when voting. 
          Make sure to review this list carefully before casting your vote.</p>
        </div>

        <div class="footer">
          <p><strong>School Election Management System</strong></p>
          <p>This document is for informational purposes and contains official candidate information.</p>
          <p>For questions about the election, please contact school administration.</p>
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

  return (
    <ErrorBoundary>
      <div className="App">
        {/* Protection Mode Indicator */}
        {(currentStudent || currentView === 'voting') && (
          <div className="protection-indicator">
            🔒 Secure Voting Mode - Admin password required
          </div>
        )}
        
        {/* Data Persistence Indicator */}
        <div className="persistence-indicator">
          💾 Data Automatically Saved
        </div>
        
        <header className="app-header">
          <div className="school-info">
            <h1>{schoolInfo.fullName}</h1>
            <h2>School Election Voting System</h2>
          </div>
          <nav className="navigation">
            <button 
              onClick={() => setCurrentView('login')}
              className={currentView === 'login' ? 'active' : ''}
            >
              Vote
            </button>
            <button onClick={handleResultsAccess}>
              Results
            </button>
            <button onClick={handleStatusAccess} className="status-btn">
              Status
            </button>
            <button 
              onClick={() => setShowCandidateList(true)}
              className="candidates-btn"
            >
              📋 Candidates
            </button>
            <button onClick={handleAdminAccess}>
              Admin
            </button>
          </nav>
        </header>

        <main className="main-content">
          {currentView === 'login' && (
            <LoginModal 
              onLogin={handleStudentLogin} 
              onSecureExit={handleSecureExit}
              electionCompleted={electionCompleted}
              onViewResults={handleViewResultsFromLogin}
            />
          )}
          
          {currentView === 'voting' && !electionCompleted && !votingPaused && (
            <VotingInterface 
              candidates={candidates}
              positions={positions}
              schoolInfo={schoolInfo}
              onVoteSubmit={handleVoteSubmit}
              onCancel={() => {
                setCurrentStudent(null);
                setCurrentView('login');
              }}
              onSecureExit={handleSecureExit}
            />
          )}

          {currentView === 'voting' && votingPaused && (
            <div className="voting-paused-message">
              <div className="paused-container">
                <h2>⏸️ Voting Paused</h2>
                <p>Voting has been temporarily paused by the administrator.</p>
                <p><strong>Please wait for voting to be resumed.</strong></p>
                <button 
                  onClick={() => {
                    setCurrentStudent(null);
                    setCurrentView('login');
                  }}
                  className="back-to-login-btn"
                >
                  Back to Login
                </button>
              </div>
            </div>
          )}

          {currentView === 'voting' && electionCompleted && (
            <div className="election-completed-message">
              <div className="completed-container">
                <h2>🏆 Election Completed!</h2>
                <p>The election has been completed and voting is now closed.</p>
                <p><strong>Use "Declare Results" to view the final winners with admin password.</strong></p>
                <div className="completion-actions">
                  <button 
                    className="results-btn primary"
                    onClick={() => {
                      // Trigger password dialog for results access
                      setPasswordDialog({
                        show: true,
                        type: 'results',
                        password: '',
                        error: ''
                      });
                    }}
                  >
                    🔐 Declare Results
                  </button>
                  <button 
                    className="back-btn secondary"
                    onClick={() => {
                      setCurrentStudent(null);
                      setCurrentView('login');
                    }}
                  >
                    ← Back to Login
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {currentView === 'results' && (
            <Results 
              candidates={candidates}
              votes={votes}
              positions={positions}
              totalVotedStudents={votedStudents.length}
              electionCompleted={electionCompleted}
              resultsPublished={resultsPublished}
              tieBreakerResults={tieBreakerResults}
              setTieBreakerResults={setTieBreakerResults}
              onCompleteElection={completeElection}
              onDeclareResults={declareResults}
              schoolInfo={schoolInfo}
            />
          )}
          
          {currentView === 'status' && (
            <StatusView 
              votedStudents={votedStudents}
              votes={votes}
              candidates={candidates}
              onBack={() => setCurrentView('login')}
              electionCompleted={electionCompleted}
              votingPaused={votingPaused}
              onCompleteVoting={completeVotingFromStatus}
              onPauseVoting={pauseVoting}
              onResumeVoting={resumeVoting}
              schoolInfo={schoolInfo}
              positions={positions}
              totalEligibleStudents={totalEligibleStudents}
            />
          )}
          
          {currentView === 'admin' && (
            <AdminPanel 
              candidates={candidates}
              setCandidates={setCandidates}
              votes={votes}
              setVotes={setVotes}
              votedStudents={votedStudents}
              onResetVotes={resetVotes}
              onClearAllData={clearAllData}
              onDebugStorage={debugLocalStorage}
              onBack={() => setCurrentView('login')}
              availableSymbols={availableSymbols}
              getRandomSymbol={getRandomSymbol}
              schoolInfo={schoolInfo}
              setSchoolInfo={setSchoolInfo}
              positions={positions}
              setPositions={setPositions}
              totalEligibleStudents={totalEligibleStudents}
              setTotalEligibleStudents={setTotalEligibleStudents}
            />
          )}
        </main>

        {/* Candidate List Modal */}
        {showCandidateList && (
          <div className="candidate-list-overlay">
            <div className="candidate-list-modal">
              <div className="candidate-list-header">
                <h2>📋 Election Candidates</h2>
                <button 
                  className="close-btn"
                  onClick={() => setShowCandidateList(false)}
                >
                  ✕
                </button>
              </div>
              
              <div className="candidate-list-content">
                {/* Dynamic Positions and Candidates */}
                {positions.filter(pos => pos.isActive).map(position => (
                  <div key={position.id} className="position-section">
                    <h3>{position.emoji || '�'} {position.displayName} Candidates</h3>
                    <div className="candidates-grid">
                      {(candidates[position.id] || []).length > 0 ? (
                        (candidates[position.id] || []).map(candidate => (
                          <div key={candidate.id} className="candidate-card-view">
                            <div className="candidate-symbol-large">
                              {candidate.symbol || '❓'}
                            </div>
                            <div className="candidate-details">
                              <h4>{candidate.name}</h4>
                              <p className="candidate-grade">Grade: {candidate.grade}</p>
                              <div className="symbol-display">
                                Symbol: <span className="symbol-badge">{candidate.symbol || '❓'}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="no-candidates-message">
                          <p>No candidates registered for {position.displayName} position yet.</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {positions.filter(pos => pos.isActive).length === 0 && (
                  <div className="no-positions-message">
                    <h3>No Active Positions</h3>
                    <p>There are currently no active positions in this election.</p>
                  </div>
                )}
              </div>
              
              <div className="candidate-list-footer">
                <div className="footer-actions">
                  <button 
                    className="print-candidates-main-btn"
                    onClick={handlePrintCandidatesFromMain}
                    title="Print candidates list for reference"
                  >
                    🖨️ Print Candidates
                  </button>
                  <button 
                    className="close-modal-btn"
                    onClick={() => setShowCandidateList(false)}
                  >
                    Close
                  </button>
                </div>
                <p className="footer-note">💡 <strong>Remember your candidate's symbol when voting!</strong></p>
              </div>
            </div>
          </div>
        )}

        {/* Password Dialog */}
        {passwordDialog.show && (
          <div className="password-dialog-overlay">
            <div className="password-dialog">
              <h3>🔐 Authentication Required</h3>
              <p>
                {passwordDialog.type === 'admin' && 'Enter admin password to access admin panel:'}
                {passwordDialog.type === 'results' && 'Enter password to view results:'}
                {passwordDialog.type === 'status' && 'Enter password to view voting status:'}
                {passwordDialog.type === 'reset-votes' && '⚠️ Enter admin password to reset all votes:'}
                {passwordDialog.type === 'clear-all' && '🚨 Enter admin password to clear ALL data:'}
                {passwordDialog.type === 'complete-election' && '🏆 Enter admin password to complete the election:'}
                {passwordDialog.type === 'pause-voting' && '⏸️ Enter admin password to pause voting:'}
                {passwordDialog.type === 'resume-voting' && '▶️ Enter admin password to resume voting:'}
                {passwordDialog.type === 'complete-voting-status' && '✅ Enter admin password to complete voting:'}
              </p>
              <input
                type="password"
                placeholder="Enter password"
                value={passwordDialog.password}
                onChange={(e) => setPasswordDialog(prev => ({ ...prev, password: e.target.value, error: '' }))}
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                className="password-input"
                autoFocus
              />
              {passwordDialog.error && (
                <div className="password-error">{passwordDialog.error}</div>
              )}
              <div className="password-dialog-buttons">
                <button onClick={handlePasswordSubmit} className="submit-btn">
                  Submit
                </button>
                <button onClick={handlePasswordCancel} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <footer className="app-footer">
          <p>Created by Rahul Works | {schoolInfo?.fullName || schoolInfo?.name || 'School Election System'}</p>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;
