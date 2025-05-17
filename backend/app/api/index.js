const { Router } = require('express');
const path = require('path');
const UsersRouter = require('./users');
const QuestionsRouter = require('./questions');

const router = new Router();

router.get('/status', (req, res) => res.status(200).json('ok'));
router.use('/users', UsersRouter);
router.use('/questions', QuestionsRouter);

// Redirect /api/ to the Angular app's index.html
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../frontend/src/index.html'));
});

module.exports = router;
