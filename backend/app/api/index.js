const { Router } = require('express');
const UsersRouter = require('./users');
const GameStatisticsRouter = require('../routes/game-statistics.routes');

const router = new Router();

router.get('/status', (req, res) => res.status(200).json('ok'));
router.use('/users', UsersRouter);
router.use('/game-statistics', GameStatisticsRouter);

module.exports = router;