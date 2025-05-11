const Joi = require('joi');
const BaseModel = require('../utils/base-model.js');

module.exports = new BaseModel('User', {
    userId: Joi.string().required(),
    name: Joi.string().required(),
    age: Joi.string().required(),
    icon: Joi.string().default('pp-9.png'),
    conditons: Joi.array().items(Joi.string()).default([]),
    userConfig: Joi.object({
        showsAnswer: Joi.boolean().required().default(false),
        addition: Joi.boolean().required().default(false),
        substraction: Joi.boolean().required().default(false),
        multiplication: Joi.boolean().required().default(false),
        division: Joi.boolean().required().default(false),
        rewriting: Joi.boolean().required().default(false),
        encryption: Joi.boolean().required().default(false),
    }).required(),
});