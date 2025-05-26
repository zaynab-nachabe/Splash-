const express = require('express');
const router = express.Router();
const GameStatistics = require('../models/game-statistics.model');


router.get('/', async (req, res) => {
  try {
    const statistics = await GameStatistics.get();
    res.json(statistics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/child/:childId', (req, res) => {
  try {
    const childId = req.params.childId;
    const allStats = GameStatistics.get();
    const childStats = allStats.filter(stat => stat.childId === childId);
    res.status(200).json(childStats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new game session
router.post('/', (req, res) => {
  try {
    const newStats = GameStatistics.create({
      ...req.body,
      date: new Date(),
      id: `game-${req.body.childId}-${Date.now()}`
    });
    
    // After saving, update the total/average stats
    updateChildTotal(req.body.childId);
    res.status(201).json(newStats);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

function updateChildTotal(childId) {
  try {
    const allStats = GameStatistics.get();
    const childSessions = allStats.filter(stat=>
      stat.childId === childId && !stat.isTotal !== true
    );
    
    if (childSessions.length === 0) return;
    
    const existingTotal = allStats.find(stat => 
      stat.childId === childId && stat.isTotal === true
    );
    
    // Delete existing total if found
    if (existingTotal) {
      GameStatistics.delete(existingTotal.id);
    }
    
    // Create new total record
    const totalRecord = {
      id: `game-${childId}-total`,
      childId: childId,
      sessionName: 'TOTAL',
      date: new Date(),
      isTotal: true,
      ranking: Math.round(childSessions.reduce((acc, s) => acc + s.ranking, 0) / childSessions.length),
      wordsPerMinute: Math.round(childSessions.reduce((acc, s) => acc + s.wordsPerMinute, 0) / childSessions.length),
      mathNotionUnderstanding: Math.round(childSessions.reduce((acc, s) => acc + s.mathNotionUnderstanding, 0) / childSessions.length),
      precision: Math.round(childSessions.reduce((acc, s) => acc + s.precision, 0) / childSessions.length),
      numberOfCorrections: childSessions.reduce((acc, s) => acc + s.numberOfCorrections, 0),
      answersShown: childSessions.reduce((acc, s) => acc + s.answersShown, 0)
    };
    GameStatistics.create(totalRecord);
  }catch (err){
    console.error('Error updating child total:', err);
  }
}

module.exports = router;