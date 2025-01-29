const express = require("express");
const app = express();
const path = require("path");
const port = 3000
const data = require('./data');
const bcrypt = require("bcrypt");
const multer = require("multer");
const cors = require("cors");
const jwt = require('jsonwebtoken');


const JWT_SECRET = "sua_chave_secreta";


app.use(cors())
app.use(express.static('public'));
app.use("/users", express.static(path.join(__dirname, "users")));


app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));

const User = require("./models/user");
const { default: mongoose } = require("mongoose");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(cors({
    origin: ["http://example.com", "http://localhost:3000"], // Permitir apenas essa origem
    methods: ["GET", "POST", "PUT", "DELETE"], // Permitir apenas esses métodos HTTP
    allowedHeaders: ["Content-Type", "Authorization"], // Permitir apenas esses cabeçalhos
    credentials: true, // Habilitar envio de cookies e credenciais
}));

const storage = multer.diskStorage({
    destination: "users/", // Define a pasta onde os arquivos serão salvos
    filename: (req, file, cb) => {
        const uniqueName = `../users/${Date.now()}.jpg`; // Nome único com extensão .jpg
        cb(null, uniqueName);
    },
});

const upload = multer({ storage });

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/login', async (req, res) => {
    res.render('login', {msg: null})
})



app.get('/cadastrar', (req, res) => {
    res.render('register', data)
})

app.get('/submited', (req, res) => {
    res.render('submited', { users })
})

app.post('/submited', upload.single('image'), async (req, res) => {
    const { name, login, password } = req.body;

    /*if(!req.body.image) {
        return res.status(400).send("nao ha imagem selecionada")
    }*/

    try {
        const alreadyEmail = await User.findOne({ login });
        if (alreadyEmail) {
            return res.status(400).json({
                field: 'login',
                message: 'Login já existe',
            });
        }

        console.log(req.file)
        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = new User({ name, login, password: passwordHash, image: req.file.filename });

        await newUser.save();
        res.redirect('/users');
    } catch (err) {
        console.error('Erro ao salvar o usuário:', err);
        res.status(500).send('Erro ao salvar o usuário');
    }
});



app.get('/users', authenticateToken, async (req, res) => {
    try {
        const users = await User.find();
        res.render('users', { users });
    } catch (err) {
        console.log('Erro ao buscar os usuários', err);
        res.status(500).send('Erro ao buscar os usuários');
    }
});

app.post('/login', async (req, res) => {
    console.log("chegou aqui1", req.body)
    const { login, password } = req.body;

    try {
        const user = await User.findOne({ login });
        if (!user) {
            return res.status(404).render('login', { msg: "Usuário não encontrado!" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log("chegou aqui", isPasswordValid)
        if (!isPasswordValid) {
            return res.status(400).render('login', { msg: "Senha incorreta!" });
        }

        const token = jwt.sign({ id: user._id, login: user.login }, JWT_SECRET, { expiresIn: '1h' })


        res.json({ token, redirect: `/edit/${login}` });

    } catch (err) {
        console.error('Erro ao realizar login:', err.message);
        res.status(500).render('login', { msg: "Erro interno no servidor!" });
    }
});


function authenticateToken(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1]; // Obtém o token do header 'Authorization'

    if (!token) {
        return res.status(401).json({ message: "Token não fornecido" });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Token inválido ou expirado" });
        }
        req.user = user; // Armazena as informações do token na requisição
        next();
    });
}

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


app.get('/edit/:login', authenticateToken, async (req, res) => {
    const { login } = req.params;
    console.log(req.params)


    try {
        const user = await User.findOne({ login })
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
            { login },
            {
                name, password,
                login: newLogin || login
            },
            { new: true }
        )

        if (!updateLogin) {
            return res.status(404).send("UsuArio nAo encontrado");
        }
    } catch (err) {
        res.status(500).send("Erro ao atualizar o usuArio: " + err.message);
    }
    res.redirect("/users")
})

app.listen(port, () => {
    console.log(`server runing at localhost , ${port}`)
})
