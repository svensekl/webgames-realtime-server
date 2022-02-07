// websocket connected to website
import { WebSocketServer } from 'ws';

// socket connected to phone
import { createServer } from 'net';

import { genSid, validSid } from './sid.js';

class Session {
	constructor(sid, display) {
		this.sid = sid;
		this.display = display; // website
		this.clients = []; // phones

		const displayMessageHandler = msg => {
			let json;
			try {
				json = JSON.parse(msg);
			} catch(error) {
				throw new Error("packet not valid json format: " + msg);
			}

			if (!json.type) {
				throw new Error("Garbled packet doesn't have a type: " + JSON.stringify(json));
			}

			if (json.type === "session-end") {
				// TODO: reason
				this.disconnect(null);
				return;
			}

			if (json.type === "passthrough") {
				if (!json.for || !json.data) {
					throw new Error("Garbled passthrough packet: " + JSON.stringify(json));
				}
				// TODO: json.for
				this.clients.forEach(client => {
					client.write(JSON.stringify(json.data));
				});
				return;
			}
		};

		// wait for session-create packet
		this.display.on('message', (msg) => {
			let json;
			try {
				json = JSON.parse(msg);
			} catch (error) {
				throw new Error("packet not valid json format: " + msg);
			}

			if (!json.type || json.type !== "session-create") {
				throw new Error("First message not a valid session-create packet: " + JSON.stringify(json));
			}

			// send a session-start packet
			const packet = {
				type: "session-start",
				sid: this.sid,
			}
			this.display.send(JSON.stringify(packet));
			this.display.removeAllListeners();
			this.display.on('message', displayMessageHandler);
		});
	}

	disconnect(client) {
		if (client === null) {
			this.display.terminate();
			this.clients.forEach(client => {
				client.destroy();
			});
		}
		// send client disconnected message to display
		console.log('client disconnected');
		this.clients.filter(item => item !== client);
	}

	connect(client) {
		this.clients.push(client);
		console.log('client connected');
		const json = {
			type: "session-connected",
			successful: true,
		};
		client.write(JSON.stringify(json));
		client.on('data', data => {
			let json;
			try {
				json = JSON.parse(data);
			} catch(error) {
				throw new Error("Garbled message not in json format: " + data);
			}

			if (!json.type) {
				throw new Error("Garbled message doesn't have a type");
			}

			console.log('data: ' + data);
			if (json.type === "passthrough") {
				if (!json.data) {
					throw new Error("Garbled passthrough message");
				}
				this.display.send(JSON.stringify(json.data));
				return;
			}
		});
		client.on('close', () => {
			this.disconnect(client);
		});
	}
}

// entry in form of sid: session
let sessions = {};
const wss = new WebSocketServer({ port: 1234 });

// create a new session
wss.on('connection', function connection(ws) {
	let id; // generate unique session id
	// while (sessions[id = genSid()]);
	id = 'sid'; // testing sid
	sessions[id] = new Session(id, ws);
});

createServer((client) => {
	client.setEncoding('utf8')
	
	// wait for it to send session id then
	// create new client and attach it to session
	client.on('data', data => {
		let json;
		try {
			json = JSON.parse(data);
		} catch(error) {
			throw new Error("packet not valid json format: " + data);
		}
		if (json.type !== "session-connect" || !json.sid) {
			throw new Error("first data from client isn't a valid session-connect packet: " + JSON.stringify(json));
		}
		const packet = {
			type: "session-connected",
			successful: true,
		};
		let session;
		if (!(json.sid in sessions)) {
			console.log('sid not valid: ' + json.sid);
			packet.successful = false;
			client.write(JSON.stringify(packet));
			client.destroy();
			return;
		}
		session = sessions[json.sid];
		client.write(JSON.stringify(packet));
		client.removeAllListeners('data');
		session.connect(client);
	});
}).listen(1235, () => { 
	console.log('server is listening');
});
