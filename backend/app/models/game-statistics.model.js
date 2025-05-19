const BaseModel = require('./base.model');
const Joi = require('joi');

module.exports = new BaseModel('GameStatistics', {
  id: Joi.string().required(),
  childId: Joi.string().required(),
  sessionName: Joi.string().required(),
  date: Joi.date().default(Date.now),
  score: Joi.number().default(0),
  ranking: Joi.number().default(0),
  wordsPerMinute: Joi.number().default(0),
  mathNotionUnderstanding: Joi.number().default(0),
  precision: Joi.number().default(0),
  numberOfCorrections: Joi.number().default(0),
  answersShown: Joi.number().default(0),
  isTotal: Joi.boolean().default(false),
  wordsLeastSuccessful: Joi.array().items(
    Joi.object({
      word: Joi.string(),
      successRate: Joi.number()
    })
  ).default([]),
  heatmapData: Joi.array().items(
    Joi.object({
      keyCode: Joi.string(),
      errorFrequency: Joi.number()
    })
  ).default([])
});