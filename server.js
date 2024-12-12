const express = require("express");
const app = express();
const path = require("path");
const port = 3000
const data = require('./data');

const user = require('./models/user');
const User = require("./models/user");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/', (req, res) => {
    res.render('index', data)
})

app.get('/submited', (req, res) => {
    res.render('submited', { users })
})

app.post('/submited', async (req, res) => {
    const { name, login, password } = req.body;
    console.log('chegou ate aqui', req.body)

    try {
        const newUser = new User({ name, login, password });
        await newUser.save();
    } catch (err) {
        console.error('erro ao salvar o usuario:', err);
        res.status(500).send('erro ao salvar o usuario');
    }
    res.redirect('/users');

})

app.get('/users', async (req, res) => {

    try {
        const users = await User.find();
        res.render('users', { users });
    } catch (err) {
        console.log('Erro ao buscar os usuarios', err);
        res.status(500).send('erro ao buscar os usuarios');
    }
})

app.post('/delete', async (req, res) => {
    const { login } = req.body;

    try {
        await User.deleteOne({ login });
    } catch (err) {
        ('Erro ao deletar os usuarios', err);
        res.status(500).send('erro ao deletar os usuarios');
    }

    if (!login) {
        return res.status(400).send("login do Usuario é obrigatorio para deletar")
    }

    res.redirect("/users");
})


app.get('/edit/:login', async (req, res) => {
    const { login } = req.params;
    console.log(req.params)


    try {
        const user = await User.findOne({login})
        if (!user) {
        return res.status(404).send("Usuario não encontrado")
    }
        
        res.render('edit', {
        title: "Editar Usuário",
        message: "Atualize as informações do usuário",
        name: "Nome",
        password: "Senha",
        user
    });
    } catch (err) {
        res.status(500).send("Erro ao buscar o usuário: " + err.message);
    }
    
})

app.post("/edit/:login", async (req, res) => {
    const { login } = req.params;
    const { name, password, newLogin } = req.body;

    console.log(req.params)

    try {
        const updateLogin = await User.findOneAndUpdate(
            {login},
            {name, password, 
            login: newLogin || login},
            {new: true}
        )

        if (!updateLogin) {
            return res.status(404).send("Usuário não encontrado");
        }
    } catch (err) {
        res.status(500).send("Erro ao atualizar o usuário: " + err.message);
    }
    res.redirect("/users")
})

app.listen(port, () => {
    console.log(`server runing at localhost , ${port}`)
})
