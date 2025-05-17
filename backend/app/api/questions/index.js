const { Router } = require('express');
const QuestionGenerator = require('../../questiongeneration/questionGenerator');

const router = new Router();


// //////////////////////////////////////////////////////////////////////////////
// CREER UN USER :

router.post('/generate', (req, res) => {
    try {
        const seed = Date.now() % 100000; // keep seed in safe range
        console.log('Received question generation request with seed:', seed, 'and body:', req.body);
        const generator = new QuestionGenerator(seed);
        const qna = generator.generateQnA(req.body);
        console.log('Generated question:', qna);
        res.status(200).json(qna);
    } catch (err) {
        console.error('Error in /generate:', err);
        if (err.name === 'ValidationError') {
            res.status(400).json(err.extra);
        } else {
            res.status(500).json({error : err.message});
        }
    }
});


module.exports = router;
