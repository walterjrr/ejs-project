const express = require ("express");
const app = express();
const path = require("path");
const port = 3000
const data = require('./data');

//app.set("view engine", "hbs");
app.use(express.static(path.join(__dirname, "public")))

app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render('index', data)
})

app.listen(port, () => {
    console.log(`server runing in localhost , ${port}`)
})