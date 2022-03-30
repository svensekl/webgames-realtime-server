import Listener from './listener';
import { WebSocketServer } from 'ws';
import WebSocket from 'ws';

class WebSocketListener extends Listener {
	constructor() {
		super(1234)

		const server = new WebSocketServer({ port: this.port });
		server.on('connection', (ws: WebSocket) => {
			console.log("connected something");
			ws.on('message', (msg) => { this.onMessage(ws, msg.toString()) });
		});
	}
}

export default WebSocketListener;
