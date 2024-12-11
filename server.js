const express = require ("express");
const app = express();
const path = require("path");
const port = 3000
const data = require('./data');

const user = require('./models/user');
const User = require("./models/user");

app.use(express.urlencoded({ extended: true}));
app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/', (req, res) => {
    res.render('index', data)
})

app.get('/submited', (req, res) => {
    res.render('submited', {users} )
})

app.post('/submited', async (req, res) => {
    const { name, login, password } = req.body;
    console.log('chegou ate aqui', req.body)

    try {
        const newUser = new User({name, login, password });
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

app.post('/delete', (req, res) => {
    const { login } = req.body;
    
    if (!login) {
        return res.status(400).send("login do Usuario é obrigatorio para deletar")
    }
    
    users = users.filter(user => user.login !== login);
    res.redirect("/users");
})


app.get('/edit/:login', (req, res) => {
    const {login} = req.params;
    
    const user = users.find(user => user.login === login)
    
    if(!user) {
        return res.status(404).send("Usuario não encontrado")
    }
    
    res.render('edit', { 
        title: "Editar Usuário", 
        message: "Atualize as informações do usuário", 
        name: "Nome", 
        password: "Senha", 
        user 
    });
})

app.post("/edit/:login", (req, res) => {
    const { login } = req.params;
    const {name, newLogin, password } = req.body;
    
    console.log(req.params)
    const userIndex = users.findIndex(user => user.login === login)
    
    if (userIndex === -1) {
        return res.status(404).send("Usuario não encontrado")
    }
    
    users[userIndex] = {name, login: newLogin || login, password};
    console.log(req.params)
    res.redirect("/users")
})

app.listen(port, () => {
    console.log(`server runing at localhost , ${port}`)
})
