import { createServer } from 'net';
import readline from 'readline';
import { exit } from 'process';

var rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

createServer((client) => {
	client.setEncoding('utf8')
	
	client.on('data', data => {
		console.log(data);
	});

	rl.on('line', line => {
		if (line === 'exit')
			exit();
		client.write(line);
	})
}).listen(1235, () => { 
	console.log('server is listening');
});
