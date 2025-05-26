const Joi = require('joi');
const BaseModel = require('../utils/base-model.js');

const userSchema = Joi.object({
    userId: Joi.string().required(),
    name: Joi.string().required(),
    age: Joi.string().required(),
    icon: Joi.string().default('pp-9.png'),
    conditons: Joi.array().items(Joi.string()).default([]),
    userConfig: Joi.object({
        showsAnswer: Joi.boolean().optional().default(false),
        addition: Joi.boolean().optional().default(false),
        subtraction: Joi.boolean().optional().default(false),
        multiplication: Joi.boolean().optional().default(false),
        division: Joi.boolean().optional().default(false),
        rewriting: Joi.boolean().optional().default(false),
        encryption: Joi.boolean().optional().default(false),
        word: Joi.boolean().optional().default(false),
    }).required(),
});

// Export a validation function for user objects
const validateUser = (user) => {
    const { error, value } = userSchema.validate(user);
    if (error) {
        throw new Error(`Invalid user input: ${error.message}`);
    }
    return value;
};

module.exports = { userSchema, validateUser };
