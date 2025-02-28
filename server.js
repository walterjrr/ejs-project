const express = require("express");
const app = express();
const path = require("path");
const port = 3000;
const data = require('./data');
const bcrypt = require("bcrypt");
const multer = require("multer");
const cors = require("cors");
const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require("./models/user");

const JWT_SECRET = process.env.JWT_SECRET;

app.use(express.static('public'));
app.use("/users", express.static(path.join(__dirname, "users")));
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));

const { default: mongoose } = require("mongoose");

const router = require("./routes");
const { Console } = require("console");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(cors({
    origin: ["http://localhost:3000"], // Permitir apenas essa origem
    methods: ["GET", "POST", "PUT", "DELETE"], // Permitir apenas esses métodos HTTP
    allowedHeaders: ["Content-Type", "Authorization"], // Permitir apenas esses cabeçalhos
    credentials: true, // Habilitar envio de cookies e credenciais
}));

const storage = multer.diskStorage({
    destination: "users/", // Define a pasta onde os arquivos serão salvos
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}.jpg`; // Nome único com extensão .jpg
        cb(null, uniqueName);
    },
});

const upload = multer({ storage });

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/login', async (req, res) => {
    res.render('login', { msg: null });
});

app.get('/cadastrar', (req, res) => {
    res.render('register', data);
});


app.get('/submited', (req, res) => {
    res.render('submited', { User });
});

app.post('/submited', upload.single('image'), async (req, res) => {
    const { name, login, password } = req.body;

    try {
        const alreadyEmail = await User.findOne({ login });
        if (alreadyEmail) {
            return res.status(400).json({
                field: 'login',
                message: 'Login já existe',
            });
        }

        console.log(req.file);
        const passwordHash = await bcrypt.hash(password, 12);
        const newUser = new User({ name, 
            login, 
            password: passwordHash, 
            image: req.file.filename });

        await newUser.save();

        const token = jwt.sign({ id: newUser.id, 
            login: newUser.login }, 
            JWT_SECRET, { expiresIn: '1h' });

            res.json({ 
                success: true, 
                token: token,
                redirect: '/users'
            });
            console.log(res.json);
            console.log('Generated Token:', token); // Log the token for debugging
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
        console.log('Erro ao buscar os usuários', err);
        res.status(500).send('Erro ao buscar os usuários');
    }
});

app.use(router);

function authenticateToken(req, res, next) {

    if (req.isAdmin) {
        return next();
    }
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format

    if (!token) {
        token = req.query.token;
    }

    if (!token) {
        // For API requests
        if (req.xhr || req.headers.accept?.includes('json')) {
            return res.status(401).json({ 
                success: false,
                message: 'Token não fornecido' 
            });
        }
        // For browser requests
        // return res.redirect('/login');
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            // Handle different JWT errors
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    success: false,
                    message: 'Token expirado' 
                });
            }
            
            return res.status(401).json({ 
                success: false,
                message: 'Token inválido' 
            });
        }

        // Store decoded user in request
        req.user = user;
        next();
    });
}

app.post('/delete', authenticateToken, async (req, res) => {
    const { login } = req.body;

    if (!login) {
        return res.status(400).send("login do Usuario é obrigatorio para deletar");
    }

    try {
        await User.deleteOne({ login });
        res.redirect("/users");
    } catch (err) {
        console.error('Erro ao deletar os usuarios', err);
        res.status(500).send('erro ao deletar os usuarios');
    }
});

app.get('/edit/:login', authenticateToken, async (req, res) => {
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

app.post("/edit/:login", async (req, res) => {
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

app.get('/admin/login', (req, res) => {
    res.render('adminLogin', { msg: null });
});

app.post('/admin/login', async (req, res) => {
    const { adminLogin, adminPassword } = req.body;

    if (adminLogin === process.env.ADMIN_LOGIN && adminPassword === process.env.ADMIN_PASSWORD) {
        req.isAdmin = true;
        return res.redirect('/users');
    } else {
        return res.status(401).json({
            success: false,
            message: 'Login de administrador inválido'
        });
    }
});

app.post('/login', async (req, res) => {
    const { login, password } = req.body;

    try {
        const user = await User.findOne({ login });
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: 'Login ou senha inválidos'
            });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ 
                success: false,
                message: 'Login ou senha inválidos'
            });
        }

        const token = jwt.sign(
            { id: user._id, login: user.login },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log('Generated Token1:', token); // Log the token for debugging

        res.json({
            success: true,
            token: token,
            redirect: '/users'
        });
    } catch (err) {
        console.error('Erro ao fazer login:', err);
        res.status(500).json({ 
            success: false,
            message: 'Erro ao fazer login'
        });
    }
});


app.listen(port, () => {
    console.log(`server runing at localhost , ${port}`);
});