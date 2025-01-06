const mongoose = require('mongoose');
require('dotenv').config()



const mongoURI = process.env.MONGO_URL

mongoose.connect(mongoURI).then(() => console.log('Conexão com o mongoDb estabelecida com sucesso!')).catch(err => console.log('Erro ao conectar ao mongoDb', err));

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    login: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: {type: String, required: false}
})

const User = mongoose.model('User', userSchema);

module.exports = User;