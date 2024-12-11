const mongoose = require('mongoose');

const mongoURI = 'mongodb://localhost:27017/formejs';

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Conexão com o mongoDb estabelecida com sucesso!')).catch(err => console.log('Erro ao conectar ao mongoDb', err));

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    login: { type: String, required: true, unique: true },
    password: { type: String, required: true }
})

const User = mongoose.model('User', userSchema);

module.exports = User;