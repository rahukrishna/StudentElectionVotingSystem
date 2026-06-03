import React, { useState } from 'react';
import './PositionManager.css';

const PositionManager = ({ positions, onUpdatePositions, candidates, setCandidates, votes, setVotes }) => {
  const [showAddPosition, setShowAddPosition] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);
  const [newPosition, setNewPosition] = useState({
    id: '',
    name: '',
    displayName: '',
    description: '',
    maxCandidates: 5,
    isActive: true
  });

  // Generate a safe ID from the position name
  const generatePositionId = (name) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '')
      .trim();
  };

  const handleAddPosition = (e) => {
    e.preventDefault();
    if (!newPosition.name.trim() || !newPosition.displayName.trim()) {
      alert('Please fill in all required fields.');
      return;
    }

    const positionId = generatePositionId(newPosition.name);
    
    // Check if position already exists
    if (positions.find(p => p.id === positionId)) {
      alert('A position with this name already exists. Please use a different name.');
      return;
    }

    const position = {
      id: positionId,
      name: newPosition.name.trim(),
      displayName: newPosition.displayName.trim(),
      description: newPosition.description.trim(),
      maxCandidates: parseInt(newPosition.maxCandidates),
      isActive: newPosition.isActive,
      createdAt: new Date().toISOString(),
      order: positions.length
    };

    // Add position to the list
    const updatedPositions = [...positions, position];
    onUpdatePositions(updatedPositions);

    // Initialize empty candidate list and votes for this position
    setCandidates(prev => ({
      ...prev,
      [positionId]: []
    }));

    setVotes(prev => ({
      ...prev,
      [positionId]: {}
    }));

    // Reset form
    setNewPosition({
      id: '',
      name: '',
      displayName: '',
      description: '',
      maxCandidates: 5,
      isActive: true
    });
    setShowAddPosition(false);

    alert(`✅ Position "${position.displayName}" has been added successfully!`);
  };

  const handleEditPosition = (position) => {
    setEditingPosition(position);
    setNewPosition({
      id: position.id,
      name: position.name,
      displayName: position.displayName,
      description: position.description,
      maxCandidates: position.maxCandidates,
      isActive: position.isActive
    });
  };

  const handleUpdatePosition = (e) => {
    e.preventDefault();
    if (!newPosition.name.trim() || !newPosition.displayName.trim()) {
      alert('Please fill in all required fields.');
      return;
    }

    const updatedPositions = positions.map(p => 
      p.id === editingPosition.id 
        ? {
            ...p,
            name: newPosition.name.trim(),
            displayName: newPosition.displayName.trim(),
            description: newPosition.description.trim(),
            maxCandidates: parseInt(newPosition.maxCandidates),
            isActive: newPosition.isActive,
            updatedAt: new Date().toISOString()
          }
        : p
    );

    onUpdatePositions(updatedPositions);
    setEditingPosition(null);
    setNewPosition({
      id: '',
      name: '',
      displayName: '',
      description: '',
      maxCandidates: 5,
      isActive: true
    });

    alert(`✅ Position "${newPosition.displayName}" has been updated successfully!`);
  };

  const handleDeletePosition = (position) => {
    // Check if position has candidates
    const positionCandidates = candidates[position.id] || [];
    if (positionCandidates.length > 0) {
      const confirmDelete = window.confirm(
        `This position has ${positionCandidates.length} candidate(s). Deleting this position will also remove all candidates and votes for this position. Are you sure you want to continue?`
      );
      if (!confirmDelete) return;
    }

    // Remove position
    const updatedPositions = positions.filter(p => p.id !== position.id);
    onUpdatePositions(updatedPositions);

    // Remove candidates and votes for this position
    setCandidates(prev => {
      const newCandidates = { ...prev };
      delete newCandidates[position.id];
      return newCandidates;
    });

    setVotes(prev => {
      const newVotes = { ...prev };
      delete newVotes[position.id];
      return newVotes;
    });

    alert(`✅ Position "${position.displayName}" has been deleted successfully!`);
  };

  const handleToggleActive = (position) => {
    const updatedPositions = positions.map(p => 
      p.id === position.id 
        ? { ...p, isActive: !p.isActive, updatedAt: new Date().toISOString() }
        : p
    );
    onUpdatePositions(updatedPositions);
  };

  const handleReorderPosition = (positionId, direction) => {
    const currentIndex = positions.findIndex(p => p.id === positionId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= positions.length) return;

    const updatedPositions = [...positions];
    [updatedPositions[currentIndex], updatedPositions[newIndex]] = 
    [updatedPositions[newIndex], updatedPositions[currentIndex]];

    // Update order values
    updatedPositions.forEach((pos, index) => {
      pos.order = index;
    });

    onUpdatePositions(updatedPositions);
  };

  return (
    <div className="position-manager">
      <div className="position-manager-header">
        <h3>🏛️ Position Management</h3>
        <p>Manage voting positions for your election</p>
      </div>

      <div className="position-actions">
        <button 
          onClick={() => setShowAddPosition(true)}
          className="add-position-btn"
        >
          ➕ Add New Position
        </button>
      </div>

      {/* Add/Edit Position Form */}
      {(showAddPosition || editingPosition) && (
        <div className="position-form-overlay">
          <div className="position-form">
            <div className="form-header">
              <h4>{editingPosition ? '✏️ Edit Position' : '➕ Add New Position'}</h4>
              <button 
                onClick={() => {
                  setShowAddPosition(false);
                  setEditingPosition(null);
                  setNewPosition({
                    id: '',
                    name: '',
                    displayName: '',
                    description: '',
                    maxCandidates: 5,
                    isActive: true
                  });
                }}
                className="close-btn"
              >
                ✕
              </button>
            </div>

            <form onSubmit={editingPosition ? handleUpdatePosition : handleAddPosition}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="positionName">Position Name *</label>
                  <input
                    type="text"
                    id="positionName"
                    value={newPosition.name}
                    onChange={(e) => setNewPosition(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Head Boy, Sports Captain"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="displayName">Display Name *</label>
                  <input
                    type="text"
                    id="displayName"
                    value={newPosition.displayName}
                    onChange={(e) => setNewPosition(prev => ({ ...prev, displayName: e.target.value }))}
                    placeholder="e.g., Head Boy, Sports Captain"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={newPosition.description}
                  onChange={(e) => setNewPosition(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this position (optional)"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="maxCandidates">Max Candidates</label>
                  <input
                    type="number"
                    id="maxCandidates"
                    value={newPosition.maxCandidates}
                    onChange={(e) => setNewPosition(prev => ({ ...prev, maxCandidates: e.target.value }))}
                    min="1"
                    max="20"
                  />
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={newPosition.isActive}
                      onChange={(e) => setNewPosition(prev => ({ ...prev, isActive: e.target.checked }))}
                    />
                    <span>Active Position</span>
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="save-btn">
                  {editingPosition ? '💾 Update Position' : '➕ Add Position'}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAddPosition(false);
                    setEditingPosition(null);
                    setNewPosition({
                      id: '',
                      name: '',
                      displayName: '',
                      description: '',
                      maxCandidates: 5,
                      isActive: true
                    });
                  }}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Positions List */}
      <div className="positions-list">
        {positions.length === 0 ? (
          <div className="no-positions">
            <p>No positions created yet. Add your first position above!</p>
          </div>
        ) : (
          positions.map((position, index) => (
            <div key={position.id} className={`position-card ${!position.isActive ? 'inactive' : ''}`}>
              <div className="position-info">
                <div className="position-header">
                  <h4>{position.displayName}</h4>
                  <div className="position-badges">
                    {!position.isActive && <span className="status-badge inactive">Inactive</span>}
                    <span className="candidates-badge">
                      {(candidates[position.id] || []).length}/{position.maxCandidates} candidates
                    </span>
                  </div>
                </div>
                
                {position.description && (
                  <p className="position-description">{position.description}</p>
                )}

                <div className="position-stats">
                  <span>Max Candidates: {position.maxCandidates}</span>
                  <span>•</span>
                  <span>Total Votes: {Object.values(votes[position.id] || {}).reduce((a, b) => a + b, 0)}</span>
                </div>
              </div>

              <div className="position-actions">
                <div className="order-controls">
                  <button 
                    onClick={() => handleReorderPosition(position.id, 'up')}
                    disabled={index === 0}
                    className="order-btn"
                    title="Move Up"
                  >
                    ⬆️
                  </button>
                  <button 
                    onClick={() => handleReorderPosition(position.id, 'down')}
                    disabled={index === positions.length - 1}
                    className="order-btn"
                    title="Move Down"
                  >
                    ⬇️
                  </button>
                </div>

                <div className="action-buttons">
                  <button 
                    onClick={() => handleToggleActive(position)}
                    className={`toggle-btn ${position.isActive ? 'active' : 'inactive'}`}
                    title={position.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {position.isActive ? '⏸️' : '▶️'}
                  </button>
                  
                  <button 
                    onClick={() => handleEditPosition(position)}
                    className="edit-btn"
                    title="Edit Position"
                  >
                    ✏️
                  </button>
                  
                  <button 
                    onClick={() => handleDeletePosition(position)}
                    className="delete-btn"
                    title="Delete Position"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {positions.length > 0 && (
        <div className="position-summary">
          <h4>📊 Summary</h4>
          <div className="summary-stats">
            <div className="stat">
              <span className="stat-number">{positions.length}</span>
              <span className="stat-label">Total Positions</span>
            </div>
            <div className="stat">
              <span className="stat-number">{positions.filter(p => p.isActive).length}</span>
              <span className="stat-label">Active Positions</span>
            </div>
            <div className="stat">
              <span className="stat-number">
                {positions.reduce((total, pos) => total + (candidates[pos.id] || []).length, 0)}
              </span>
              <span className="stat-label">Total Candidates</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PositionManager;
