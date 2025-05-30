const Joi = require('joi');
const seedUsers = require('./seed-users.js');

const userSchema = Joi.object({
    userId: Joi.string().required(),
    name: Joi.string().required(),
    age: Joi.string().required(),
    icon: Joi.string().default('pp-9.png'),
    conditions: Joi.array().items(Joi.string()).default([]),
    userConfig: Joi.object({
        showAnswer: Joi.boolean().optional().default(false),
        addition: Joi.boolean().optional().default(false),
        subtraction: Joi.boolean().optional().default(false),
        multiplication: Joi.boolean().optional().default(false),
        division: Joi.boolean().optional().default(false),
        rewrite: Joi.boolean().optional().default(false),
        encryption: Joi.boolean().optional().default(false),
        word: Joi.boolean().optional().default(false),
        showScore: Joi.boolean().optional().default(false),
        nombresDeQuestion: Joi.number().optional().default(10),
        questionFrequency: {
        }
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

// In-memory users array, initialized with seed users
let users = seedUsers.map(user => {
    // Optionally validate here
    return user;
});

// CRUD functions
const get = () => users;

const create = (user) => {
    users.push(user);
    return user;
};

const del = (userId) => {
    users = users.filter(u => u.userId !== userId);
};

module.exports = {
    userSchema,
    get,
    create,
    delete: del
};
