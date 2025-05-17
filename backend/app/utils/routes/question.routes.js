const express = require('express');
const QuestionGenerator = require('../../questiongeneration/questionGenerator');

const router = express.Router();

router.post('/generate', (req, res) => {
  const userConfig = req.body;
  const generator = new QuestionGenerator();

  try {
    const question = generator.generateQnA(userConfig);
    res.json(question);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
