const express = require("express");
const app = express();
const path = require("path");
const port = 3000;
const data = require('./data/data');
const cors = require("cors");
const cookieParser = require('cookie-parser');


const authenticateToken = require("./middlewares/authenticateToken");
const verifyAdminToken = require("./middlewares/verifyToken");
const admin = require("./routes/admin")
const { default: mongoose } = require("mongoose");

const router = require("./routes/login");
const submited = require("./routes/submited");
const usersList = require("./routes/usersList");
const edit = require("./routes/edit")

require('dotenv').config();

app.use(cookieParser());
app.use(express.static('public'));
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));


app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.set('view engine', 'ejs');
app.set('views', './views');

app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/cadastrar', (req, res) => {
    res.render('register', data);
});

app.use("/users", express.static(path.join(__dirname, "users")));
app.use(edit);
app.use(submited);
app.use(admin)
app.use(router);
app.use(usersList);
app.use(authenticateToken);
app.use(verifyAdminToken)

app.listen(port, () => {
    console.log(`server runing at localhost , ${port}`);
});
