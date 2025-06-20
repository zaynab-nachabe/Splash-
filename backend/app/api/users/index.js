const { Router } = require('express');
const User = require('../../models/user.model');
const router = new Router();


// //////////////////////////////////////////////////////////////////////////////
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
    console.log('PUT /api/users/:userId', req.params.userId, req.body);
    try {
        const updatedUser = User.update(req.params.userId, { ...req.body });
        console.log('Updated user:', updatedUser);
        res.status(200).json(updatedUser);
    } catch (err) {
        console.error('PUT /api/users/:userId error:', err); 
        if (err.name === 'ValidationError') {
            res.status(400).json(err.extra);
        } else {
            res.status(500).json({ message: err.message, stack: err.stack });
        }
    }
});

router.get('/:userId', (req, res) => {
  try {
    const user = User.get().find(u => u.userId === req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});
////////////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////////
// CREER UN USER :

router.post('/', (req, res) => {
  try {
    const user = User.create({ ...req.body });
    res.status(201).json(user);
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(400).json(err.extra);
    } else {
      res.status(500).json(err);
    }
  }
});

// //////////////////////////////////////////////////////////////////////////////
// DELETE UN USER :

router.delete('/:userId', (req, res) => {
  try {
    User.delete(req.params.userId);
    res.status(204).end();
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
