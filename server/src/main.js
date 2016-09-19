import path from 'path';
import express from 'express';
import ws from 'ws';

const app = express();
const wss = new ws.Server({ port: 1337 });

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        console.log('received: %s', message);
    });

    ws.send(JSON.stringify({ msg: 'ok' }));
});

setInterval(() => wss.clients.forEach(c => c.send(JSON.stringify({ type: 'SELECT_NONE' }))), 5000);

app.use(express.static('public'));

app.listen(8000, () => {
    console.log('Example app listening on port 8000!');
});
