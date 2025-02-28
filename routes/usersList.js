const express = require('express');
const router = express.Router();

router.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.render('users', { users });
    } catch (err) {
        console.log('Erro ao buscar os usuários', err);
        res.status(500).send('Erro ao buscar os usuários');
    }
});

module.exports = router;
