import { WebSocketServer } from 'ws';
import readline from 'readline';
import { exit } from 'process';

const wss = new WebSocketServer({ port: 1234 });
var rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

wss.on('connection', sock => {
	console.log('connected');
	sock.on('message', (msg) => {
		console.log('%s', msg);
	});

	rl.on('line', line => {
		if (line === 'exit')
			exit();
		sock.send(line);
	})
});

