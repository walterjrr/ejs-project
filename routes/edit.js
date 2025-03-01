const express = require("express");
const authenticateToken = require("../middlewares/authenticateToken");
const User = require("../models/user");
const router = express.Router();

router.get('/edit/:login', authenticateToken, async (req, res) => {
    const { login } = req.params;
    console.log(req.params);
    
    try {
        const user = await User.findOne({ login });
        if (!user) {
            return res.status(404).send("Usuario não encontrado");
        }

        res.render('edit', {
            title: "Editar Usuário",
            message: "Atualize as informações do usuário",
            name: "Nome",
            user
        });
    } catch (err) {
        res.status(500).send("Erro ao buscar o usuário: " + err.message);
    }
});

router.post("/edit/:login", async (req, res) => {
    const { login } = req.params;
    const { name, password, newLogin } = req.body;
    
    console.log(req.params);
    
    try {
        const updateLogin = await User.findOneAndUpdate(
            { login },
            {
                name, password,
                login: newLogin || login
            },
            { new: true }
        );
        
        if (!updateLogin) {
            return res.status(404).send("Usuário não encontrado");
        }
    } catch (err) {
        res.status(500).send("Erro ao atualizar o usuário: " + err.message);
    }
    res.redirect("/users");
});

module.exports = router