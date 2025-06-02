const Joi = require('joi');
const seedUsers = require('./seed-users.js');
const fs = require('fs');
const path = require('path');
const USERS_FILE = path.join(__dirname, '../../database/users.json');

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
        questionFrequency: Joi.object().pattern(
            /^(addition|subtraction|multiplication|division|rewrite|encryption|word)$/,
            Joi.number().optional()
        ).optional()
    }).required(),
    musicEnabled: Joi.boolean().optional().default(true),
    effectsEnabled: Joi.boolean().optional().default(true),
    showScore: Joi.boolean().optional().default(true),
    backgroundBrightness: Joi.number().optional().default(0.8),
    selectedPlayerImage: Joi.string().optional().default('../../../../frontend/src/assets/images/game/player/yellow_fish.png'),
});

const validateUser = (user) => {
    const { error, value } = userSchema.validate(user);
    if (error) {
        throw new Error(`Invalid user input: ${error.message}`);
    }
    return value;
};

let users;
if (fs.existsSync(USERS_FILE)) {
    try {
        const fileData = fs.readFileSync(USERS_FILE, 'utf-8');
        users = JSON.parse(fileData);
        if (!Array.isArray(users)) throw new Error('users.json is not an array');
    } catch (e) {
        console.error('Failed to load users.json, using seedUsers:', e.message);
        users = seedUsers.map(user => user);
        saveUsersToFile();
    }
} else {
    users = seedUsers.map(user => user);
    saveUsersToFile();
}

function saveUsersToFile() {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
        console.log('[saveUsersToFile] users.json written successfully:', USERS_FILE);
    } catch (err) {
        console.error('[saveUsersToFile] Error writing users.json:', err);
    }
}

const get = () => users;

const create = (user) => {
    users.push(user);
    saveUsersToFile();
    return user;
};

const update = (userId, updates) => {
    const idx = users.findIndex(u => u.userId === userId);
    if (idx === -1) throw new Error('User not found');
    // Merge updates
    const updatedUser = { ...users[idx], ...updates };
    // Validate
    const validUser = validateUser(updatedUser);
    users[idx] = validUser;
    console.log('[update] User updated in memory:', validUser);
    saveUsersToFile();
    return users[idx];
};

const del = (userId) => {
    users = users.filter(u => u.userId !== userId);
    saveUsersToFile();
};

module.exports = {
    userSchema,
    get,
    create,
    update,
    delete: del
};
