const Joi = require('joi');
const BaseModel = require('../utils/base-model.js');

module.exports = new BaseModel('Question', {
  question: Joi.string().required(),
  answer: Joi.string().required(),
  notion: Joi.string().required(), // Ensure notion is a required string
});



/*
Here is the .js file of the equivalent TypeScript code:
const Joi = require('joi')
const BaseModel = require('../utils/base-model.js')

module.exports = new BaseModel('Question', {
  label: Joi.string().required(),
  quizId: Joi.number(),
  answers: Joi.array(),
})


Here is the equivalent typescript code:
export interface Question {
    id: string;
    label: string;
    answers: Answer[];
}

 */