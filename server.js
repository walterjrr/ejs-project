const express = require("express");
const app = express();
const path = require("path");
const port = 3000
const data = require('./data');
const bcrypt = require("bcrypt")

app.use(express.static('public'));

app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));

const User = require("./models/user");
const { default: mongoose } = require("mongoose");

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

    try {
        const alreadyEmail = await User.findOne({ login });
        if (alreadyEmail) {
            return res.status(400).json({
                field: 'login',
                message: 'Login já existe',
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = new User({ name, login, password: passwordHash });

        await newUser.save();
        res.redirect('/users');
    } catch (err) {
        console.error('Erro ao salvar o usuário:', err);
        res.status(500).send('Erro ao salvar o usuário');
    }
});



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
