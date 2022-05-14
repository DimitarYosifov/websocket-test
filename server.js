

const WebSocket = require('ws');
const path = require('path');
const express = require('express');
const app = express();
const router = express.Router();
const cors = require("cors");
const port = process.env.port || 80;

app.use(express.static(path.join(__dirname, '/')));
app.use(cors());
app.set('views', path.join(__dirname, ''));
app.use(router);

router.get('/', function (req, res, next) {
    res.render('index.html', {});
});

const server = app.listen(port, function () {
    console.log('listening on port ', server.address().port);
});

const wss = new WebSocket.Server({ server, user: "test" });
let activeUsers = {};
wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        if (JSON.parse(message).user) {
            let user = JSON.parse(message).user;
            ws._sockname = user;
            activeUsers[user] = true;
            wss.clients.forEach(client => { client.send(Buffer.from(JSON.stringify(activeUsers))) });
        }
        else {
            wss.clients.forEach(client => { client.send(message) });
            // if (client != ws) {}
        }
    });
    ws.on('error', (error) => {
        console.log('received: %s', error);
    });
    ws.on('close', () => {
        delete activeUsers[ws._sockname];
        wss.clients.forEach(client => { client.send(Buffer.from(JSON.stringify(activeUsers))) });
        console.log("CLOSED!");
    });
});

app.set('port', process.env.PORT || 8080);
