const express = require('express');
const router = express.Router();
const GameStatistics = require('../models/game-statistics.model');


router.get('/', async (req, res) => {
  try {
    const statistics = await GameStatistics.find();
    res.json(statistics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get statistics for a specific child
router.get('/child/:childId', async (req, res) => {
  try {
    const statistics = await GameStatistics.find({ childId: req.params.childId });
    res.json(statistics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new game session
router.post('/', async (req, res) => {
  const gameStats = new GameStatistics({
    ...req.body,
    date: new Date(),
    id: `game-${req.body.childId}-${Date.now()}`
  });

  try {
    const newStats = await gameStats.save();
    // After saving, update the total/average stats
    await updateChildTotal(req.body.childId);
    res.status(201).json(newStats);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

async function updateChildTotal(childId) {
  try {
    // Get all non-total sessions for this child
    const childSessions = await GameStatistics.find({ 
      childId: childId, 
      isTotal: { $ne: true } 
    });
    
    if (childSessions.length === 0) return;
    
    // Remove existing total if present
    await GameStatistics.deleteOne({ childId: childId, isTotal: true });
    
    const totalRecord = {
      id: `game-${childId}-total`,
      childId: childId,
      sessionName: 'TOTAL',
      date: new Date(),
      isTotal: true,
      ranking: Math.round(childSessions.reduce((acc, s) => acc + s.ranking, 0) / childSessions.length),
      wordsPerMinute: Math.round(childSessions.reduce((acc, s) => acc + s.wordsPerMinute, 0) / childSessions.length),
      // other fields ...
    };
    
    //new total record
    const newTotal = new GameStatistics(totalRecord);
    await newTotal.save();
  } catch (err) {
    console.error('Error updating child total:', err);
  }
}

module.exports = router;