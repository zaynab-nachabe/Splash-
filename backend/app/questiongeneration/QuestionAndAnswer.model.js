/*
const { QuestionNotion } = require('./QuestionNotionEnum');
*/

class QuestionAndAnswer {
  constructor(question, answer, notion) {
    this.question = question;
    this.answer = answer;
    this.notion = notion; // Ensure notion is an element of QuestionNotionEnum
  }
}

module.exports = QuestionAndAnswer;
