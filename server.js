const express = require ("express");
const app = express();
const path = require("path");
const port = 3000
const data = require('./data');
let users = [];

const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/', (req, res) => {
    res.render('index', data)
})

app.get('/submited', (req, res) => {
    res.render('submited', {users} )
})

app.post('/submited', (req, res) => {
    const { name, login, password } = req.body;
    console.log('chegou ate aqui', req.body)

    if (!name || !login || !password) {
        return res.status(400).send('Todos os campos são obrigatorios')
    }

    users.push({ name, login, password });

    res.redirect('/users');

})

app.get('/users', (req, res) => {
    res.render('users', {users})
})

app.listen(port, () => {
    console.log(`server runing at localhost , ${port}`)
})