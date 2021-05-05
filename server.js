const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const router = require('./router');
const io = require('./socket');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));
global.__homedir = __dirname;

router(app);
mongoose.connect('mongodb://localhost/nodejs', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
}).then(() => {
    const server = http.createServer(app);
    server.listen(2021);
    io(server);
});

