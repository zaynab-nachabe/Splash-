const Joi = require('joi');
const BaseModel = require('../utils/base-model.js');

module.exports = new BaseModel('User', {
    userId: Joi.string().required(),
    name: Joi.string().required(),
    age: Joi.string().required(),
    icon: Joi.string().default('pp-9.png'),
    conditons: Joi.array().items(Joi.string()).default([]),
    userConfig: Joi.object({
        showsAnswer: Joi.boolean().optional().default(false),
        addition: Joi.boolean().optional().default(false),
        substraction: Joi.boolean().optional().default(false),
        multiplication: Joi.boolean().optoinal().default(false),
        division: Joi.boolean().optional().default(false),
        rewriting: Joi.boolean().optional().default(false),
        encryption: Joi.boolean().optional().default(false),
    }).required(),
});