const { Router } = require('express');
const User = require('../../../../shared/models/user.model');
const UserConfig = require('../../../../shared/config/user.config');

const router = new Router();


////////////////////////////////////////////////////////////////////////////////
// AFFICHER TOUT LES USERS :

router.get('/', (req, res) => {
    try {
        res.status(200).json(User.get());
    } catch (err) {
        res.status(500).json(err);
    }
});


////////////////////////////////////////////////////////////////////////////////
// UPDATE A USER :
router.put('/:userId', (req, res) => {
    try {
        const updatedUser = User.update(req.params.userId, { ...req.body });
        res.status(200).json(updatedUser);
    } catch (err) {
        if (err.name === 'ValidationError') {
            res.status(400).json(err.extra);
        } else {
            res.status(500).json(err);
        }
    }
});
////////////////////////////////////////////////////////////////////////////////
// CREER UN USER :

router.post('/', (req, res) =>{
    try {
        const user = User.create({ ...req.body });
        res.status(201).json(user);
    } catch (err) {
        if (err.name === 'ValidationError'){
            res.status(400).json(err.extra);
        } else {
            res.status(500).json(err);
        }
    }
});

////////////////////////////////////////////////////////////////////////////////
// DELETE UN USER :

router.delete('/:userId', (req, res) =>{
    try {
        User.delete(req.params.userId);
        res.status(204).end();
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;