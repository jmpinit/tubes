import path from 'path';
import fs from 'fs';
import express from 'express';
import ws from 'ws';
import temp from 'temp';
import { exec } from 'child_process';

const header = fs.readFileSync('server/lua-context/header.lua', 'utf8');
const footer = fs.readFileSync('server/lua-context/footer.lua', 'utf8');

// cleanup files on exit
temp.track();

const app = express();
const wss = new ws.Server({ port: 1337 });

function getTemp() {
    return new Promise((fulfill, reject) => {
        temp.mkdir('tubes', (err, dir) => {
            if (err) {
                reject(err);
                return;
            }

            fulfill(dir);
        });
    });
}

function writeToFile(filepath, text) {
    return new Promise((fulfill, reject) => {
        fs.writeFile(filepath, text, 'utf8', (err) => {
            if(err) {
                reject(err);
                return;
            }

            fulfill();
        }); 
    });
}

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        console.log('received: %s', message);

        let graph;
        try {
            graph = JSON.parse(message);
        } catch (e) {
            console.log('could not parse');
            console.error(e);
            return;
        }

        getTemp().then(tempDir => {
            console.log(tempDir);

            const scriptPromises = Object.keys(graph.sourceCode).map(id => {
                const code = `${header}\n${graph.sourceCode[id]}\n${footer}`;
                const codefile = path.join(tempDir, `${id}.lua`);

                return writeToFile(codefile, code).then(() => Promise.resolve(codefile));
            });

            Promise.all(scriptPromises)
                .then((files) => {
                    files.forEach(scriptfile => {
                        exec(`lua ${scriptfile}`, (err, stdout, stderr) => {
                            console.log(stdout, stderr);
                        });
                    })

                    return Promise.resolve();
                });
        })
        .then(() => console.log('wrote scripts'))
        .catch(err => console.error(err));
        //exec(`lua -e "${code}"`);
    });

    ws.send(JSON.stringify({ msg: 'ok' }));
});

app.use(express.static('public'));

app.listen(8000, () => {
    console.log('Example app listening on port 8000!');
});
